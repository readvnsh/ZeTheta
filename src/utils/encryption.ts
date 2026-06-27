const getCryptoKey = async (secret: string): Promise<CryptoKey> => {
  const rawSecret = new TextEncoder().encode(secret);
  const hash = await globalThis.crypto.subtle.digest('SHA-256', rawSecret);
  return globalThis.crypto.subtle.importKey(
    'raw',
    hash,
    { name: 'AES-GCM' },
    false,
    ['encrypt', 'decrypt'],
  );
};

/**
 * Encrypts plain text using AES-256-GCM.
 * @param plainText The text to encrypt.
 * @param secret The passphrase to derive key from.
 * @returns Base64 encoded encrypted string (includes IV prefix).
 */
export const encryptData = async (plainText: string, secret: string): Promise<string> => {
  const key = await getCryptoKey(secret);
  const iv = globalThis.crypto.getRandomValues(new Uint8Array(12));
  const data = new TextEncoder().encode(plainText);
  const cipherBuffer = await globalThis.crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    data,
  );

  const cipherArray = new Uint8Array(cipherBuffer);
  const combined = new Uint8Array(iv.length + cipherArray.length);
  combined.set(iv);
  combined.set(cipherArray, iv.length);

  return btoa(String.fromCharCode(...combined));
};

/**
 * Decrypts an AES-256-GCM encrypted Base64 string.
 * @param encryptedBase64 The base64 string.
 * @param secret The passphrase.
 */
export const decryptData = async (encryptedBase64: string, secret: string): Promise<string> => {
  const key = await getCryptoKey(secret);
  const combined = new Uint8Array(
    atob(encryptedBase64)
      .split('')
      .map((char) => char.charCodeAt(0)),
  );

  const iv = combined.slice(0, 12);
  const cipherText = combined.slice(12);

  const decryptedBuffer = await globalThis.crypto.subtle.decrypt(
    { name: 'AES-GCM', iv },
    key,
    cipherText,
  );

  return new TextDecoder().decode(decryptedBuffer);
};
