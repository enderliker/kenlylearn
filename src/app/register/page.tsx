import { RegisterForm } from '@/components/auth/register-form';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Create Account — KenlyLearn',
  description: 'Create an account to begin active recall studying with KenlyLearn',
};

export default function RegisterPage() {
  return (
    <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center p-4">
      <RegisterForm />
    </div>
  );
}
