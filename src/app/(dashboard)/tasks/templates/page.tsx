"use client";

import { useEffect, useState } from "react";
import { Header } from "@/components/layout/header";
import { store } from "@/lib/store";
import type { TaskTemplate, TaskPriority } from "@/lib/types";
import { ListChecks, Plus, Trash2, X, Copy } from "lucide-react";
import { v4 as uuidv4 } from "uuid";
import { logActivity } from "@/lib/activity";

const priorityLabels: Record<TaskPriority, { label: string; color: string }> = {
  high: { label: "高", color: "text-danger" },
  medium: { label: "中", color: "text-warning" },
  low: { label: "低", color: "text-muted" },
};

export default function TaskTemplatesPage() {
  const [templates, setTemplates] = useState<TaskTemplate[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [priority, setPriority] = useState<TaskPriority>("medium");
  const [category, setCategory] = useState("general");

  useEffect(() => { setTemplates(store.getTaskTemplates()); }, []);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const t: TaskTemplate = { id: uuidv4(), title, description: desc || undefined, priority, category, created_by: store.getProfile().id, created_at: new Date().toISOString() };
    store.saveTaskTemplate(t);
    setTemplates(store.getTaskTemplates());
    setTitle(""); setDesc(""); setShowForm(false);
  };

  const useTemplate = (t: TaskTemplate) => {
    const today = new Date().toISOString().split("T")[0];
    store.saveTask({ id: uuidv4(), user_id: store.getProfile().id, task_date: today, title: t.title, description: t.description, status: "todo", priority: t.priority, created_at: new Date().toISOString() });
    logActivity("task_add", `テンプレートからタスク追加: ${t.title}`);
    alert(`「${t.title}」を今日のタスクに追加しました`);
  };

  const deleteTemplate = (id: string) => {
    store.deleteTaskTemplate(id);
    setTemplates(store.getTaskTemplates());
  };

  const grouped = templates.reduce<Record<string, TaskTemplate[]>>((acc, t) => {
    if (!acc[t.category]) acc[t.category] = [];
    acc[t.category].push(t);
    return acc;
  }, {});

  return (
    <>
      <Header title="タスクテンプレート" subtitle="よく使うタスクをテンプレート化" />
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted">{templates.length} テンプレート</p>
          <button onClick={() => setShowForm(true)} className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-hover">
            <Plus size={18} /> 新規テンプレート
          </button>
        </div>

        {templates.length === 0 ? (
          <div className="flex flex-col items-center py-20">
            <ListChecks size={48} className="text-muted mb-4" />
            <p className="text-muted text-sm">テンプレートを作成してください</p>
          </div>
        ) : (
          Object.entries(grouped).map(([cat, items]) => (
            <div key={cat}>
              <h3 className="mb-3 text-sm font-bold text-muted uppercase">{cat}</h3>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {items.map((t) => (
                  <div key={t.id} className="group rounded-xl border border-card-border bg-card-bg p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-sm font-bold">{t.title}</p>
                        {t.description && <p className="text-xs text-muted mt-1">{t.description}</p>}
                        <span className={`text-xs font-medium ${priorityLabels[t.priority].color}`}>優先度: {priorityLabels[t.priority].label}</span>
                      </div>
                    </div>
                    <div className="mt-3 flex gap-2">
                      <button onClick={() => useTemplate(t)} className="flex items-center gap-1 rounded-lg bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary hover:bg-primary/20">
                        <Copy size={12} /> 使う
                      </button>
                      <button onClick={() => deleteTemplate(t.id)} className="flex items-center gap-1 rounded-lg bg-danger/10 px-3 py-1.5 text-xs font-medium text-danger hover:bg-danger/20 opacity-0 group-hover:opacity-100">
                        <Trash2 size={12} /> 削除
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}

        {showForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-md rounded-2xl bg-card-bg shadow-2xl">
              <div className="flex items-center justify-between border-b border-card-border px-6 py-4">
                <h2 className="text-lg font-bold">テンプレート作成</h2>
                <button onClick={() => setShowForm(false)} className="rounded-lg p-2 hover:bg-background"><X size={20} /></button>
              </div>
              <form onSubmit={handleSave} className="p-6 space-y-4">
                <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="タスク名" required className="w-full rounded-lg border border-card-border bg-background px-4 py-2.5 text-sm focus:border-primary focus:outline-none" />
                <input type="text" value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="説明（任意）" className="w-full rounded-lg border border-card-border bg-background px-4 py-2.5 text-sm focus:border-primary focus:outline-none" />
                <div className="grid grid-cols-2 gap-3">
                  <select value={priority} onChange={(e) => setPriority(e.target.value as TaskPriority)} className="rounded-lg border border-card-border bg-background px-3 py-2.5 text-sm">
                    <option value="low">低</option><option value="medium">中</option><option value="high">高</option>
                  </select>
                  <input type="text" value={category} onChange={(e) => setCategory(e.target.value)} placeholder="カテゴリ" className="rounded-lg border border-card-border bg-background px-3 py-2.5 text-sm focus:border-primary focus:outline-none" />
                </div>
                <button type="submit" className="w-full rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-white hover:bg-primary-hover">保存</button>
              </form>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
