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
