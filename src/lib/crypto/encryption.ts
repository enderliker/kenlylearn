import crypto from 'node:crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12; // 96 bits for GCM
const TAG_LENGTH = 16; // 128 bits auth tag

/**
 * Derives or verifies a 256-bit key from the environment secret
 */
function getMasterKey(): Buffer {
  const secret = process.env.ENCRYPTION_SECRET;
  if (!secret) {
    throw new Error('CRITICAL_SECURITY_ERROR: ENCRYPTION_SECRET is not defined in environment variables.');
  }

  // Derive a uniform 32-byte key via SHA-256 hash of the master secret
  return crypto.createHash('sha256').update(secret).digest();
}

export interface EncryptedData {
  ciphertext: string;
  iv: string;
  tag: string;
}

/**
 * Encrypts a sensitive string using AES-256-GCM authenticated encryption.
 * Guaranteed to produce unique ciphertext and IV per invocation.
 */
export function encryptSecret(plaintext: string): EncryptedData {
  if (!plaintext) {
    throw new Error('Encryption error: Plaintext cannot be empty.');
  }

  const key = getMasterKey();
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv, { authTagLength: TAG_LENGTH });

  let encrypted = cipher.update(plaintext, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const tag = cipher.getAuthTag().toString('hex');

  return {
    ciphertext: encrypted,
    iv: iv.toString('hex'),
    tag,
  };
}

/**
 * Decrypts ciphertext using AES-256-GCM.
 * Validates the authentication tag to guarantee integrity and authenticity.
 */
export function decryptSecret(ciphertext: string, ivHex: string, tagHex: string): string {
  if (!ciphertext || !ivHex || !tagHex) {
    throw new Error('Decryption error: Missing ciphertext, IV, or authentication tag.');
  }

  const key = getMasterKey();
  const iv = Buffer.from(ivHex, 'hex');
  const tag = Buffer.from(tagHex, 'hex');

  if (iv.length !== IV_LENGTH) {
    throw new Error('Decryption security violation: Invalid IV length.');
  }
  if (tag.length !== TAG_LENGTH) {
    throw new Error('Decryption security violation: Invalid authentication tag length.');
  }

  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv, { authTagLength: TAG_LENGTH });
  decipher.setAuthTag(tag);

  let decrypted = decipher.update(ciphertext, 'hex', 'utf8');
  decrypted += decipher.final('utf8');

  return decrypted;
}

/**
 * Safely masks an API key for UI display (e.g., nvapi-4a1...9x3)
 * Never exposes the internal characters.
 */
export function maskApiKey(apiKey: string): string {
  if (!apiKey || apiKey.length < 10) {
    return '••••••••';
  }
  const prefix = apiKey.slice(0, 8);
  const suffix = apiKey.slice(-4);
  return `${prefix}••••••••••••${suffix}`;
}
