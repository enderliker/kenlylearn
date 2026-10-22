import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { db } from '@/db';
import { userSettings } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { decryptSecret } from '@/lib/crypto/encryption';

const NVIDIA_BASE_URL = process.env.NVIDIA_BASE_URL || 'https://integrate.api.nvidia.com/v1';

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let apiKey: string | null = null;

  try {
    const body = await req.json().catch(() => ({}));
    if (body.apiKey && typeof body.apiKey === 'string') {
      apiKey = body.apiKey.trim();
    }
  } catch {
    // Ignore JSON parse error, fallback to stored key
  }

  // If no in-flight key provided, retrieve stored decrypted key
  if (!apiKey) {
    const [settings] = await db
      .select({
        encryptedApiKey: userSettings.encryptedApiKey,
        keyIv: userSettings.keyIv,
        keyTag: userSettings.keyTag,
      })
      .from(userSettings)
      .where(eq(userSettings.userId, session.user.id))
      .limit(1);

    if (settings?.encryptedApiKey && settings?.keyIv && settings?.keyTag) {
      try {
        apiKey = decryptSecret(
          settings.encryptedApiKey,
          settings.keyIv,
          settings.keyTag
        );
      } catch {
        return NextResponse.json(
          { error: 'Failed to decrypt stored credential.' },
          { status: 500 }
        );
      }
    }
  }

  if (!apiKey) {
    return NextResponse.json(
      { error: 'No API key provided or found in user settings.' },
      { status: 400 }
    );
  }

  try {
    // Query NVIDIA NIM models endpoint to verify key credentials
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000); // 8s timeout

    const res = await fetch(`${NVIDIA_BASE_URL}/models`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (res.ok) {
      return NextResponse.json({
        success: true,
        message: 'Successfully authenticated with NVIDIA NIM API.',
      });
    } else {
      const errorText = await res.text().catch(() => '');
      return NextResponse.json(
        {
          success: false,
          error: `NVIDIA API responded with status ${res.status}: ${errorText || 'Authentication rejected.'}`,
        },
        { status: 400 }
      );
    }
  } catch (error: unknown) {
    const isTimeout = error instanceof Error && error.name === 'AbortError';
    return NextResponse.json(
      {
        success: false,
        error: isTimeout
          ? 'Connection to NVIDIA timed out after 8 seconds.'
          : 'Network error connecting to NVIDIA NIM API.',
      },
      { status: 504 }
    );
  }
}
