"use client";

import { useEffect, useState } from "react";
import { Header } from "@/components/layout/header";
import { store } from "@/lib/store";
import { ACTION_LABELS } from "@/lib/activity";
import type { ActivityLog, ActivityAction } from "@/lib/types";
import { format } from "date-fns";
import { ja } from "date-fns/locale";
import { ScrollText, Filter, Clock, LogIn, FileText, CheckSquare, Package, Calendar, Receipt, MessageCircle, Upload, MessageSquare } from "lucide-react";

const actionIcons: Record<ActivityAction, typeof Clock> = {
  clock_in: LogIn,
  clock_out: LogIn,
  task_add: CheckSquare,
  task_done: CheckSquare,
  report_submit: FileText,
  project_edit: Package,
  login: LogIn,
  schedule_save: Calendar,
  invoice_create: Receipt,
  question_post: MessageCircle,
  file_upload: Upload,
  chat_send: MessageSquare,
};

const actionColors: Record<ActivityAction, string> = {
  clock_in: "text-success",
  clock_out: "text-danger",
  task_add: "text-primary",
  task_done: "text-success",
  report_submit: "text-primary",
  project_edit: "text-purple-500",
  login: "text-muted",
  schedule_save: "text-warning",
  invoice_create: "text-success",
  question_post: "text-primary",
  file_upload: "text-purple-500",
  chat_send: "text-primary",
};

export default function ActivityLogPage() {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [filterAction, setFilterAction] = useState<ActivityAction | "all">("all");

  useEffect(() => {
    setLogs(store.getActivityLogs());
  }, []);

  const filtered = filterAction === "all" ? logs : logs.filter((l) => l.action === filterAction);

  const allActions = Object.keys(ACTION_LABELS) as ActivityAction[];

  return (
    <>
      <Header title="活動ログ" subtitle="全スタッフの操作履歴" />
      <div className="p-6 space-y-6">
        <div className="flex items-center gap-3 flex-wrap">
          <Filter size={16} className="text-muted" />
          <button
            onClick={() => setFilterAction("all")}
            className={`rounded-lg px-3 py-1 text-xs font-medium transition-colors ${filterAction === "all" ? "bg-primary text-white" : "bg-card-bg border border-card-border text-muted hover:text-foreground"}`}
          >
            すべて
          </button>
          {allActions.map((a) => (
            <button
              key={a}
              onClick={() => setFilterAction(a)}
              className={`rounded-lg px-3 py-1 text-xs font-medium transition-colors ${filterAction === a ? "bg-primary text-white" : "bg-card-bg border border-card-border text-muted hover:text-foreground"}`}
            >
              {ACTION_LABELS[a]}
            </button>
          ))}
          <span className="text-sm text-muted ml-auto">{filtered.length} 件</span>
        </div>

        <div className="rounded-xl border border-card-border bg-card-bg">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20">
              <ScrollText size={48} className="text-muted mb-4" />
              <p className="text-lg font-medium text-muted">ログがまだありません</p>
              <p className="text-sm text-muted mt-1">操作を行うとここに記録されます</p>
            </div>
          ) : (
            <div className="max-h-[70vh] overflow-y-auto">
              {filtered.map((log) => {
                const Icon = actionIcons[log.action] || Clock;
                const color = actionColors[log.action] || "text-muted";
                return (
                  <div key={log.id} className="flex items-center gap-4 border-b border-card-border px-6 py-3 last:border-0">
                    <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-background ${color}`}>
                      <Icon size={16} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm">
                        <span className="font-medium">{log.user_name}</span>
                        <span className="text-muted"> が </span>
                        <span className={`font-medium ${color}`}>{ACTION_LABELS[log.action]}</span>
                      </p>
                      {log.detail && <p className="text-xs text-muted truncate">{log.detail}</p>}
                    </div>
                    <span className="shrink-0 text-xs text-muted">
                      {format(new Date(log.created_at), "M/d HH:mm:ss")}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
