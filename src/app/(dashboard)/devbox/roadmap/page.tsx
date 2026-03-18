"use client";

import { useEffect, useState } from "react";
import { Header } from "@/components/layout/header";
import { store } from "@/lib/store";
import type { Project, ProjectMilestone } from "@/lib/types";
import { format } from "date-fns";
import { Map, Plus, Trash2, X, Target } from "lucide-react";
import { v4 as uuidv4 } from "uuid";

const statusColors: Record<string, { bg: string; text: string; label: string }> = {
  planned: { bg: "bg-muted/10", text: "text-muted", label: "計画" },
  in_progress: { bg: "bg-primary/10", text: "text-primary", label: "進行中" },
  completed: { bg: "bg-success/10", text: "text-success", label: "完了" },
};

export default function RoadmapPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [milestones, setMilestones] = useState<ProjectMilestone[]>([]);
  const [selectedProject, setSelectedProject] = useState("");
  const [showForm, setShowForm] = useState(false);

  const [version, setVersion] = useState("");
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [targetDate, setTargetDate] = useState("");
  const [status, setStatus] = useState<"planned" | "in_progress" | "completed">("planned");

  useEffect(() => {
    setProjects(store.getProjects());
    setMilestones(store.getMilestones());
  }, []);

  const projectMilestones = selectedProject ? milestones.filter((m) => m.project_id === selectedProject) : milestones;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProject) { alert("プロジェクトを選択してください"); return; }
    const ms: ProjectMilestone = { id: uuidv4(), project_id: selectedProject, version, title, description: desc, target_date: targetDate || undefined, status, created_at: new Date().toISOString() };
    store.saveMilestone(ms);
    setMilestones(store.getMilestones());
    setVersion(""); setTitle(""); setDesc(""); setTargetDate(""); setShowForm(false);
  };

  const deleteMilestone = (id: string) => {
    store.deleteMilestone(id);
    setMilestones(store.getMilestones());
  };

  return (
    <>
      <Header title="プロジェクトロードマップ" subtitle="バージョン別の開発計画" />
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <select value={selectedProject} onChange={(e) => setSelectedProject(e.target.value)} className="rounded-lg border border-card-border bg-card-bg px-4 py-2 text-sm focus:border-primary focus:outline-none">
            <option value="">すべてのプロジェクト</option>
            {projects.map((p) => (<option key={p.id} value={p.id}>{p.name}</option>))}
          </select>
          <button onClick={() => setShowForm(true)} className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-hover">
            <Plus size={18} /> マイルストーン追加
          </button>
        </div>

        {projectMilestones.length === 0 ? (
          <div className="flex flex-col items-center py-20">
            <Map size={48} className="text-muted mb-4" />
            <p className="text-muted text-sm">マイルストーンがまだありません</p>
          </div>
        ) : (
          <div className="relative space-y-0">
            <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-card-border" />
            {projectMilestones.sort((a, b) => (a.target_date || "").localeCompare(b.target_date || "")).map((ms) => {
              const sc = statusColors[ms.status];
              const proj = projects.find((p) => p.id === ms.project_id);
              return (
                <div key={ms.id} className="relative pl-14 pb-6">
                  <div className={`absolute left-4 top-1 flex h-5 w-5 items-center justify-center rounded-full border-2 border-card-bg ${sc.bg}`}>
                    <div className={`h-2 w-2 rounded-full ${ms.status === "completed" ? "bg-success" : ms.status === "in_progress" ? "bg-primary" : "bg-muted"}`} />
                  </div>
                  <div className="group rounded-xl border border-card-border bg-card-bg p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="rounded bg-background px-2 py-0.5 text-xs font-mono font-bold">{ms.version}</span>
                          <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${sc.bg} ${sc.text}`}>{sc.label}</span>
                        </div>
                        <h3 className="text-sm font-bold">{ms.title}</h3>
                        {ms.description && <p className="text-xs text-muted mt-1">{ms.description}</p>}
                        <div className="flex gap-3 mt-2 text-xs text-muted">
                          {proj && <span>{proj.name}</span>}
                          {ms.target_date && <span>目標: {ms.target_date}</span>}
                        </div>
                      </div>
                      <button onClick={() => deleteMilestone(ms.id)} className="opacity-0 group-hover:opacity-100 text-muted hover:text-danger"><Trash2 size={14} /></button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {showForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-md rounded-2xl bg-card-bg shadow-2xl">
              <div className="flex items-center justify-between border-b border-card-border px-6 py-4">
                <h2 className="text-lg font-bold">マイルストーン追加</h2>
                <button onClick={() => setShowForm(false)} className="rounded-lg p-2 hover:bg-background"><X size={20} /></button>
              </div>
              <form onSubmit={handleSave} className="p-6 space-y-4">
                <select value={selectedProject} onChange={(e) => setSelectedProject(e.target.value)} required className="w-full rounded-lg border border-card-border bg-background px-4 py-2.5 text-sm">
                  <option value="">プロジェクトを選択</option>
                  {projects.map((p) => (<option key={p.id} value={p.id}>{p.name}</option>))}
                </select>
                <div className="grid grid-cols-2 gap-3">
                  <input type="text" value={version} onChange={(e) => setVersion(e.target.value)} placeholder="v1.0.0" required className="rounded-lg border border-card-border bg-background px-3 py-2.5 text-sm focus:border-primary focus:outline-none" />
                  <select value={status} onChange={(e) => setStatus(e.target.value as typeof status)} className="rounded-lg border border-card-border bg-background px-3 py-2.5 text-sm">
                    <option value="planned">計画</option><option value="in_progress">進行中</option><option value="completed">完了</option>
                  </select>
                </div>
                <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="タイトル" required className="w-full rounded-lg border border-card-border bg-background px-4 py-2.5 text-sm focus:border-primary focus:outline-none" />
                <textarea value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="説明" rows={3} className="w-full rounded-lg border border-card-border bg-background px-4 py-2.5 text-sm focus:border-primary focus:outline-none resize-none" />
                <input type="date" value={targetDate} onChange={(e) => setTargetDate(e.target.value)} className="w-full rounded-lg border border-card-border bg-background px-4 py-2.5 text-sm focus:border-primary focus:outline-none" />
                <button type="submit" className="w-full rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-white hover:bg-primary-hover">追加</button>
              </form>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
