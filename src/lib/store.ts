import type {
  Profile,
  DailyReport,
  DailyTask,
  Project,
  Invoice,
  WeeklySchedule,
  Question,
  AppNotification,
  ActivityLog,
  KnowledgeArticle,
  TaskTemplate,
  TimeEntry,
  Skill,
  UserSkill,
  FileRecord,
  ChatMessage,
  ProjectMilestone,
} from "./types";

const STORAGE_KEYS = {
  PROFILE: "sm_profile",
  REPORTS: "sm_reports",
  TASKS: "sm_tasks",
  PROJECTS: "sm_projects",
  INVOICES: "sm_invoices",
  SCHEDULES: "sm_schedules",
  QUESTIONS: "sm_questions",
  NOTIFICATIONS: "sm_notifications",
  ACTIVITY_LOGS: "sm_activity_logs",
  KNOWLEDGE: "sm_knowledge",
  TASK_TEMPLATES: "sm_task_templates",
  TIME_ENTRIES: "sm_time_entries",
  SKILLS: "sm_skills",
  USER_SKILLS: "sm_user_skills",
  FILES: "sm_files",
  CHAT: "sm_chat",
  MILESTONES: "sm_milestones",
} as const;

function getItem<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch {
    return fallback;
  }
}

function setItem<T>(key: string, value: T): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(key, JSON.stringify(value));
}

function upsert<T extends { id: string }>(key: string, item: T, list: T[]): T[] {
  const idx = list.findIndex((x) => x.id === item.id);
  if (idx >= 0) list[idx] = item;
  else list.unshift(item);
  setItem(key, list);
  return list;
}

const DEMO_PROFILE: Profile = {
  id: "demo-user",
  email: "demo@example.com",
  name: "デモユーザー",
  role: "admin",
  hourly_rate: 1200,
  created_at: new Date().toISOString(),
};

export const store = {
  // --- Profile ---
  getProfile(): Profile {
    return getItem(STORAGE_KEYS.PROFILE, DEMO_PROFILE);
  },
  setProfile(profile: Profile) {
    setItem(STORAGE_KEYS.PROFILE, profile);
  },

  // --- Reports ---
  getReports(): DailyReport[] {
    return getItem(STORAGE_KEYS.REPORTS, []);
  },
  saveReport(report: DailyReport) {
    upsert(STORAGE_KEYS.REPORTS, report, this.getReports());
  },
  deleteReport(id: string) {
    setItem(STORAGE_KEYS.REPORTS, this.getReports().filter((r) => r.id !== id));
  },

  // --- Tasks ---
  getTasks(): DailyTask[] {
    return getItem(STORAGE_KEYS.TASKS, []);
  },
  getTasksByDate(date: string): DailyTask[] {
    return this.getTasks().filter((t) => t.task_date === date);
  },
  saveTask(task: DailyTask) {
    upsert(STORAGE_KEYS.TASKS, task, this.getTasks());
  },
  deleteTask(id: string) {
    setItem(STORAGE_KEYS.TASKS, this.getTasks().filter((t) => t.id !== id));
  },

  // --- Projects ---
  getProjects(): Project[] {
    return getItem(STORAGE_KEYS.PROJECTS, []);
  },
  saveProject(project: Project) {
    upsert(STORAGE_KEYS.PROJECTS, project, this.getProjects());
  },
  deleteProject(id: string) {
    setItem(STORAGE_KEYS.PROJECTS, this.getProjects().filter((p) => p.id !== id));
  },

  // --- Invoices ---
  getInvoices(): Invoice[] {
    return getItem(STORAGE_KEYS.INVOICES, []);
  },
  saveInvoice(invoice: Invoice) {
    upsert(STORAGE_KEYS.INVOICES, invoice, this.getInvoices());
  },
  deleteInvoice(id: string) {
    setItem(STORAGE_KEYS.INVOICES, this.getInvoices().filter((i) => i.id !== id));
  },
  getNextInvoiceNumber(): string {
    return `INV-${String(this.getInvoices().length + 1).padStart(4, "0")}`;
  },

  // --- Schedules ---
  getSchedules(): WeeklySchedule[] {
    return getItem(STORAGE_KEYS.SCHEDULES, []);
  },
  getScheduleByWeek(weekStart: string): WeeklySchedule | undefined {
    return this.getSchedules().find((s) => s.week_start === weekStart);
  },
  saveSchedule(schedule: WeeklySchedule) {
    upsert(STORAGE_KEYS.SCHEDULES, schedule, this.getSchedules());
  },

  // --- Questions ---
  getQuestions(): Question[] {
    return getItem(STORAGE_KEYS.QUESTIONS, []);
  },
  saveQuestion(question: Question) {
    upsert(STORAGE_KEYS.QUESTIONS, question, this.getQuestions());
  },
  deleteQuestion(id: string) {
    setItem(STORAGE_KEYS.QUESTIONS, this.getQuestions().filter((q) => q.id !== id));
  },

  // --- Notifications ---
  getNotifications(): AppNotification[] {
    return getItem(STORAGE_KEYS.NOTIFICATIONS, []);
  },
  getUnreadCount(): number {
    return this.getNotifications().filter((n) => !n.read).length;
  },
  addNotification(n: AppNotification) {
    const list = this.getNotifications();
    list.unshift(n);
    if (list.length > 100) list.length = 100;
    setItem(STORAGE_KEYS.NOTIFICATIONS, list);
  },
  markNotificationRead(id: string) {
    const list = this.getNotifications();
    const n = list.find((x) => x.id === id);
    if (n) n.read = true;
    setItem(STORAGE_KEYS.NOTIFICATIONS, list);
  },
  markAllNotificationsRead() {
    setItem(STORAGE_KEYS.NOTIFICATIONS, this.getNotifications().map((n) => ({ ...n, read: true })));
  },

  // --- Activity Logs ---
  getActivityLogs(): ActivityLog[] {
    return getItem(STORAGE_KEYS.ACTIVITY_LOGS, []);
  },
  addActivityLog(log: ActivityLog) {
    const logs = this.getActivityLogs();
    logs.unshift(log);
    if (logs.length > 500) logs.length = 500;
    setItem(STORAGE_KEYS.ACTIVITY_LOGS, logs);
  },

  // --- Knowledge ---
  getKnowledge(): KnowledgeArticle[] {
    return getItem(STORAGE_KEYS.KNOWLEDGE, []);
  },
  saveKnowledge(article: KnowledgeArticle) {
    upsert(STORAGE_KEYS.KNOWLEDGE, article, this.getKnowledge());
  },
  deleteKnowledge(id: string) {
    setItem(STORAGE_KEYS.KNOWLEDGE, this.getKnowledge().filter((a) => a.id !== id));
  },

  // --- Task Templates ---
  getTaskTemplates(): TaskTemplate[] {
    return getItem(STORAGE_KEYS.TASK_TEMPLATES, []);
  },
  saveTaskTemplate(t: TaskTemplate) {
    upsert(STORAGE_KEYS.TASK_TEMPLATES, t, this.getTaskTemplates());
  },
  deleteTaskTemplate(id: string) {
    setItem(STORAGE_KEYS.TASK_TEMPLATES, this.getTaskTemplates().filter((t) => t.id !== id));
  },

  // --- Time Entries ---
  getTimeEntries(): TimeEntry[] {
    return getItem(STORAGE_KEYS.TIME_ENTRIES, []);
  },
  getTimeEntriesByDate(date: string): TimeEntry[] {
    return this.getTimeEntries().filter((e) => e.start_time.startsWith(date));
  },
  saveTimeEntry(entry: TimeEntry) {
    upsert(STORAGE_KEYS.TIME_ENTRIES, entry, this.getTimeEntries());
  },
  deleteTimeEntry(id: string) {
    setItem(STORAGE_KEYS.TIME_ENTRIES, this.getTimeEntries().filter((e) => e.id !== id));
  },

  // --- Skills ---
  getSkills(): Skill[] {
    return getItem(STORAGE_KEYS.SKILLS, []);
  },
  saveSkill(skill: Skill) {
    upsert(STORAGE_KEYS.SKILLS, skill, this.getSkills());
  },
  getUserSkills(): UserSkill[] {
    return getItem(STORAGE_KEYS.USER_SKILLS, []);
  },
  saveUserSkill(us: UserSkill) {
    upsert(STORAGE_KEYS.USER_SKILLS, us, this.getUserSkills());
  },
  deleteUserSkill(id: string) {
    setItem(STORAGE_KEYS.USER_SKILLS, this.getUserSkills().filter((s) => s.id !== id));
  },

  // --- Files ---
  getFiles(): FileRecord[] {
    return getItem(STORAGE_KEYS.FILES, []);
  },
  saveFile(file: FileRecord) {
    upsert(STORAGE_KEYS.FILES, file, this.getFiles());
  },
  deleteFile(id: string) {
    setItem(STORAGE_KEYS.FILES, this.getFiles().filter((f) => f.id !== id));
  },

  // --- Chat ---
  getChatMessages(channel?: string): ChatMessage[] {
    const all = getItem<ChatMessage[]>(STORAGE_KEYS.CHAT, []);
    return channel ? all.filter((m) => m.channel === channel) : all;
  },
  addChatMessage(msg: ChatMessage) {
    const list = getItem<ChatMessage[]>(STORAGE_KEYS.CHAT, []);
    list.push(msg);
    if (list.length > 1000) list.splice(0, list.length - 1000);
    setItem(STORAGE_KEYS.CHAT, list);
  },

  // --- Milestones ---
  getMilestones(projectId?: string): ProjectMilestone[] {
    const all = getItem<ProjectMilestone[]>(STORAGE_KEYS.MILESTONES, []);
    return projectId ? all.filter((m) => m.project_id === projectId) : all;
  },
  saveMilestone(m: ProjectMilestone) {
    upsert(STORAGE_KEYS.MILESTONES, m, this.getMilestones());
  },
  deleteMilestone(id: string) {
    setItem(STORAGE_KEYS.MILESTONES, this.getMilestones().filter((m) => m.id !== id));
  },
};
