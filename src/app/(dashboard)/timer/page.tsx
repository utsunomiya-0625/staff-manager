"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { Header } from "@/components/layout/header";
import { store } from "@/lib/store";
import type { TimeEntry, DailyTask } from "@/lib/types";
import { format } from "date-fns";
import { ja } from "date-fns/locale";
import { Timer, Play, Square, Trash2, Clock } from "lucide-react";
import { v4 as uuidv4 } from "uuid";

export default function TimerPage() {
  const [entries, setEntries] = useState<TimeEntry[]>([]);
  const [tasks, setTasks] = useState<DailyTask[]>([]);
  const [running, setRunning] = useState<TimeEntry | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const [selectedTask, setSelectedTask] = useState("");
  const [description, setDescription] = useState("");
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const today = format(new Date(), "yyyy-MM-dd");

  const load = useCallback(() => {
    const all = store.getTimeEntries();
    setEntries(all.filter((e) => e.start_time.startsWith(today)));
    setTasks(store.getTasksByDate(today));
    const active = all.find((e) => !e.end_time);
    if (active) {
      setRunning(active);
      const diff = Math.floor((Date.now() - new Date(active.start_time).getTime()) / 1000);
      setElapsed(diff);
    }
  }, [today]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => setElapsed((p) => p + 1), 1000);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [running]);

  const startTimer = () => {
    const entry: TimeEntry = {
      id: uuidv4(),
      user_id: store.getProfile().id,
      task_id: selectedTask || undefined,
      description: description || tasks.find((t) => t.id === selectedTask)?.title || "作業",
      start_time: new Date().toISOString(),
      created_at: new Date().toISOString(),
    };
    store.saveTimeEntry(entry);
    setRunning(entry);
    setElapsed(0);
  };

  const stopTimer = () => {
    if (!running) return;
    const end = new Date();
    const start = new Date(running.start_time);
    const durMin = Math.round((end.getTime() - start.getTime()) / 60000);
    const updated: TimeEntry = { ...running, end_time: end.toISOString(), duration_minutes: durMin };
    store.saveTimeEntry(updated);
    setRunning(null);
    setElapsed(0);
    setDescription("");
    load();
  };

  const deleteEntry = (id: string) => {
    store.deleteTimeEntry(id);
    load();
  };

  const fmtDur = (sec: number) => {
    const h = Math.floor(sec / 3600);
    const m = Math.floor((sec % 3600) / 60);
    const s = sec % 60;
    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  };

  const totalMin = entries.filter((e) => e.duration_minutes).reduce((s, e) => s + (e.duration_minutes || 0), 0);

  return (
    <>
      <Header title="タイムトラッキング" subtitle="タスクごとの作業時間を計測" />
      <div className="p-6 space-y-6">
        <div className="rounded-xl border border-card-border bg-card-bg p-6">
          <div className="flex flex-col items-center gap-4">
            <div className={`text-5xl font-mono font-bold tracking-wider ${running ? "text-primary" : "text-muted"}`}>
              {fmtDur(elapsed)}
            </div>
            {!running ? (
              <div className="flex flex-col items-center gap-3 w-full max-w-md">
                <select value={selectedTask} onChange={(e) => setSelectedTask(e.target.value)} className="w-full rounded-lg border border-card-border bg-background px-3 py-2 text-sm">
                  <option value="">タスクを選択（任意）</option>
                  {tasks.map((t) => (<option key={t.id} value={t.id}>{t.title}</option>))}
                </select>
                <input type="text" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="作業内容を入力..." className="w-full rounded-lg border border-card-border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none" />
                <button onClick={startTimer} className="flex items-center gap-2 rounded-xl bg-primary px-8 py-3 text-sm font-semibold text-white hover:bg-primary-hover">
                  <Play size={18} /> 開始
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <p className="text-sm text-muted">{running.description}</p>
                <button onClick={stopTimer} className="flex items-center gap-2 rounded-xl bg-danger px-8 py-3 text-sm font-semibold text-white hover:bg-danger/90">
                  <Square size={18} /> 停止
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-base font-bold">
            <Clock size={18} className="text-primary" />
            今日の記録
          </h2>
          <span className="text-sm text-muted">合計: {Math.floor(totalMin / 60)}h{totalMin % 60}m</span>
        </div>

        <div className="rounded-xl border border-card-border bg-card-bg">
          {entries.filter((e) => e.end_time).length === 0 ? (
            <p className="py-12 text-center text-sm text-muted">まだ記録がありません</p>
          ) : (
            entries.filter((e) => e.end_time).map((e) => (
              <div key={e.id} className="flex items-center justify-between border-b border-card-border px-6 py-4 last:border-0">
                <div className="flex items-center gap-3">
                  <Timer size={16} className="text-primary" />
                  <div>
                    <p className="text-sm font-medium">{e.description}</p>
                    <p className="text-xs text-muted">
                      {format(new Date(e.start_time), "HH:mm")} - {e.end_time ? format(new Date(e.end_time), "HH:mm") : ""}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-bold text-primary">{e.duration_minutes}分</span>
                  <button onClick={() => deleteEntry(e.id)} className="text-muted hover:text-danger"><Trash2 size={14} /></button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
}
