"use client";

import { useState } from "react";
import { Header } from "@/components/layout/header";
import { format } from "date-fns";
import { ja } from "date-fns/locale";
import {
  Clock,
  Play,
  Square,
  Calendar,
  FileSpreadsheet,
  AlertCircle,
} from "lucide-react";

export default function AttendancePage() {
  const [isClockedIn, setIsClockedIn] = useState(false);
  const [clockInTime, setClockInTime] = useState<string | null>(null);
  const today = format(new Date(), "yyyy年M月d日(E)", { locale: ja });

  const handleClockIn = () => {
    setClockInTime(format(new Date(), "HH:mm"));
    setIsClockedIn(true);
  };

  const handleClockOut = () => {
    setIsClockedIn(false);
  };

  return (
    <>
      <Header title="勤怠管理" subtitle="Google Sheets / Calendar 連携" />
      <div className="p-6 space-y-6">
        <div className="rounded-xl border border-primary/30 bg-primary/5 p-6">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
              <Clock size={24} className="text-primary" />
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-bold">{today}</h2>
              <p className="text-sm text-muted mt-1">
                {clockInTime
                  ? `出勤時間: ${clockInTime}`
                  : "まだ出勤記録がありません"}
              </p>
              <div className="mt-4 flex gap-3">
                {!isClockedIn ? (
                  <button
                    onClick={handleClockIn}
                    className="flex items-center gap-2 rounded-xl bg-success px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-success/90"
                  >
                    <Play size={18} />
                    出勤
                  </button>
                ) : (
                  <button
                    onClick={handleClockOut}
                    className="flex items-center gap-2 rounded-xl bg-danger px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-danger/90"
                  >
                    <Square size={18} />
                    退勤
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="rounded-xl border border-card-border bg-card-bg p-6">
            <div className="mb-4 flex items-center gap-2">
              <FileSpreadsheet size={20} className="text-success" />
              <h3 className="text-base font-bold">Google Sheets 連携</h3>
            </div>
            <div className="rounded-lg bg-background p-6 text-center">
              <AlertCircle size={32} className="mx-auto text-muted mb-3" />
              <p className="text-sm font-medium text-muted">
                Google Sheets API を設定すると、勤務時間と給料データがここに表示されます
              </p>
              <p className="mt-2 text-xs text-muted">
                .env.local に GOOGLE_SHEETS_SPREADSHEET_ID を設定してください
              </p>
            </div>
            <div className="mt-4">
              <h4 className="text-sm font-medium text-muted mb-2">
                連携後に利用できる機能:
              </h4>
              <ul className="space-y-1 text-sm text-muted">
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-success" />
                  出退勤記録をスプレッドシートに自動記録
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-success" />
                  月次勤務時間の自動集計
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-success" />
                  給料計算（時給 x 勤務時間）
                </li>
              </ul>
            </div>
          </div>

          <div className="rounded-xl border border-card-border bg-card-bg p-6">
            <div className="mb-4 flex items-center gap-2">
              <Calendar size={20} className="text-primary" />
              <h3 className="text-base font-bold">Google Calendar 連携</h3>
            </div>
            <div className="rounded-lg bg-background p-6 text-center">
              <AlertCircle size={32} className="mx-auto text-muted mb-3" />
              <p className="text-sm font-medium text-muted">
                Google Calendar API を設定すると、勤務予定の登録ができます
              </p>
              <p className="mt-2 text-xs text-muted">
                .env.local に GOOGLE_CALENDAR_ID を設定してください
              </p>
            </div>
            <div className="mt-4">
              <h4 className="text-sm font-medium text-muted mb-2">
                連携後に利用できる機能:
              </h4>
              <ul className="space-y-1 text-sm text-muted">
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                  勤務予定をカレンダーに書き込み
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                  シフト管理
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                  勤務実績とスケジュールの突合
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-card-border bg-card-bg p-6">
          <h3 className="mb-4 text-base font-bold">月次集計（サンプル）</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-card-border text-left text-muted">
                  <th className="pb-3 pr-4 font-medium">日付</th>
                  <th className="pb-3 pr-4 font-medium">出勤</th>
                  <th className="pb-3 pr-4 font-medium">退勤</th>
                  <th className="pb-3 pr-4 font-medium">勤務時間</th>
                  <th className="pb-3 font-medium">給料</th>
                </tr>
              </thead>
              <tbody className="text-muted">
                <tr>
                  <td colSpan={5} className="py-8 text-center">
                    Google Sheets 連携後にデータが表示されます
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}
