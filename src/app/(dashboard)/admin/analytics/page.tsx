"use client";

import { useEffect, useState } from "react";
import { Header } from "@/components/layout/header";
import { store } from "@/lib/store";
import type { DailyReport, DailyTask } from "@/lib/types";
import { format, subMonths, getDaysInMonth } from "date-fns";
import { BarChart3, TrendingUp, Target, Clock, Award } from "lucide-react";

export default function AnalyticsPage() {
  const [month, setMonth] = useState(format(new Date(), "yyyy-MM"));
  const [reports, setReports] = useState<DailyReport[]>([]);
  const [tasks, setTasks] = useState<DailyTask[]>([]);

  useEffect(() => {
    setReports(store.getReports());
    setTasks(store.getTasks());
  }, []);

  const monthReports = reports.filter((r) => r.report_date.startsWith(month));
  const monthTasks = tasks.filter((t) => t.task_date.startsWith(month));
  const completedTasks = monthTasks.filter((t) => t.status === "done");
  const daysInMonth = getDaysInMonth(new Date(month + "-01"));
  const workDays = Math.round(daysInMonth * (5 / 7));
  const submissionRate = workDays > 0 ? Math.round((monthReports.length / workDays) * 100) : 0;

  const achievedReports = monthReports.filter((r) => r.goal_result === "achieved");
  const achieveRate = monthReports.length > 0 ? Math.round((achievedReports.length / monthReports.length) * 100) : 0;

  const taskCompletionRate = monthTasks.length > 0 ? Math.round((completedTasks.length / monthTasks.length) * 100) : 0;

  const tasksByPriority = {
    high: monthTasks.filter((t) => t.priority === "high").length,
    medium: monthTasks.filter((t) => t.priority === "medium").length,
    low: monthTasks.filter((t) => t.priority === "low").length,
  };

  const stats = [
    { label: "日報提出数", value: monthReports.length, sub: `提出率 ${submissionRate}%`, icon: TrendingUp, color: "text-primary", bg: "bg-primary/10" },
    { label: "ゴール達成率", value: `${achieveRate}%`, sub: `${achievedReports.length}/${monthReports.length}件`, icon: Target, color: "text-success", bg: "bg-success/10" },
    { label: "タスク完了", value: completedTasks.length, sub: `完了率 ${taskCompletionRate}%`, icon: Award, color: "text-warning", bg: "bg-warning/10" },
    { label: "総タスク数", value: monthTasks.length, sub: `高:${tasksByPriority.high} 中:${tasksByPriority.medium} 低:${tasksByPriority.low}`, icon: BarChart3, color: "text-purple-500", bg: "bg-purple-500/10" },
  ];

  const weeklyData = Array.from({ length: 4 }, (_, weekIdx) => {
    const weekNum = weekIdx + 1;
    const startDay = weekIdx * 7 + 1;
    const endDay = Math.min(startDay + 6, daysInMonth);
    const prefix = `${month}-`;
    const weekReports = monthReports.filter((r) => {
      const day = parseInt(r.report_date.split("-")[2]);
      return day >= startDay && day <= endDay;
    });
    const weekTasks = monthTasks.filter((t) => {
      const day = parseInt(t.task_date.split("-")[2]);
      return day >= startDay && day <= endDay;
    });
    return {
      week: `第${weekNum}週`,
      reports: weekReports.length,
      tasksCompleted: weekTasks.filter((t) => t.status === "done").length,
      tasksTotal: weekTasks.length,
    };
  });

  const maxBar = Math.max(...weeklyData.map((w) => Math.max(w.reports, w.tasksTotal)), 1);

  return (
    <>
      <Header title="パフォーマンス分析" subtitle="月次データの可視化" />
      <div className="p-6 space-y-6">
        <div className="flex items-center gap-3">
          <input
            type="month"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="rounded-lg border border-card-border bg-card-bg px-3 py-2 text-sm focus:border-primary focus:outline-none"
          />
          <button onClick={() => setMonth(format(new Date(), "yyyy-MM"))} className="rounded-lg border border-card-border px-3 py-2 text-xs font-medium hover:bg-card-bg">
            今月
          </button>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((s) => {
            const Icon = s.icon;
            return (
              <div key={s.label} className="flex items-center gap-4 rounded-xl border border-card-border bg-card-bg p-5">
                <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${s.bg}`}>
                  <Icon size={24} className={s.color} />
                </div>
                <div>
                  <p className="text-sm text-muted">{s.label}</p>
                  <p className="text-xl font-bold">{s.value}</p>
                  <p className="text-xs text-muted">{s.sub}</p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="rounded-xl border border-card-border bg-card-bg p-6">
            <h3 className="mb-4 text-base font-bold">週別推移</h3>
            <div className="space-y-4">
              {weeklyData.map((w) => (
                <div key={w.week}>
                  <div className="mb-1 flex items-center justify-between text-xs">
                    <span className="font-medium">{w.week}</span>
                    <span className="text-muted">日報 {w.reports} / タスク {w.tasksCompleted}/{w.tasksTotal}</span>
                  </div>
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <div className="h-4 rounded-full bg-background overflow-hidden">
                        <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${(w.reports / maxBar) * 100}%` }} />
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="h-4 rounded-full bg-background overflow-hidden">
                        <div className="h-full rounded-full bg-success transition-all" style={{ width: `${(w.tasksCompleted / maxBar) * 100}%` }} />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              <div className="flex gap-4 text-xs text-muted pt-2">
                <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-primary" /> 日報</span>
                <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-success" /> タスク完了</span>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-card-border bg-card-bg p-6">
            <h3 className="mb-4 text-base font-bold">負荷メーター</h3>
            <div className="space-y-4">
              {(() => {
                const profile = store.getProfile();
                const userTasks = monthTasks.length;
                const maxLoad = 50;
                const loadPercent = Math.min(Math.round((userTasks / maxLoad) * 100), 100);
                const loadColor = loadPercent > 80 ? "bg-danger" : loadPercent > 50 ? "bg-warning" : "bg-success";
                const loadLabel = loadPercent > 80 ? "高負荷" : loadPercent > 50 ? "中負荷" : "低負荷";
                return (
                  <div className="rounded-lg border border-card-border p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">{profile.name}</span>
                      <span className={`text-xs font-medium ${loadPercent > 80 ? "text-danger" : loadPercent > 50 ? "text-warning" : "text-success"}`}>
                        {loadLabel} ({loadPercent}%)
                      </span>
                    </div>
                    <div className="h-3 rounded-full bg-background overflow-hidden">
                      <div className={`h-full rounded-full ${loadColor} transition-all`} style={{ width: `${loadPercent}%` }} />
                    </div>
                    <div className="mt-2 flex justify-between text-xs text-muted">
                      <span>タスク: {userTasks}件</span>
                      <span>日報: {monthReports.length}件</span>
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
