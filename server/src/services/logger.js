const winston = require('winston');
const config = require('../config');

const SENSITIVE_KEYS = [
  'password',
  'token',
  'refreshToken',
  'authorization',
  'customerEmail',
  'customerPhone',
  'customerName',
  'vin',
  'notes',
  'cpf',
  'creditCard',
];

function redact(value, depth = 0) {
  if (depth > 5) return '[MaxDepth]';
  if (value == null) return value;
  if (typeof value === 'string') {
    if (value.includes('@')) return '[email-redacted]';
    if (value.length > 20) return '[string-redacted]';
    return value;
  }
  if (Array.isArray(value)) return value.map((v) => redact(v, depth + 1));
  if (typeof value === 'object') {
    const out = {};
    for (const [k, v] of Object.entries(value)) {
      if (SENSITIVE_KEYS.some((s) => k.toLowerCase().includes(s.toLowerCase()))) {
        out[k] = '[redacted]';
      } else {
        out[k] = redact(v, depth + 1);
      }
    }
    return out;
  }
  return value;
}

const logger = winston.createLogger({
  level: config.nodeEnv === 'production' ? 'info' : 'debug',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: config.nodeEnv !== 'production' }),
    winston.format.json()
  ),
  defaultMeta: { service: 'ford-api' },
  transports: [new winston.transports.Console()],
});

function secureLog(level, message, meta = {}) {
  logger.log(level, message, redact(meta));
}

module.exports = { logger, secureLog, redact };
