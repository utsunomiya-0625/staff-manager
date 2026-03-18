"use client";

import { useEffect, useState } from "react";
import { Header } from "@/components/layout/header";
import { store } from "@/lib/store";
import type { DailyReport } from "@/lib/types";
import Link from "next/link";
import { Plus, FileText, Trash2, Eye } from "lucide-react";
import { format } from "date-fns";
import { ja } from "date-fns/locale";

const resultLabel: Record<string, string> = {
  achieved: "達成",
  in_progress: "途中",
  not_started: "未着手",
};

const resultStyle: Record<string, string> = {
  achieved: "bg-success/10 text-success",
  in_progress: "bg-warning/10 text-warning",
  not_started: "bg-muted/10 text-muted",
};

export default function ReportsPage() {
  const [reports, setReports] = useState<DailyReport[]>([]);
  const [selected, setSelected] = useState<DailyReport | null>(null);

  useEffect(() => {
    setReports(store.getReports());
  }, []);

  const handleDelete = (id: string) => {
    if (!confirm("この日報を削除しますか？")) return;
    store.deleteReport(id);
    setReports(store.getReports());
    if (selected?.id === id) setSelected(null);
  };

  return (
    <>
      <Header title="日報" subtitle="日々の振り返りを記録" />
      <div className="p-6">
        <div className="mb-6 flex items-center justify-between">
          <p className="text-sm text-muted">{reports.length} 件の日報</p>
          <Link
            href="/reports/new"
            className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-hover"
          >
            <Plus size={18} />
            日報を書く
          </Link>
        </div>

        {reports.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <FileText size={48} className="text-muted mb-4" />
            <p className="text-lg font-medium text-muted">
              まだ日報がありません
            </p>
            <Link
              href="/reports/new"
              className="mt-4 text-sm text-primary hover:underline"
            >
              最初の日報を書く
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="lg:col-span-1 space-y-3 max-h-[calc(100vh-220px)] overflow-y-auto pr-2">
              {reports.map((report) => (
                <button
                  key={report.id}
                  onClick={() => setSelected(report)}
                  className={`w-full text-left rounded-xl border p-4 transition-all ${
                    selected?.id === report.id
                      ? "border-primary bg-primary/5 shadow-sm"
                      : "border-card-border bg-card-bg hover:shadow-sm"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-bold">
                      {format(
                        new Date(report.report_date),
                        "M月d日(E)",
                        { locale: ja }
                      )}
                    </span>
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                        resultStyle[report.goal_result]
                      }`}
                    >
                      {resultLabel[report.goal_result]}
                    </span>
                  </div>
                  <p className="text-sm text-foreground line-clamp-2">
                    {report.goal}
                  </p>
                </button>
              ))}
            </div>

            <div className="lg:col-span-2">
              {selected ? (
                <div className="rounded-xl border border-card-border bg-card-bg p-6 space-y-5">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-bold">
                      {format(
                        new Date(selected.report_date),
                        "yyyy年M月d日(E) 日報",
                        { locale: ja }
                      )}
                    </h2>
                    <button
                      onClick={() => handleDelete(selected.id)}
                      className="rounded-lg p-2 text-danger hover:bg-danger/10 transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>

                  <Section title="本日のゴール">
                    <p>{selected.goal}</p>
                    <span
                      className={`mt-1 inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        resultStyle[selected.goal_result]
                      }`}
                    >
                      結果: {resultLabel[selected.goal_result]}
                    </span>
                  </Section>

                  <Section title="開発の進捗">
                    <p className="whitespace-pre-wrap">{selected.progress}</p>
                  </Section>

                  <Section title="ブロッカー・質問">
                    <p className="whitespace-pre-wrap">{selected.blocker}</p>
                  </Section>

                  <Section title="試したこと">
                    <p className="whitespace-pre-wrap">{selected.tried}</p>
                  </Section>

                  <Section title="今日の学び">
                    <p className="whitespace-pre-wrap">{selected.learning}</p>
                  </Section>

                  <Section title="次回出勤日の予定">
                    <p className="whitespace-pre-wrap">{selected.next_plan}</p>
                  </Section>

                  <Section title="フリースペース・相談事項">
                    <p className="whitespace-pre-wrap">{selected.free_space}</p>
                  </Section>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-card-border py-20">
                  <Eye size={32} className="text-muted mb-2" />
                  <p className="text-sm text-muted">
                    左の一覧から日報を選択してください
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <h3 className="mb-1 text-sm font-semibold text-primary">{title}</h3>
      <div className="text-sm text-foreground">{children}</div>
    </div>
  );
}
