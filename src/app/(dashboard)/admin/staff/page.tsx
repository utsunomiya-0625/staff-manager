"use client";

import { Header } from "@/components/layout/header";
import { store } from "@/lib/store";
import { User, Mail, Shield, DollarSign } from "lucide-react";

export default function StaffManagementPage() {
  const profile = store.getProfile();

  return (
    <>
      <Header title="スタッフ管理" subtitle="スタッフの一覧と管理" />
      <div className="p-6 space-y-6">
        <div className="rounded-xl border border-card-border bg-card-bg p-6">
          <h2 className="mb-4 text-base font-bold">登録スタッフ一覧</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-card-border text-left">
                  <th className="pb-3 pr-4 font-medium text-muted">名前</th>
                  <th className="pb-3 pr-4 font-medium text-muted">メール</th>
                  <th className="pb-3 pr-4 font-medium text-muted">ロール</th>
                  <th className="pb-3 font-medium text-muted">時給</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-card-border last:border-0">
                  <td className="py-4 pr-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                        <User size={16} className="text-primary" />
                      </div>
                      <span className="font-medium">{profile.name}</span>
                    </div>
                  </td>
                  <td className="py-4 pr-4">
                    <div className="flex items-center gap-2 text-muted">
                      <Mail size={14} />
                      {profile.email}
                    </div>
                  </td>
                  <td className="py-4 pr-4">
                    <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                      <Shield size={12} />
                      {profile.role === "admin" ? "管理者" : "スタッフ"}
                    </span>
                  </td>
                  <td className="py-4">
                    <div className="flex items-center gap-1 text-muted">
                      <DollarSign size={14} />
                      {profile.hourly_rate.toLocaleString()}円
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div className="rounded-xl border border-dashed border-card-border bg-card-bg p-8 text-center">
          <p className="text-sm text-muted">
            Supabase 接続後、Google OAuth でログインしたスタッフが自動的に一覧に追加されます
          </p>
        </div>
      </div>
    </>
  );
}
