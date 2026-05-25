const crypto = require('crypto');

require('dotenv').config();

const DEFAULT_CORS =
  'http://localhost:8081,http://localhost:19006,http://localhost:8082,http://127.0.0.1:8081,http://127.0.0.1:19006,https://*.vercel.app';

const parseOrigins = (value) =>
  (value || DEFAULT_CORS)
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean);

const matchesOriginPattern = (origin, pattern) => {
  if (pattern === origin) return true;
  if (!pattern.includes('*')) return false;

  const escaped = pattern
    .replace(/[.+?^${}()|[\]\\]/g, '\\$&')
    .replace(/\*/g, '.*');

  return new RegExp(`^${escaped}$`).test(origin);
};

const corsOrigins = parseOrigins(process.env.CORS_ORIGINS);

const isAllowedOrigin = (origin) =>
  corsOrigins.some((allowedOrigin) => matchesOriginPattern(origin, allowedOrigin));

function getRequiredSecret(name, minLength = 32) {
  const value = process.env[name];
  if (value && value.length >= minLength) {
    return value;
  }

  if (process.env.NODE_ENV === 'production') {
    throw new Error(`${name} must be set with at least ${minLength} characters`);
  }

  return crypto.randomBytes(Math.max(minLength, 32)).toString('hex');
}

module.exports = {
  port: Number(process.env.PORT) || 3001,
  nodeEnv: process.env.NODE_ENV || 'development',
  jwtSecret: getRequiredSecret('JWT_SECRET'),
  jwtRefreshSecret: getRequiredSecret('JWT_REFRESH_SECRET'),
  payloadHmacSecret: getRequiredSecret('PAYLOAD_HMAC_SECRET'),
  dataEncryptionKey: getRequiredSecret('DATA_ENCRYPTION_KEY'),
  corsOrigins,
  isAllowedOrigin,
  trustProxy: process.env.TRUST_PROXY === 'true',
  accessTokenTtl: '15m',
  refreshTokenTtl: '7d',
  retentionDays: {
    leads: 365,
    maintenance: 730,
    auditLogs: 90,
  },
};
