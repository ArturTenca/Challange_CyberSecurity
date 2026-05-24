const { secureLog } = require('../services/logger');

function secureErrorHandler(err, req, res, _next) {
  secureLog('error', 'unhandled_error', {
    path: req.path,
    method: req.method,
    message: err.message,
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack }),
  });

  const status = err.status || err.statusCode || 500;
  const publicMessage =
    status >= 500
      ? 'Erro interno. Tente novamente mais tarde.'
      : err.publicMessage || 'Requisição não pôde ser processada.';

  res.status(status).json({
    error: publicMessage,
    code: err.code || 'REQUEST_FAILED',
    requestId: req.requestId,
  });
}

module.exports = { secureErrorHandler };
