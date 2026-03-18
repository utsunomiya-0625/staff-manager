import { NextResponse } from "next/server";
import type { DailyReport } from "@/lib/types";

export async function POST(request: Request) {
  try {
    const { reports } = await request.json() as { reports: DailyReport[] };

    if (!reports || reports.length === 0) {
      return NextResponse.json({ summary: "日報がありません" });
    }

    if (!process.env.OPENAI_API_KEY) {
      const fallback = reports
        .map(
          (r) =>
            `- ${r.user?.name || "スタッフ"}: ${r.goal} (${r.goal_result === "achieved" ? "達成" : r.goal_result === "in_progress" ? "途中" : "未着手"})`
        )
        .join("\n");
      return NextResponse.json({
        summary: `【チーム日報サマリー】\n${fallback}\n\n※ OPENAI_API_KEY を設定するとAI要約が有効になります`,
      });
    }

    const { summarizeReports } = await import("@/lib/ai/openai");
    const summary = await summarizeReports(reports);
    return NextResponse.json({ summary });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "AI要約に失敗しました";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
