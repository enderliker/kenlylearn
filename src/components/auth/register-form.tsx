'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert } from '@/components/ui/alert';
import { Lock, Mail, User, ArrowRight, Loader2, CheckCircle2 } from 'lucide-react';

export function RegisterForm() {
  const router = useRouter();
  const [name, setName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [confirmPassword, setConfirmPassword] = React.useState('');
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState(false);
  const [loading, setLoading] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match. Please verify both fields.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Failed to create account. Please try again.');
        return;
      }

      setSuccess(true);
      setTimeout(() => {
        router.push('/login');
      }, 1500);
    } catch {
      setError('A network error occurred. Please check your connection and retry.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="w-full max-w-sm space-y-4 text-center py-8">
        <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
        <h2 className="text-lg font-semibold text-zinc-100">Account Created Successfully</h2>
        <p className="text-xs text-zinc-400">
          Redirecting to sign-in page...
        </p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-sm space-y-6">
      <div className="space-y-1 text-center">
        <h1 className="text-xl font-semibold tracking-tight text-zinc-100">Create your account</h1>
        <p className="text-xs text-zinc-400">
          Set up a personal workspace with local-first security
        </p>
      </div>

      {error && (
        <Alert variant="error" title="Registration Failed">
          {error}
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="register-name" required>
            Full name
          </Label>
          <div className="relative">
            <User className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-3 pointer-events-none" />
            <Input
              id="register-name"
              type="text"
              autoComplete="name"
              required
              placeholder="Dr. Alan Turing"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="pl-9"
              disabled={loading}
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="register-email" required>
            Email address
          </Label>
          <div className="relative">
            <Mail className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-3 pointer-events-none" />
            <Input
              id="register-email"
              type="email"
              autoComplete="email"
              required
              placeholder="researcher@institute.org"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="pl-9"
              disabled={loading}
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="register-password" required>
            Password (min. 8 characters)
          </Label>
          <div className="relative">
            <Lock className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-3 pointer-events-none" />
            <Input
              id="register-password"
              type="password"
              autoComplete="new-password"
              required
              placeholder="••••••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="pl-9"
              disabled={loading}
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="register-confirm-password" required>
            Confirm password
          </Label>
          <div className="relative">
            <Lock className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-3 pointer-events-none" />
            <Input
              id="register-confirm-password"
              type="password"
              autoComplete="new-password"
              required
              placeholder="••••••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="pl-9"
              disabled={loading}
            />
          </div>
        </div>

        <Button
          type="submit"
          variant="primary"
          className="w-full justify-center gap-2 h-9 text-xs mt-2"
          disabled={loading}
        >
          {loading ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <>
              <span>Create Account</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </>
          )}
        </Button>
      </form>

      <p className="text-center text-xs text-zinc-500">
        Already have an account?{' '}
        <Link href="/login" className="text-zinc-200 hover:text-white underline underline-offset-4">
          Sign in
        </Link>
      </p>
    </div>
  );
}
