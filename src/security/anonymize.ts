import { sha256Hex } from './webCrypto';

export async function hashIdentifier(value: string): Promise<string> {
  return (await sha256Hex(value)).slice(0, 16);
}

export function maskEmail(email: string): string {
  if (!email.includes('@')) return '***@***';
  const [local, domain] = email.split('@');
  return `${local.slice(0, 1)}***@${domain}`;
}

export async function anonymizeForDashboard<T extends Record<string, unknown>>(
  record: T,
  fieldsToDrop: string[] = ['email', 'phone', 'name', 'cpf', 'vin']
): Promise<Record<string, unknown>> {
  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(record)) {
    if (fieldsToDrop.includes(key)) continue;
    if (key === 'id' && typeof value === 'string') {
      out[key] = await hashIdentifier(value);
    } else {
      out[key] = value;
    }
  }
  return out;
}
