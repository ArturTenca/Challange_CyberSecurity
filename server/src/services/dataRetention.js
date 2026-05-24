const config = require('../config');
const { leads, maintenanceHistory, auditLogs } = require('../data/store');
const { recordAudit } = require('./auditLog');
const { secureLog } = require('./logger');

function purgeExpiredRecords() {
  const now = Date.now();
  const leadCutoff = now - config.retentionDays.leads * 86400000;
  const maintCutoff = now - config.retentionDays.maintenance * 86400000;
  const auditCutoff = now - config.retentionDays.auditLogs * 86400000;

  const beforeLeads = leads.length;
  for (let i = leads.length - 1; i >= 0; i -= 1) {
    if (new Date(leads[i].createdAt).getTime() < leadCutoff) {
      leads.splice(i, 1);
    }
  }

  const beforeMaint = maintenanceHistory.length;
  for (let i = maintenanceHistory.length - 1; i >= 0; i -= 1) {
    if (new Date(maintenanceHistory[i].createdAt).getTime() < maintCutoff) {
      maintenanceHistory.splice(i, 1);
    }
  }

  const beforeAudit = auditLogs.length;
  for (let i = auditLogs.length - 1; i >= 0; i -= 1) {
    if (new Date(auditLogs[i].timestamp).getTime() < auditCutoff) {
      auditLogs.splice(i, 1);
    }
  }

  const summary = {
    leadsRemoved: beforeLeads - leads.length,
    maintenanceRemoved: beforeMaint - maintenanceHistory.length,
    auditRemoved: beforeAudit - auditLogs.length,
  };

  if (
    summary.leadsRemoved ||
    summary.maintenanceRemoved ||
    summary.auditRemoved
  ) {
    recordAudit({
      action: 'data_retention_purge',
      actor: 'system',
      details: summary,
    });
    secureLog('info', 'retention_purge_completed', summary);
  }

  return summary;
}

module.exports = { purgeExpiredRecords };
