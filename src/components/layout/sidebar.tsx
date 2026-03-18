"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FileText,
  CheckSquare,
  Package,
  Clock,
  Receipt,
  CalendarDays,
  MessageCircleQuestion,
  Shield,
  Users,
  BarChart3,
  Bell,
  ScrollText,
  Calculator,
  BookOpen,
  ListChecks,
  Timer,
  Map,
  FolderOpen,
  MessageSquare,
  Sparkles,
  Award,
  Building2,
  LogOut,
} from "lucide-react";

const navItems = [
  { href: "/dashboard", label: "ダッシュボード", icon: LayoutDashboard },
  { href: "/reports", label: "日報", icon: FileText },
  { href: "/tasks", label: "作業計画", icon: CheckSquare },
  { href: "/timer", label: "タイムトラッキング", icon: Timer },
  { href: "/schedule", label: "勤務予定", icon: CalendarDays },
  { href: "/devbox", label: "開発ボックス", icon: Package },
  { href: "/attendance", label: "勤怠管理", icon: Clock },
  { href: "/invoices", label: "請求書", icon: Receipt },
  { href: "/knowledge", label: "ナレッジ", icon: BookOpen },
  { href: "/skills", label: "スキル管理", icon: Award },
  { href: "/files", label: "ファイル共有", icon: FolderOpen },
  { href: "/chat", label: "チャット", icon: MessageSquare },
  { href: "/questions", label: "相談・質問", icon: MessageCircleQuestion },
];

const adminItems = [
  { href: "/admin", label: "管理者パネル", icon: Shield },
  { href: "/admin/staff", label: "スタッフ管理", icon: Users },
  { href: "/admin/analytics", label: "パフォーマンス分析", icon: BarChart3 },
  { href: "/admin/payroll", label: "給与計算", icon: Calculator },
  { href: "/admin/activity-log", label: "活動ログ", icon: ScrollText },
  { href: "/admin/notifications", label: "通知管理", icon: Bell },
  { href: "/admin/kpi", label: "KPI", icon: Sparkles },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 z-40 flex h-screen w-64 flex-col bg-sidebar-bg text-sidebar-text">
      <div className="flex h-16 items-center gap-3 border-b border-white/10 px-6">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-white font-bold text-sm">
          SM
        </div>
        <span className="text-lg font-bold tracking-tight">Staff Manager</span>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <ul className="space-y-0.5">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
            const Icon = item.icon;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                    isActive ? "bg-sidebar-active text-white" : "text-sidebar-text hover:bg-sidebar-hover"
                  }`}
                >
                  <Icon size={18} />
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>

        <div className="mt-4 mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-muted">
          管理者メニュー
        </div>
        <ul className="space-y-0.5">
          {adminItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
            const Icon = item.icon;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                    isActive ? "bg-sidebar-active text-white" : "text-sidebar-text hover:bg-sidebar-hover"
                  }`}
                >
                  <Icon size={18} />
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="border-t border-white/10 p-3">
        <button className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-sidebar-text hover:bg-sidebar-hover transition-colors">
          <LogOut size={18} />
          ログアウト
        </button>
      </div>
    </aside>
  );
}
