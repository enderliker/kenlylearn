import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

describe('Supabase Security & RLS Compliance Suite', () => {
  const schemaPath = path.resolve(process.cwd(), 'supabase/schema.sql');
  const schemaSql = fs.readFileSync(schemaPath, 'utf-8');

  test('Rule 1: Enforces Row Level Security (RLS) on ALL tables', () => {
    const requiredTables = [
      'users',
      'accounts',
      'sessions',
      'verification_tokens',
      'user_settings',
      'subjects',
      'materials',
      'generated_content',
      'exams',
      'questions',
      'user_answers',
    ];

    for (const table of requiredTables) {
      const rlsStatement = `ALTER TABLE public.${table} ENABLE ROW LEVEL SECURITY;`;
      assert.ok(
        schemaSql.includes(rlsStatement),
        `Table '${table}' must have RLS explicitly enabled via: ${rlsStatement}`
      );
    }
  });

  test('Rule 1: Enforces FORCE ROW LEVEL SECURITY to prevent table owner bypass', () => {
    const criticalTables = ['user_settings', 'materials', 'exams'];
    for (const table of criticalTables) {
      const forceStatement = `ALTER TABLE public.${table} FORCE ROW LEVEL SECURITY;`;
      assert.ok(
        schemaSql.includes(forceStatement),
        `Critical table '${table}' must have FORCE ROW LEVEL SECURITY enabled`
      );
    }
  });

  test('Rule 2: Ensures client-side Supabase client uses only public anon keys', () => {
    const clientPath = path.resolve(process.cwd(), 'src/lib/supabase/client.ts');
    const clientCode = fs.readFileSync(clientPath, 'utf-8');

    assert.ok(clientCode.includes('NEXT_PUBLIC_SUPABASE_ANON_KEY'));
    assert.ok(!clientCode.includes('process.env.SUPABASE_SERVICE_ROLE_KEY'));
  });

  test('Rule 2: Server-side admin client blocks execution in browser context', async () => {
    const serverPath = path.resolve(process.cwd(), 'src/lib/supabase/server.ts');
    const serverCode = fs.readFileSync(serverPath, 'utf-8');

    // Verify window guard exists
    assert.ok(serverCode.includes("typeof window !== 'undefined'"));
    assert.ok(serverCode.includes('FATAL SECURITY VIOLATION'));
  });

  test('Rule 3: Enforces schema restriction by isolating private schema from anon/authenticated roles', () => {
    assert.ok(schemaSql.includes('CREATE SCHEMA IF NOT EXISTS private;'));
    assert.ok(schemaSql.includes('REVOKE ALL ON SCHEMA private FROM anon, authenticated;'));
    assert.ok(schemaSql.includes('GRANT ALL ON SCHEMA private TO service_role;'));
  });

  test('Rule 5: CORS configuration documentation exists for production domain lockdown', () => {
    const docPath = path.resolve(process.cwd(), 'supabase/README.md');
    const doc = fs.readFileSync(docPath, 'utf-8');

    assert.ok(doc.includes('Allowed Origins (CORS)'));
    assert.ok(doc.includes('Remove the wildcard `*`'));
  });
});
