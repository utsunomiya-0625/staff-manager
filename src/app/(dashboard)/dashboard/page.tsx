"use client";

import { useEffect, useState } from "react";
import { Header } from "@/components/layout/header";
import { store } from "@/lib/store";
import type { DailyReport, DailyTask, Project } from "@/lib/types";
import { format } from "date-fns";
import { ja } from "date-fns/locale";
import {
  FileText,
  CheckSquare,
  Package,
  Clock,
  TrendingUp,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";

export default function DashboardPage() {
  const [reports, setReports] = useState<DailyReport[]>([]);
  const [tasks, setTasks] = useState<DailyTask[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const today = format(new Date(), "yyyy-MM-dd");

  useEffect(() => {
    setReports(store.getReports());
    setTasks(store.getTasksByDate(today));
    setProjects(store.getProjects());
  }, [today]);

  const todayReport = reports.find((r) => r.report_date === today);
  const completedTasks = tasks.filter((t) => t.status === "done").length;
  const activeProjects = projects.filter(
    (p) => p.status === "in_development"
  ).length;

  const stats = [
    {
      label: "今日の日報",
      value: todayReport ? "提出済み" : "未提出",
      icon: FileText,
      color: todayReport ? "text-success" : "text-warning",
      bgColor: todayReport ? "bg-success/10" : "bg-warning/10",
      href: todayReport ? "/reports" : "/reports/new",
    },
    {
      label: "今日のタスク",
      value: `${completedTasks} / ${tasks.length}`,
      icon: CheckSquare,
      color: "text-primary",
      bgColor: "bg-primary/10",
      href: "/tasks",
    },
    {
      label: "開発プロジェクト",
      value: `${activeProjects} 件進行中`,
      icon: Package,
      color: "text-purple-500",
      bgColor: "bg-purple-500/10",
      href: "/devbox",
    },
    {
      label: "今月の勤務",
      value: "Google Sheets連携後",
      icon: Clock,
      color: "text-muted",
      bgColor: "bg-muted/10",
      href: "/attendance",
    },
  ];

  return (
    <>
      <Header
        title="ダッシュボード"
        subtitle={format(new Date(), "yyyy年M月d日(E)", { locale: ja })}
      />
      <div className="p-6 space-y-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <Link
                key={stat.label}
                href={stat.href}
                className="flex items-center gap-4 rounded-xl border border-card-border bg-card-bg p-5 transition-shadow hover:shadow-md"
              >
                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-xl ${stat.bgColor}`}
                >
                  <Icon size={24} className={stat.color} />
                </div>
                <div>
                  <p className="text-sm text-muted">{stat.label}</p>
                  <p className={`text-lg font-bold ${stat.color}`}>
                    {stat.value}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="rounded-xl border border-card-border bg-card-bg p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="flex items-center gap-2 text-lg font-bold">
                <TrendingUp size={20} className="text-primary" />
                最近の日報
              </h2>
              <Link
                href="/reports"
                className="text-sm text-primary hover:underline"
              >
                すべて見る
              </Link>
            </div>
            {reports.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted">
                まだ日報がありません
              </p>
            ) : (
              <ul className="space-y-3">
                {reports.slice(0, 5).map((report) => (
                  <li
                    key={report.id}
                    className="flex items-center justify-between rounded-lg bg-background p-3"
                  >
                    <div>
                      <p className="text-sm font-medium">{report.goal}</p>
                      <p className="text-xs text-muted">{report.report_date}</p>
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
              <Link
                href="/tasks"
                className="text-sm text-primary hover:underline"
              >
                すべて見る
              </Link>
            </div>
            {tasks.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted">
                今日のタスクはまだありません
              </p>
            ) : (
              <ul className="space-y-3">
                {tasks.slice(0, 5).map((task) => (
                  <li
                    key={task.id}
                    className="flex items-center justify-between rounded-lg bg-background p-3"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`h-3 w-3 rounded-full ${
                          task.status === "done"
                            ? "bg-success"
                            : task.status === "in_progress"
                            ? "bg-warning"
                            : "bg-muted"
                        }`}
                      />
                      <span
                        className={`text-sm ${
                          task.status === "done"
                            ? "line-through text-muted"
                            : ""
                        }`}
                      >
                        {task.title}
                      </span>
                    </div>
                    <span
                      className={`text-xs font-medium ${
                        task.priority === "high"
                          ? "text-danger"
                          : task.priority === "medium"
                          ? "text-warning"
                          : "text-muted"
                      }`}
                    >
                      {task.priority === "high"
                        ? "高"
                        : task.priority === "medium"
                        ? "中"
                        : "低"}
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
