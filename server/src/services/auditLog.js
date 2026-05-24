const { auditLogs } = require('../data/store');
const { secureLog } = require('./logger');

function recordAudit(entry) {
  const record = {
    id: `audit-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    timestamp: new Date().toISOString(),
    ...entry,
  };
  auditLogs.push(record);
  if (auditLogs.length > 5000) {
    auditLogs.splice(0, auditLogs.length - 5000);
  }
  secureLog('info', 'audit_event', record);
  return record;
}

module.exports = { recordAudit };
