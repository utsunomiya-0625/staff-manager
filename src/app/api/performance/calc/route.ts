import { NextResponse } from "next/server";
import type { PerformanceStats, DailyReport, DailyTask } from "@/lib/types";

export async function POST(request: Request) {
  try {
    const { month, staffList, reports, tasks, invoices } = await request.json() as {
      month: string;
      staffList: { id: string; name: string }[];
      reports: DailyReport[];
      tasks: DailyTask[];
      invoices: { user_id: string; items: { hours: number }[] }[];
    };

    const daysInMonth = new Date(
      parseInt(month.split("-")[0]),
      parseInt(month.split("-")[1]),
      0
    ).getDate();
    const workDays = Math.round(daysInMonth * (5 / 7));

    const stats: PerformanceStats[] = staffList.map((staff) => {
      const userReports = reports.filter(
        (r) => r.user_id === staff.id && r.report_date.startsWith(month)
      );
      const userTasks = tasks.filter(
        (t) => t.user_id === staff.id && t.task_date.startsWith(month)
      );
      const completedTasks = userTasks.filter((t) => t.status === "done");

      const userInvoice = invoices.find((inv) => inv.user_id === staff.id);
      const totalHours = userInvoice
        ? userInvoice.items.reduce((sum, it) => sum + it.hours, 0)
        : 0;

      return {
        user_id: staff.id,
        user_name: staff.name,
        month,
        tasks_completed: completedTasks.length,
        tasks_total: userTasks.length,
        report_submission_rate: workDays > 0 ? Math.round((userReports.length / workDays) * 100) : 0,
        total_hours: totalHours,
        avg_daily_hours: userReports.length > 0 ? Math.round((totalHours / userReports.length) * 10) / 10 : 0,
      };
    });

    return NextResponse.json({ month, stats });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "計算に失敗しました";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
