"use client";

import { useState } from "react";
import { Header } from "@/components/layout/header";
import { store } from "@/lib/store";
import { User, Mail, Shield, DollarSign, UserPlus, Send, X, Loader2 } from "lucide-react";
import type { UserRole } from "@/lib/types";

export default function StaffManagementPage() {
  const profile = store.getProfile();
  const [showInvite, setShowInvite] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteName, setInviteName] = useState("");
  const [inviteRole, setInviteRole] = useState<UserRole>("staff");
  const [inviteLoading, setInviteLoading] = useState(false);
  const [inviteResult, setInviteResult] = useState<{ ok: boolean; msg: string } | null>(null);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setInviteLoading(true);
    setInviteResult(null);
    try {
      const res = await fetch("/api/admin/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: inviteEmail, name: inviteName, role: inviteRole }),
      });
      const data = await res.json();
      if (res.ok) {
        setInviteResult({ ok: true, msg: data.message || "招待しました" });
        setInviteEmail("");
        setInviteName("");
      } else {
        setInviteResult({ ok: false, msg: data.error || "招待に失敗しました" });
      }
    } catch {
      setInviteResult({ ok: false, msg: "通信エラーが発生しました" });
    }
    setInviteLoading(false);
  };

  return (
    <>
      <Header title="スタッフ管理" subtitle="スタッフの一覧・招待・権限管理" />
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold">登録スタッフ一覧</h2>
          <button
            onClick={() => setShowInvite(true)}
            className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-hover transition-colors"
          >
            <UserPlus size={18} />
            スタッフを招待
          </button>
        </div>

        <div className="rounded-xl border border-card-border bg-card-bg">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-card-border text-left">
                  <th className="px-6 py-3 font-medium text-muted">名前</th>
                  <th className="px-4 py-3 font-medium text-muted">メール</th>
                  <th className="px-4 py-3 font-medium text-muted">ロール</th>
                  <th className="px-4 py-3 font-medium text-muted">時給</th>
                  <th className="px-4 py-3 font-medium text-muted">状態</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-card-border last:border-0">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                        <User size={16} className="text-primary" />
                      </div>
                      <span className="font-medium">{profile.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2 text-muted">
                      <Mail size={14} />
                      {profile.email}
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                      <Shield size={12} />
                      {profile.role === "admin" ? "管理者" : "スタッフ"}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-1 text-muted">
                      <DollarSign size={14} />
                      {profile.hourly_rate.toLocaleString()}円
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <span className="rounded-full bg-success/10 px-2.5 py-0.5 text-xs font-medium text-success">
                      アクティブ
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div className="rounded-xl border border-card-border bg-card-bg p-6">
          <h3 className="mb-3 text-sm font-bold">招待制アクセス管理</h3>
          <div className="space-y-3 text-sm text-muted">
            <div className="flex items-start gap-3">
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-success/10 text-success text-xs font-bold">1</div>
              <p>管理者（あなた）が「スタッフを招待」ボタンからメールアドレスを登録</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-success/10 text-success text-xs font-bold">2</div>
              <p>招待されたスタッフにメールが届き、Googleアカウントで初回ログイン</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-success/10 text-success text-xs font-bold">3</div>
              <p>招待されていない人はログインできません（完全招待制）</p>
            </div>
          </div>
          <div className="mt-4 rounded-lg bg-warning/5 border border-warning/20 p-3">
            <p className="text-xs text-warning">
              Supabase ダッシュボード → Authentication → Settings → 「Enable email confirmations」をON、「Disable sign ups」をON にすると、招待制が有効になります。
            </p>
          </div>
        </div>

        {showInvite && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-md rounded-2xl bg-card-bg shadow-2xl">
              <div className="flex items-center justify-between border-b border-card-border px-6 py-4">
                <h2 className="flex items-center gap-2 text-lg font-bold">
                  <UserPlus size={20} className="text-primary" />
                  スタッフ招待
                </h2>
                <button onClick={() => { setShowInvite(false); setInviteResult(null); }} className="rounded-lg p-2 hover:bg-background">
                  <X size={20} />
                </button>
              </div>
              <form onSubmit={handleInvite} className="p-6 space-y-4">
                {inviteResult && (
                  <div className={`rounded-lg border px-4 py-3 text-sm ${inviteResult.ok ? "bg-success/10 border-success/30 text-success" : "bg-danger/10 border-danger/30 text-danger"}`}>
                    {inviteResult.msg}
                  </div>
                )}
                <div>
                  <label className="mb-1 block text-sm font-medium">メールアドレス *</label>
                  <input
                    type="email"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    placeholder="staff@example.com"
                    required
                    className="w-full rounded-lg border border-card-border bg-background px-4 py-2.5 text-sm focus:border-primary focus:outline-none"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium">名前</label>
                  <input
                    type="text"
                    value={inviteName}
                    onChange={(e) => setInviteName(e.target.value)}
                    placeholder="山田 太郎"
                    className="w-full rounded-lg border border-card-border bg-background px-4 py-2.5 text-sm focus:border-primary focus:outline-none"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium">権限</label>
                  <select
                    value={inviteRole}
                    onChange={(e) => setInviteRole(e.target.value as UserRole)}
                    className="w-full rounded-lg border border-card-border bg-background px-4 py-2.5 text-sm"
                  >
                    <option value="staff">スタッフ（通常権限）</option>
                    <option value="admin">管理者（全機能アクセス）</option>
                  </select>
                </div>
                <button
                  type="submit"
                  disabled={inviteLoading}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-white hover:bg-primary-hover disabled:opacity-50 transition-colors"
                >
                  {inviteLoading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                  {inviteLoading ? "送信中..." : "招待メールを送信"}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
