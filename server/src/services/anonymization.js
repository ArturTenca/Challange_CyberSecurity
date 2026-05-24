const crypto = require('crypto');

function hashIdentifier(value) {
  return crypto
    .createHash('sha256')
    .update(String(value))
    .digest('hex')
    .slice(0, 16);
}

function maskEmail(email) {
  if (!email || !email.includes('@')) return '***@***';
  const [local, domain] = email.split('@');
  return `${local.slice(0, 1)}***@${domain}`;
}

function anonymizeLeadForMl(lead) {
  return {
    id: hashIdentifier(lead.id),
    region: lead.region || 'unknown',
    vehicleInterest: lead.vehicleInterest,
    createdMonth: lead.createdAt?.slice(0, 7) || null,
    scoreBand: lead.scoreBand || null,
  };
}

function anonymizeMaintenanceForDashboard(record) {
  return {
    id: hashIdentifier(record.id),
    serviceType: record.serviceType,
    month: record.createdAt?.slice(0, 7) || null,
    mileageBand: record.mileageBand || null,
  };
}

module.exports = {
  hashIdentifier,
  maskEmail,
  anonymizeLeadForMl,
  anonymizeMaintenanceForDashboard,
};
