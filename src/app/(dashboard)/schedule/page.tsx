"use client";

import { useEffect, useState, useCallback } from "react";
import { Header } from "@/components/layout/header";
import { store } from "@/lib/store";
import type { WeeklySchedule, WeeklyScheduleDay, WorkLocation } from "@/lib/types";
import {
  format,
  startOfWeek,
  addDays,
  addWeeks,
  subWeeks,
  isSameDay,
  isToday,
} from "date-fns";
import { ja } from "date-fns/locale";
import {
  ChevronLeft,
  ChevronRight,
  Building2,
  Home,
  Coffee,
  HelpCircle,
  Save,
  Check,
} from "lucide-react";
import { v4 as uuidv4 } from "uuid";

const locationConfig: Record<
  WorkLocation,
  { label: string; icon: typeof Building2; color: string; bg: string; border: string }
> = {
  office: {
    label: "出社",
    icon: Building2,
    color: "text-primary",
    bg: "bg-primary/10",
    border: "border-primary/40",
  },
  remote: {
    label: "在宅",
    icon: Home,
    color: "text-success",
    bg: "bg-success/10",
    border: "border-success/40",
  },
  off: {
    label: "休み",
    icon: Coffee,
    color: "text-muted",
    bg: "bg-muted/10",
    border: "border-muted/40",
  },
  undecided: {
    label: "未定",
    icon: HelpCircle,
    color: "text-warning",
    bg: "bg-warning/10",
    border: "border-warning/40",
  },
};

const locationOrder: WorkLocation[] = ["office", "remote", "off", "undecided"];

export default function SchedulePage() {
  const [weekStart, setWeekStart] = useState(() =>
    format(startOfWeek(new Date(), { weekStartsOn: 1 }), "yyyy-MM-dd")
  );
  const [days, setDays] = useState<WeeklyScheduleDay[]>([]);
  const [saved, setSaved] = useState(false);

  const buildWeekDays = useCallback(
    (ws: string): WeeklyScheduleDay[] => {
      const start = new Date(ws);
      return Array.from({ length: 7 }, (_, i) => ({
        date: format(addDays(start, i), "yyyy-MM-dd"),
        location: (i >= 5 ? "off" : "undecided") as WorkLocation,
        note: "",
      }));
    },
    []
  );

  useEffect(() => {
    const existing = store.getScheduleByWeek(weekStart);
    if (existing) {
      setDays(existing.days);
    } else {
      setDays(buildWeekDays(weekStart));
    }
    setSaved(false);
  }, [weekStart, buildWeekDays]);

  const goWeek = (offset: number) => {
    const current = new Date(weekStart);
    const next = offset > 0 ? addWeeks(current, 1) : subWeeks(current, 1);
    setWeekStart(format(next, "yyyy-MM-dd"));
  };

  const goThisWeek = () => {
    setWeekStart(
      format(startOfWeek(new Date(), { weekStartsOn: 1 }), "yyyy-MM-dd")
    );
  };

  const updateDay = (idx: number, field: keyof WeeklyScheduleDay, value: string) => {
    setDays((prev) => {
      const updated = [...prev];
      updated[idx] = { ...updated[idx], [field]: value };
      return updated;
    });
    setSaved(false);
  };

  const cycleLocation = (idx: number) => {
    const current = days[idx].location;
    const nextIdx = (locationOrder.indexOf(current) + 1) % locationOrder.length;
    updateDay(idx, "location", locationOrder[nextIdx]);
  };

  const handleSave = () => {
    const existing = store.getScheduleByWeek(weekStart);
    const now = new Date().toISOString();
    const schedule: WeeklySchedule = {
      id: existing?.id || uuidv4(),
      user_id: store.getProfile().id,
      week_start: weekStart,
      days,
      created_at: existing?.created_at || now,
      updated_at: now,
    };
    store.saveSchedule(schedule);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const weekEnd = format(addDays(new Date(weekStart), 6), "yyyy-MM-dd");

  const officeDays = days.filter((d) => d.location === "office").length;
  const remoteDays = days.filter((d) => d.location === "remote").length;

  return (
    <>
      <Header title="勤務予定" subtitle="週間スケジュールの管理" />
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => goWeek(-1)}
              className="rounded-lg p-2 hover:bg-card-bg transition-colors"
            >
              <ChevronLeft size={20} />
            </button>
            <div className="text-center">
              <h2 className="text-lg font-bold">
                {format(new Date(weekStart), "yyyy年M月d日", { locale: ja })}
                {" 〜 "}
                {format(new Date(weekEnd), "M月d日", { locale: ja })}
              </h2>
            </div>
            <button
              onClick={() => goWeek(1)}
              className="rounded-lg p-2 hover:bg-card-bg transition-colors"
            >
              <ChevronRight size={20} />
            </button>
            <button
              onClick={goThisWeek}
              className="ml-2 rounded-lg border border-card-border px-3 py-1 text-xs font-medium hover:bg-card-bg transition-colors"
            >
              今週
            </button>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3 text-sm">
              <span className="flex items-center gap-1.5 text-primary">
                <Building2 size={14} />
                出社 {officeDays}日
              </span>
              <span className="flex items-center gap-1.5 text-success">
                <Home size={14} />
                在宅 {remoteDays}日
              </span>
            </div>
            <button
              onClick={handleSave}
              className={`flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold text-white transition-all ${
                saved
                  ? "bg-success"
                  : "bg-primary hover:bg-primary-hover"
              }`}
            >
              {saved ? <Check size={18} /> : <Save size={18} />}
              {saved ? "保存しました" : "保存"}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-3">
          {days.map((day, idx) => {
            const loc = locationConfig[day.location];
            const Icon = loc.icon;
            const dateObj = new Date(day.date);
            const today = isToday(dateObj);
            const isWeekend = idx >= 5;

            return (
              <div
                key={day.date}
                className={`rounded-xl border-2 transition-all ${loc.border} ${
                  today ? "ring-2 ring-primary ring-offset-2" : ""
                } bg-card-bg`}
              >
                <div
                  className={`flex items-center justify-between border-b px-3 py-2 ${
                    isWeekend ? "bg-muted/5" : ""
                  }`}
                  style={{ borderColor: "inherit" }}
                >
                  <div>
                    <p
                      className={`text-xs font-medium ${
                        today ? "text-primary" : "text-muted"
                      }`}
                    >
                      {format(dateObj, "E", { locale: ja })}
                    </p>
                    <p
                      className={`text-lg font-bold ${
                        today ? "text-primary" : ""
                      }`}
                    >
                      {format(dateObj, "d")}
                    </p>
                  </div>
                  {today && (
                    <span className="rounded-full bg-primary px-2 py-0.5 text-[10px] font-bold text-white">
                      TODAY
                    </span>
                  )}
                </div>

                <div className="p-3 space-y-3">
                  <button
                    onClick={() => cycleLocation(idx)}
                    className={`flex w-full items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-semibold transition-colors ${loc.bg} ${loc.color}`}
                  >
                    <Icon size={16} />
                    {loc.label}
                  </button>

                  <div className="flex gap-1">
                    {locationOrder.map((l) => {
                      const cfg = locationConfig[l];
                      const LIcon = cfg.icon;
                      return (
                        <button
                          key={l}
                          onClick={() => updateDay(idx, "location", l)}
                          title={cfg.label}
                          className={`flex-1 flex items-center justify-center rounded-md py-1.5 transition-colors ${
                            day.location === l
                              ? `${cfg.bg} ${cfg.color}`
                              : "text-muted/40 hover:bg-background"
                          }`}
                        >
                          <LIcon size={12} />
                        </button>
                      );
                    })}
                  </div>

                  <textarea
                    value={day.note}
                    onChange={(e) => updateDay(idx, "note", e.target.value)}
                    placeholder="メモ"
                    rows={2}
                    className="w-full rounded-md border border-card-border bg-background px-2 py-1.5 text-xs focus:border-primary focus:outline-none resize-none"
                  />
                </div>
              </div>
            );
          })}
        </div>

        <div className="rounded-xl border border-card-border bg-card-bg p-5">
          <h3 className="mb-3 text-sm font-bold">凡例</h3>
          <div className="flex flex-wrap gap-4">
            {locationOrder.map((l) => {
              const cfg = locationConfig[l];
              const LIcon = cfg.icon;
              return (
                <div key={l} className="flex items-center gap-2 text-sm">
                  <div
                    className={`flex h-8 w-8 items-center justify-center rounded-lg ${cfg.bg}`}
                  >
                    <LIcon size={16} className={cfg.color} />
                  </div>
                  <span>{cfg.label}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}
