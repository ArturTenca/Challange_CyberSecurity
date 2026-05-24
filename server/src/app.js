const crypto = require('crypto');
const path = require('path');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const bcrypt = require('bcryptjs');
const config = require('./config');
const { users } = require('./data/store');
const { enforceHttps } = require('./middleware/httpsOnly');
const { verifyPayloadSignature } = require('./middleware/payloadSignature');
const { secureErrorHandler } = require('./middleware/secureErrorHandler');
const { secureLog } = require('./services/logger');
const { purgeExpiredRecords } = require('./services/dataRetention');

const authRoutes = require('./routes/auth');
const vehicleRoutes = require('./routes/vehicles');
const leadRoutes = require('./routes/leads');
const adminRoutes = require('./routes/admin');

let initialized = false;
let initPromise = null;

async function seedUsers() {
  const demoPassword = 'Ford@2026';
  const hash = await bcrypt.hash(demoPassword, 10);
  for (const user of users) {
    user.passwordHash = hash;
  }
  secureLog('info', 'demo_users_seeded', {
    accounts: users.map((u) => ({ email: u.email, role: u.role })),
    passwordHint: 'Ford@2026 (apenas desenvolvimento)',
  });
}

function initializeApp() {
  if (initialized) {
    return Promise.resolve();
  }

  if (!initPromise) {
    initPromise = (async () => {
      await seedUsers();
      purgeExpiredRecords();
      initialized = true;
    })();
  }

  return initPromise;
}

const app = express();

if (config.trustProxy) {
  app.set('trust proxy', 1);
}

app.use(async (_req, _res, next) => {
  try {
    await initializeApp();
    next();
  } catch (err) {
    next(err);
  }
});

app.use(
  helmet({
    contentSecurityPolicy: false,
  })
);
app.use(enforceHttps);

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || config.isAllowedOrigin(origin)) {
        callback(null, true);
      } else {
        callback(new Error('CORS não permitido'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'X-Payload-Signature',
      'X-Payload-Timestamp',
    ],
  })
);

app.use(
  express.json({
    limit: '64kb',
    verify: (req, _res, buf) => {
      req.rawBody = buf.toString('utf8');
    },
  })
);

app.use((req, res, next) => {
  req.requestId = crypto.randomUUID();
  res.setHeader('X-Request-Id', req.requestId);
  next();
});

const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'Muitas requisições. Tente novamente mais tarde.',
    code: 'RATE_LIMIT',
  },
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: {
    error: 'Muitas tentativas de login.',
    code: 'AUTH_RATE_LIMIT',
  },
});

app.use(globalLimiter);

app.use(express.static(path.join(__dirname, '../public')));

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', tls: 'required-in-production' });
});

app.get('/', (_req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/vehicles', verifyPayloadSignature, vehicleRoutes);
app.use('/api/leads', verifyPayloadSignature, leadRoutes);
app.use('/api/admin', verifyPayloadSignature, adminRoutes);

app.use((err, req, res, next) => {
  if (err.message === 'CORS não permitido') {
    return res.status(403).json({
      error: 'Origem não autorizada',
      code: 'CORS_FORBIDDEN',
    });
  }
  return secureErrorHandler(err, req, res, next);
});

app.use(secureErrorHandler);

module.exports = { app, initializeApp, purgeExpiredRecords, secureLog, config };