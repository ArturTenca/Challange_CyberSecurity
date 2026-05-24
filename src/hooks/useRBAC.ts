import { useAuth } from '../contexts/AuthContext';
import type { UserRole } from '../config/security';

export function useRBAC() {
  const { user, hasPermission } = useAuth();

  const isRole = (...roles: UserRole[]) =>
    !!user && roles.includes(user.role);

  return {
    user,
    role: user?.role ?? null,
    isAdmin: isRole('administrador'),
    isAnalyst: isRole('analista'),
    isCommonUser: isRole('usuario'),
    canReadLeads: hasPermission('leads:read'),
    canWriteLeads: hasPermission('leads:write'),
    canReadVehicles: hasPermission('vehicles:read'),
    canReadAnalytics: hasPermission('analytics:read'),
    canReadAudit: hasPermission('audit:read'),
    hasPermission,
    isRole,
  };
}
