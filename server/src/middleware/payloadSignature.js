const crypto = require('crypto');
const config = require('../config');

const SIGNED_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);
const MAX_SKEW_MS = 5 * 60 * 1000;

function verifyPayloadSignature(req, res, next) {
  if (!SIGNED_METHODS.has(req.method)) {
    return next();
  }

  const signature = req.headers['x-payload-signature'];
  const timestamp = req.headers['x-payload-timestamp'];

  if (!signature || !timestamp) {
    return res.status(401).json({
      error: 'Assinatura de payload obrigatória',
      code: 'SIGNATURE_REQUIRED',
    });
  }

  const ts = Number(timestamp);
  if (!Number.isFinite(ts) || Math.abs(Date.now() - ts) > MAX_SKEW_MS) {
    return res.status(401).json({
      error: 'Timestamp de assinatura inválido',
      code: 'SIGNATURE_EXPIRED',
    });
  }

  const body =
    req.rawBody ||
    (req.body && Object.keys(req.body).length
      ? JSON.stringify(req.body)
      : '');

  const expected = crypto
    .createHmac('sha256', config.payloadHmacSecret)
    .update(`${timestamp}.${body}`)
    .digest('hex');

  const sigBuffer = Buffer.from(signature, 'hex');
  const expectedBuffer = Buffer.from(expected, 'hex');

  if (
    sigBuffer.length !== expectedBuffer.length ||
    !crypto.timingSafeEqual(sigBuffer, expectedBuffer)
  ) {
    return res.status(401).json({
      error: 'Assinatura de payload inválida',
      code: 'INVALID_SIGNATURE',
    });
  }

  next();
}

function signPayload(body, timestamp = Date.now()) {
  const serialized = typeof body === 'string' ? body : JSON.stringify(body);
  const signature = crypto
    .createHmac('sha256', config.payloadHmacSecret)
    .update(`${timestamp}.${serialized}`)
    .digest('hex');
  return { signature, timestamp: String(timestamp), body: serialized };
}

module.exports = { verifyPayloadSignature, signPayload };
