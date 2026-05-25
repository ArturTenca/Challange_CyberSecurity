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

let accessTokenMemory: string | null = null;

function isDemoCredential(email: string, password: string) {
  return (
    DEMO_USERS.some((user) => user.email.toLowerCase() === email.toLowerCase()) &&
    password === DEMO_PASSWORD
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
  async login(email: string, password: string): Promise<AuthUser> {
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
    const user = DEMO_USERS.find(
      (demoUser) => demoUser.email.toLowerCase() === emailNorm
    );
    if (!user) {
      throw new Error('Usuário de demonstração não encontrado');
    }

    await persistSession(`dev-${user.id}`, `dev-refresh-${user.id}`, user);
    return user;
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
    accessTokenMemory = null;
    await deleteSecureItem(SECURITY_CONFIG.accessTokenKey);
    await deleteSecureItem(SECURITY_CONFIG.refreshTokenKey);
    await deleteSecureItem(SECURITY_CONFIG.userKey);
  },
};
