/**
 * HMAC/SHA256 via Web Crypto (funciona no Expo Web sem dependências extras)
 */
function toHex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

function getSubtle(): SubtleCrypto {
  const subtle = globalThis.crypto?.subtle;
  if (!subtle) {
    throw new Error('Web Crypto não disponível neste ambiente');
  }
  return subtle;
}

export async function hmacSha256Hex(
  message: string,
  secret: string
): Promise<string> {
  const enc = new TextEncoder();
  const subtle = getSubtle();
  const key = await subtle.importKey(
    'raw',
    enc.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const signature = await subtle.sign('HMAC', key, enc.encode(message));
  return toHex(signature);
}

export async function sha256Hex(value: string): Promise<string> {
  const enc = new TextEncoder();
  const digest = await getSubtle().digest('SHA-256', enc.encode(value));
  return toHex(digest);
}
