"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/layout/header";
import { store } from "@/lib/store";
import type { ProjectStatus } from "@/lib/types";
import { Save, ArrowLeft, Plus, X } from "lucide-react";
import Link from "next/link";
import { v4 as uuidv4 } from "uuid";
import { logActivity } from "@/lib/activity";

export default function NewProjectPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [url, setUrl] = useState("");
  const [demoUrl, setDemoUrl] = useState("");
  const [screenshotUrl, setScreenshotUrl] = useState("");
  const [status, setStatus] = useState<ProjectStatus>("in_development");
  const [progress, setProgress] = useState(0);
  const [techInput, setTechInput] = useState("");
  const [techStack, setTechStack] = useState<string[]>([]);
  const [notes, setNotes] = useState("");

  const addTech = () => {
    const tech = techInput.trim();
    if (tech && !techStack.includes(tech)) {
      setTechStack([...techStack, tech]);
      setTechInput("");
    }
  };

  const removeTech = (tech: string) => {
    setTechStack(techStack.filter((t) => t !== tech));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const now = new Date().toISOString();
    store.saveProject({
      id: uuidv4(),
      name,
      description,
      url: url || undefined,
      demo_url: demoUrl || undefined,
      screenshot_url: screenshotUrl || undefined,
      status,
      progress,
      tech_stack: techStack,
      assignees: [store.getProfile().id],
      notes: notes || undefined,
      created_by: store.getProfile().id,
      created_at: now,
      updated_at: now,
    });
    logActivity("project_edit", `プロジェクト登録: ${name}`);
    router.push("/devbox");
  };

  return (
    <>
      <Header title="プロジェクト登録" subtitle="開発ボックスに追加" />
      <div className="mx-auto max-w-2xl p-6">
        <Link
          href="/devbox"
          className="mb-6 inline-flex items-center gap-1 text-sm text-muted hover:text-foreground transition-colors"
        >
          <ArrowLeft size={16} />
          一覧に戻る
        </Link>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="mb-1 block text-sm font-medium">
              プロジェクト名 <span className="text-danger">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="例: Staff Manager"
              required
              className="w-full rounded-lg border border-card-border bg-card-bg px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">
              説明 <span className="text-danger">*</span>
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="プロジェクトの概要を記入"
              rows={3}
              required
              className="w-full rounded-lg border border-card-border bg-card-bg px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary resize-none"
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium">
                アプリURL
              </label>
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://..."
                className="w-full rounded-lg border border-card-border bg-card-bg px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">
                デモURL（iframe埋め込み用）
              </label>
              <input
                type="url"
                value={demoUrl}
                onChange={(e) => setDemoUrl(e.target.value)}
                placeholder="https://..."
                className="w-full rounded-lg border border-card-border bg-card-bg px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">
              スクリーンショットURL
            </label>
            <input
              type="url"
              value={screenshotUrl}
              onChange={(e) => setScreenshotUrl(e.target.value)}
              placeholder="画像URLを入力"
              className="w-full rounded-lg border border-card-border bg-card-bg px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium">
                ステータス
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as ProjectStatus)}
                className="w-full rounded-lg border border-card-border bg-card-bg px-3 py-2 text-sm focus:border-primary focus:outline-none"
              >
                <option value="in_development">開発中</option>
                <option value="completed">完了</option>
                <option value="on_hold">保留</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">
                進捗: {progress}%
              </label>
              <input
                type="range"
                min={0}
                max={100}
                step={5}
                value={progress}
                onChange={(e) => setProgress(Number(e.target.value))}
                className="w-full accent-primary mt-2"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">
              技術スタック
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={techInput}
                onChange={(e) => setTechInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addTech();
                  }
                }}
                placeholder="例: Next.js, React, TypeScript..."
                className="flex-1 rounded-lg border border-card-border bg-card-bg px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
              <button
                type="button"
                onClick={addTech}
                className="rounded-lg bg-background px-3 py-2 text-sm hover:bg-card-border transition-colors"
              >
                <Plus size={18} />
              </button>
            </div>
            {techStack.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {techStack.map((tech) => (
                  <span
                    key={tech}
                    className="inline-flex items-center gap-1 rounded-lg bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary"
                  >
                    {tech}
                    <button type="button" onClick={() => removeTech(tech)}>
                      <X size={12} />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">開発メモ</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="自由メモ"
              rows={3}
              className="w-full rounded-lg border border-card-border bg-card-bg px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary resize-none"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Link
              href="/devbox"
              className="rounded-xl border border-card-border px-6 py-2.5 text-sm font-medium hover:bg-background transition-colors"
            >
              キャンセル
            </Link>
            <button
              type="submit"
              className="flex items-center gap-2 rounded-xl bg-primary px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-hover"
            >
              <Save size={18} />
              登録する
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
