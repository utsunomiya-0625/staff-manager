"use client";

import { useEffect, useState } from "react";
import { Header } from "@/components/layout/header";
import { store } from "@/lib/store";
import { format, subMonths } from "date-fns";
import { BarChart3, TrendingUp, Target, Clock, Award, Users } from "lucide-react";

export default function KPIPage() {
  const [month, setMonth] = useState(format(new Date(), "yyyy-MM"));

  const reports = store.getReports().filter((r) => r.report_date.startsWith(month));
  const tasks = store.getTasks().filter((t) => t.task_date.startsWith(month));
  const completedTasks = tasks.filter((t) => t.status === "done");
  const timeEntries = store.getTimeEntries().filter((e) => e.start_time.startsWith(month));
  const totalMinutes = timeEntries.reduce((s, e) => s + (e.duration_minutes || 0), 0);
  const projects = store.getProjects();
  const activeProjects = projects.filter((p) => p.status === "in_development");

  const achievedReports = reports.filter((r) => r.goal_result === "achieved");
  const achieveRate = reports.length > 0 ? Math.round((achievedReports.length / reports.length) * 100) : 0;
  const taskRate = tasks.length > 0 ? Math.round((completedTasks.length / tasks.length) * 100) : 0;

  const revenue = projects.reduce((s, p) => s + (p.revenue || 0), 0);
  const cost = projects.reduce((s, p) => s + (p.cost || 0), 0);

  const kpis = [
    { label: "日報提出", value: `${reports.length}件`, icon: TrendingUp, color: "text-primary", bg: "bg-primary/10" },
    { label: "ゴール達成率", value: `${achieveRate}%`, icon: Target, color: "text-success", bg: "bg-success/10" },
    { label: "タスク完了率", value: `${taskRate}%`, icon: Award, color: "text-warning", bg: "bg-warning/10" },
    { label: "作業時間", value: `${Math.floor(totalMinutes / 60)}h${totalMinutes % 60}m`, icon: Clock, color: "text-purple-500", bg: "bg-purple-500/10" },
    { label: "進行中プロジェクト", value: `${activeProjects.length}件`, icon: BarChart3, color: "text-primary", bg: "bg-primary/10" },
    { label: "総プロジェクト収益", value: `¥${(revenue - cost).toLocaleString()}`, icon: TrendingUp, color: revenue - cost >= 0 ? "text-success" : "text-danger", bg: revenue - cost >= 0 ? "bg-success/10" : "bg-danger/10" },
  ];

  const prev = format(subMonths(new Date(month + "-01"), 1), "yyyy-MM");
  const prevReports = store.getReports().filter((r) => r.report_date.startsWith(prev));
  const prevTasks = store.getTasks().filter((t) => t.task_date.startsWith(prev));
  const prevCompleted = prevTasks.filter((t) => t.status === "done");

  return (
    <>
      <Header title="KPIダッシュボード" subtitle="月間成果サマリー" />
      <div className="p-6 space-y-6">
        <div className="flex items-center gap-3">
          <input type="month" value={month} onChange={(e) => setMonth(e.target.value)} className="rounded-lg border border-card-border bg-card-bg px-3 py-2 text-sm focus:border-primary focus:outline-none" />
          <button onClick={() => setMonth(format(new Date(), "yyyy-MM"))} className="rounded-lg border border-card-border px-3 py-2 text-xs font-medium hover:bg-card-bg">今月</button>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {kpis.map((kpi) => {
            const Icon = kpi.icon;
            return (
              <div key={kpi.label} className="flex items-center gap-4 rounded-xl border border-card-border bg-card-bg p-5">
                <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${kpi.bg}`}>
                  <Icon size={24} className={kpi.color} />
                </div>
                <div>
                  <p className="text-sm text-muted">{kpi.label}</p>
                  <p className="text-xl font-bold">{kpi.value}</p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="rounded-xl border border-card-border bg-card-bg p-6">
          <h3 className="mb-4 text-base font-bold">前月比較</h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="rounded-lg bg-background p-4 text-center">
              <p className="text-xs text-muted">日報提出</p>
              <p className="text-lg font-bold">{reports.length} <span className="text-sm text-muted">/ 前月 {prevReports.length}</span></p>
              <p className={`text-xs font-medium ${reports.length >= prevReports.length ? "text-success" : "text-danger"}`}>
                {reports.length >= prevReports.length ? "+" : ""}{reports.length - prevReports.length}
              </p>
            </div>
            <div className="rounded-lg bg-background p-4 text-center">
              <p className="text-xs text-muted">タスク完了</p>
              <p className="text-lg font-bold">{completedTasks.length} <span className="text-sm text-muted">/ 前月 {prevCompleted.length}</span></p>
              <p className={`text-xs font-medium ${completedTasks.length >= prevCompleted.length ? "text-success" : "text-danger"}`}>
                {completedTasks.length >= prevCompleted.length ? "+" : ""}{completedTasks.length - prevCompleted.length}
              </p>
            </div>
            <div className="rounded-lg bg-background p-4 text-center">
              <p className="text-xs text-muted">ゴール達成率</p>
              <p className="text-lg font-bold">{achieveRate}%</p>
              <div className="mt-1 h-2 rounded-full bg-card-border overflow-hidden">
                <div className="h-full rounded-full bg-success transition-all" style={{ width: `${achieveRate}%` }} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
