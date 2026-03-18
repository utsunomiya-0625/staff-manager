"use client";

import { useEffect, useState, useRef } from "react";
import { Header } from "@/components/layout/header";
import { store } from "@/lib/store";
import type { FileRecord } from "@/lib/types";
import { format } from "date-fns";
import { FolderOpen, Upload, Trash2, FileIcon, Image, FileText, File, Download } from "lucide-react";
import { v4 as uuidv4 } from "uuid";
import { logActivity } from "@/lib/activity";

const iconForMime = (mime: string) => {
  if (mime.startsWith("image/")) return Image;
  if (mime.includes("pdf") || mime.includes("document")) return FileText;
  return File;
};

const fmtSize = (bytes: number) => {
  if (bytes < 1024) return `${bytes}B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
};

export default function FilesPage() {
  const [files, setFiles] = useState<FileRecord[]>([]);
  const [folder, setFolder] = useState("general");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { setFiles(store.getFiles()); }, []);

  const filtered = files.filter((f) => folder === "all" || f.folder === folder);

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files;
    if (!fileList) return;
    Array.from(fileList).forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => {
        const record: FileRecord = {
          id: uuidv4(),
          user_id: store.getProfile().id,
          file_name: file.name,
          file_size: file.size,
          mime_type: file.type,
          storage_path: reader.result as string,
          folder,
          created_at: new Date().toISOString(),
        };
        store.saveFile(record);
        logActivity("file_upload", `ファイルアップロード: ${file.name}`);
        setFiles(store.getFiles());
      };
      reader.readAsDataURL(file);
    });
    e.target.value = "";
  };

  const handleDelete = (id: string) => {
    if (!confirm("削除しますか？")) return;
    store.deleteFile(id);
    setFiles(store.getFiles());
  };

  const handleDownload = (f: FileRecord) => {
    const a = document.createElement("a");
    a.href = f.storage_path;
    a.download = f.file_name;
    a.click();
  };

  const folders = ["all", "general", "project", "document", "image"];
  const folderLabels: Record<string, string> = { all: "すべて", general: "一般", project: "プロジェクト", document: "ドキュメント", image: "画像" };

  return (
    <>
      <Header title="ファイル共有" subtitle="チーム資料の管理・共有" />
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex gap-1">
            {folders.map((f) => (
              <button key={f} onClick={() => setFolder(f)} className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${folder === f ? "bg-primary text-white" : "bg-card-bg border border-card-border text-muted"}`}>
                {folderLabels[f]}
              </button>
            ))}
          </div>
          <div>
            <input ref={inputRef} type="file" multiple onChange={handleUpload} className="hidden" />
            <button onClick={() => inputRef.current?.click()} className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-hover">
              <Upload size={18} /> アップロード
            </button>
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="flex flex-col items-center py-20">
            <FolderOpen size={48} className="text-muted mb-4" />
            <p className="text-muted text-sm">ファイルがありません</p>
            <p className="text-xs text-muted mt-1">Supabase Storage 連携後、クラウドに保存されます</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((f) => {
              const Icon = iconForMime(f.mime_type);
              return (
                <div key={f.id} className="group flex items-center gap-3 rounded-xl border border-card-border bg-card-bg p-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <Icon size={20} className="text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{f.file_name}</p>
                    <p className="text-xs text-muted">{fmtSize(f.file_size)} · {format(new Date(f.created_at), "M/d HH:mm")}</p>
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100">
                    <button onClick={() => handleDownload(f)} className="rounded-lg p-1.5 text-muted hover:text-primary hover:bg-primary/10"><Download size={14} /></button>
                    <button onClick={() => handleDelete(f.id)} className="rounded-lg p-1.5 text-muted hover:text-danger hover:bg-danger/10"><Trash2 size={14} /></button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
