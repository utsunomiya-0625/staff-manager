-- profiles: ユーザー情報
create table if not exists profiles (
  id uuid references auth.users on delete cascade primary key,
  email text not null,
  name text not null default '',
  avatar_url text,
  role text not null default 'staff' check (role in ('admin', 'staff')),
  hourly_rate integer not null default 1200,
  created_at timestamptz not null default now()
);

alter table profiles enable row level security;
create policy "Users can view all profiles" on profiles for select using (true);
create policy "Users can update own profile" on profiles for update using (auth.uid() = id);

-- daily_reports: 日報
create table if not exists daily_reports (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade not null,
  report_date date not null,
  goal text not null default '',
  goal_result text not null default 'in_progress' check (goal_result in ('achieved', 'in_progress', 'not_started')),
  progress text not null default '',
  blocker text not null default 'なし',
  tried text not null default '',
  learning text not null default '',
  next_plan text not null default '',
  free_space text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(user_id, report_date)
);

alter table daily_reports enable row level security;
create policy "Users can view all reports" on daily_reports for select using (true);
create policy "Users can insert own reports" on daily_reports for insert with check (auth.uid() = user_id);
create policy "Users can update own reports" on daily_reports for update using (auth.uid() = user_id);
create policy "Users can delete own reports" on daily_reports for delete using (auth.uid() = user_id);

-- daily_tasks: 作業計画
create table if not exists daily_tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade not null,
  task_date date not null,
  title text not null,
  description text,
  status text not null default 'todo' check (status in ('todo', 'in_progress', 'done')),
  priority text not null default 'medium' check (priority in ('low', 'medium', 'high')),
  created_at timestamptz not null default now()
);

alter table daily_tasks enable row level security;
create policy "Users can view own tasks" on daily_tasks for select using (auth.uid() = user_id);
create policy "Users can insert own tasks" on daily_tasks for insert with check (auth.uid() = user_id);
create policy "Users can update own tasks" on daily_tasks for update using (auth.uid() = user_id);
create policy "Users can delete own tasks" on daily_tasks for delete using (auth.uid() = user_id);

-- projects: 開発ボックス
create table if not exists projects (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text not null default '',
  url text,
  demo_url text,
  screenshot_url text,
  status text not null default 'in_development' check (status in ('in_development', 'completed', 'on_hold')),
  progress integer not null default 0 check (progress >= 0 and progress <= 100),
  tech_stack text[] not null default '{}',
  assignees uuid[] not null default '{}',
  notes text,
  created_by uuid references profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table projects enable row level security;
create policy "Anyone can view projects" on projects for select using (true);
create policy "Authenticated users can insert projects" on projects for insert with check (auth.uid() is not null);
create policy "Authenticated users can update projects" on projects for update using (auth.uid() is not null);
create policy "Authenticated users can delete projects" on projects for delete using (auth.uid() is not null);

-- weekly_schedules: 勤務予定
create table if not exists weekly_schedules (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade not null,
  week_start date not null,
  days jsonb not null default '[]',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(user_id, week_start)
);

alter table weekly_schedules enable row level security;
create policy "Users can view all schedules" on weekly_schedules for select using (true);
create policy "Users can insert own schedules" on weekly_schedules for insert with check (auth.uid() = user_id);
create policy "Users can update own schedules" on weekly_schedules for update using (auth.uid() = user_id);

-- questions: 相談・質問
create table if not exists questions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade not null,
  user_name text not null default '',
  title text not null,
  content text not null default '',
  category text not null default 'general' check (category in ('general', 'tech', 'hr', 'other')),
  status text not null default 'open' check (status in ('open', 'resolved')),
  replies jsonb not null default '[]',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table questions enable row level security;
create policy "Anyone can view questions" on questions for select using (true);
create policy "Authenticated users can insert questions" on questions for insert with check (auth.uid() is not null);
create policy "Authenticated users can update questions" on questions for update using (auth.uid() is not null);
create policy "Users can delete own questions" on questions for delete using (auth.uid() = user_id);

-- trigger: auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, name, avatar_url)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    coalesce(new.raw_user_meta_data ->> 'avatar_url', '')
  );
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
