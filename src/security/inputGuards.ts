const INJECTION_PATTERNS = [
  /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|UNION|ALTER)\b)/i,
  /(--|#|\/\*)/,
  /(<script|javascript:|on\w+\s*=)/i,
  /(\||;|`|\$\()/,
  /(\.\.\/|\\x00)/,
];

export const INPUT_LIMITS = {
  shortText: 120,
  mediumText: 500,
  email: 254,
  password: 128,
  phone: 20,
};

export function containsMaliciousPattern(value: string): boolean {
  return INJECTION_PATTERNS.some((pattern) => pattern.test(value));
}

export function assertSafeString(
  value: string,
  maxLength: number = INPUT_LIMITS.mediumText
): { safe: boolean; reason?: string } {
  if (value.length > maxLength) {
    return { safe: false, reason: `Máximo ${maxLength} caracteres` };
  }
  if (containsMaliciousPattern(value)) {
    return { safe: false, reason: 'Caracteres ou padrões não permitidos' };
  }
  return { safe: true };
}

export function truncatePayload(body: unknown): string {
  const serialized = JSON.stringify(body ?? {});
  if (serialized.length > INPUT_LIMITS.mediumText * 20) {
    throw new Error('Payload excede limite permitido');
  }
  return serialized;
}
