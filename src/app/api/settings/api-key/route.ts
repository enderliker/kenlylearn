import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { db } from '@/db';
import { userSettings } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { encryptSecret, decryptSecret, maskApiKey } from '@/lib/crypto/encryption';
import { z } from 'zod';

const apiKeySchema = z.object({
  apiKey: z.string().min(10).max(256),
});

/**
 * GET /api/settings/api-key
 * Returns masked API key status. Never exposes plaintext key to the browser.
 */
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const [settings] = await db
    .select({
      encryptedApiKey: userSettings.encryptedApiKey,
      keyIv: userSettings.keyIv,
      keyTag: userSettings.keyTag,
      keyUpdatedAt: userSettings.keyUpdatedAt,
    })
    .from(userSettings)
    .where(eq(userSettings.userId, session.user.id))
    .limit(1);

  if (!settings?.encryptedApiKey || !settings?.keyIv || !settings?.keyTag) {
    return NextResponse.json({
      hasKey: false,
      maskedKey: null,
      updatedAt: null,
    });
  }

  try {
    const decrypted = decryptSecret(
      settings.encryptedApiKey,
      settings.keyIv,
      settings.keyTag
    );

    return NextResponse.json({
      hasKey: true,
      maskedKey: maskApiKey(decrypted),
      updatedAt: settings.keyUpdatedAt,
    });
  } catch {
    return NextResponse.json({
      hasKey: false,
      maskedKey: null,
      error: 'Corrupted credential detected. Please enter your key again.',
    });
  }
}

/**
 * POST /api/settings/api-key
 * Encrypts user API key using AES-256-GCM and persists to user_settings.
 */
export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const result = apiKeySchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: 'Invalid API key format. Key must be at least 10 characters.' },
        { status: 400 }
      );
    }

    const { apiKey } = result.data;
    const encrypted = encryptSecret(apiKey.trim());
    const now = new Date().toISOString();

    await db
      .insert(userSettings)
      .values({
        userId: session.user.id,
        encryptedApiKey: encrypted.ciphertext,
        keyIv: encrypted.iv,
        keyTag: encrypted.tag,
        keyUpdatedAt: now,
      })
      .onConflictDoUpdate({
        target: userSettings.userId,
        set: {
          encryptedApiKey: encrypted.ciphertext,
          keyIv: encrypted.iv,
          keyTag: encrypted.tag,
          keyUpdatedAt: now,
        },
      });

    return NextResponse.json({
      success: true,
      maskedKey: maskApiKey(apiKey.trim()),
      updatedAt: now,
    });
  } catch {
    console.error('Failed to securely persist encrypted API key.');
    return NextResponse.json(
      { error: 'Failed to encrypt and store API key. Please try again.' },
      { status: 500 }
    );
  }
}
