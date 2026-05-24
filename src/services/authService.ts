import {
  DEMO_PASSWORD,
  DEMO_USERS,
  SECURITY_CONFIG,
  type AuthUser,
} from '../config/security';
import { recordClientAudit } from '../security/auditClient';
import { secureLogger } from '../security/secureLogger';
import {
  deleteSecureItem,
  getSecureItem,
  setSecureItem,
} from '../security/secureStorage';
import { validateInput } from '../utils/validation';
import { getPublicErrorMessage } from '../utils/errorHandler';

export interface LoginChallengeResult {
  requires2FA: true;
  challengeId: string;
  expiresAt?: number;
  devCode?: string;
}

interface TokenResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  user: AuthUser;
}

let accessTokenMemory: string | null = null;
let devChallengeEmail: string | null = null;

function isLocalApi(url: string) {
  return (
    url.includes('localhost') ||
    url.includes('127.0.0.1') ||
    url.includes('10.0.2.2')
  );
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

    const url = `${SECURITY_CONFIG.apiBaseUrl}/api/auth/login`;

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailNorm, password }),
      });

      if (!response.ok) {
        recordClientAudit('auth_failure', { status: response.status });
        if (response.status === 401) {
          throw new Error('E-mail ou senha incorretos');
        }
        throw new Error(getPublicErrorMessage(response.status));
      }

      const data = await response.json();
      if (!data.requires2FA || !data.challengeId) {
        throw new Error('Resposta de autenticação inválida');
      }

      return {
        requires2FA: true,
        challengeId: data.challengeId,
        expiresAt: data.expiresAt,
        devCode: data.devCode,
      };
    } catch (error) {
      if (error instanceof Error && error.message.includes('incorretos')) {
        throw error;
      }

      if (__DEV__ && isLocalApi(SECURITY_CONFIG.apiBaseUrl)) {
        const user = DEMO_USERS.find((u) => u.email.toLowerCase() === emailNorm);
        if (!user || password !== DEMO_PASSWORD) {
          throw new Error('Credenciais inválidas');
        }
        devChallengeEmail = emailNorm;
        return {
          requires2FA: true,
          challengeId: 'dev-challenge',
          devCode: '123456',
        };
      }

      throw new Error(
        'Não foi possível conectar. Inicie a API com: npm run api'
      );
    }
  },

  async verify2FA(challengeId: string, code: string): Promise<AuthUser> {
    const normalized = code.replace(/\D/g, '').slice(0, 6);
    if (normalized.length !== 6) {
      throw new Error('Informe o código de 6 dígitos');
    }

    if (challengeId === 'dev-challenge' && __DEV__) {
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

    const url = `${SECURITY_CONFIG.apiBaseUrl}/api/auth/verify-2fa`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ challengeId, code: normalized }),
    });

    if (!response.ok) {
      const body = await response.json().catch(() => ({}));
      throw new Error(
        (body as { error?: string }).error || getPublicErrorMessage(response.status)
      );
    }

    const data: TokenResponse = await response.json();
    await persistSession(data.accessToken, data.refreshToken, data.user);
    recordClientAudit('config_change', { action: 'login_2fa_success' });
    secureLogger.info('auth_2fa_success', {
      userId: data.user.id,
      role: data.user.role,
    });
    return data.user;
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

    const url = `${SECURITY_CONFIG.apiBaseUrl}/api/auth/refresh`;

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      });

      if (!response.ok) {
        await authService.logout();
        return null;
      }

      const data = await response.json();
      const currentUser = await authService.getUser();
      if (currentUser) {
        await persistSession(data.accessToken, data.refreshToken, currentUser);
      }
      return data.accessToken;
    } catch {
      return accessTokenMemory;
    }
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
    const refreshToken = await getSecureItem(SECURITY_CONFIG.refreshTokenKey);
    if (refreshToken && !refreshToken.startsWith('dev-refresh-')) {
      try {
        await fetch(`${SECURITY_CONFIG.apiBaseUrl}/api/auth/logout`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refreshToken }),
        });
      } catch {
        // ignore
      }
    }
    accessTokenMemory = null;
    await deleteSecureItem(SECURITY_CONFIG.accessTokenKey);
    await deleteSecureItem(SECURITY_CONFIG.refreshTokenKey);
    await deleteSecureItem(SECURITY_CONFIG.userKey);
  },
};
