import { SECURITY_CONFIG } from '../config/security';
import { truncatePayload } from './inputGuards';
import { hmacSha256Hex } from './webCrypto';

export async function signRequestPayload(body: unknown): Promise<{
  signature: string;
  timestamp: string;
  serialized: string;
}> {
  const timestamp = String(Date.now());
  const serialized = truncatePayload(body);
  const signature = await hmacSha256Hex(
    `${timestamp}.${serialized}`,
    SECURITY_CONFIG.payloadHmacSecret
  );
  return { signature, timestamp, serialized };
}

export function buildSignedHeaders(signature: string, timestamp: string) {
  return {
    'X-Payload-Signature': signature,
    'X-Payload-Timestamp': timestamp,
  };
}
