import { secureLogger } from './secureLogger';

export type AuditAction =
  | 'lead_submit'
  | 'vehicle_query'
  | 'config_change'
  | 'auth_failure'
  | 'sync_data';

const localAuditTrail: Array<{
  id: string;
  action: AuditAction;
  timestamp: string;
  meta: Record<string, unknown>;
}> = [];

export function recordClientAudit(
  action: AuditAction,
  meta: Record<string, unknown> = {}
) {
  const entry = {
    id: `client-audit-${Date.now()}`,
    action,
    timestamp: new Date().toISOString(),
    meta,
  };
  localAuditTrail.push(entry);
  if (localAuditTrail.length > 200) {
    localAuditTrail.shift();
  }
  secureLogger.info('audit_trail', entry);
}

export function getClientAuditTrail() {
  return [...localAuditTrail].reverse();
}
