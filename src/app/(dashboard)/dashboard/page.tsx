"use client";

import { useEffect, useState } from "react";
import { Header } from "@/components/layout/header";
import { store } from "@/lib/store";
import type { DailyReport, DailyTask, Project, TimeEntry } from "@/lib/types";
import { format, isAfter, parseISO } from "date-fns";
import { ja } from "date-fns/locale";
import {
  FileText,
  CheckSquare,
  Package,
  Clock,
  TrendingUp,
  AlertCircle,
  Users,
  AlertTriangle,
  Timer,
} from "lucide-react";
import Link from "next/link";

export default function DashboardPage() {
  const [reports, setReports] = useState<DailyReport[]>([]);
  const [tasks, setTasks] = useState<DailyTask[]>([]);
  const [allTasks, setAllTasks] = useState<DailyTask[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([]);
  const today = format(new Date(), "yyyy-MM-dd");

  useEffect(() => {
    setReports(store.getReports());
    setTasks(store.getTasksByDate(today));
    setAllTasks(store.getTasks());
    setProjects(store.getProjects());
    setTimeEntries(store.getTimeEntries());
  }, [today]);

  const todayReport = reports.find((r) => r.report_date === today);
  const completedTasks = tasks.filter((t) => t.status === "done").length;
  const activeProjects = projects.filter((p) => p.status === "in_development").length;

  const overdueTasks = allTasks.filter(
    (t) => t.due_date && t.status !== "done" && isAfter(new Date(today), parseISO(t.due_date))
  );

  const todayHours = timeEntries
    .filter((e) => e.start_time.startsWith(today))
    .reduce((sum, e) => sum + (e.duration_minutes || 0), 0);

  const stats = [
    { label: "今日の日報", value: todayReport ? "提出済み" : "未提出", icon: FileText, color: todayReport ? "text-success" : "text-warning", bgColor: todayReport ? "bg-success/10" : "bg-warning/10", href: todayReport ? "/reports" : "/reports/new" },
    { label: "今日のタスク", value: `${completedTasks} / ${tasks.length}`, icon: CheckSquare, color: "text-primary", bgColor: "bg-primary/10", href: "/tasks" },
    { label: "開発プロジェクト", value: `${activeProjects} 件進行中`, icon: Package, color: "text-purple-500", bgColor: "bg-purple-500/10", href: "/devbox" },
    { label: "今日の作業時間", value: todayHours > 0 ? `${Math.floor(todayHours / 60)}h${todayHours % 60}m` : "未計測", icon: Timer, color: todayHours > 0 ? "text-success" : "text-muted", bgColor: todayHours > 0 ? "bg-success/10" : "bg-muted/10", href: "/timer" },
  ];

  const profile = store.getProfile();
  const schedule = store.getScheduleByWeek(
    format(new Date(), "yyyy-MM-dd")
  );

  return (
    <>
      <Header title="ダッシュボード" subtitle={format(new Date(), "yyyy年M月d日(E)", { locale: ja })} />
      <div className="p-6 space-y-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <Link key={stat.label} href={stat.href} className="flex items-center gap-4 rounded-xl border border-card-border bg-card-bg p-5 transition-shadow hover:shadow-md">
                <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${stat.bgColor}`}>
                  <Icon size={24} className={stat.color} />
                </div>
                <div>
                  <p className="text-sm text-muted">{stat.label}</p>
                  <p className={`text-lg font-bold ${stat.color}`}>{stat.value}</p>
                </div>
              </Link>
            );
          })}
        </div>

        {/* チーム状況パネル */}
        <div className="rounded-xl border border-card-border bg-card-bg p-5">
          <h3 className="mb-3 flex items-center gap-2 text-sm font-bold">
            <Users size={16} className="text-primary" />
            今日のチーム状況
          </h3>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div className="rounded-lg bg-background p-3 text-center">
              <p className="text-xs text-muted">日報提出</p>
              <p className="text-lg font-bold text-success">{reports.filter((r) => r.report_date === today).length}名</p>
            </div>
            <div className="rounded-lg bg-background p-3 text-center">
              <p className="text-xs text-muted">タスク進行中</p>
              <p className="text-lg font-bold text-primary">{allTasks.filter((t) => t.status === "in_progress").length}件</p>
            </div>
            <div className="rounded-lg bg-background p-3 text-center">
              <p className="text-xs text-muted">期限切れタスク</p>
              <p className={`text-lg font-bold ${overdueTasks.length > 0 ? "text-danger" : "text-success"}`}>{overdueTasks.length}件</p>
            </div>
            <div className="rounded-lg bg-background p-3 text-center">
              <p className="text-xs text-muted">質問 (未解決)</p>
              <p className="text-lg font-bold text-warning">{store.getQuestions().filter((q) => q.status === "open").length}件</p>
            </div>
          </div>
        </div>

        {overdueTasks.length > 0 && (
          <div className="flex items-start gap-3 rounded-xl border border-danger/30 bg-danger/5 p-4">
            <AlertTriangle size={20} className="text-danger shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-bold text-danger">期限切れタスクがあります</p>
              <ul className="mt-1 space-y-1">
                {overdueTasks.slice(0, 3).map((t) => (
                  <li key={t.id} className="text-xs text-muted">
                    {t.title} — 期限: {t.due_date}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="rounded-xl border border-card-border bg-card-bg p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="flex items-center gap-2 text-lg font-bold">
                <TrendingUp size={20} className="text-primary" />
                最近の日報
              </h2>
              <Link href="/reports" className="text-sm text-primary hover:underline">すべて見る</Link>
            </div>
            {reports.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted">まだ日報がありません</p>
            ) : (
              <ul className="space-y-3">
                {reports.slice(0, 5).map((report) => (
                  <li key={report.id} className="flex items-center justify-between rounded-lg bg-background p-3">
                    <div>
                      <p className="text-sm font-medium">{report.goal}</p>
                      <p className="text-xs text-muted">{report.report_date}</p>
                    </div>
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${report.goal_result === "achieved" ? "bg-success/10 text-success" : report.goal_result === "in_progress" ? "bg-warning/10 text-warning" : "bg-muted/10 text-muted"}`}>
                      {report.goal_result === "achieved" ? "達成" : report.goal_result === "in_progress" ? "途中" : "未着手"}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="rounded-xl border border-card-border bg-card-bg p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="flex items-center gap-2 text-lg font-bold">
                <AlertCircle size={20} className="text-warning" />
                今日のタスク
              </h2>
              <Link href="/tasks" className="text-sm text-primary hover:underline">すべて見る</Link>
            </div>
            {tasks.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted">今日のタスクはまだありません</p>
            ) : (
              <ul className="space-y-3">
                {tasks.slice(0, 5).map((task) => (
                  <li key={task.id} className="flex items-center justify-between rounded-lg bg-background p-3">
                    <div className="flex items-center gap-3">
                      <div className={`h-3 w-3 rounded-full ${task.status === "done" ? "bg-success" : task.status === "in_progress" ? "bg-warning" : "bg-muted"}`} />
                      <div>
                        <span className={`text-sm ${task.status === "done" ? "line-through text-muted" : ""}`}>{task.title}</span>
                        {task.due_date && <p className="text-xs text-muted">期限: {task.due_date}</p>}
                      </div>
                    </div>
                    <span className={`text-xs font-medium ${task.priority === "high" ? "text-danger" : task.priority === "medium" ? "text-warning" : "text-muted"}`}>
                      {task.priority === "high" ? "高" : task.priority === "medium" ? "中" : "低"}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
