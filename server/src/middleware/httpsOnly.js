const config = require('../config');

function enforceHttps(req, res, next) {
  if (config.nodeEnv !== 'production') {
    return next();
  }

  const proto =
    req.headers['x-forwarded-proto'] ||
    (req.secure ? 'https' : 'http');

  if (proto !== 'https') {
    return res.status(403).json({
      error: 'HTTPS obrigatório (TLS 1.2+)',
      code: 'HTTPS_REQUIRED',
    });
  }
  next();
}

module.exports = { enforceHttps };
