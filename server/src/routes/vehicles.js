const express = require('express');
const { vehicles } = require('../data/store');
const { authenticate } = require('../middleware/auth');
const { requirePermission } = require('../middleware/rbac');
const { validateVehicleQuery } = require('../middleware/validateInput');
const { recordAudit } = require('../services/auditLog');
const { trackAnomaly } = require('../services/securityMonitor');

const router = express.Router();

router.get(
  '/',
  authenticate,
  requirePermission('vehicles:read'),
  validateVehicleQuery,
  (req, res) => {
    const { marca, modelo, versao } = req.validated;
    const results = vehicles.filter(
      (v) =>
        v.marca.toLowerCase() === marca.toLowerCase() &&
        v.modelo.toLowerCase() === modelo.toLowerCase() &&
        v.versao === versao
    );

    if (req.query.bulk === 'true') {
      trackAnomaly('massive_query_attempt', {
        userId: req.user.id,
        path: '/api/vehicles',
      });
      recordAudit({
        action: 'massive_vehicle_query',
        actor: req.user.id,
        role: req.user.role,
        details: { marca, modelo, versao },
      });
    }

    res.json({ data: results, count: results.length });
  }
);

module.exports = router;
