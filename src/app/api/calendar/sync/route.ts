import { NextRequest, NextResponse } from "next/server";
import { syncScheduleToCalendar, type ScheduleEvent } from "@/lib/google/calendar";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { accessToken, events, weekStart } = body as {
      accessToken: string;
      events: ScheduleEvent[];
      weekStart: string;
    };

    if (!accessToken) {
      return NextResponse.json(
        { error: "Google アクセストークンが必要です。Google OAuth でログインしてください。" },
        { status: 401 }
      );
    }

    if (!events || !weekStart) {
      return NextResponse.json(
        { error: "events と weekStart は必須です" },
        { status: 400 }
      );
    }

    const results = await syncScheduleToCalendar(accessToken, events, weekStart);

    return NextResponse.json({
      success: true,
      synced: results.length,
      message: `${results.length}件のイベントを Google Calendar に同期しました`,
    });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Google Calendar の同期に失敗しました";
    console.error("Calendar sync error:", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
