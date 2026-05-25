export const SECURITY_CONFIG = {
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
