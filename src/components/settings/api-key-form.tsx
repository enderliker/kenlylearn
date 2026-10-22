'use client';

import * as React from 'react';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Key, Eye, EyeOff, ShieldCheck, CheckCircle2, Loader2, Sparkles, ExternalLink } from 'lucide-react';

export function ApiKeyForm() {
  const [apiKey, setApiKey] = React.useState('');
  const [showKey, setShowKey] = React.useState(false);
  const [currentMaskedKey, setCurrentMaskedKey] = React.useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = React.useState<string | null>(null);

  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [testing, setTesting] = React.useState(false);

  const [alert, setAlert] = React.useState<{
    type: 'success' | 'error' | 'default';
    message: string;
  } | null>(null);

  React.useEffect(() => {
    fetchCurrentKey();
  }, []);

  const fetchCurrentKey = async () => {
    try {
      const res = await fetch('/api/settings/api-key');
      if (res.ok) {
        const data = await res.json();
        if (data.hasKey) {
          setCurrentMaskedKey(data.maskedKey);
          setLastUpdated(data.updatedAt);
        }
      }
    } catch {
      // Ignore background load error
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setAlert(null);

    if (!apiKey || apiKey.length < 10) {
      setAlert({
        type: 'error',
        message: 'Please provide a valid NVIDIA NIM API key (minimum 10 characters).',
      });
      return;
    }

    setSaving(true);

    try {
      const res = await fetch('/api/settings/api-key', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apiKey }),
      });

      const data = await res.json();

      if (res.ok) {
        setCurrentMaskedKey(data.maskedKey);
        setLastUpdated(data.updatedAt);
        setApiKey('');
        setAlert({
          type: 'success',
          message: 'NVIDIA API Key encrypted with AES-256-GCM and saved successfully.',
        });
      } else {
        setAlert({
          type: 'error',
          message: data.error || 'Failed to save API key.',
        });
      }
    } catch {
      setAlert({
        type: 'error',
        message: 'Network error occurred while encrypting key.',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleTestConnection = async () => {
    setAlert(null);
    setTesting(true);

    try {
      const res = await fetch('/api/settings/api-key/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apiKey: apiKey || undefined }),
      });

      const data = await res.json();

      if (data.success) {
        setAlert({
          type: 'success',
          message: 'Connection verified: NVIDIA NIM API authenticated successfully.',
        });
      } else {
        setAlert({
          type: 'error',
          message: data.error || 'Authentication with NVIDIA NIM failed.',
        });
      }
    } catch {
      setAlert({
        type: 'error',
        message: 'Failed to reach NVIDIA NIM servers.',
      });
    } finally {
      setTesting(false);
    }
  };

  return (
    <Card className="space-y-6">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Key className="w-4 h-4 text-indigo-400" />
            <CardTitle>NVIDIA NIM API Key</CardTitle>
          </div>
          <Badge variant="indigo">AES-256-GCM Encrypted</Badge>
        </div>
        <CardDescription>
          Your personal API key used for Nemotron-3 Ultra 550B inference. Stored encrypted at rest and never exposed to the client.
        </CardDescription>
      </CardHeader>

      {/* Current Key Status Indicator */}
      <div className="p-3.5 rounded-lg bg-zinc-950/70 border border-zinc-800 flex items-center justify-between text-xs">
        <div className="space-y-0.5">
          <span className="text-zinc-400 text-[11px]">Current Status</span>
          <div className="flex items-center gap-2">
            {loading ? (
              <span className="text-zinc-500">Checking credentials...</span>
            ) : currentMaskedKey ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span className="font-mono text-zinc-200">{currentMaskedKey}</span>
              </>
            ) : (
              <span className="text-amber-400 font-medium">No key configured yet</span>
            )}
          </div>
        </div>

        {lastUpdated && (
          <span className="text-[10px] text-zinc-500 font-mono">
            Updated: {new Date(lastUpdated).toLocaleDateString()}
          </span>
        )}
      </div>

      {alert && (
        <Alert variant={alert.type} title={alert.type === 'success' ? 'Verified' : 'Notice'}>
          {alert.message}
        </Alert>
      )}

      {/* Input Form */}
      <form onSubmit={handleSave} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="nvidia-key-input">
            {currentMaskedKey ? 'Replace API Key' : 'Enter NVIDIA API Key'}
          </Label>
          <div className="relative">
            <Input
              id="nvidia-key-input"
              type={showKey ? 'text' : 'password'}
              placeholder="nvapi-..."
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              disabled={saving || testing}
              className="pr-10 font-mono text-xs"
              autoComplete="off"
            />
            <button
              type="button"
              onClick={() => setShowKey(!showKey)}
              className="absolute right-3 top-2.5 text-zinc-500 hover:text-zinc-300 focus:outline-none"
              aria-label={showKey ? 'Hide API key' : 'Show API key'}
            >
              {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-2">
            <Button
              type="submit"
              variant="primary"
              disabled={saving || testing || !apiKey}
              className="gap-2"
            >
              {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <ShieldCheck className="w-3.5 h-3.5" />}
              <span>Save Encrypted Key</span>
            </Button>

            <Button
              type="button"
              variant="outline"
              disabled={testing || saving || (!apiKey && !currentMaskedKey)}
              onClick={handleTestConnection}
              className="gap-2"
            >
              {testing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5 text-indigo-400" />}
              <span>Test Connection</span>
            </Button>
          </div>

          <a
            href="https://build.nvidia.com/nvidia/nemotron-3-ultra-550b-a55b"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[11px] text-zinc-500 hover:text-zinc-300 inline-flex items-center gap-1"
          >
            <span>Get free key at build.nvidia.com</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </form>
    </Card>
  );
}
