"use client";

import Link from "next/link";
import { ShieldX } from "lucide-react";

export default function DeniedPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="w-full max-w-md text-center space-y-6 rounded-2xl bg-card-bg p-8 shadow-lg border border-card-border">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-danger/10">
          <ShieldX size={32} className="text-danger" />
        </div>
        <h1 className="text-2xl font-bold text-foreground">アクセス権限がありません</h1>
        <p className="text-sm text-muted">
          このページは管理者のみアクセスできます。<br />
          アクセスが必要な場合は管理者に連絡してください。
        </p>
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-white hover:bg-primary-hover transition-colors"
        >
          ダッシュボードに戻る
        </Link>
      </div>
    </div>
  );
}
