import { NextResponse } from "next/server";
import type { PayrollEntry } from "@/lib/types";

export async function POST(request: Request) {
  try {
    const { month, staffList, attendanceData } = await request.json() as {
      month: string;
      staffList: { id: string; name: string; hourly_rate: number }[];
      attendanceData: { user_id: string; hours: number[] }[];
    };

    const DAILY_REGULAR_HOURS = 8;

    const entries: PayrollEntry[] = staffList.map((staff) => {
      const userData = attendanceData.find((a) => a.user_id === staff.id);
      const dailyHours = userData?.hours || [];
      const totalHours = dailyHours.reduce((s, h) => s + h, 0);
      const overtimeHours = dailyHours.reduce(
        (s, h) => s + Math.max(0, h - DAILY_REGULAR_HOURS),
        0
      );
      const regularHours = totalHours - overtimeHours;
      const basePay = Math.round(regularHours * staff.hourly_rate);
      const overtimePay = Math.round(overtimeHours * staff.hourly_rate * 1.25);

      return {
        user_id: staff.id,
        user_name: staff.name,
        month,
        total_hours: Math.round(totalHours * 10) / 10,
        overtime_hours: Math.round(overtimeHours * 10) / 10,
        hourly_rate: staff.hourly_rate,
        base_pay: basePay,
        overtime_pay: overtimePay,
        total_pay: basePay + overtimePay,
      };
    });

    return NextResponse.json({ month, entries });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "給与計算に失敗しました";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
