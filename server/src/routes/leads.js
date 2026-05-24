const express = require('express');
const { addLead, getLeadsForRole } = require('../data/store');
const { authenticate } = require('../middleware/auth');
const { requirePermission } = require('../middleware/rbac');
const { validateBody, leadSchema } = require('../middleware/validateInput');
const { recordAudit } = require('../services/auditLog');
const { anonymizeLeadForMl } = require('../services/anonymization');

const router = express.Router();

router.post(
  '/',
  authenticate,
  requirePermission('leads:write'),
  validateBody(leadSchema),
  (req, res) => {
    const lead = addLead(req.validated);
    recordAudit({
      action: 'lead_created',
      actor: req.user.id,
      role: req.user.role,
      resourceId: lead.id,
    });
    res.status(201).json({
      success: true,
      id: lead.id,
      createdAt: lead.createdAt,
    });
  }
);

router.get(
  '/',
  authenticate,
  requirePermission('leads:read'),
  (req, res) => {
    const data = getLeadsForRole(req.user.role);
    recordAudit({
      action: 'leads_listed',
      actor: req.user.id,
      role: req.user.role,
      count: data.length,
    });
    res.json({ data, count: data.length });
  }
);

router.get(
  '/analytics',
  authenticate,
  requirePermission('analytics:read'),
  (_req, res) => {
    const { leads } = require('../data/store');
    const anonymized = leads.map(anonymizeLeadForMl);
    res.json({ data: anonymized, purpose: 'ml_dashboard' });
  }
);

module.exports = router;
