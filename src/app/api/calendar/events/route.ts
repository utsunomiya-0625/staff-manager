import { NextRequest, NextResponse } from "next/server";
import { getCalendarEvents } from "@/lib/google/calendar";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const accessToken = searchParams.get("accessToken");
    const timeMin = searchParams.get("timeMin");
    const timeMax = searchParams.get("timeMax");

    if (!accessToken) {
      return NextResponse.json(
        { error: "Google アクセストークンが必要です" },
        { status: 401 }
      );
    }

    if (!timeMin || !timeMax) {
      return NextResponse.json(
        { error: "timeMin と timeMax は必須です" },
        { status: 400 }
      );
    }

    const events = await getCalendarEvents(accessToken, timeMin, timeMax);

    return NextResponse.json({ events });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Google Calendar の取得に失敗しました";
    console.error("Calendar fetch error:", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
