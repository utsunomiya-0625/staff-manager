"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/layout/header";
import { store } from "@/lib/store";
import type { InvoiceItem } from "@/lib/types";
import { format, endOfMonth, startOfMonth, eachDayOfInterval, isWeekend } from "date-fns";
import { ja } from "date-fns/locale";
import { Save, ArrowLeft, Plus, Trash2, Calculator } from "lucide-react";
import Link from "next/link";
import { v4 as uuidv4 } from "uuid";

export default function NewInvoicePage() {
  const router = useRouter();
  const profile = store.getProfile();
  const now = new Date();

  const [billingMonth, setBillingMonth] = useState(format(now, "yyyy-MM"));
  const [issueDate, setIssueDate] = useState(format(now, "yyyy-MM-dd"));
  const [dueDate, setDueDate] = useState(
    format(endOfMonth(now), "yyyy-MM-dd")
  );
  const [billerName, setBillerName] = useState(profile.name);
  const [billerAddress, setBillerAddress] = useState("");
  const [billerBank, setBillerBank] = useState("");
  const [billerBankBranch, setBillerBankBranch] = useState("");
  const [billerAccountType, setBillerAccountType] = useState("普通");
  const [billerAccountNumber, setBillerAccountNumber] = useState("");
  const [billerAccountName, setBillerAccountName] = useState("");
  const [clientName, setClientName] = useState("");
  const [clientAddress, setClientAddress] = useState("");
  const [rate, setRate] = useState(profile.hourly_rate);
  const [taxRate, setTaxRate] = useState(10);
  const [notes, setNotes] = useState("");

  const [items, setItems] = useState<InvoiceItem[]>([]);

  const addItem = () => {
    setItems([
      ...items,
      {
        date: format(now, "yyyy-MM-dd"),
        description: "業務委託作業",
        hours: 0,
        rate,
        subtotal: 0,
      },
    ]);
  };

  const updateItem = (idx: number, field: keyof InvoiceItem, value: string | number) => {
    setItems((prev) => {
      const updated = [...prev];
      const item = { ...updated[idx], [field]: value };
      if (field === "hours" || field === "rate") {
        item.subtotal = Number(item.hours) * Number(item.rate);
      }
      updated[idx] = item;
      return updated;
    });
  };

  const removeItem = (idx: number) => {
    setItems((prev) => prev.filter((_, i) => i !== idx));
  };

  const generateFromMonth = () => {
    const monthDate = new Date(billingMonth + "-01");
    const start = startOfMonth(monthDate);
    const end = endOfMonth(monthDate);
    const weekdays = eachDayOfInterval({ start, end }).filter(
      (d) => !isWeekend(d)
    );

    const generated: InvoiceItem[] = weekdays.map((d) => ({
      date: format(d, "yyyy-MM-dd"),
      description: "業務委託作業",
      hours: 0,
      rate,
      subtotal: 0,
    }));
    setItems(generated);
  };

  const subtotal = items.reduce((sum, i) => sum + i.subtotal, 0);
  const taxAmount = Math.floor(subtotal * (taxRate / 100));
  const total = subtotal + taxAmount;
  const totalHours = items.reduce((sum, i) => sum + Number(i.hours), 0);

  const formatCurrency = (n: number) => `¥${n.toLocaleString()}`;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const nowStr = new Date().toISOString();
    store.saveInvoice({
      id: uuidv4(),
      invoice_number: store.getNextInvoiceNumber(),
      user_id: profile.id,
      status: "draft",
      billing_period: `${billingMonth}`,
      issue_date: issueDate,
      due_date: dueDate,
      biller_name: billerName,
      biller_address: billerAddress,
      biller_bank: billerBank,
      biller_bank_branch: billerBankBranch,
      biller_account_type: billerAccountType,
      biller_account_number: billerAccountNumber,
      biller_account_name: billerAccountName,
      client_name: clientName,
      client_address: clientAddress,
      items: items.filter((i) => i.hours > 0),
      subtotal,
      tax_rate: taxRate,
      tax_amount: taxAmount,
      total,
      notes,
      created_at: nowStr,
      updated_at: nowStr,
    });
    router.push("/invoices");
  };

  return (
    <>
      <Header title="請求書作成" subtitle="給料計算から請求書を作成" />
      <div className="mx-auto max-w-4xl p-6">
        <Link
          href="/invoices"
          className="mb-6 inline-flex items-center gap-1 text-sm text-muted hover:text-foreground transition-colors"
        >
          <ArrowLeft size={16} />
          一覧に戻る
        </Link>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <fieldset className="rounded-xl border border-card-border bg-card-bg p-5 space-y-4">
              <legend className="px-2 text-sm font-bold text-primary">
                請求者情報（あなた）
              </legend>
              <div>
                <label className="mb-1 block text-xs font-medium text-muted">名前</label>
                <input
                  type="text"
                  value={billerName}
                  onChange={(e) => setBillerName(e.target.value)}
                  required
                  className="w-full rounded-lg border border-card-border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-muted">住所</label>
                <textarea
                  value={billerAddress}
                  onChange={(e) => setBillerAddress(e.target.value)}
                  rows={2}
                  className="w-full rounded-lg border border-card-border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary resize-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs font-medium text-muted">銀行名</label>
                  <input
                    type="text"
                    value={billerBank}
                    onChange={(e) => setBillerBank(e.target.value)}
                    placeholder="例: 三菱UFJ銀行"
                    className="w-full rounded-lg border border-card-border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-muted">支店名</label>
                  <input
                    type="text"
                    value={billerBankBranch}
                    onChange={(e) => setBillerBankBranch(e.target.value)}
                    placeholder="例: 渋谷支店"
                    className="w-full rounded-lg border border-card-border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="mb-1 block text-xs font-medium text-muted">口座種別</label>
                  <select
                    value={billerAccountType}
                    onChange={(e) => setBillerAccountType(e.target.value)}
                    className="w-full rounded-lg border border-card-border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none"
                  >
                    <option value="普通">普通</option>
                    <option value="当座">当座</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-muted">口座番号</label>
                  <input
                    type="text"
                    value={billerAccountNumber}
                    onChange={(e) => setBillerAccountNumber(e.target.value)}
                    className="w-full rounded-lg border border-card-border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-muted">口座名義</label>
                  <input
                    type="text"
                    value={billerAccountName}
                    onChange={(e) => setBillerAccountName(e.target.value)}
                    className="w-full rounded-lg border border-card-border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
              </div>
            </fieldset>

            <fieldset className="rounded-xl border border-card-border bg-card-bg p-5 space-y-4">
              <legend className="px-2 text-sm font-bold text-primary">
                請求先情報
              </legend>
              <div>
                <label className="mb-1 block text-xs font-medium text-muted">
                  会社名 / 氏名 <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  required
                  placeholder="例: 株式会社○○"
                  className="w-full rounded-lg border border-card-border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-muted">住所</label>
                <textarea
                  value={clientAddress}
                  onChange={(e) => setClientAddress(e.target.value)}
                  rows={2}
                  className="w-full rounded-lg border border-card-border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary resize-none"
                />
              </div>

              <div className="border-t border-card-border pt-4 space-y-4">
                <p className="text-xs font-semibold text-muted uppercase">請求情報</p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="mb-1 block text-xs font-medium text-muted">対象月</label>
                    <input
                      type="month"
                      value={billingMonth}
                      onChange={(e) => setBillingMonth(e.target.value)}
                      className="w-full rounded-lg border border-card-border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium text-muted">時給 (円)</label>
                    <input
                      type="number"
                      value={rate}
                      onChange={(e) => setRate(Number(e.target.value))}
                      className="w-full rounded-lg border border-card-border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="mb-1 block text-xs font-medium text-muted">発行日</label>
                    <input
                      type="date"
                      value={issueDate}
                      onChange={(e) => setIssueDate(e.target.value)}
                      className="w-full rounded-lg border border-card-border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium text-muted">支払期限</label>
                    <input
                      type="date"
                      value={dueDate}
                      onChange={(e) => setDueDate(e.target.value)}
                      className="w-full rounded-lg border border-card-border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-muted">消費税率 (%)</label>
                  <select
                    value={taxRate}
                    onChange={(e) => setTaxRate(Number(e.target.value))}
                    className="w-full rounded-lg border border-card-border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none"
                  >
                    <option value={0}>なし (0%)</option>
                    <option value={8}>8%</option>
                    <option value={10}>10%</option>
                  </select>
                </div>
              </div>
            </fieldset>
          </div>

          <div className="rounded-xl border border-card-border bg-card-bg p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-primary">明細</h3>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={generateFromMonth}
                  className="flex items-center gap-1.5 rounded-lg border border-card-border px-3 py-1.5 text-xs font-medium hover:bg-background transition-colors"
                >
                  <Calculator size={14} />
                  {billingMonth} の平日を生成
                </button>
                <button
                  type="button"
                  onClick={addItem}
                  className="flex items-center gap-1.5 rounded-lg bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary hover:bg-primary/20 transition-colors"
                >
                  <Plus size={14} />
                  行を追加
                </button>
              </div>
            </div>

            {items.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted">
                「行を追加」またはボタンで月の平日を自動生成できます
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-card-border text-left text-muted">
                      <th className="pb-2 pr-2 font-medium">日付</th>
                      <th className="pb-2 pr-2 font-medium">内容</th>
                      <th className="pb-2 pr-2 font-medium w-24">時間 (h)</th>
                      <th className="pb-2 pr-2 font-medium w-28">単価 (円)</th>
                      <th className="pb-2 pr-2 font-medium text-right w-28">小計</th>
                      <th className="pb-2 w-10"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item, idx) => (
                      <tr key={idx} className="border-b border-card-border last:border-0">
                        <td className="py-2 pr-2">
                          <input
                            type="date"
                            value={item.date}
                            onChange={(e) => updateItem(idx, "date", e.target.value)}
                            className="rounded border border-card-border bg-background px-2 py-1 text-sm focus:border-primary focus:outline-none"
                          />
                        </td>
                        <td className="py-2 pr-2">
                          <input
                            type="text"
                            value={item.description}
                            onChange={(e) => updateItem(idx, "description", e.target.value)}
                            className="w-full rounded border border-card-border bg-background px-2 py-1 text-sm focus:border-primary focus:outline-none"
                          />
                        </td>
                        <td className="py-2 pr-2">
                          <input
                            type="number"
                            value={item.hours || ""}
                            onChange={(e) => updateItem(idx, "hours", Number(e.target.value))}
                            step="0.5"
                            min="0"
                            className="w-full rounded border border-card-border bg-background px-2 py-1 text-sm focus:border-primary focus:outline-none"
                          />
                        </td>
                        <td className="py-2 pr-2">
                          <input
                            type="number"
                            value={item.rate}
                            onChange={(e) => updateItem(idx, "rate", Number(e.target.value))}
                            className="w-full rounded border border-card-border bg-background px-2 py-1 text-sm focus:border-primary focus:outline-none"
                          />
                        </td>
                        <td className="py-2 pr-2 text-right font-medium">
                          {formatCurrency(item.subtotal)}
                        </td>
                        <td className="py-2">
                          <button
                            type="button"
                            onClick={() => removeItem(idx)}
                            className="rounded p-1 text-muted hover:text-danger transition-colors"
                          >
                            <Trash2 size={14} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {items.length > 0 && (
              <div className="mt-4 flex justify-end">
                <div className="w-72 space-y-2 rounded-lg bg-background p-4 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted">合計時間</span>
                    <span className="font-medium">{totalHours}h</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted">小計</span>
                    <span>{formatCurrency(subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted">消費税 ({taxRate}%)</span>
                    <span>{formatCurrency(taxAmount)}</span>
                  </div>
                  <div className="flex justify-between border-t border-card-border pt-2 text-lg font-bold">
                    <span>合計</span>
                    <span className="text-primary">{formatCurrency(total)}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">備考</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              placeholder="備考欄（任意）"
              className="w-full rounded-lg border border-card-border bg-card-bg px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary resize-none"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Link
              href="/invoices"
              className="rounded-xl border border-card-border px-6 py-2.5 text-sm font-medium hover:bg-background transition-colors"
            >
              キャンセル
            </Link>
            <button
              type="submit"
              className="flex items-center gap-2 rounded-xl bg-primary px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-hover"
            >
              <Save size={18} />
              保存する
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
