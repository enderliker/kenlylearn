import { ApiKeyForm } from '@/components/settings/api-key-form';
import { Card, CardTitle, CardDescription } from '@/components/ui/card';
import { Shield, Lock, Server } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Settings — KenlyLearn',
  description: 'Manage your credentials, encryption settings, and personal inference API keys',
};

export default function SettingsPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-lg font-semibold text-zinc-100 tracking-tight">Platform Settings</h1>
        <p className="text-xs text-zinc-400">
          Configure inference credentials, multi-tenant security, and local storage parameters
        </p>
      </div>

      {/* API Key Form Section */}
      <ApiKeyForm />

      {/* Security Architecture Reference */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="space-y-2">
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-emerald-400" />
            <CardTitle className="text-xs">Argon2id Hashing</CardTitle>
          </div>
          <CardDescription className="text-[11px] leading-relaxed">
            Passwords are salted and hashed using memory-hard Argon2id to resist GPU cracking and rainbow table attacks.
          </CardDescription>
        </Card>

        <Card className="space-y-2">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-indigo-400" />
            <CardTitle className="text-xs">AES-256-GCM</CardTitle>
          </div>
          <CardDescription className="text-[11px] leading-relaxed">
            API keys are authenticated and encrypted at rest with unique IVs. Plaintext keys are decrypted only in ephemeral memory.
          </CardDescription>
        </Card>

        <Card className="space-y-2">
          <div className="flex items-center gap-2">
            <Server className="w-4 h-4 text-amber-400" />
            <CardTitle className="text-xs">Tenant Isolation</CardTitle>
          </div>
          <CardDescription className="text-[11px] leading-relaxed">
            Row-level security ensures all database queries enforce non-nullable user ID boundaries with zero telemetry.
          </CardDescription>
        </Card>
      </div>
    </div>
  );
}
