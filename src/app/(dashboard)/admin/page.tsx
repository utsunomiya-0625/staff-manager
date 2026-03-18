"use client";

import { useEffect, useState } from "react";
import { Header } from "@/components/layout/header";
import { store } from "@/lib/store";
import type { DailyReport } from "@/lib/types";
import { format } from "date-fns";
import { ja } from "date-fns/locale";
import { Users, FileText, CheckSquare, TrendingUp } from "lucide-react";

export default function AdminPage() {
  const [reports, setReports] = useState<DailyReport[]>([]);

  useEffect(() => {
    setReports(store.getReports());
  }, []);

  const today = format(new Date(), "yyyy-MM-dd");
  const todayReports = reports.filter((r) => r.report_date === today);

  const stats = [
    {
      label: "登録スタッフ",
      value: "1名",
      icon: Users,
      color: "text-primary",
      bg: "bg-primary/10",
    },
    {
      label: "今日の日報提出",
      value: `${todayReports.length}件`,
      icon: FileText,
      color: "text-success",
      bg: "bg-success/10",
    },
    {
      label: "全日報数",
      value: `${reports.length}件`,
      icon: TrendingUp,
      color: "text-warning",
      bg: "bg-warning/10",
    },
    {
      label: "タスク管理",
      value: `${store.getTasks().length}件`,
      icon: CheckSquare,
      color: "text-purple-500",
      bg: "bg-purple-500/10",
    },
  ];

  return (
    <>
      <Header title="管理者パネル" subtitle="スタッフ全体の状況を確認" />
      <div className="p-6 space-y-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.label}
                className="flex items-center gap-4 rounded-xl border border-card-border bg-card-bg p-5"
              >
                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-xl ${stat.bg}`}
                >
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

        <div className="rounded-xl border border-card-border bg-card-bg p-6">
          <h2 className="mb-4 text-lg font-bold">最新の日報</h2>
          {reports.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted">
              まだ日報がありません
            </p>
          ) : (
            <div className="space-y-3">
              {reports.slice(0, 10).map((report) => (
                <div
                  key={report.id}
                  className="flex items-center justify-between rounded-lg bg-background p-4"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold">
                      {store.getProfile().name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{report.goal}</p>
                      <p className="text-xs text-muted">
                        {format(
                          new Date(report.report_date),
                          "M月d日(E)",
                          { locale: ja }
                        )}{" "}
                        - {store.getProfile().name}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      report.goal_result === "achieved"
                        ? "bg-success/10 text-success"
                        : report.goal_result === "in_progress"
                        ? "bg-warning/10 text-warning"
                        : "bg-muted/10 text-muted"
                    }`}
                  >
                    {report.goal_result === "achieved"
                      ? "達成"
                      : report.goal_result === "in_progress"
                      ? "途中"
                      : "未着手"}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
