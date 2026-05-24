const { secureLog } = require('./logger');

const failedAttempts = new Map();
const ALERT_THRESHOLD = 5;
const WINDOW_MS = 15 * 60 * 1000;

function trackFailedAuth(identifier, ip) {
  const key = `${identifier}:${ip || 'unknown'}`;
  const now = Date.now();
  const attempts = (failedAttempts.get(key) || []).filter(
    (t) => now - t < WINDOW_MS
  );
  attempts.push(now);
  failedAttempts.set(key, attempts);

  if (attempts.length >= ALERT_THRESHOLD) {
    secureLog('warn', 'suspicious_auth_activity', {
      type: 'repeated_login_failures',
      identifier: '[redacted]',
      ip,
      count: attempts.length,
      windowMinutes: WINDOW_MS / 60000,
    });
    return { suspicious: true, count: attempts.length };
  }
  return { suspicious: false, count: attempts.length };
}

function clearFailedAuth(identifier, ip) {
  failedAttempts.delete(`${identifier}:${ip || 'unknown'}`);
}

function trackAnomaly(type, meta = {}) {
  secureLog('warn', 'suspicious_activity', { type, ...meta });
}

module.exports = { trackFailedAuth, clearFailedAuth, trackAnomaly };
