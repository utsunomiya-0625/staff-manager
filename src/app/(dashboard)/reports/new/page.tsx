"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/layout/header";
import { store } from "@/lib/store";
import type { ReportResult } from "@/lib/types";
import { format } from "date-fns";
import { ja } from "date-fns/locale";
import { Save, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { v4 as uuidv4 } from "uuid";
import { logActivity } from "@/lib/activity";

const resultOptions: { value: ReportResult; label: string }[] = [
  { value: "achieved", label: "達成" },
  { value: "in_progress", label: "途中" },
  { value: "not_started", label: "未着手" },
];

export default function NewReportPage() {
  const router = useRouter();
  const today = format(new Date(), "yyyy-MM-dd");
  const [date, setDate] = useState(today);
  const [goal, setGoal] = useState("");
  const [goalResult, setGoalResult] = useState<ReportResult>("in_progress");
  const [progress, setProgress] = useState("");
  const [blocker, setBlocker] = useState("");
  const [tried, setTried] = useState("");
  const [learning, setLearning] = useState("");
  const [nextPlan, setNextPlan] = useState("");
  const [freeSpace, setFreeSpace] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const now = new Date().toISOString();
    store.saveReport({
      id: uuidv4(),
      user_id: store.getProfile().id,
      report_date: date,
      goal,
      goal_result: goalResult,
      progress,
      blocker: blocker || "なし",
      tried,
      learning,
      next_plan: nextPlan,
      free_space: freeSpace,
      created_at: now,
      updated_at: now,
    });
    logActivity("report_submit", `${date} の日報を提出: ${goal}`);
    router.push("/reports");
  };

  return (
    <>
      <Header
        title="日報作成"
        subtitle={format(new Date(date), "yyyy年M月d日(E)", { locale: ja })}
      />
      <div className="mx-auto max-w-3xl p-6">
        <Link
          href="/reports"
          className="mb-6 inline-flex items-center gap-1 text-sm text-muted hover:text-foreground transition-colors"
        >
          <ArrowLeft size={16} />
          一覧に戻る
        </Link>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="mb-1 block text-sm font-medium">日付</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full rounded-lg border border-card-border bg-card-bg px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          <fieldset className="rounded-xl border border-card-border bg-card-bg p-5 space-y-4">
            <legend className="px-2 text-sm font-bold text-primary">
              本日のゴール
            </legend>
            <textarea
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              placeholder="今日達成を目指したこと（1つ）"
              rows={2}
              required
              className="w-full rounded-lg border border-card-border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary resize-none"
            />
            <div className="flex gap-3">
              {resultOptions.map((opt) => (
                <label
                  key={opt.value}
                  className={`flex cursor-pointer items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition-colors ${
                    goalResult === opt.value
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-card-border hover:bg-background"
                  }`}
                >
                  <input
                    type="radio"
                    name="goalResult"
                    value={opt.value}
                    checked={goalResult === opt.value}
                    onChange={() => setGoalResult(opt.value)}
                    className="sr-only"
                  />
                  {opt.label}
                </label>
              ))}
            </div>
          </fieldset>

          <FormField
            label="開発の進捗"
            placeholder="取り組んだタスク"
            value={progress}
            onChange={setProgress}
          />

          <FormField
            label="ブロッカー・質問"
            placeholder="詰まっていること。なければ「なし」でOK"
            value={blocker}
            onChange={setBlocker}
          />

          <FormField
            label="試したこと"
            placeholder="調べたキーワード、参照したドキュメント、試したコード等"
            value={tried}
            onChange={setTried}
          />

          <FormField
            label="今日の学び"
            placeholder="技術的な学び（新しく知った概念、使い方、ハマりポイントなど）"
            value={learning}
            onChange={setLearning}
          />

          <FormField
            label="次回出勤日の予定"
            placeholder="やること（把握してるものでOK）"
            value={nextPlan}
            onChange={setNextPlan}
          />

          <FormField
            label="フリースペース・相談事項"
            placeholder="自由記入欄"
            value={freeSpace}
            onChange={setFreeSpace}
          />

          <div className="flex justify-end gap-3 pt-4">
            <Link
              href="/reports"
              className="rounded-xl border border-card-border px-6 py-2.5 text-sm font-medium hover:bg-background transition-colors"
            >
              キャンセル
            </Link>
            <button
              type="submit"
              className="flex items-center gap-2 rounded-xl bg-primary px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-hover"
            >
              <Save size={18} />
              保存する
            </button>
          </div>
        </form>
      </div>
    </>
  );
}

function FormField({
  label,
  placeholder,
  value,
  onChange,
}: {
  label: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <label className="mb-1 block text-sm font-bold text-primary">
        {label}
      </label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={3}
        className="w-full rounded-lg border border-card-border bg-card-bg px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary resize-none"
      />
    </div>
  );
}
