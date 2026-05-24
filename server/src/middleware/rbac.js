const ROLE_PERMISSIONS = {
  administrador: [
    'leads:read',
    'leads:write',
    'vehicles:read',
    'analytics:read',
    'audit:read',
    'config:write',
  ],
  analista: ['leads:read', 'vehicles:read', 'analytics:read'],
  usuario: ['vehicles:read', 'leads:write'],
};

function requirePermission(permission) {
  return (req, res, next) => {
    const role = req.user?.role;
    const allowed = ROLE_PERMISSIONS[role] || [];

    if (!allowed.includes(permission)) {
      return res.status(403).json({
        error: 'Acesso negado para seu perfil',
        code: 'FORBIDDEN',
      });
    }
    next();
  };
}

function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        error: 'Acesso negado',
        code: 'FORBIDDEN',
      });
    }
    next();
  };
}

module.exports = { requirePermission, requireRole, ROLE_PERMISSIONS };
