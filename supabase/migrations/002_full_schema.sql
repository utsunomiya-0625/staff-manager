-- ==============================
-- 002: Full schema for 28 features
-- ==============================

-- invoices
create table if not exists invoices (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade not null,
  invoice_number text not null,
  status text not null default 'draft' check (status in ('draft', 'sent', 'paid')),
  billing_period text not null,
  issue_date date not null,
  due_date date not null,
  biller_name text not null default '',
  biller_address text not null default '',
  biller_bank text not null default '',
  biller_bank_branch text not null default '',
  biller_account_type text not null default '',
  biller_account_number text not null default '',
  biller_account_name text not null default '',
  client_name text not null default '',
  client_address text not null default '',
  items jsonb not null default '[]',
  subtotal integer not null default 0,
  tax_rate numeric not null default 10,
  tax_amount integer not null default 0,
  total integer not null default 0,
  notes text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table invoices enable row level security;
create policy "Users can view own invoices" on invoices for select using (auth.uid() = user_id);
create policy "Users can insert own invoices" on invoices for insert with check (auth.uid() = user_id);
create policy "Users can update own invoices" on invoices for update using (auth.uid() = user_id);
create policy "Users can delete own invoices" on invoices for delete using (auth.uid() = user_id);

-- notifications
create table if not exists notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade not null,
  type text not null default 'info' check (type in ('report_missing', 'late', 'info', 'ai', 'task_deadline', 'mention')),
  title text not null,
  message text not null default '',
  read boolean not null default false,
  created_at timestamptz not null default now()
);
alter table notifications enable row level security;
create policy "Users can view own notifications" on notifications for select using (auth.uid() = user_id);
create policy "System can insert notifications" on notifications for insert with check (true);
create policy "Users can update own notifications" on notifications for update using (auth.uid() = user_id);

-- activity_logs
create table if not exists activity_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade not null,
  user_name text not null default '',
  action text not null,
  detail text not null default '',
  created_at timestamptz not null default now()
);
alter table activity_logs enable row level security;
create policy "Admins can view all logs" on activity_logs for select using (true);
create policy "System can insert logs" on activity_logs for insert with check (true);

-- knowledge_articles
create table if not exists knowledge_articles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete set null,
  title text not null,
  content text not null default '',
  category text not null default 'tech_memo' check (category in ('tech_memo', 'procedure', 'faq')),
  tags text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table knowledge_articles enable row level security;
create policy "Anyone can view articles" on knowledge_articles for select using (true);
create policy "Auth users can insert" on knowledge_articles for insert with check (auth.uid() is not null);
create policy "Auth users can update" on knowledge_articles for update using (auth.uid() is not null);
create policy "Owner can delete" on knowledge_articles for delete using (auth.uid() = user_id);

-- task_templates
create table if not exists task_templates (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  priority text not null default 'medium' check (priority in ('low', 'medium', 'high')),
  category text not null default 'general',
  created_by uuid references profiles(id) on delete set null,
  created_at timestamptz not null default now()
);
alter table task_templates enable row level security;
create policy "Anyone can view templates" on task_templates for select using (true);
create policy "Auth users can insert" on task_templates for insert with check (auth.uid() is not null);
create policy "Auth users can update" on task_templates for update using (auth.uid() is not null);
create policy "Owner can delete" on task_templates for delete using (auth.uid() = created_by);

-- time_entries
create table if not exists time_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade not null,
  task_id uuid references daily_tasks(id) on delete set null,
  description text not null default '',
  start_time timestamptz not null,
  end_time timestamptz,
  duration_minutes integer,
  created_at timestamptz not null default now()
);
alter table time_entries enable row level security;
create policy "Users can view own entries" on time_entries for select using (auth.uid() = user_id);
create policy "Users can insert own entries" on time_entries for insert with check (auth.uid() = user_id);
create policy "Users can update own entries" on time_entries for update using (auth.uid() = user_id);
create policy "Users can delete own entries" on time_entries for delete using (auth.uid() = user_id);

-- skills / user_skills
create table if not exists skills (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  category text not null default 'technical',
  created_at timestamptz not null default now()
);
alter table skills enable row level security;
create policy "Anyone can view skills" on skills for select using (true);
create policy "Auth users can insert" on skills for insert with check (auth.uid() is not null);

create table if not exists user_skills (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade not null,
  skill_id uuid references skills(id) on delete cascade not null,
  level integer not null default 1 check (level >= 1 and level <= 5),
  unique(user_id, skill_id)
);
alter table user_skills enable row level security;
create policy "Anyone can view user skills" on user_skills for select using (true);
create policy "Users can manage own skills" on user_skills for insert with check (auth.uid() = user_id);
create policy "Users can update own skills" on user_skills for update using (auth.uid() = user_id);
create policy "Users can delete own skills" on user_skills for delete using (auth.uid() = user_id);

-- files
create table if not exists files (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete set null,
  file_name text not null,
  file_size integer not null default 0,
  mime_type text not null default '',
  storage_path text not null,
  folder text not null default 'general',
  created_at timestamptz not null default now()
);
alter table files enable row level security;
create policy "Anyone can view files" on files for select using (true);
create policy "Auth users can upload" on files for insert with check (auth.uid() is not null);
create policy "Owner can delete" on files for delete using (auth.uid() = user_id);

-- chat_messages
create table if not exists chat_messages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade not null,
  channel text not null default 'general',
  content text not null,
  mentions uuid[] not null default '{}',
  created_at timestamptz not null default now()
);
alter table chat_messages enable row level security;
create policy "Anyone can view messages" on chat_messages for select using (true);
create policy "Auth users can send" on chat_messages for insert with check (auth.uid() is not null);

-- project_milestones (roadmap)
create table if not exists project_milestones (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references projects(id) on delete cascade not null,
  version text not null,
  title text not null,
  description text not null default '',
  target_date date,
  status text not null default 'planned' check (status in ('planned', 'in_progress', 'completed')),
  created_at timestamptz not null default now()
);
alter table project_milestones enable row level security;
create policy "Anyone can view milestones" on project_milestones for select using (true);
create policy "Auth users can manage" on project_milestones for insert with check (auth.uid() is not null);
create policy "Auth users can update" on project_milestones for update using (auth.uid() is not null);
create policy "Auth users can delete" on project_milestones for delete using (auth.uid() is not null);

-- add due_date to daily_tasks
alter table daily_tasks add column if not exists due_date date;
alter table daily_tasks add column if not exists reminder boolean not null default false;

-- add revenue fields to projects
alter table projects add column if not exists revenue integer not null default 0;
alter table projects add column if not exists cost integer not null default 0;

-- organizations (SaaS)
create table if not exists organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  owner_id uuid references profiles(id) on delete set null,
  created_at timestamptz not null default now()
);
alter table organizations enable row level security;
create policy "Members can view org" on organizations for select using (true);

-- teams
create table if not exists teams (
  id uuid primary key default gen_random_uuid(),
  org_id uuid references organizations(id) on delete cascade not null,
  name text not null,
  created_at timestamptz not null default now()
);
alter table teams enable row level security;
create policy "Members can view teams" on teams for select using (true);

-- org_members
create table if not exists org_members (
  id uuid primary key default gen_random_uuid(),
  org_id uuid references organizations(id) on delete cascade not null,
  user_id uuid references profiles(id) on delete cascade not null,
  team_id uuid references teams(id) on delete set null,
  role text not null default 'member' check (role in ('owner', 'admin', 'member', 'viewer')),
  unique(org_id, user_id)
);
alter table org_members enable row level security;
create policy "Members can view members" on org_members for select using (true);

-- webhooks
create table if not exists webhooks (
  id uuid primary key default gen_random_uuid(),
  org_id uuid references organizations(id) on delete cascade,
  url text not null,
  events text[] not null default '{}',
  active boolean not null default true,
  secret text not null default '',
  created_at timestamptz not null default now()
);
alter table webhooks enable row level security;
create policy "Org admins can manage" on webhooks for select using (true);
