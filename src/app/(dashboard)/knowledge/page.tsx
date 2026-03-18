"use client";

import { useEffect, useState } from "react";
import { Header } from "@/components/layout/header";
import { store } from "@/lib/store";
import type { KnowledgeArticle, KnowledgeCategory } from "@/lib/types";
import { format } from "date-fns";
import { BookOpen, Plus, Search, Tag, Trash2, X } from "lucide-react";
import { v4 as uuidv4 } from "uuid";

const categories: { value: KnowledgeCategory; label: string }[] = [
  { value: "tech_memo", label: "技術メモ" },
  { value: "procedure", label: "手順書" },
  { value: "faq", label: "FAQ" },
];

export default function KnowledgePage() {
  const [articles, setArticles] = useState<KnowledgeArticle[]>([]);
  const [selected, setSelected] = useState<KnowledgeArticle | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState("");
  const [filterCat, setFilterCat] = useState<KnowledgeCategory | "all">("all");

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState<KnowledgeCategory>("tech_memo");
  const [tagsInput, setTagsInput] = useState("");

  useEffect(() => { setArticles(store.getKnowledge()); }, []);

  const filtered = articles
    .filter((a) => filterCat === "all" || a.category === filterCat)
    .filter((a) => search === "" || a.title.toLowerCase().includes(search.toLowerCase()) || a.tags.some((t) => t.toLowerCase().includes(search.toLowerCase())));

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const now = new Date().toISOString();
    const article: KnowledgeArticle = {
      id: uuidv4(),
      user_id: store.getProfile().id,
      title,
      content,
      category,
      tags: tagsInput.split(",").map((t) => t.trim()).filter(Boolean),
      created_at: now,
      updated_at: now,
    };
    store.saveKnowledge(article);
    setArticles(store.getKnowledge());
    setTitle(""); setContent(""); setTagsInput(""); setShowForm(false);
  };

  const handleDelete = (id: string) => {
    if (!confirm("削除しますか？")) return;
    store.deleteKnowledge(id);
    setArticles(store.getKnowledge());
    if (selected?.id === id) setSelected(null);
  };

  return (
    <>
      <Header title="ナレッジベース" subtitle="技術メモ・手順書・FAQ" />
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="relative flex-1 max-w-sm">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
              <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="検索..." className="w-full rounded-lg border border-card-border bg-card-bg pl-9 pr-3 py-2 text-sm focus:border-primary focus:outline-none" />
            </div>
            <div className="flex gap-1">
              {[{ value: "all" as const, label: "すべて" }, ...categories].map((c) => (
                <button key={c.value} onClick={() => setFilterCat(c.value)} className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${filterCat === c.value ? "bg-primary text-white" : "bg-card-bg border border-card-border text-muted hover:text-foreground"}`}>
                  {c.label}
                </button>
              ))}
            </div>
          </div>
          <button onClick={() => setShowForm(true)} className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-hover">
            <Plus size={18} /> 記事作成
          </button>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-1 space-y-2 max-h-[70vh] overflow-y-auto">
            {filtered.length === 0 ? (
              <div className="flex flex-col items-center py-16">
                <BookOpen size={48} className="text-muted mb-4" />
                <p className="text-sm text-muted">記事がまだありません</p>
              </div>
            ) : (
              filtered.map((a) => (
                <div key={a.id} onClick={() => setSelected(a)} className={`group cursor-pointer rounded-lg border p-4 transition-all ${selected?.id === a.id ? "border-primary bg-primary/5" : "border-card-border bg-card-bg hover:border-primary/50"}`}>
                  <div className="flex items-start justify-between">
                    <h3 className="text-sm font-bold line-clamp-1">{a.title}</h3>
                    <button onClick={(e) => { e.stopPropagation(); handleDelete(a.id); }} className="opacity-0 group-hover:opacity-100 text-muted hover:text-danger"><Trash2 size={14} /></button>
                  </div>
                  <p className="text-xs text-muted mt-1">{categories.find((c) => c.value === a.category)?.label} · {format(new Date(a.created_at), "M/d")}</p>
                  {a.tags.length > 0 && (
                    <div className="flex gap-1 mt-2 flex-wrap">
                      {a.tags.slice(0, 3).map((t) => (
                        <span key={t} className="flex items-center gap-0.5 rounded bg-background px-1.5 py-0.5 text-xs text-muted"><Tag size={10} />{t}</span>
                      ))}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
          <div className="lg:col-span-2 rounded-xl border border-card-border bg-card-bg p-6">
            {selected ? (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-xl font-bold">{selected.title}</h2>
                    <p className="text-xs text-muted mt-1">{categories.find((c) => c.value === selected.category)?.label} · {format(new Date(selected.created_at), "yyyy/M/d HH:mm")}</p>
                  </div>
                </div>
                <div className="prose prose-sm max-w-none whitespace-pre-wrap text-sm leading-relaxed">{selected.content}</div>
                {selected.tags.length > 0 && (
                  <div className="mt-6 flex gap-2 flex-wrap">{selected.tags.map((t) => (<span key={t} className="rounded-lg bg-background px-3 py-1 text-xs">{t}</span>))}</div>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-20">
                <BookOpen size={48} className="text-muted mb-4" />
                <p className="text-muted text-sm">記事を選択してください</p>
              </div>
            )}
          </div>
        </div>

        {showForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-2xl rounded-2xl bg-card-bg shadow-2xl">
              <div className="flex items-center justify-between border-b border-card-border px-6 py-4">
                <h2 className="text-lg font-bold">新規記事</h2>
                <button onClick={() => setShowForm(false)} className="rounded-lg p-2 hover:bg-background"><X size={20} /></button>
              </div>
              <form onSubmit={handleSave} className="p-6 space-y-4">
                <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="タイトル" required className="w-full rounded-lg border border-card-border bg-background px-4 py-2.5 text-sm focus:border-primary focus:outline-none" />
                <select value={category} onChange={(e) => setCategory(e.target.value as KnowledgeCategory)} className="w-full rounded-lg border border-card-border bg-background px-4 py-2.5 text-sm">
                  {categories.map((c) => (<option key={c.value} value={c.value}>{c.label}</option>))}
                </select>
                <textarea value={content} onChange={(e) => setContent(e.target.value)} placeholder="内容（Markdown対応）" rows={10} required className="w-full rounded-lg border border-card-border bg-background px-4 py-2.5 text-sm focus:border-primary focus:outline-none resize-none" />
                <input type="text" value={tagsInput} onChange={(e) => setTagsInput(e.target.value)} placeholder="タグ（カンマ区切り: React, Next.js）" className="w-full rounded-lg border border-card-border bg-background px-4 py-2.5 text-sm focus:border-primary focus:outline-none" />
                <button type="submit" className="w-full rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-white hover:bg-primary-hover">保存</button>
              </form>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
