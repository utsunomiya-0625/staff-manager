import { NextResponse } from "next/server";
import type { AttendanceCheck, AttendanceStatus, WorkLocation } from "@/lib/types";

export async function POST(request: Request) {
  try {
    const { date, schedules, clockIns } = await request.json() as {
      date: string;
      schedules: { user_id: string; user_name: string; location: WorkLocation }[];
      clockIns: { user_id: string; time: string | null }[];
    };

    const checks: AttendanceCheck[] = schedules.map((sched) => {
      const clock = clockIns.find((c) => c.user_id === sched.user_id);
      let actual: AttendanceStatus = "absent";

      if (sched.location === "off") {
        actual = "day_off";
      } else if (clock?.time) {
        const clockHour = parseInt(clock.time.split(":")[0], 10);
        actual = clockHour >= 10 ? "late" : "present";
      }

      return {
        date,
        user_id: sched.user_id,
        user_name: sched.user_name,
        expected: sched.location,
        actual,
      };
    });

    return NextResponse.json({ date, checks });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "勤怠チェックに失敗しました";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
