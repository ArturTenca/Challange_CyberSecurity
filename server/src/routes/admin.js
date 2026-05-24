const express = require('express');
const { auditLogs } = require('../data/store');
const { authenticate } = require('../middleware/auth');
const { requireRole } = require('../middleware/rbac');
const { purgeExpiredRecords } = require('../services/dataRetention');
const { recordAudit } = require('../services/auditLog');

const router = express.Router();

router.get(
  '/audit',
  authenticate,
  requireRole('administrador'),
  (req, res) => {
    const limit = Math.min(Number(req.query.limit) || 50, 200);
    const data = auditLogs.slice(-limit).reverse();
    res.json({ data, count: data.length });
  }
);

router.post(
  '/retention/purge',
  authenticate,
  requireRole('administrador'),
  (_req, res) => {
    const summary = purgeExpiredRecords();
    recordAudit({
      action: 'manual_retention_purge',
      actor: _req.user.id,
      details: summary,
    });
    res.json({ success: true, summary });
  }
);

module.exports = router;
