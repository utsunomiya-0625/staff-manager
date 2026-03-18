export type UserRole = "admin" | "staff";

export interface Profile {
  id: string;
  email: string;
  name: string;
  avatar_url?: string;
  role: UserRole;
  hourly_rate: number;
  created_at: string;
}

export type ReportResult = "achieved" | "in_progress" | "not_started";

export interface DailyReport {
  id: string;
  user_id: string;
  report_date: string;
  goal: string;
  goal_result: ReportResult;
  progress: string;
  blocker: string;
  tried: string;
  learning: string;
  next_plan: string;
  free_space: string;
  created_at: string;
  updated_at: string;
  user?: Profile;
}

export type TaskStatus = "todo" | "in_progress" | "done";
export type TaskPriority = "low" | "medium" | "high";

export interface DailyTask {
  id: string;
  user_id: string;
  task_date: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  due_date?: string;
  reminder?: boolean;
  created_at: string;
}

export type ProjectStatus = "in_development" | "completed" | "on_hold";

export interface Project {
  id: string;
  name: string;
  description: string;
  url?: string;
  demo_url?: string;
  screenshot_url?: string;
  status: ProjectStatus;
  progress: number;
  tech_stack: string[];
  assignees: string[];
  notes?: string;
  revenue?: number;
  cost?: number;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface AttendanceRecord {
  date: string;
  user_id: string;
  clock_in?: string;
  clock_out?: string;
  hours_worked?: number;
  hourly_rate: number;
  total_pay?: number;
}

export type WorkLocation = "office" | "remote" | "off" | "undecided";

export interface WeeklyScheduleDay {
  date: string;
  location: WorkLocation;
  note: string;
}

export interface WeeklySchedule {
  id: string;
  user_id: string;
  week_start: string;
  days: WeeklyScheduleDay[];
  created_at: string;
  updated_at: string;
}

export type QuestionStatus = "open" | "resolved";
export type QuestionCategory = "general" | "tech" | "hr" | "other";

export interface QuestionReply {
  id: string;
  user_id: string;
  user_name: string;
  content: string;
  created_at: string;
}

export interface Question {
  id: string;
  user_id: string;
  user_name: string;
  title: string;
  content: string;
  category: QuestionCategory;
  status: QuestionStatus;
  replies: QuestionReply[];
  created_at: string;
  updated_at: string;
}

// --- Admin features ---

export interface AppNotification {
  id: string;
  user_id: string;
  type: "report_missing" | "late" | "info" | "ai" | "task_deadline" | "mention";
  title: string;
  message: string;
  read: boolean;
  created_at: string;
}

export type ActivityAction =
  | "clock_in"
  | "clock_out"
  | "task_add"
  | "task_done"
  | "report_submit"
  | "project_edit"
  | "login"
  | "schedule_save"
  | "invoice_create"
  | "question_post"
  | "file_upload"
  | "chat_send";

export interface ActivityLog {
  id: string;
  user_id: string;
  user_name: string;
  action: ActivityAction;
  detail: string;
  created_at: string;
}

export type AttendanceStatus = "present" | "late" | "absent" | "day_off";

export interface AttendanceCheck {
  date: string;
  user_id: string;
  user_name: string;
  expected: WorkLocation;
  actual: AttendanceStatus;
}

export interface PerformanceStats {
  user_id: string;
  user_name: string;
  month: string;
  tasks_completed: number;
  tasks_total: number;
  report_submission_rate: number;
  total_hours: number;
  avg_daily_hours: number;
}

export interface PayrollEntry {
  user_id: string;
  user_name: string;
  month: string;
  total_hours: number;
  overtime_hours: number;
  hourly_rate: number;
  base_pay: number;
  overtime_pay: number;
  total_pay: number;
}

export type InvoiceStatus = "draft" | "sent" | "paid";

export interface InvoiceItem {
  date: string;
  description: string;
  hours: number;
  rate: number;
  subtotal: number;
}

export interface Invoice {
  id: string;
  invoice_number: string;
  user_id: string;
  status: InvoiceStatus;
  billing_period: string;
  issue_date: string;
  due_date: string;
  biller_name: string;
  biller_address: string;
  biller_bank: string;
  biller_bank_branch: string;
  biller_account_type: string;
  biller_account_number: string;
  biller_account_name: string;
  client_name: string;
  client_address: string;
  items: InvoiceItem[];
  subtotal: number;
  tax_rate: number;
  tax_amount: number;
  total: number;
  notes: string;
  created_at: string;
  updated_at: string;
}

// --- Phase 2: New features ---

export type KnowledgeCategory = "tech_memo" | "procedure" | "faq";

export interface KnowledgeArticle {
  id: string;
  user_id: string;
  title: string;
  content: string;
  category: KnowledgeCategory;
  tags: string[];
  created_at: string;
  updated_at: string;
  user?: Profile;
}

export interface TaskTemplate {
  id: string;
  title: string;
  description?: string;
  priority: TaskPriority;
  category: string;
  created_by: string;
  created_at: string;
}

export interface TimeEntry {
  id: string;
  user_id: string;
  task_id?: string;
  description: string;
  start_time: string;
  end_time?: string;
  duration_minutes?: number;
  created_at: string;
}

export interface Skill {
  id: string;
  name: string;
  category: string;
  created_at: string;
}

export interface UserSkill {
  id: string;
  user_id: string;
  skill_id: string;
  level: number;
  skill?: Skill;
}

export interface ProjectMilestone {
  id: string;
  project_id: string;
  version: string;
  title: string;
  description: string;
  target_date?: string;
  status: "planned" | "in_progress" | "completed";
  created_at: string;
}

export interface FileRecord {
  id: string;
  user_id: string;
  file_name: string;
  file_size: number;
  mime_type: string;
  storage_path: string;
  folder: string;
  created_at: string;
  user?: Profile;
}

export interface ChatMessage {
  id: string;
  user_id: string;
  channel: string;
  content: string;
  mentions: string[];
  created_at: string;
  user?: Profile;
}

// --- Phase 6: SaaS ---

export interface Organization {
  id: string;
  name: string;
  slug: string;
  owner_id: string;
  created_at: string;
}

export type OrgRole = "owner" | "admin" | "member" | "viewer";

export interface OrgMember {
  id: string;
  org_id: string;
  user_id: string;
  team_id?: string;
  role: OrgRole;
  user?: Profile;
}

export interface Team {
  id: string;
  org_id: string;
  name: string;
  created_at: string;
}

export interface WebhookConfig {
  id: string;
  org_id: string;
  url: string;
  events: string[];
  active: boolean;
  secret: string;
  created_at: string;
}
