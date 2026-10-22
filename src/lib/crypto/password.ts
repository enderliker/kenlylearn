import { hash, verify } from '@node-rs/argon2';

/**
 * OWASP recommended parameters for Argon2id password hashing:
 * - memoryCost: 65536 KiB (64 MiB)
 * - timeCost: 3 iterations
 * - parallelism: 1 thread (suitable for serverless Node runtimes)
 */
const ARGON2ID_OPTIONS = {
  memoryCost: 65536,
  timeCost: 3,
  parallelism: 1,
};

/**
 * Hashes a plaintext password using salted Argon2id.
 * Plaintext is never stored or logged.
 */
export async function hashPassword(password: string): Promise<string> {
  if (!password || password.length < 8) {
    throw new Error('Password security requirement: Must be at least 8 characters.');
  }

  return hash(password, ARGON2ID_OPTIONS);
}

/**
 * Verifies a plaintext password against a stored Argon2id hash.
 * Constant-time comparison prevents timing side-channel attacks.
 */
export async function verifyPassword(passwordHash: string, candidate: string): Promise<boolean> {
  if (!passwordHash || !candidate) {
    return false;
  }

  try {
    return await verify(passwordHash, candidate, ARGON2ID_OPTIONS);
  } catch {
    return false;
  }
}
