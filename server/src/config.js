require('dotenv').config();

const DEFAULT_CORS =
  'http://localhost:8081,http://localhost:19006,http://localhost:8082,http://127.0.0.1:8081,http://127.0.0.1:19006';

const parseOrigins = (value) =>
  (value || DEFAULT_CORS)
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean);

module.exports = {
  port: Number(process.env.PORT) || 3001,
  nodeEnv: process.env.NODE_ENV || 'development',
  jwtSecret: process.env.JWT_SECRET || 'dev-jwt-secret-min-32-characters-long!!',
  jwtRefreshSecret:
    process.env.JWT_REFRESH_SECRET || 'dev-refresh-secret-min-32-characters!!',
  payloadHmacSecret:
    process.env.PAYLOAD_HMAC_SECRET || 'dev-hmac-secret-min-32-characters-long!!',
  dataEncryptionKey:
    process.env.DATA_ENCRYPTION_KEY || '0123456789abcdef0123456789abcdef',
  corsOrigins: parseOrigins(process.env.CORS_ORIGINS),
  trustProxy: process.env.TRUST_PROXY === 'true',
  accessTokenTtl: '15m',
  refreshTokenTtl: '7d',
  retentionDays: {
    leads: 365,
    maintenance: 730,
    auditLogs: 90,
  },
};
