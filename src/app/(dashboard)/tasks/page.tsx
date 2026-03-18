"use client";

import { useEffect, useState, useCallback } from "react";
import { Header } from "@/components/layout/header";
import { store } from "@/lib/store";
import type { DailyTask, TaskStatus, TaskPriority } from "@/lib/types";
import { format, addDays, subDays } from "date-fns";
import { ja } from "date-fns/locale";
import {
  Plus,
  ChevronLeft,
  ChevronRight,
  Trash2,
  GripVertical,
} from "lucide-react";
import { logActivity } from "@/lib/activity";
import { v4 as uuidv4 } from "uuid";

const statusConfig: Record<TaskStatus, { label: string; color: string; bg: string }> = {
  todo: { label: "未着手", color: "text-muted", bg: "bg-muted/10" },
  in_progress: { label: "進行中", color: "text-warning", bg: "bg-warning/10" },
  done: { label: "完了", color: "text-success", bg: "bg-success/10" },
};

const priorityConfig: Record<TaskPriority, { label: string; color: string }> = {
  high: { label: "高", color: "text-danger" },
  medium: { label: "中", color: "text-warning" },
  low: { label: "低", color: "text-muted" },
};

export default function TasksPage() {
  const [currentDate, setCurrentDate] = useState(
    format(new Date(), "yyyy-MM-dd")
  );
  const [tasks, setTasks] = useState<DailyTask[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newPriority, setNewPriority] = useState<TaskPriority>("medium");

  const loadTasks = useCallback(() => {
    setTasks(store.getTasksByDate(currentDate));
  }, [currentDate]);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  const addTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    store.saveTask({
      id: uuidv4(),
      user_id: store.getProfile().id,
      task_date: currentDate,
      title: newTitle.trim(),
      status: "todo",
      priority: newPriority,
      created_at: new Date().toISOString(),
    });
    setNewTitle("");
    setShowForm(false);
    logActivity("task_add", `タスク追加: ${newTitle.trim()}`);
    loadTasks();
  };

  const toggleStatus = (task: DailyTask) => {
    const order: TaskStatus[] = ["todo", "in_progress", "done"];
    const nextIdx = (order.indexOf(task.status) + 1) % order.length;
    const nextStatus = order[nextIdx];
    store.saveTask({ ...task, status: nextStatus });
    if (nextStatus === "done") logActivity("task_done", `タスク完了: ${task.title}`);
    loadTasks();
  };

  const deleteTask = (id: string) => {
    store.deleteTask(id);
    loadTasks();
  };

  const goDate = (offset: number) => {
    const d = offset > 0
      ? addDays(new Date(currentDate), offset)
      : subDays(new Date(currentDate), Math.abs(offset));
    setCurrentDate(format(d, "yyyy-MM-dd"));
  };

  const columns: TaskStatus[] = ["todo", "in_progress", "done"];

  return (
    <>
      <Header title="作業計画" subtitle="今日のタスクを管理" />
      <div className="p-6">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => goDate(-1)}
              className="rounded-lg p-2 hover:bg-card-bg transition-colors"
            >
              <ChevronLeft size={20} />
            </button>
            <h2 className="text-lg font-bold">
              {format(new Date(currentDate), "yyyy年M月d日(E)", {
                locale: ja,
              })}
            </h2>
            <button
              onClick={() => goDate(1)}
              className="rounded-lg p-2 hover:bg-card-bg transition-colors"
            >
              <ChevronRight size={20} />
            </button>
            <button
              onClick={() => setCurrentDate(format(new Date(), "yyyy-MM-dd"))}
              className="ml-2 rounded-lg border border-card-border px-3 py-1 text-xs font-medium hover:bg-card-bg transition-colors"
            >
              今日
            </button>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-hover"
          >
            <Plus size={18} />
            タスク追加
          </button>
        </div>

        {showForm && (
          <form
            onSubmit={addTask}
            className="mb-6 flex items-end gap-3 rounded-xl border border-primary/30 bg-primary/5 p-4"
          >
            <div className="flex-1">
              <label className="mb-1 block text-xs font-medium text-muted">
                タスク名
              </label>
              <input
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="タスクの内容を入力"
                autoFocus
                className="w-full rounded-lg border border-card-border bg-card-bg px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-muted">
                優先度
              </label>
              <select
                value={newPriority}
                onChange={(e) => setNewPriority(e.target.value as TaskPriority)}
                className="rounded-lg border border-card-border bg-card-bg px-3 py-2 text-sm focus:border-primary focus:outline-none"
              >
                <option value="high">高</option>
                <option value="medium">中</option>
                <option value="low">低</option>
              </select>
            </div>
            <button
              type="submit"
              className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-hover transition-colors"
            >
              追加
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="rounded-lg border border-card-border px-4 py-2 text-sm hover:bg-card-bg transition-colors"
            >
              キャンセル
            </button>
          </form>
        )}

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {columns.map((status) => {
            const config = statusConfig[status];
            const columnTasks = tasks.filter((t) => t.status === status);
            return (
              <div
                key={status}
                className="rounded-xl border border-card-border bg-card-bg"
              >
                <div className="flex items-center justify-between border-b border-card-border px-4 py-3">
                  <div className="flex items-center gap-2">
                    <span
                      className={`inline-block h-2.5 w-2.5 rounded-full ${
                        status === "done"
                          ? "bg-success"
                          : status === "in_progress"
                          ? "bg-warning"
                          : "bg-muted"
                      }`}
                    />
                    <h3 className="text-sm font-bold">{config.label}</h3>
                  </div>
                  <span className="text-xs text-muted">
                    {columnTasks.length}
                  </span>
                </div>
                <div className="space-y-2 p-3 min-h-[200px]">
                  {columnTasks.map((task) => (
                    <div
                      key={task.id}
                      className="group flex items-center gap-2 rounded-lg border border-card-border bg-background p-3 hover:shadow-sm transition-shadow"
                    >
                      <GripVertical
                        size={14}
                        className="text-muted opacity-0 group-hover:opacity-100 transition-opacity cursor-grab"
                      />
                      <button
                        onClick={() => toggleStatus(task)}
                        className="flex-1 text-left"
                      >
                        <p
                          className={`text-sm ${
                            task.status === "done"
                              ? "line-through text-muted"
                              : ""
                          }`}
                        >
                          {task.title}
                        </p>
                      </button>
                      <span
                        className={`text-xs font-medium ${
                          priorityConfig[task.priority].color
                        }`}
                      >
                        {priorityConfig[task.priority].label}
                      </span>
                      <button
                        onClick={() => deleteTask(task.id)}
                        className="rounded p-1 text-muted opacity-0 group-hover:opacity-100 hover:text-danger transition-all"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                  {columnTasks.length === 0 && (
                    <p className="py-8 text-center text-xs text-muted">
                      タスクなし
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}
