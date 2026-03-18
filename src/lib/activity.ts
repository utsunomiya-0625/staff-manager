import { store } from "./store";
import type { ActivityAction } from "./types";
import { v4 as uuidv4 } from "uuid";

export function logActivity(action: ActivityAction, detail: string) {
  const profile = store.getProfile();
  store.addActivityLog({
    id: uuidv4(),
    user_id: profile.id,
    user_name: profile.name,
    action,
    detail,
    created_at: new Date().toISOString(),
  });
}

export const ACTION_LABELS: Record<ActivityAction, string> = {
  clock_in: "出勤",
  clock_out: "退勤",
  task_add: "タスク追加",
  task_done: "タスク完了",
  report_submit: "日報提出",
  project_edit: "プロジェクト編集",
  login: "ログイン",
  schedule_save: "勤務予定保存",
  invoice_create: "請求書作成",
  question_post: "質問投稿",
  file_upload: "ファイルアップロード",
  chat_send: "チャット送信",
};
