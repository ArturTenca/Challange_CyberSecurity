const { z } = require('zod');

const INJECTION_PATTERNS = [
  /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|UNION|ALTER)\b)/i,
  /(--|#|\/\*)/,
  /(<script|javascript:|on\w+\s*=)/i,
  /(\||;|`|\$\()/,
  /(\.\.\/|\\x00)/,
];

const MAX_STRING = 500;
const MAX_PAYLOAD_BYTES = 64 * 1024;

function hasMaliciousPattern(value) {
  if (typeof value !== 'string') return false;
  return INJECTION_PATTERNS.some((p) => p.test(value));
}

function scanObject(obj, path = '') {
  if (obj == null) return null;
  if (typeof obj === 'string') {
    if (obj.length > MAX_STRING) {
      return { path, reason: 'string_too_long' };
    }
    if (hasMaliciousPattern(obj)) {
      return { path, reason: 'malicious_pattern' };
    }
    return null;
  }
  if (Array.isArray(obj)) {
    for (let i = 0; i < obj.length; i += 1) {
      const hit = scanObject(obj[i], `${path}[${i}]`);
      if (hit) return hit;
    }
    return null;
  }
  if (typeof obj === 'object') {
    for (const [key, value] of Object.entries(obj)) {
      const hit = scanObject(value, path ? `${path}.${key}` : key);
      if (hit) return hit;
    }
  }
  return null;
}

const vehicleQuerySchema = z.object({
  marca: z
    .string()
    .min(1)
    .max(50)
    .regex(/^[A-Za-zÀ-ÿ0-9\s-]+$/),
  modelo: z
    .string()
    .min(1)
    .max(80)
    .regex(/^[A-Za-zÀ-ÿ0-9\s-]+$/),
  versao: z
    .string()
    .min(4)
    .max(10)
    .regex(/^\d{4}$/),
});

const leadSchema = z.object({
  customerName: z.string().min(2).max(120),
  customerEmail: z.string().email().max(254),
  customerPhone: z.string().min(8).max(20),
  vehicleInterest: z.string().min(2).max(120),
  region: z.string().max(80).optional(),
  scoreBand: z.enum(['low', 'medium', 'high']).optional(),
});

function validateBody(schema) {
  return (req, res, next) => {
    const contentLength = Number(req.headers['content-length'] || 0);
    if (contentLength > MAX_PAYLOAD_BYTES) {
      return res.status(413).json({
        error: 'Payload muito grande',
        code: 'PAYLOAD_TOO_LARGE',
      });
    }

    const scan = scanObject(req.body);
    if (scan) {
      return res.status(400).json({
        error: 'Entrada inválida ou não permitida',
        code: 'INVALID_INPUT',
      });
    }

    const parsed = schema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        error: 'Dados inválidos',
        code: 'VALIDATION_ERROR',
        details: parsed.error.issues.map((i) => ({
          field: i.path.join('.'),
          message: i.message,
        })),
      });
    }

    req.validated = parsed.data;
    next();
  };
}

function validateVehicleQuery(req, res, next) {
  const scan = scanObject(req.query);
  if (scan) {
    return res.status(400).json({
      error: 'Parâmetros inválidos',
      code: 'INVALID_INPUT',
    });
  }

  const parsed = vehicleQuerySchema.safeParse(req.query);
  if (!parsed.success) {
    return res.status(400).json({
      error: 'Parâmetros de veículo inválidos (marca, modelo, versão)',
      code: 'VALIDATION_ERROR',
    });
  }

  req.validated = parsed.data;
  next();
}

module.exports = {
  validateBody,
  validateVehicleQuery,
  leadSchema,
  vehicleQuerySchema,
  hasMaliciousPattern,
  scanObject,
};
