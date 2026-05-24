const SENSITIVE_KEYS = [
  'password',
  'token',
  'refreshToken',
  'authorization',
  'email',
  'phone',
  'cpf',
  'vin',
];

function redactMeta(meta: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(meta)) {
    if (SENSITIVE_KEYS.some((s) => key.toLowerCase().includes(s))) {
      out[key] = '[redacted]';
    } else if (typeof value === 'object' && value !== null) {
      out[key] = redactMeta(value as Record<string, unknown>);
    } else {
      out[key] = value;
    }
  }
  return out;
}

export const secureLogger = {
  info(event: string, meta: Record<string, unknown> = {}) {
    if (__DEV__) {
      console.log(
        JSON.stringify({
          level: 'info',
          event,
          timestamp: new Date().toISOString(),
          ...redactMeta(meta),
        })
      );
    }
  },
  warn(event: string, meta: Record<string, unknown> = {}) {
    console.warn(
      JSON.stringify({
        level: 'warn',
        event,
        timestamp: new Date().toISOString(),
        ...redactMeta(meta),
      })
    );
  },
  error(event: string, meta: Record<string, unknown> = {}) {
    console.error(
      JSON.stringify({
        level: 'error',
        event,
        timestamp: new Date().toISOString(),
        ...redactMeta(meta),
      })
    );
  },
};
