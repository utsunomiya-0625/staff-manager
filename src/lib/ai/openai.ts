import OpenAI from "openai";
import type { DailyReport } from "../types";

function getClient() {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("OPENAI_API_KEY が未設定です");
  return new OpenAI({ apiKey });
}

export async function summarizeReports(reports: DailyReport[]): Promise<string> {
  const client = getClient();

  const reportTexts = reports
    .map(
      (r, i) =>
        `【${r.user?.name || "スタッフ"}】ゴール: ${r.goal} (${r.goal_result}) / 進捗: ${r.progress} / ブロッカー: ${r.blocker} / 学び: ${r.learning}`
    )
    .join("\n");

  const res = await client.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content:
          "あなたはチームの日報をまとめるアシスタントです。簡潔な日本語の箇条書きで、チーム全体の進捗・課題・学びを要約してください。3〜5個の箇条書きにまとめてください。",
      },
      { role: "user", content: `今日のチーム日報:\n${reportTexts}` },
    ],
    max_tokens: 500,
    temperature: 0.3,
  });

  return res.choices[0]?.message?.content || "要約を生成できませんでした";
}

export async function suggestTasks(report: DailyReport): Promise<string[]> {
  const client = getClient();

  const res = await client.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content:
          "日報の内容から次回やるべきタスクを3つ提案してください。各タスクは1行で簡潔に。JSON配列形式で返してください。例: [\"タスク1\", \"タスク2\", \"タスク3\"]",
      },
      {
        role: "user",
        content: `ゴール: ${report.goal}\n結果: ${report.goal_result}\n進捗: ${report.progress}\nブロッカー: ${report.blocker}\n学び: ${report.learning}\n次回予定: ${report.next_plan}`,
      },
    ],
    max_tokens: 200,
    temperature: 0.5,
  });

  try {
    const content = res.choices[0]?.message?.content || "[]";
    const match = content.match(/\[[\s\S]*\]/);
    return match ? JSON.parse(match[0]) : [];
  } catch {
    return [];
  }
}
