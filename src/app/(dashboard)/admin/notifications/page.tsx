"use client";

import { useEffect, useState } from "react";
import { Header } from "@/components/layout/header";
import { store } from "@/lib/store";
import type { AppNotification } from "@/lib/types";
import { format } from "date-fns";
import { ja } from "date-fns/locale";
import { Bell, CheckCheck, Trash2, AlertTriangle, Info, Brain, Clock } from "lucide-react";

const typeConfig: Record<string, { icon: typeof Bell; color: string; bg: string }> = {
  report_missing: { icon: AlertTriangle, color: "text-danger", bg: "bg-danger/10" },
  late: { icon: Clock, color: "text-warning", bg: "bg-warning/10" },
  info: { icon: Info, color: "text-primary", bg: "bg-primary/10" },
  ai: { icon: Brain, color: "text-purple-500", bg: "bg-purple-500/10" },
};

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [slackUrl, setSlackUrl] = useState("");

  useEffect(() => {
    setNotifications(store.getNotifications());
    if (typeof window !== "undefined") {
      setSlackUrl(localStorage.getItem("sm_slack_webhook") || "");
    }
  }, []);

  const markAllRead = () => {
    store.markAllNotificationsRead();
    setNotifications(store.getNotifications());
  };

  const saveSlackUrl = () => {
    localStorage.setItem("sm_slack_webhook", slackUrl);
    alert("Slack Webhook URL を保存しました");
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <>
      <Header title="通知管理" subtitle="アプリ内通知とSlack連携の設定" />
      <div className="p-6 space-y-6">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 rounded-xl border border-card-border bg-card-bg">
            <div className="flex items-center justify-between border-b border-card-border px-6 py-4">
              <h2 className="flex items-center gap-2 text-base font-bold">
                <Bell size={18} className="text-primary" />
                通知一覧
                {unreadCount > 0 && (
                  <span className="rounded-full bg-danger px-2 py-0.5 text-xs text-white">
                    {unreadCount}
                  </span>
                )}
              </h2>
              <button onClick={markAllRead} className="flex items-center gap-1.5 text-xs text-primary hover:underline">
                <CheckCheck size={14} />
                すべて既読にする
              </button>
            </div>
            <div className="max-h-[60vh] overflow-y-auto">
              {notifications.length === 0 ? (
                <p className="py-12 text-center text-sm text-muted">通知はありません</p>
              ) : (
                notifications.map((n) => {
                  const cfg = typeConfig[n.type] || typeConfig.info;
                  const Icon = cfg.icon;
                  return (
                    <div
                      key={n.id}
                      className={`flex items-start gap-3 border-b border-card-border px-6 py-4 ${!n.read ? "bg-primary/5" : ""}`}
                      onClick={() => { store.markNotificationRead(n.id); setNotifications(store.getNotifications()); }}
                    >
                      <div className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${cfg.bg}`}>
                        <Icon size={16} className={cfg.color} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">{n.title}</p>
                        <p className="text-xs text-muted mt-0.5">{n.message}</p>
                      </div>
                      <span className="shrink-0 text-xs text-muted">
                        {format(new Date(n.created_at), "M/d HH:mm")}
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-xl border border-card-border bg-card-bg p-5">
              <h3 className="mb-3 text-sm font-bold">Slack 連携設定</h3>
              <p className="mb-3 text-xs text-muted">
                Incoming Webhook URL を設定すると、日報未提出・遅刻アラートが Slack に通知されます
              </p>
              <input
                type="url"
                value={slackUrl}
                onChange={(e) => setSlackUrl(e.target.value)}
                placeholder="https://hooks.slack.com/services/..."
                className="mb-3 w-full rounded-lg border border-card-border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
              <button onClick={saveSlackUrl} className="w-full rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-hover transition-colors">
                保存
              </button>
            </div>

            <div className="rounded-xl border border-card-border bg-card-bg p-5">
              <h3 className="mb-3 text-sm font-bold">通知の種類</h3>
              <ul className="space-y-2">
                {Object.entries(typeConfig).map(([key, cfg]) => {
                  const Icon = cfg.icon;
                  const labels: Record<string, string> = { report_missing: "日報未提出", late: "遅刻", info: "お知らせ", ai: "AI通知" };
                  return (
                    <li key={key} className="flex items-center gap-2 text-sm">
                      <Icon size={14} className={cfg.color} />
                      {labels[key]}
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
