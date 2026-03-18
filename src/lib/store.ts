import type {
  Profile,
  DailyReport,
  DailyTask,
  Project,
  Invoice,
} from "./types";

const STORAGE_KEYS = {
  PROFILE: "sm_profile",
  REPORTS: "sm_reports",
  TASKS: "sm_tasks",
  PROJECTS: "sm_projects",
  INVOICES: "sm_invoices",
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

const DEMO_PROFILE: Profile = {
  id: "demo-user",
  email: "demo@example.com",
  name: "デモユーザー",
  role: "admin",
  hourly_rate: 1200,
  created_at: new Date().toISOString(),
};

export const store = {
  getProfile(): Profile {
    return getItem(STORAGE_KEYS.PROFILE, DEMO_PROFILE);
  },
  setProfile(profile: Profile) {
    setItem(STORAGE_KEYS.PROFILE, profile);
  },

  getReports(): DailyReport[] {
    return getItem(STORAGE_KEYS.REPORTS, []);
  },
  saveReport(report: DailyReport) {
    const reports = this.getReports();
    const idx = reports.findIndex((r) => r.id === report.id);
    if (idx >= 0) {
      reports[idx] = report;
    } else {
      reports.unshift(report);
    }
    setItem(STORAGE_KEYS.REPORTS, reports);
  },
  deleteReport(id: string) {
    const reports = this.getReports().filter((r) => r.id !== id);
    setItem(STORAGE_KEYS.REPORTS, reports);
  },

  getTasks(): DailyTask[] {
    return getItem(STORAGE_KEYS.TASKS, []);
  },
  getTasksByDate(date: string): DailyTask[] {
    return this.getTasks().filter((t) => t.task_date === date);
  },
  saveTask(task: DailyTask) {
    const tasks = this.getTasks();
    const idx = tasks.findIndex((t) => t.id === task.id);
    if (idx >= 0) {
      tasks[idx] = task;
    } else {
      tasks.unshift(task);
    }
    setItem(STORAGE_KEYS.TASKS, tasks);
  },
  deleteTask(id: string) {
    const tasks = this.getTasks().filter((t) => t.id !== id);
    setItem(STORAGE_KEYS.TASKS, tasks);
  },

  getProjects(): Project[] {
    return getItem(STORAGE_KEYS.PROJECTS, []);
  },
  saveProject(project: Project) {
    const projects = this.getProjects();
    const idx = projects.findIndex((p) => p.id === project.id);
    if (idx >= 0) {
      projects[idx] = project;
    } else {
      projects.unshift(project);
    }
    setItem(STORAGE_KEYS.PROJECTS, projects);
  },
  deleteProject(id: string) {
    const projects = this.getProjects().filter((p) => p.id !== id);
    setItem(STORAGE_KEYS.PROJECTS, projects);
  },

  getInvoices(): Invoice[] {
    return getItem(STORAGE_KEYS.INVOICES, []);
  },
  saveInvoice(invoice: Invoice) {
    const invoices = this.getInvoices();
    const idx = invoices.findIndex((i) => i.id === invoice.id);
    if (idx >= 0) {
      invoices[idx] = invoice;
    } else {
      invoices.unshift(invoice);
    }
    setItem(STORAGE_KEYS.INVOICES, invoices);
  },
  deleteInvoice(id: string) {
    const invoices = this.getInvoices().filter((i) => i.id !== id);
    setItem(STORAGE_KEYS.INVOICES, invoices);
  },
  getNextInvoiceNumber(): string {
    const invoices = this.getInvoices();
    const num = invoices.length + 1;
    return `INV-${String(num).padStart(4, "0")}`;
  },
};
