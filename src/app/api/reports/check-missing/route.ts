import { NextResponse } from "next/server";
import { sendSlackNotification, formatMissingReportMessage } from "@/lib/notifications/slack";

export async function POST(request: Request) {
  try {
    const { date, staffList, submittedUserIds, slackWebhookUrl } = await request.json();

    const missing = (staffList as { id: string; name: string }[]).filter(
      (s) => !(submittedUserIds as string[]).includes(s.id)
    );

    if (missing.length > 0 && slackWebhookUrl) {
      const msg = formatMissingReportMessage(
        missing.map((m) => m.name),
        date
      );
      await sendSlackNotification(slackWebhookUrl, msg);
    }

    return NextResponse.json({
      date,
      total: staffList.length,
      submitted: submittedUserIds.length,
      missing: missing.map((m) => ({ id: m.id, name: m.name })),
      slackSent: missing.length > 0 && !!slackWebhookUrl,
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "チェックに失敗しました";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
