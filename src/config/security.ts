import Constants from 'expo-constants';
import { Platform } from 'react-native';

const extra = Constants.expoConfig?.extra ?? {};

export function getApiBaseUrl(): string {
  const fromEnv = process.env.EXPO_PUBLIC_API_URL;
  const fromExtra = extra.apiBaseUrl as string | undefined;
  if (fromEnv) return fromEnv;
  if (fromExtra) return fromExtra;
  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    return window.location.origin;
  }
  if (Platform.OS === 'android') return 'http://10.0.2.2:3001';
  return 'http://localhost:3001';
}

export const SECURITY_CONFIG = {
  get apiBaseUrl() {
    return getApiBaseUrl();
  },
  payloadHmacSecret:
    (extra.payloadHmacSecret as string) ||
    process.env.EXPO_PUBLIC_PAYLOAD_HMAC_SECRET ||
    'dev-hmac-secret-min-32-characters-long!!',
  maxPayloadBytes: 64 * 1024,
  accessTokenKey: 'ford_access_token',
  refreshTokenKey: 'ford_refresh_token',
  userKey: 'ford_auth_user',
};

export type UserRole = 'administrador' | 'analista' | 'usuario';

export interface AuthUser {
  id: string;
  email: string;
  role: UserRole;
  name: string;
}

export const DEMO_USERS: AuthUser[] = [
  {
    id: 'u-admin-1',
    email: 'admin@ford.demo',
    role: 'administrador',
    name: 'Admin Ford',
  },
  {
    id: 'u-analyst-1',
    email: 'analista@ford.demo',
    role: 'analista',
    name: 'Analista Mercado',
  },
  {
    id: 'u-user-1',
    email: 'usuario@ford.demo',
    role: 'usuario',
    name: 'Cliente Demo',
  },
];

export const DEMO_PASSWORD = 'Ford@2026';
