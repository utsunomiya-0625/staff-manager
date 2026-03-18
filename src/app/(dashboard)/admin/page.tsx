"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Header } from "@/components/layout/header";
import { store } from "@/lib/store";
import type { DailyReport, DailyTask, AppNotification } from "@/lib/types";
import { format } from "date-fns";
import { ja } from "date-fns/locale";
import { v4 as uuidv4 } from "uuid";
import {
  Users,
  FileText,
  CheckSquare,
  TrendingUp,
  AlertTriangle,
  Brain,
  Calculator,
  ScrollText,
  BarChart3,
  Plus,
  Package,
  Bell,
  ArrowRight,
  Zap,
  Clock,
} from "lucide-react";

export default function AdminPage() {
  const [reports, setReports] = useState<DailyReport[]>([]);
  const [tasks, setTasks] = useState<DailyTask[]>([]);
  const [aiSummary, setAiSummary] = useState<string | null>(null);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [missingStaff, setMissingStaff] = useState<string[]>([]);
  const [showShortcuts, setShowShortcuts] = useState(false);

  useEffect(() => {
    setReports(store.getReports());
    setTasks(store.getTasks());
    checkMissingReports();
  }, []);

  const today = format(new Date(), "yyyy-MM-dd");
  const todayReports = reports.filter((r) => r.report_date === today);
  const profile = store.getProfile();
  const allTasks = tasks;
  const todayTasks = allTasks.filter((t) => t.task_date === today);
  const doneTasks = allTasks.filter((t) => t.status === "done");

  function checkMissingReports() {
    const todayStr = format(new Date(), "yyyy-MM-dd");
    const submitted = store.getReports().filter((r) => r.report_date === todayStr);
    const submittedIds = submitted.map((r) => r.user_id);
    if (!submittedIds.includes(profile.id)) {
      setMissingStaff([profile.name]);
      const notif: AppNotification = {
        id: uuidv4(),
        user_id: "system",
        type: "report_missing",
        title: "日報未提出アラート",
        message: `${profile.name} が ${todayStr} の日報を未提出です`,
        read: false,
        created_at: new Date().toISOString(),
      };
      const existing = store.getNotifications();
      if (!existing.some((n) => n.title === notif.title && n.message === notif.message)) {
        store.addNotification(notif);
      }
    }
  }

  async function generateAiSummary() {
    setSummaryLoading(true);
    try {
      const res = await fetch("/api/ai/summarize-reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reports: todayReports.length > 0 ? todayReports : reports.slice(0, 5) }),
      });
      const data = await res.json();
      setAiSummary(data.summary || data.error || "要約を取得できませんでした");
    } catch {
      setAiSummary("API通信エラー。OPENAI_API_KEY を確認してください。");
    }
    setSummaryLoading(false);
  }

  const stats = [
    { label: "登録スタッフ", value: "1名", icon: Users, color: "text-primary", bg: "bg-primary/10" },
    { label: "今日の日報", value: `${todayReports.length}件`, icon: FileText, color: "text-success", bg: "bg-success/10" },
    { label: "全タスク", value: `${allTasks.length}件`, icon: CheckSquare, color: "text-warning", bg: "bg-warning/10" },
    { label: "タスク完了率", value: allTasks.length > 0 ? `${Math.round((doneTasks.length / allTasks.length) * 100)}%` : "0%", icon: TrendingUp, color: "text-purple-500", bg: "bg-purple-500/10" },
  ];

  const shortcuts = [
    { label: "タスク追加", icon: Plus, href: "/tasks", color: "bg-primary" },
    { label: "プロジェクト追加", icon: Package, href: "/devbox/new", color: "bg-purple-500" },
    { label: "日報確認", icon: FileText, href: "/reports", color: "bg-success" },
    { label: "給与計算", icon: Calculator, href: "/admin/payroll", color: "bg-warning" },
    { label: "パフォーマンス", icon: BarChart3, href: "/admin/analytics", color: "bg-primary" },
    { label: "活動ログ", icon: ScrollText, href: "/admin/activity-log", color: "bg-muted" },
  ];

  return (
    <>
      <Header title="管理者パネル" subtitle="スタッフ全体の状況を確認" />
      <div className="p-6 space-y-6">
        {missingStaff.length > 0 && (
          <div className="flex items-center gap-3 rounded-xl border border-danger/30 bg-danger/5 p-4">
            <AlertTriangle size={20} className="text-danger shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-bold text-danger">日報未提出アラート</p>
              <p className="text-xs text-muted">{missingStaff.join(", ")} が今日の日報を未提出です</p>
            </div>
            <Link href="/admin/notifications" className="text-xs text-primary hover:underline">
              通知管理
            </Link>
          </div>
        )}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div key={stat.label} className="flex items-center gap-4 rounded-xl border border-card-border bg-card-bg p-5">
                <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${stat.bg}`}>
                  <Icon size={24} className={stat.color} />
                </div>
                <div>
                  <p className="text-sm text-muted">{stat.label}</p>
                  <p className="text-xl font-bold">{stat.value}</p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="rounded-xl border border-card-border bg-card-bg p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="flex items-center gap-2 text-sm font-bold">
              <Zap size={16} className="text-warning" />
              管理者ショートカット
            </h3>
          </div>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
            {shortcuts.map((sc) => {
              const Icon = sc.icon;
              return (
                <Link key={sc.label} href={sc.href} className="flex flex-col items-center gap-2 rounded-lg border border-card-border p-3 text-center transition-all hover:border-primary hover:shadow-sm">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${sc.color} text-white`}>
                    <Icon size={18} />
                  </div>
                  <span className="text-xs font-medium">{sc.label}</span>
                </Link>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="rounded-xl border border-card-border bg-card-bg">
            <div className="flex items-center justify-between border-b border-card-border px-6 py-4">
              <h2 className="flex items-center gap-2 text-base font-bold">
                <Brain size={18} className="text-purple-500" />
                AI日報サマリー
              </h2>
              <button
                onClick={generateAiSummary}
                disabled={summaryLoading}
                className="rounded-lg bg-purple-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-purple-600 disabled:opacity-50 transition-colors"
              >
                {summaryLoading ? "生成中..." : "AI要約を生成"}
              </button>
            </div>
            <div className="p-6">
              {aiSummary ? (
                <div className="whitespace-pre-wrap text-sm leading-relaxed">{aiSummary}</div>
              ) : (
                <p className="py-4 text-center text-sm text-muted">
                  「AI要約を生成」ボタンで日報のサマリーを作成できます
                </p>
              )}
            </div>
          </div>

          <div className="rounded-xl border border-card-border bg-card-bg">
            <div className="flex items-center justify-between border-b border-card-border px-6 py-4">
              <h2 className="text-base font-bold">最新の日報</h2>
              <Link href="/reports" className="flex items-center gap-1 text-xs text-primary hover:underline">
                すべて見る <ArrowRight size={12} />
              </Link>
            </div>
            <div className="p-4">
              {reports.length === 0 ? (
                <p className="py-8 text-center text-sm text-muted">まだ日報がありません</p>
              ) : (
                <div className="space-y-2">
                  {reports.slice(0, 5).map((report) => (
                    <div key={report.id} className="flex items-center justify-between rounded-lg bg-background p-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold">
                          {profile.name.charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm font-medium truncate max-w-[200px]">{report.goal}</p>
                          <p className="text-xs text-muted">
                            {format(new Date(report.report_date), "M月d日(E)", { locale: ja })}
                          </p>
                        </div>
                      </div>
                      <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        report.goal_result === "achieved" ? "bg-success/10 text-success"
                        : report.goal_result === "in_progress" ? "bg-warning/10 text-warning"
                        : "bg-muted/10 text-muted"
                      }`}>
                        {report.goal_result === "achieved" ? "達成" : report.goal_result === "in_progress" ? "途中" : "未着手"}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
