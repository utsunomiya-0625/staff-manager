"use client";

import { useEffect, useState } from "react";
import { Header } from "@/components/layout/header";
import { store } from "@/lib/store";
import type { Invoice, InvoiceStatus } from "@/lib/types";
import Link from "next/link";
import { format } from "date-fns";
import { ja } from "date-fns/locale";
import {
  Plus,
  Receipt,
  Trash2,
  Eye,
  FileSpreadsheet,
  Copy,
} from "lucide-react";

const statusConfig: Record<InvoiceStatus, { label: string; color: string; bg: string }> = {
  draft: { label: "下書き", color: "text-muted", bg: "bg-muted/10" },
  sent: { label: "送付済み", color: "text-primary", bg: "bg-primary/10" },
  paid: { label: "入金済み", color: "text-success", bg: "bg-success/10" },
};

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [selected, setSelected] = useState<Invoice | null>(null);
  const [filter, setFilter] = useState<InvoiceStatus | "all">("all");

  useEffect(() => {
    setInvoices(store.getInvoices());
  }, []);

  const filtered =
    filter === "all"
      ? invoices
      : invoices.filter((i) => i.status === filter);

  const handleDelete = (id: string) => {
    if (!confirm("この請求書を削除しますか？")) return;
    store.deleteInvoice(id);
    setInvoices(store.getInvoices());
    if (selected?.id === id) setSelected(null);
  };

  const handleStatusChange = (invoice: Invoice, newStatus: InvoiceStatus) => {
    const updated = { ...invoice, status: newStatus, updated_at: new Date().toISOString() };
    store.saveInvoice(updated);
    setInvoices(store.getInvoices());
    setSelected(updated);
  };

  const formatCurrency = (n: number) =>
    `¥${n.toLocaleString()}`;

  return (
    <>
      <Header title="請求書" subtitle="給料計算から請求書を作成・管理" />
      <div className="p-6">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 rounded-lg border border-card-border p-1">
              {(
                [
                  { value: "all", label: "すべて" },
                  { value: "draft", label: "下書き" },
                  { value: "sent", label: "送付済み" },
                  { value: "paid", label: "入金済み" },
                ] as const
              ).map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setFilter(opt.value)}
                  className={`rounded-md px-3 py-1 text-xs font-medium transition-colors ${
                    filter === opt.value
                      ? "bg-primary text-white"
                      : "text-muted hover:text-foreground"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
            <span className="text-sm text-muted">{filtered.length} 件</span>
          </div>
          <Link
            href="/invoices/new"
            className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-hover"
          >
            <Plus size={18} />
            請求書作成
          </Link>
        </div>

        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Receipt size={48} className="text-muted mb-4" />
            <p className="text-lg font-medium text-muted">
              請求書がまだありません
            </p>
            <Link
              href="/invoices/new"
              className="mt-4 text-sm text-primary hover:underline"
            >
              最初の請求書を作成する
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="lg:col-span-1 space-y-3 max-h-[calc(100vh-220px)] overflow-y-auto pr-2">
              {filtered.map((invoice) => {
                const st = statusConfig[invoice.status];
                return (
                  <button
                    key={invoice.id}
                    onClick={() => setSelected(invoice)}
                    className={`w-full text-left rounded-xl border p-4 transition-all ${
                      selected?.id === invoice.id
                        ? "border-primary bg-primary/5 shadow-sm"
                        : "border-card-border bg-card-bg hover:shadow-sm"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-bold font-mono">
                        {invoice.invoice_number}
                      </span>
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-medium ${st.bg} ${st.color}`}
                      >
                        {st.label}
                      </span>
                    </div>
                    <p className="text-sm text-foreground">{invoice.client_name}</p>
                    <div className="mt-1 flex items-center justify-between">
                      <span className="text-xs text-muted">
                        {invoice.billing_period}
                      </span>
                      <span className="text-sm font-bold">
                        {formatCurrency(invoice.total)}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="lg:col-span-2">
              {selected ? (
                <InvoicePreview
                  invoice={selected}
                  onDelete={handleDelete}
                  onStatusChange={handleStatusChange}
                  formatCurrency={formatCurrency}
                />
              ) : (
                <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-card-border py-20">
                  <Eye size={32} className="text-muted mb-2" />
                  <p className="text-sm text-muted">
                    左の一覧から請求書を選択してください
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
}

function InvoicePreview({
  invoice,
  onDelete,
  onStatusChange,
  formatCurrency,
}: {
  invoice: Invoice;
  onDelete: (id: string) => void;
  onStatusChange: (invoice: Invoice, status: InvoiceStatus) => void;
  formatCurrency: (n: number) => string;
}) {
  return (
    <div className="rounded-xl border border-card-border bg-card-bg overflow-hidden">
      <div className="flex items-center justify-between border-b border-card-border px-6 py-4">
        <h2 className="text-lg font-bold">請求書プレビュー</h2>
        <div className="flex items-center gap-2">
          <select
            value={invoice.status}
            onChange={(e) =>
              onStatusChange(invoice, e.target.value as InvoiceStatus)
            }
            className="rounded-lg border border-card-border bg-background px-3 py-1.5 text-xs font-medium focus:border-primary focus:outline-none"
          >
            <option value="draft">下書き</option>
            <option value="sent">送付済み</option>
            <option value="paid">入金済み</option>
          </select>
          <button
            title="Google Sheetsに書き出し"
            className="rounded-lg p-2 text-success hover:bg-success/10 transition-colors"
          >
            <FileSpreadsheet size={18} />
          </button>
          <button
            onClick={() => onDelete(invoice.id)}
            className="rounded-lg p-2 text-danger hover:bg-danger/10 transition-colors"
          >
            <Trash2 size={18} />
          </button>
        </div>
      </div>

      <div className="p-6 space-y-6">
        <div className="rounded-xl border border-card-border bg-white p-8 text-foreground shadow-sm">
          <div className="flex items-start justify-between mb-8">
            <div>
              <h3 className="text-2xl font-bold text-foreground">請求書</h3>
              <p className="mt-1 font-mono text-sm text-muted">
                {invoice.invoice_number}
              </p>
            </div>
            <div className="text-right text-sm">
              <p>
                <span className="text-muted">発行日: </span>
                {invoice.issue_date}
              </p>
              <p>
                <span className="text-muted">支払期限: </span>
                {invoice.due_date}
              </p>
              <p>
                <span className="text-muted">対象期間: </span>
                {invoice.billing_period}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8 mb-8">
            <div>
              <p className="mb-1 text-xs font-semibold uppercase text-muted">
                請求先
              </p>
              <p className="text-base font-bold">{invoice.client_name}</p>
              <p className="text-sm text-muted whitespace-pre-wrap">
                {invoice.client_address}
              </p>
            </div>
            <div>
              <p className="mb-1 text-xs font-semibold uppercase text-muted">
                請求者
              </p>
              <p className="text-base font-bold">{invoice.biller_name}</p>
              <p className="text-sm text-muted whitespace-pre-wrap">
                {invoice.biller_address}
              </p>
            </div>
          </div>

          <div className="mb-6 rounded-lg bg-primary/5 p-4 text-center">
            <p className="text-sm text-muted">ご請求金額</p>
            <p className="text-3xl font-bold text-primary">
              {formatCurrency(invoice.total)}
            </p>
          </div>

          <table className="mb-6 w-full text-sm">
            <thead>
              <tr className="border-b-2 border-foreground/10 text-left">
                <th className="pb-2 font-semibold">日付</th>
                <th className="pb-2 font-semibold">内容</th>
                <th className="pb-2 text-right font-semibold">時間</th>
                <th className="pb-2 text-right font-semibold">単価</th>
                <th className="pb-2 text-right font-semibold">小計</th>
              </tr>
            </thead>
            <tbody>
              {invoice.items.map((item, i) => (
                <tr key={i} className="border-b border-card-border">
                  <td className="py-2 text-muted">{item.date}</td>
                  <td className="py-2">{item.description}</td>
                  <td className="py-2 text-right">{item.hours}h</td>
                  <td className="py-2 text-right">
                    {formatCurrency(item.rate)}
                  </td>
                  <td className="py-2 text-right font-medium">
                    {formatCurrency(item.subtotal)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="flex justify-end">
            <div className="w-64 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted">小計</span>
                <span>{formatCurrency(invoice.subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">
                  消費税 ({invoice.tax_rate}%)
                </span>
                <span>{formatCurrency(invoice.tax_amount)}</span>
              </div>
              <div className="flex justify-between border-t border-foreground/10 pt-2 text-base font-bold">
                <span>合計</span>
                <span className="text-primary">
                  {formatCurrency(invoice.total)}
                </span>
              </div>
            </div>
          </div>

          {invoice.biller_bank && (
            <div className="mt-8 rounded-lg border border-card-border p-4">
              <p className="mb-2 text-xs font-semibold uppercase text-muted">
                振込先
              </p>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <p>
                  <span className="text-muted">銀行名: </span>
                  {invoice.biller_bank}
                </p>
                <p>
                  <span className="text-muted">支店名: </span>
                  {invoice.biller_bank_branch}
                </p>
                <p>
                  <span className="text-muted">口座種別: </span>
                  {invoice.biller_account_type}
                </p>
                <p>
                  <span className="text-muted">口座番号: </span>
                  {invoice.biller_account_number}
                </p>
                <p className="col-span-2">
                  <span className="text-muted">口座名義: </span>
                  {invoice.biller_account_name}
                </p>
              </div>
            </div>
          )}

          {invoice.notes && (
            <div className="mt-4">
              <p className="mb-1 text-xs font-semibold uppercase text-muted">
                備考
              </p>
              <p className="whitespace-pre-wrap text-sm text-muted">
                {invoice.notes}
              </p>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 text-xs text-muted">
          <FileSpreadsheet size={14} />
          Google Sheets 連携後、請求書をスプレッドシートに自動書き出しできます
        </div>
      </div>
    </div>
  );
}
