import { test, describe, before } from 'node:test';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';

describe('AES-256-GCM Encryption & Decryption Security Suite', () => {
  const TEST_SECRET = '0123456789abcdef0123456789abcdef';
  process.env.ENCRYPTION_SECRET = TEST_SECRET;

  function getMasterKey() {
    return crypto.createHash('sha256').update(process.env.ENCRYPTION_SECRET).digest();
  }

  function encryptSecret(plaintext) {
    const key = getMasterKey();
    const iv = crypto.randomBytes(12);
    const cipher = crypto.createCipheriv('aes-256-gcm', key, iv, { authTagLength: 16 });
    let encrypted = cipher.update(plaintext, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return {
      ciphertext: encrypted,
      iv: iv.toString('hex'),
      tag: cipher.getAuthTag().toString('hex'),
    };
  }

  function decryptSecret(ciphertext, ivHex, tagHex) {
    const key = getMasterKey();
    const iv = Buffer.from(ivHex, 'hex');
    const tag = Buffer.from(tagHex, 'hex');
    const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv, { authTagLength: 16 });
    decipher.setAuthTag(tag);
    let decrypted = decipher.update(ciphertext, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  }

  function maskApiKey(apiKey) {
    if (!apiKey || apiKey.length < 10) return '••••••••';
    const prefix = apiKey.slice(0, 8);
    const suffix = apiKey.slice(-4);
    return `${prefix}••••••••••••${suffix}`;
  }

  test('successfully encrypts and decrypts user API keys without alteration', () => {
    const sampleApiKey = 'nvapi-TEST-sample-key-1234567890abcdefghijklmnopqrstuvwxyz';
    const encrypted = encryptSecret(sampleApiKey);

    assert.notEqual(encrypted.ciphertext, sampleApiKey);
    assert.equal(encrypted.iv.length, 24); // 12 bytes in hex = 24 chars
    assert.equal(encrypted.tag.length, 32); // 16 bytes in hex = 32 chars

    const decrypted = decryptSecret(encrypted.ciphertext, encrypted.iv, encrypted.tag);
    assert.equal(decrypted, sampleApiKey);
  });

  test('produces unique IVs and ciphertexts for identical plaintexts (non-deterministic)', () => {
    const raw = 'nvapi-SAME-INPUT-KEY';
    const enc1 = encryptSecret(raw);
    const enc2 = encryptSecret(raw);

    assert.notEqual(enc1.iv, enc2.iv);
    assert.notEqual(enc1.ciphertext, enc2.ciphertext);
  });

  test('fails decryption with authentication error if ciphertext is tampered', () => {
    const raw = 'nvapi-SECRET-CREDENTIAL';
    const encrypted = encryptSecret(raw);

    // Tamper ciphertext
    const tampered = encrypted.ciphertext.slice(0, -2) + '00';

    assert.throws(
      () => decryptSecret(tampered, encrypted.iv, encrypted.tag),
      /Unsupported state or unable to authenticate data/
    );
  });

  test('fails decryption if authentication tag is corrupted', () => {
    const raw = 'nvapi-SECRET-CREDENTIAL';
    const encrypted = encryptSecret(raw);

    const corruptedTag = '00'.repeat(16);

    assert.throws(
      () => decryptSecret(encrypted.ciphertext, encrypted.iv, corruptedTag),
      /Unsupported state or unable to authenticate data/
    );
  });

  test('safely masks API keys avoiding internal token exposure', () => {
    const key = 'nvapi-9a8b7c6d5e4f3a2b1c0';
    const masked = maskApiKey(key);

    assert.ok(masked.startsWith('nvapi-9a'));
    assert.ok(masked.endsWith('b1c0'));
    assert.ok(masked.includes('••••'));
    assert.ok(!masked.includes('7c6d5e4f3a2'));
  });
});
