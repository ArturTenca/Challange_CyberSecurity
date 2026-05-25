import {
  DEMO_PASSWORD,
  DEMO_USERS,
  SECURITY_CONFIG,
  type AuthUser,
} from '../config/security';
import { recordClientAudit } from '../security/auditClient';
import {
  deleteSecureItem,
  getSecureItem,
  setSecureItem,
} from '../security/secureStorage';
import { validateInput } from '../utils/validation';

export interface LoginChallengeResult {
  requires2FA: true;
  challengeId: string;
  expiresAt?: number;
  devCode?: string;
}

let accessTokenMemory: string | null = null;
let devChallengeEmail: string | null = null;

function isDemoCredential(email: string, password: string) {
  return (
    DEMO_USERS.some((user) => user.email.toLowerCase() === email.toLowerCase()) &&
    password === DEMO_PASSWORD
  );
}

function createDemoChallenge(email: string): LoginChallengeResult {
  devChallengeEmail = email;
  return {
    requires2FA: true,
    challengeId: 'dev-challenge',
    devCode: '123456',
  };
}

async function persistSession(
  accessToken: string,
  refreshToken: string,
  user: AuthUser
) {
  accessTokenMemory = accessToken;
  await setSecureItem(SECURITY_CONFIG.accessTokenKey, accessToken);
  await setSecureItem(SECURITY_CONFIG.refreshTokenKey, refreshToken);
  await setSecureItem(SECURITY_CONFIG.userKey, JSON.stringify(user));
}

export const authService = {
  async requestLogin(
    email: string,
    password: string
  ): Promise<LoginChallengeResult> {
    const emailNorm = email.trim().toLowerCase();
    const emailCheck = validateInput.email(emailNorm);
    const passwordCheck = validateInput.password(password);

    if (!emailCheck.valid) throw new Error(emailCheck.error);
    if (!passwordCheck.valid) throw new Error(passwordCheck.error);

    if (!isDemoCredential(emailNorm, password)) {
      recordClientAudit('auth_failure', { email: emailNorm, reason: 'invalid_credentials' });
      throw new Error('E-mail ou senha incorretos');
    }

    recordClientAudit('config_change', { action: 'local_demo_login' });
    return createDemoChallenge(emailNorm);
  },

  async verify2FA(challengeId: string, code: string): Promise<AuthUser> {
    const normalized = code.replace(/\D/g, '').slice(0, 6);
    if (normalized.length !== 6) {
      throw new Error('Informe o código de 6 dígitos');
    }

    if (challengeId === 'dev-challenge') {
      if (normalized !== '123456') {
        throw new Error('Código incorreto');
      }
      const user = DEMO_USERS.find(
        (u) => u.email.toLowerCase() === devChallengeEmail
      );
      if (!user) throw new Error('Sessão expirada. Faça login novamente.');
      await persistSession(`dev-${user.id}`, `dev-refresh-${user.id}`, user);
      recordClientAudit('config_change', { action: 'dev_2fa_success' });
      return user;
    }

    throw new Error('Sessão de autenticação inválida. Faça login novamente.');
  },

  /** @deprecated Use requestLogin + verify2FA */
  async login(email: string, password: string): Promise<AuthUser> {
    const challenge = await authService.requestLogin(email, password);
    if (challenge.devCode) {
      return authService.verify2FA(challenge.challengeId, challenge.devCode);
    }
    throw new Error('Verificação em duas etapas necessária');
  },

  async refreshAccessToken(): Promise<string | null> {
    const refreshToken = await getSecureItem(SECURITY_CONFIG.refreshTokenKey);
    if (!refreshToken) return null;

    if (refreshToken.startsWith('dev-refresh-')) {
      accessTokenMemory = refreshToken.replace('dev-refresh-', 'dev-');
      return accessTokenMemory;
    }

    await authService.logout();
    return null;
  },

  async getAccessToken(): Promise<string | null> {
    if (accessTokenMemory) return accessTokenMemory;
    accessTokenMemory = await getSecureItem(SECURITY_CONFIG.accessTokenKey);
    return accessTokenMemory;
  },

  async getUser(): Promise<AuthUser | null> {
    const raw = await getSecureItem(SECURITY_CONFIG.userKey);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as AuthUser;
    } catch {
      return null;
    }
  },

  async logout(): Promise<void> {
    devChallengeEmail = null;
    accessTokenMemory = null;
    await deleteSecureItem(SECURITY_CONFIG.accessTokenKey);
    await deleteSecureItem(SECURITY_CONFIG.refreshTokenKey);
    await deleteSecureItem(SECURITY_CONFIG.userKey);
  },
};
