"use client";

import { useEffect, useState } from "react";
import { Header } from "@/components/layout/header";
import { store } from "@/lib/store";
import type { Question, QuestionCategory, QuestionStatus, QuestionReply } from "@/lib/types";
import { logActivity } from "@/lib/activity";
import { format } from "date-fns";
import { ja } from "date-fns/locale";
import {
  Plus,
  MessageCircleQuestion,
  CheckCircle2,
  CircleDot,
  Send,
  Trash2,
  X,
  Filter,
  Tag,
} from "lucide-react";
import { v4 as uuidv4 } from "uuid";

const categoryConfig: Record<QuestionCategory, { label: string; color: string; bg: string }> = {
  general: { label: "一般", color: "text-primary", bg: "bg-primary/10" },
  tech: { label: "技術", color: "text-purple-500", bg: "bg-purple-500/10" },
  hr: { label: "勤怠・労務", color: "text-warning", bg: "bg-warning/10" },
  other: { label: "その他", color: "text-muted", bg: "bg-muted/10" },
};

const statusConfig: Record<QuestionStatus, { label: string; color: string; icon: typeof CircleDot }> = {
  open: { label: "未回答", color: "text-warning", icon: CircleDot },
  resolved: { label: "解決済み", color: "text-success", icon: CheckCircle2 },
};

export default function QuestionsPage() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [selected, setSelected] = useState<Question | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [filterStatus, setFilterStatus] = useState<QuestionStatus | "all">("all");
  const [filterCategory, setFilterCategory] = useState<QuestionCategory | "all">("all");
  const [replyText, setReplyText] = useState("");

  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");
  const [newCategory, setNewCategory] = useState<QuestionCategory>("general");

  useEffect(() => {
    setQuestions(store.getQuestions());
  }, []);

  const filtered = questions.filter((q) => {
    if (filterStatus !== "all" && q.status !== filterStatus) return false;
    if (filterCategory !== "all" && q.category !== filterCategory) return false;
    return true;
  });

  const handlePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    const profile = store.getProfile();
    const now = new Date().toISOString();
    const question: Question = {
      id: uuidv4(),
      user_id: profile.id,
      user_name: profile.name,
      title: newTitle.trim(),
      content: newContent.trim(),
      category: newCategory,
      status: "open",
      replies: [],
      created_at: now,
      updated_at: now,
    };
    store.saveQuestion(question);
    logActivity("question_post", `質問投稿: ${newTitle}`);
    setQuestions(store.getQuestions());
    setNewTitle("");
    setNewContent("");
    setShowForm(false);
  };

  const handleReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selected || !replyText.trim()) return;
    const profile = store.getProfile();
    const reply: QuestionReply = {
      id: uuidv4(),
      user_id: profile.id,
      user_name: profile.name,
      content: replyText.trim(),
      created_at: new Date().toISOString(),
    };
    const updated: Question = {
      ...selected,
      replies: [...selected.replies, reply],
      updated_at: new Date().toISOString(),
    };
    store.saveQuestion(updated);
    setQuestions(store.getQuestions());
    setSelected(updated);
    setReplyText("");
  };

  const toggleResolved = (question: Question) => {
    const updated: Question = {
      ...question,
      status: question.status === "open" ? "resolved" : "open",
      updated_at: new Date().toISOString(),
    };
    store.saveQuestion(updated);
    setQuestions(store.getQuestions());
    if (selected?.id === question.id) setSelected(updated);
  };

  const handleDelete = (id: string) => {
    if (!confirm("この質問を削除しますか？")) return;
    store.deleteQuestion(id);
    setQuestions(store.getQuestions());
    if (selected?.id === id) setSelected(null);
  };

  return (
    <>
      <Header title="相談・質問" subtitle="チームへの相談や技術的な質問" />
      <div className="p-6">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 rounded-lg border border-card-border p-1">
              <Filter size={14} className="ml-2 text-muted" />
              {(
                [
                  { value: "all", label: "すべて" },
                  { value: "open", label: "未回答" },
                  { value: "resolved", label: "解決済み" },
                ] as const
              ).map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setFilterStatus(opt.value)}
                  className={`rounded-md px-3 py-1 text-xs font-medium transition-colors ${
                    filterStatus === opt.value
                      ? "bg-primary text-white"
                      : "text-muted hover:text-foreground"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-1 rounded-lg border border-card-border p-1">
              <Tag size={14} className="ml-2 text-muted" />
              {(
                [
                  { value: "all", label: "全カテゴリ" },
                  { value: "general", label: "一般" },
                  { value: "tech", label: "技術" },
                  { value: "hr", label: "勤怠・労務" },
                  { value: "other", label: "その他" },
                ] as const
              ).map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setFilterCategory(opt.value)}
                  className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                    filterCategory === opt.value
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
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-hover"
          >
            <Plus size={18} />
            質問する
          </button>
        </div>

        {showForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-lg rounded-2xl bg-card-bg shadow-2xl">
              <div className="flex items-center justify-between border-b border-card-border px-6 py-4">
                <h2 className="text-lg font-bold">新しい質問・相談</h2>
                <button
                  onClick={() => setShowForm(false)}
                  className="rounded-lg p-2 hover:bg-background transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
              <form onSubmit={handlePost} className="p-6 space-y-4">
                <div>
                  <label className="mb-1 block text-sm font-medium">
                    タイトル <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    required
                    placeholder="質問や相談のタイトル"
                    autoFocus
                    className="w-full rounded-lg border border-card-border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium">カテゴリ</label>
                  <div className="flex gap-2">
                    {(Object.entries(categoryConfig) as [QuestionCategory, typeof categoryConfig.general][]).map(
                      ([key, cfg]) => (
                        <label
                          key={key}
                          className={`flex cursor-pointer items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
                            newCategory === key
                              ? `border-primary/40 ${cfg.bg} ${cfg.color}`
                              : "border-card-border hover:bg-background"
                          }`}
                        >
                          <input
                            type="radio"
                            name="category"
                            value={key}
                            checked={newCategory === key}
                            onChange={() => setNewCategory(key)}
                            className="sr-only"
                          />
                          {cfg.label}
                        </label>
                      )
                    )}
                  </div>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium">内容</label>
                  <textarea
                    value={newContent}
                    onChange={(e) => setNewContent(e.target.value)}
                    rows={5}
                    placeholder="詳しい内容を記入してください"
                    className="w-full rounded-lg border border-card-border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary resize-none"
                  />
                </div>
                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="rounded-xl border border-card-border px-5 py-2 text-sm font-medium hover:bg-background transition-colors"
                  >
                    キャンセル
                  </button>
                  <button
                    type="submit"
                    className="flex items-center gap-2 rounded-xl bg-primary px-5 py-2 text-sm font-semibold text-white hover:bg-primary-hover transition-colors"
                  >
                    <Send size={16} />
                    投稿する
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <MessageCircleQuestion size={48} className="text-muted mb-4" />
            <p className="text-lg font-medium text-muted">
              質問・相談はまだありません
            </p>
            <button
              onClick={() => setShowForm(true)}
              className="mt-4 text-sm text-primary hover:underline"
            >
              最初の質問を投稿する
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="lg:col-span-1 space-y-3 max-h-[calc(100vh-220px)] overflow-y-auto pr-2">
              {filtered.map((q) => {
                const cat = categoryConfig[q.category];
                const st = statusConfig[q.status];
                const StIcon = st.icon;
                return (
                  <button
                    key={q.id}
                    onClick={() => setSelected(q)}
                    className={`w-full text-left rounded-xl border p-4 transition-all ${
                      selected?.id === q.id
                        ? "border-primary bg-primary/5 shadow-sm"
                        : "border-card-border bg-card-bg hover:shadow-sm"
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <StIcon size={14} className={st.color} />
                        <span
                          className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${cat.bg} ${cat.color}`}
                        >
                          {cat.label}
                        </span>
                      </div>
                      <span className="text-xs text-muted">
                        {q.replies.length > 0 ? `${q.replies.length}件の回答` : ""}
                      </span>
                    </div>
                    <p className="text-sm font-bold line-clamp-1">{q.title}</p>
                    <div className="mt-1 flex items-center justify-between">
                      <span className="text-xs text-muted">{q.user_name}</span>
                      <span className="text-xs text-muted">
                        {format(new Date(q.created_at), "M/d HH:mm")}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="lg:col-span-2">
              {selected ? (
                <div className="rounded-xl border border-card-border bg-card-bg overflow-hidden">
                  <div className="flex items-center justify-between border-b border-card-border px-6 py-4">
                    <div className="flex items-center gap-3">
                      <h2 className="text-lg font-bold">{selected.title}</h2>
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          categoryConfig[selected.category].bg
                        } ${categoryConfig[selected.category].color}`}
                      >
                        {categoryConfig[selected.category].label}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => toggleResolved(selected)}
                        className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                          selected.status === "resolved"
                            ? "bg-success/10 text-success"
                            : "bg-warning/10 text-warning"
                        }`}
                      >
                        {selected.status === "resolved" ? (
                          <>
                            <CheckCircle2 size={14} />
                            解決済み
                          </>
                        ) : (
                          <>
                            <CircleDot size={14} />
                            未回答
                          </>
                        )}
                      </button>
                      <button
                        onClick={() => handleDelete(selected.id)}
                        className="rounded-lg p-2 text-danger hover:bg-danger/10 transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>

                  <div className="p-6 space-y-6">
                    <div className="rounded-lg bg-background p-4">
                      <div className="mb-2 flex items-center justify-between">
                        <span className="text-sm font-semibold">
                          {selected.user_name}
                        </span>
                        <span className="text-xs text-muted">
                          {format(new Date(selected.created_at), "yyyy/M/d HH:mm", {
                            locale: ja,
                          })}
                        </span>
                      </div>
                      <p className="whitespace-pre-wrap text-sm">
                        {selected.content || "(内容なし)"}
                      </p>
                    </div>

                    {selected.replies.length > 0 && (
                      <div className="space-y-3">
                        <p className="text-sm font-bold text-muted">
                          回答 ({selected.replies.length}件)
                        </p>
                        {selected.replies.map((reply) => (
                          <div
                            key={reply.id}
                            className="rounded-lg border border-card-border bg-card-bg p-4"
                          >
                            <div className="mb-2 flex items-center justify-between">
                              <span className="text-sm font-semibold">
                                {reply.user_name}
                              </span>
                              <span className="text-xs text-muted">
                                {format(
                                  new Date(reply.created_at),
                                  "yyyy/M/d HH:mm",
                                  { locale: ja }
                                )}
                              </span>
                            </div>
                            <p className="whitespace-pre-wrap text-sm">
                              {reply.content}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}

                    <form onSubmit={handleReply} className="flex gap-3">
                      <input
                        type="text"
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        placeholder="回答を入力..."
                        className="flex-1 rounded-xl border border-card-border bg-background px-4 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                      <button
                        type="submit"
                        disabled={!replyText.trim()}
                        className="flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-hover disabled:opacity-40"
                      >
                        <Send size={16} />
                        回答
                      </button>
                    </form>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-card-border py-20">
                  <MessageCircleQuestion size={32} className="text-muted mb-2" />
                  <p className="text-sm text-muted">
                    左の一覧から質問を選択してください
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
