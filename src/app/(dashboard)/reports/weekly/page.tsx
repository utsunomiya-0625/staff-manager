"use client";

import { useEffect, useState } from "react";
import { Header } from "@/components/layout/header";
import { store } from "@/lib/store";
import { format, startOfWeek, endOfWeek, eachDayOfInterval } from "date-fns";
import { ja } from "date-fns/locale";
import { Sparkles, FileText, CheckSquare, Clock, Loader2 } from "lucide-react";

export default function WeeklyReportPage() {
  const [weeklyText, setWeeklyText] = useState("");
  const [loading, setLoading] = useState(false);

  const now = new Date();
  const weekStart = startOfWeek(now, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(now, { weekStartsOn: 1 });
  const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });

  const reports = store.getReports().filter((r) => {
    const d = new Date(r.report_date);
    return d >= weekStart && d <= weekEnd;
  });

  const tasks = store.getTasks().filter((t) => {
    const d = new Date(t.task_date);
    return d >= weekStart && d <= weekEnd;
  });

  const completedTasks = tasks.filter((t) => t.status === "done");
  const totalEntryMin = store.getTimeEntries()
    .filter((e) => { const d = new Date(e.start_time); return d >= weekStart && d <= weekEnd; })
    .reduce((s, e) => s + (e.duration_minutes || 0), 0);

  const generateWeekly = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/ai/summarize-reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reports }),
      });
      const data = await res.json();

      const header = `# 週報 ${format(weekStart, "M/d")} - ${format(weekEnd, "M/d")}\n\n`;
      const stats = `## サマリー\n- 日報提出: ${reports.length}日\n- タスク完了: ${completedTasks.length}/${tasks.length}件\n- 作業時間: ${Math.floor(totalEntryMin / 60)}時間${totalEntryMin % 60}分\n\n`;
      const ai = `## AI要約\n${data.summary || "要約を取得できませんでした"}\n\n`;
      const dailySection = reports.length > 0
        ? `## 日別詳細\n${reports.map((r) => `### ${r.report_date}\n- ゴール: ${r.goal} (${r.goal_result === "achieved" ? "達成" : r.goal_result === "in_progress" ? "途中" : "未着手"})\n- 進捗: ${r.progress}\n- 学び: ${r.learning}`).join("\n\n")}`
        : "";

      setWeeklyText(header + stats + ai + dailySection);
    } catch {
      setWeeklyText("週報の生成に失敗しました");
    }
    setLoading(false);
  };

  return (
    <>
      <Header title="自動週報" subtitle={`${format(weekStart, "M月d日", { locale: ja })} - ${format(weekEnd, "M月d日", { locale: ja })}`} />
      <div className="p-6 space-y-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="flex items-center gap-4 rounded-xl border border-card-border bg-card-bg p-5">
            <FileText size={24} className="text-primary" />
            <div><p className="text-sm text-muted">日報提出</p><p className="text-xl font-bold">{reports.length}日</p></div>
          </div>
          <div className="flex items-center gap-4 rounded-xl border border-card-border bg-card-bg p-5">
            <CheckSquare size={24} className="text-success" />
            <div><p className="text-sm text-muted">タスク完了</p><p className="text-xl font-bold">{completedTasks.length}/{tasks.length}</p></div>
          </div>
          <div className="flex items-center gap-4 rounded-xl border border-card-border bg-card-bg p-5">
            <Clock size={24} className="text-warning" />
            <div><p className="text-sm text-muted">作業時間</p><p className="text-xl font-bold">{Math.floor(totalEntryMin / 60)}h{totalEntryMin % 60}m</p></div>
          </div>
        </div>

        <div className="flex justify-center">
          <button onClick={generateWeekly} disabled={loading} className="flex items-center gap-2 rounded-xl bg-purple-500 px-6 py-3 text-sm font-semibold text-white hover:bg-purple-600 disabled:opacity-50">
            {loading ? <Loader2 size={18} className="animate-spin" /> : <Sparkles size={18} />}
            {loading ? "生成中..." : "AIで週報を生成"}
          </button>
        </div>

        {weeklyText && (
          <div className="rounded-xl border border-card-border bg-card-bg p-6">
            <div className="whitespace-pre-wrap text-sm leading-relaxed">{weeklyText}</div>
          </div>
        )}
      </div>
    </>
  );
}
