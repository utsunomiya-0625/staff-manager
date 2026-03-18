"use client";

import { useEffect, useState } from "react";
import { Header } from "@/components/layout/header";
import { store } from "@/lib/store";
import { format } from "date-fns";
import { Calculator, Download, DollarSign, Clock, AlertTriangle } from "lucide-react";

interface PayrollRow {
  name: string;
  totalHours: number;
  overtimeHours: number;
  rate: number;
  basePay: number;
  overtimePay: number;
  totalPay: number;
}

export default function PayrollPage() {
  const [month, setMonth] = useState(format(new Date(), "yyyy-MM"));
  const [rows, setRows] = useState<PayrollRow[]>([]);

  useEffect(() => {
    const profile = store.getProfile();
    const invoices = store.getInvoices().filter((i) => i.billing_period === month);

    const payrollRows: PayrollRow[] = [];
    if (invoices.length > 0) {
      for (const inv of invoices) {
        const totalHours = inv.items.reduce((s, it) => s + it.hours, 0);
        const dailyHours = inv.items.map((it) => it.hours);
        const overtimeHours = dailyHours.reduce((s, h) => s + Math.max(0, h - 8), 0);
        const regularHours = totalHours - overtimeHours;
        const rate = inv.items[0]?.rate || profile.hourly_rate;
        payrollRows.push({
          name: inv.biller_name || profile.name,
          totalHours: Math.round(totalHours * 10) / 10,
          overtimeHours: Math.round(overtimeHours * 10) / 10,
          rate,
          basePay: Math.round(regularHours * rate),
          overtimePay: Math.round(overtimeHours * rate * 1.25),
          totalPay: Math.round(regularHours * rate + overtimeHours * rate * 1.25),
        });
      }
    } else {
      payrollRows.push({
        name: profile.name,
        totalHours: 0,
        overtimeHours: 0,
        rate: profile.hourly_rate,
        basePay: 0,
        overtimePay: 0,
        totalPay: 0,
      });
    }
    setRows(payrollRows);
  }, [month]);

  const grandTotal = rows.reduce((s, r) => s + r.totalPay, 0);
  const totalHoursAll = rows.reduce((s, r) => s + r.totalHours, 0);
  const totalOvertimeAll = rows.reduce((s, r) => s + r.overtimeHours, 0);

  const downloadCSV = () => {
    const header = "名前,勤務時間,残業時間,時給,基本給,残業代,合計\n";
    const body = rows.map((r) => `${r.name},${r.totalHours},${r.overtimeHours},${r.rate},${r.basePay},${r.overtimePay},${r.totalPay}`).join("\n");
    const bom = "\uFEFF";
    const blob = new Blob([bom + header + body], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `payroll_${month}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const fmt = (n: number) => `¥${n.toLocaleString()}`;

  return (
    <>
      <Header title="給与計算" subtitle="ワンクリックで月次給与を算出" />
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <input type="month" value={month} onChange={(e) => setMonth(e.target.value)} className="rounded-lg border border-card-border bg-card-bg px-3 py-2 text-sm focus:border-primary focus:outline-none" />
            <button onClick={() => setMonth(format(new Date(), "yyyy-MM"))} className="rounded-lg border border-card-border px-3 py-2 text-xs font-medium hover:bg-card-bg">今月</button>
          </div>
          <button onClick={downloadCSV} className="flex items-center gap-2 rounded-xl bg-success px-4 py-2.5 text-sm font-semibold text-white hover:bg-success/90 transition-colors">
            <Download size={18} />
            CSVダウンロード
          </button>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="flex items-center gap-4 rounded-xl border border-card-border bg-card-bg p-5">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10"><DollarSign size={24} className="text-primary" /></div>
            <div><p className="text-sm text-muted">合計支給額</p><p className="text-xl font-bold">{fmt(grandTotal)}</p></div>
          </div>
          <div className="flex items-center gap-4 rounded-xl border border-card-border bg-card-bg p-5">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-success/10"><Clock size={24} className="text-success" /></div>
            <div><p className="text-sm text-muted">合計勤務時間</p><p className="text-xl font-bold">{totalHoursAll}h</p></div>
          </div>
          <div className="flex items-center gap-4 rounded-xl border border-card-border bg-card-bg p-5">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-warning/10"><AlertTriangle size={24} className="text-warning" /></div>
            <div><p className="text-sm text-muted">合計残業時間</p><p className="text-xl font-bold">{totalOvertimeAll}h</p></div>
          </div>
        </div>

        <div className="rounded-xl border border-card-border bg-card-bg overflow-hidden">
          <div className="border-b border-card-border px-6 py-4">
            <h2 className="flex items-center gap-2 text-base font-bold">
              <Calculator size={18} className="text-primary" />
              {month} 給与明細
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-card-border bg-background text-left">
                  <th className="px-6 py-3 font-medium text-muted">名前</th>
                  <th className="px-4 py-3 text-right font-medium text-muted">勤務時間</th>
                  <th className="px-4 py-3 text-right font-medium text-muted">残業時間</th>
                  <th className="px-4 py-3 text-right font-medium text-muted">時給</th>
                  <th className="px-4 py-3 text-right font-medium text-muted">基本給</th>
                  <th className="px-4 py-3 text-right font-medium text-muted">残業代</th>
                  <th className="px-6 py-3 text-right font-medium text-muted">合計</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r, i) => (
                  <tr key={i} className="border-b border-card-border last:border-0">
                    <td className="px-6 py-4 font-medium">{r.name}</td>
                    <td className="px-4 py-4 text-right">{r.totalHours}h</td>
                    <td className="px-4 py-4 text-right">{r.overtimeHours > 0 ? <span className="text-warning">{r.overtimeHours}h</span> : "0h"}</td>
                    <td className="px-4 py-4 text-right">{fmt(r.rate)}</td>
                    <td className="px-4 py-4 text-right">{fmt(r.basePay)}</td>
                    <td className="px-4 py-4 text-right">{r.overtimePay > 0 ? <span className="text-warning">{fmt(r.overtimePay)}</span> : fmt(0)}</td>
                    <td className="px-6 py-4 text-right font-bold text-primary">{fmt(r.totalPay)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-background font-bold">
                  <td className="px-6 py-4">合計</td>
                  <td className="px-4 py-4 text-right">{totalHoursAll}h</td>
                  <td className="px-4 py-4 text-right">{totalOvertimeAll}h</td>
                  <td className="px-4 py-4"></td>
                  <td className="px-4 py-4 text-right">{fmt(rows.reduce((s, r) => s + r.basePay, 0))}</td>
                  <td className="px-4 py-4 text-right">{fmt(rows.reduce((s, r) => s + r.overtimePay, 0))}</td>
                  <td className="px-6 py-4 text-right text-primary">{fmt(grandTotal)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}
