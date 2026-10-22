import { NextResponse } from 'next/server';
import { db } from '@/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { hashPassword } from '@/lib/crypto/password';
import { z } from 'zod';
import crypto from 'node:crypto';

const registerSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  password: z.string().min(8).max(128),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const result = registerSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: 'Invalid input. Please ensure password is at least 8 characters long.' },
        { status: 400 }
      );
    }

    const { name, email, password } = result.data;
    const normalizedEmail = email.toLowerCase().trim();

    // Check if email already exists
    const [existing] = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, normalizedEmail))
      .limit(1);

    if (existing) {
      return NextResponse.json(
        { error: 'An account with this email address already exists.' },
        { status: 409 }
      );
    }

    // Hash password with Argon2id
    const passwordHash = await hashPassword(password);
    const userId = crypto.randomUUID();

    await db.insert(users).values({
      id: userId,
      name,
      email: normalizedEmail,
      passwordHash,
    });

    return NextResponse.json(
      { success: true, message: 'Account registered successfully.' },
      { status: 201 }
    );
  } catch {
    // Zero-leakage policy: never log stack traces containing user payloads
    console.error('Registration processing error occurred.');
    return NextResponse.json(
      { error: 'Internal registration service error. Please try again later.' },
      { status: 500 }
    );
  }
}
