"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronLeft, CheckCircle, XCircle, Copy, ExternalLink } from "@/icons";
import { Button } from "@/components/ui/Button";

const MIGRATION_SQL = `-- Executive Angler Admin Schema Migration
-- Run this in Supabase SQL Editor (one-time setup)

-- 1. Add admin columns to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_banned boolean DEFAULT false;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS ban_reason text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS banned_at timestamptz;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS banned_by text;

-- 2. Create audit log table
CREATE TABLE IF NOT EXISTS admin_audit_log (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  admin_user_id uuid NOT NULL,
  admin_email text NOT NULL,
  action text NOT NULL,
  target_user_id uuid,
  details jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- 3. Create admin notes table
CREATE TABLE IF NOT EXISTS admin_user_notes (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  admin_email text NOT NULL,
  note text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- 4. Enable RLS
ALTER TABLE admin_audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_user_notes ENABLE ROW LEVEL SECURITY;

-- 5. Create permissive policies (admin check happens in API layer)
DO $$ BEGIN
  CREATE POLICY admin_audit_all ON admin_audit_log FOR ALL TO authenticated USING (true) WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY admin_notes_all ON admin_user_notes FOR ALL TO authenticated USING (true) WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- 6. Photo credit + alt text columns on all entity tables
ALTER TABLE rivers ADD COLUMN IF NOT EXISTS hero_image_alt text;
ALTER TABLE rivers ADD COLUMN IF NOT EXISTS hero_image_credit text;
ALTER TABLE rivers ADD COLUMN IF NOT EXISTS hero_image_credit_url text;
ALTER TABLE destinations ADD COLUMN IF NOT EXISTS hero_image_alt text;
ALTER TABLE destinations ADD COLUMN IF NOT EXISTS hero_image_credit text;
ALTER TABLE destinations ADD COLUMN IF NOT EXISTS hero_image_credit_url text;
ALTER TABLE fly_shops ADD COLUMN IF NOT EXISTS hero_image_alt text;
ALTER TABLE fly_shops ADD COLUMN IF NOT EXISTS hero_image_credit text;
ALTER TABLE fly_shops ADD COLUMN IF NOT EXISTS hero_image_credit_url text;
ALTER TABLE lodges ADD COLUMN IF NOT EXISTS hero_image_alt text;
ALTER TABLE lodges ADD COLUMN IF NOT EXISTS hero_image_credit text;
ALTER TABLE lodges ADD COLUMN IF NOT EXISTS hero_image_credit_url text;
ALTER TABLE guides ADD COLUMN IF NOT EXISTS hero_image_alt text;
ALTER TABLE guides ADD COLUMN IF NOT EXISTS hero_image_credit text;
ALTER TABLE guides ADD COLUMN IF NOT EXISTS hero_image_credit_url text;
ALTER TABLE species ADD COLUMN IF NOT EXISTS hero_image_alt text;
ALTER TABLE species ADD COLUMN IF NOT EXISTS hero_image_credit text;
ALTER TABLE species ADD COLUMN IF NOT EXISTS hero_image_credit_url text;
ALTER TABLE articles ADD COLUMN IF NOT EXISTS hero_image_alt text;
ALTER TABLE articles ADD COLUMN IF NOT EXISTS hero_image_credit text;
ALTER TABLE articles ADD COLUMN IF NOT EXISTS hero_image_credit_url text;

-- 7. Indexes
CREATE INDEX IF NOT EXISTS idx_audit_log_target ON admin_audit_log(target_user_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_created ON admin_audit_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_notes_user ON admin_user_notes(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_banned ON profiles(is_banned) WHERE is_banned = true;
`;

export default function SetupClient({
  checks,
  allGood,
}: {
  checks: Record<string, boolean>;
  allGood: boolean;
}) {
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    navigator.clipboard.writeText(MIGRATION_SQL);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="min-h-screen bg-[var(--paper)]">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-16">
        <div className="flex items-center gap-3 mb-6">
          <Link href="/admin" className="text-[var(--text-2)] hover:text-[var(--text-1)] transition-colors duration-150 ease-standard">
            <ChevronLeft className="h-5 w-5" />
          </Link>
          <h1 className="font-display text-2xl sm:text-3xl font-semibold text-[var(--text-1)]">Database Setup</h1>
        </div>

        {/* Schema checks */}
        <div className="ea-card mb-6">
          <h2 className="ea-overline mb-3">Schema Status</h2>
          <div className="space-y-2">
            {Object.entries(checks).map(([key, ok]) => (
              <div key={key} className="flex items-center gap-2">
                {ok ? (
                  <CheckCircle className="h-4 w-4 text-[var(--success)]" />
                ) : (
                  <XCircle className="h-4 w-4 text-[var(--danger)]" />
                )}
                <span className={`text-sm num ${ok ? "text-[var(--success)]" : "text-[var(--danger)]"}`}>{key}</span>
              </div>
            ))}
          </div>
        </div>

        {allGood ? (
          <div className="bg-[var(--success)]/10 border border-[var(--success)]/30 rounded-[var(--radius-card)] p-5 text-center">
            <CheckCircle className="h-8 w-8 text-[var(--success)] mx-auto mb-2" />
            <p className="text-[var(--success)] font-semibold">All schema checks passed!</p>
            <p className="text-[var(--success)]/70 text-sm mt-1">Admin panel is fully operational.</p>
          </div>
        ) : (
          <>
            <div className="ea-card mb-4">
              <div className="flex items-center justify-between mb-3">
                <h2 className="ea-overline">Migration SQL</h2>
                <div className="flex gap-2">
                  <Button
                    onClick={handleCopy}
                    variant="brand"
                    size="sm"
                    icon={Copy}
                  >
                    {copied ? "Copied!" : "Copy SQL"}
                  </Button>
                  <Button
                    href="https://supabase.com/dashboard/project/qlasxtfbodyxbcuchvxz/sql/new"
                    target="_blank"
                    rel="noopener noreferrer"
                    variant="outline"
                    size="sm"
                    icon={ExternalLink}

                  >
                    Open SQL Editor
                  </Button>
                </div>
              </div>
              <pre className="text-xs text-[var(--text-2)] bg-[var(--paper-deep)] p-4 rounded-[var(--radius-md)] overflow-x-auto max-h-80 overflow-y-auto font-mono">
                {MIGRATION_SQL}
              </pre>
            </div>
            <p className="text-xs text-[var(--text-3)] text-center">
              Copy the SQL above → paste in Supabase SQL Editor → click Run → refresh this page
            </p>
          </>
        )}
      </div>
    </div>
  );
}
