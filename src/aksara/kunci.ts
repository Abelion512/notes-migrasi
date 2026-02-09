import argon2 from 'argon2-browser';

const VERSION = 'v1';

interface EncryptedPayload {
  __enc: string;
  iv: string;
  data: string;
}

function toBase64(buffer: ArrayBuffer | Uint8Array): string {
  return btoa(String.fromCharCode(...new Uint8Array(buffer)));
}

function toBuffer(base64: string): Uint8Array {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

/**
 * Membuat garam (salt) acak 32-byte untuk KDF.
 */
export function buatSalt(): Uint8Array {
  return crypto.getRandomValues(new Uint8Array(32));
}

export async function buatKunciPBKDF2(passphrase: string, salt: Uint8Array): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(passphrase),
    'PBKDF2',
    false,
    ['deriveKey']
  );

  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt as unknown as ArrayBuffer,
      iterations: 600000,
      hash: 'SHA-256'
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

/**
 * Membuat kunci menggunakan Argon2id (Memory-hard).
 * Parameter sesuai rekomendasi OWASP: 19MB RAM, 2 iterasi.
 */
export async function buatKunciArgon2(passphrase: string, salt: Uint8Array): Promise<CryptoKey> {
  const result = await argon2.hash({
    pass: passphrase,
    salt: salt,
    time: 2, // Iterasi
    mem: 19 * 1024, // 19MiB
    hashLen: 32,
    type: argon2.ArgonType.Argon2id,
  });

  return crypto.subtle.importKey(
    'raw',
    result.hash.buffer as ArrayBuffer,
    { name: 'AES-GCM' },
    false,
    ['encrypt', 'decrypt']
  );
}

export async function buatKunci(passphrase: string, salt: Uint8Array, type: 'pbkdf2' | 'argon2id' = 'pbkdf2'): Promise<CryptoKey> {
  if (type === 'argon2id') {
    return buatKunciArgon2(passphrase, salt);
  }
  return buatKunciPBKDF2(passphrase, salt);
}

export async function enkripsi(value: unknown, key: CryptoKey): Promise<EncryptedPayload> {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encoded = new TextEncoder().encode(JSON.stringify(value));
  const ciphertext = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv: iv as unknown as ArrayBuffer },
    key,
    encoded
  );
  return {
    __enc: VERSION,
    iv: toBase64(iv),
    data: toBase64(ciphertext)
  };
}

export async function dekripsi(payload: unknown, key: CryptoKey): Promise<unknown> {
  if (!payload || typeof payload !== 'object' || (payload as Record<string, unknown>).__enc !== VERSION) return payload;

  const p = payload as EncryptedPayload;
  const iv = toBuffer(p.iv);
  const data = toBuffer(p.data);
  const decrypted = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv: iv as unknown as ArrayBuffer },
    key,
    data as unknown as ArrayBuffer
  );
  const text = new TextDecoder().decode(decrypted);
  return JSON.parse(text);
}
