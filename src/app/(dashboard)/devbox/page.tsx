"use client";

import { useEffect, useState } from "react";
import { Header } from "@/components/layout/header";
import { store } from "@/lib/store";
import type { Project, ProjectStatus } from "@/lib/types";
import Link from "next/link";
import {
  Plus,
  Package,
  ExternalLink,
  Trash2,
  X,
  Monitor,
  Filter,
} from "lucide-react";

const statusConfig: Record<ProjectStatus, { label: string; color: string; bg: string }> = {
  in_development: { label: "開発中", color: "text-primary", bg: "bg-primary/10" },
  completed: { label: "完了", color: "text-success", bg: "bg-success/10" },
  on_hold: { label: "保留", color: "text-warning", bg: "bg-warning/10" },
};

export default function DevBoxPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selected, setSelected] = useState<Project | null>(null);
  const [filter, setFilter] = useState<ProjectStatus | "all">("all");

  useEffect(() => {
    setProjects(store.getProjects());
  }, []);

  const filtered =
    filter === "all"
      ? projects
      : projects.filter((p) => p.status === filter);

  const handleDelete = (id: string) => {
    if (!confirm("このプロジェクトを削除しますか？")) return;
    store.deleteProject(id);
    setProjects(store.getProjects());
    if (selected?.id === id) setSelected(null);
  };

  return (
    <>
      <Header title="開発ボックス" subtitle="開発したアプリ・システムの一覧" />
      <div className="p-6">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 rounded-lg border border-card-border p-1">
              <Filter size={14} className="ml-2 text-muted" />
              {(
                [
                  { value: "all", label: "すべて" },
                  { value: "in_development", label: "開発中" },
                  { value: "completed", label: "完了" },
                  { value: "on_hold", label: "保留" },
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
            href="/devbox/new"
            className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-hover"
          >
            <Plus size={18} />
            プロジェクト登録
          </Link>
        </div>

        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Package size={48} className="text-muted mb-4" />
            <p className="text-lg font-medium text-muted">
              プロジェクトがまだありません
            </p>
            <Link
              href="/devbox/new"
              className="mt-4 text-sm text-primary hover:underline"
            >
              最初のプロジェクトを登録する
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((project) => {
              const st = statusConfig[project.status];
              return (
                <div
                  key={project.id}
                  className="group relative rounded-xl border border-card-border bg-card-bg overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => setSelected(project)}
                >
                  <div className="h-40 bg-gradient-to-br from-primary/20 via-purple-500/10 to-success/10 flex items-center justify-center">
                    {project.screenshot_url ? (
                      <img
                        src={project.screenshot_url}
                        alt={project.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <Package
                        size={48}
                        className="text-primary/40"
                      />
                    )}
                  </div>
                  <div className="p-4 space-y-3">
                    <div className="flex items-start justify-between">
                      <h3 className="text-base font-bold line-clamp-1">
                        {project.name}
                      </h3>
                      <span
                        className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${st.bg} ${st.color}`}
                      >
                        {st.label}
                      </span>
                    </div>
                    <p className="text-sm text-muted line-clamp-2">
                      {project.description}
                    </p>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs text-muted">
                        <span>進捗</span>
                        <span>{project.progress}%</span>
                      </div>
                      <div className="h-1.5 w-full rounded-full bg-background overflow-hidden">
                        <div
                          className="h-full rounded-full bg-primary transition-all"
                          style={{ width: `${project.progress}%` }}
                        />
                      </div>
                    </div>
                    {project.tech_stack.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {project.tech_stack.slice(0, 4).map((tech) => (
                          <span
                            key={tech}
                            className="rounded-md bg-background px-2 py-0.5 text-xs text-muted"
                          >
                            {tech}
                          </span>
                        ))}
                        {project.tech_stack.length > 4 && (
                          <span className="rounded-md bg-background px-2 py-0.5 text-xs text-muted">
                            +{project.tech_stack.length - 4}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(project.id);
                    }}
                    className="absolute right-2 top-2 rounded-lg bg-black/40 p-1.5 text-white opacity-0 group-hover:opacity-100 hover:bg-black/60 transition-all"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {projects.length > 0 && (
          <div className="mt-8 rounded-xl border border-card-border bg-card-bg p-6">
            <h3 className="mb-4 flex items-center gap-2 text-base font-bold">
              <Package size={18} className="text-primary" />
              プロジェクト進捗ヒートマップ
            </h3>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {projects.map((p) => {
                const hue = p.progress > 75 ? "bg-success" : p.progress > 50 ? "bg-primary" : p.progress > 25 ? "bg-warning" : "bg-danger";
                const opacity = Math.max(0.3, p.progress / 100);
                return (
                  <div
                    key={p.id}
                    className="group relative flex flex-col items-center justify-center rounded-lg border border-card-border p-4 text-center cursor-pointer hover:shadow-md transition-shadow"
                    style={{ backgroundColor: `var(--color-${p.status === "completed" ? "success" : p.status === "on_hold" ? "warning" : "primary"})`, opacity }}
                    onClick={() => setSelected(p)}
                  >
                    <div className="absolute inset-0 rounded-lg bg-card-bg/80" />
                    <div className="relative z-10">
                      <p className="text-sm font-bold truncate max-w-full">{p.name}</p>
                      <div className="mt-1 flex items-center justify-center gap-2 text-xs text-muted">
                        <span className={`inline-block h-2 w-2 rounded-full ${hue}`} />
                        {p.progress}%
                        <span className={`${statusConfig[p.status].color}`}>
                          {statusConfig[p.status].label}
                        </span>
                      </div>
                      <div className="mt-2 h-1.5 w-full rounded-full bg-background overflow-hidden">
                        <div className={`h-full rounded-full ${hue} transition-all`} style={{ width: `${p.progress}%` }} />
                      </div>
                      {p.assignees.length > 0 && (
                        <p className="mt-1 text-xs text-muted truncate">{p.assignees.join(", ")}</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="mt-4 flex items-center gap-4 text-xs text-muted">
              <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-danger" /> 0-25%</span>
              <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-warning" /> 26-50%</span>
              <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-primary" /> 51-75%</span>
              <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-success" /> 76-100%</span>
            </div>
          </div>
        )}

        {selected && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="relative max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-card-bg shadow-2xl">
              <div className="sticky top-0 z-10 flex items-center justify-between bg-card-bg border-b border-card-border px-6 py-4">
                <h2 className="text-xl font-bold">{selected.name}</h2>
                <button
                  onClick={() => setSelected(null)}
                  className="rounded-lg p-2 hover:bg-background transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
              <div className="p-6 space-y-6">
                <div className="flex items-center gap-3">
                  <span
                    className={`rounded-full px-3 py-1 text-sm font-medium ${
                      statusConfig[selected.status].bg
                    } ${statusConfig[selected.status].color}`}
                  >
                    {statusConfig[selected.status].label}
                  </span>
                  <span className="text-sm text-muted">
                    進捗: {selected.progress}%
                  </span>
                </div>

                <p className="text-sm">{selected.description}</p>

                {selected.url && (
                  <a
                    href={selected.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
                  >
                    <ExternalLink size={16} />
                    アプリを開く
                  </a>
                )}

                {selected.demo_url && (
                  <div>
                    <h3 className="mb-2 flex items-center gap-2 text-sm font-bold">
                      <Monitor size={16} className="text-primary" />
                      デモプレビュー
                    </h3>
                    <div className="overflow-hidden rounded-xl border border-card-border">
                      <iframe
                        src={selected.demo_url}
                        className="h-[400px] w-full"
                        title={`${selected.name} demo`}
                      />
                    </div>
                  </div>
                )}

                {selected.tech_stack.length > 0 && (
                  <div>
                    <h3 className="mb-2 text-sm font-bold">技術スタック</h3>
                    <div className="flex flex-wrap gap-2">
                      {selected.tech_stack.map((tech) => (
                        <span
                          key={tech}
                          className="rounded-lg bg-background px-3 py-1 text-sm"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {selected.notes && (
                  <div>
                    <h3 className="mb-2 text-sm font-bold">開発メモ</h3>
                    <p className="whitespace-pre-wrap text-sm text-muted">
                      {selected.notes}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
