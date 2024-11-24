-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Create projects table
create table public.projects (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  url text not null,
  industry text not null,
  services text[] default '{}',
  target_audience jsonb default '{
    "gender": [],
    "languages": [],
    "location": []
  }'::jsonb,
  user_id uuid references auth.users(id) on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  -- Add unique constraint for user_id and normalized URL
  unique(user_id, lower(regexp_replace(url, '^www\.', '')))
);

-- Enable RLS
alter table public.projects enable row level security;

-- Create RLS policies
create policy "Users can view their own projects"
  on projects for select
  using (auth.uid() = user_id);

create policy "Users can create their own projects"
  on projects for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own projects"
  on projects for update
  using (auth.uid() = user_id);

create policy "Users can delete their own projects"
  on projects for delete
  using (auth.uid() = user_id);

-- Create function to update updated_at timestamp
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$ language plpgsql security definer;

-- Create trigger for updated_at
create trigger set_updated_at
  before update on projects
  for each row
  execute function handle_updated_at();

-- Enable replication for real-time features
alter publication supabase_realtime add table public.projects;

-- Create indexes for better performance
create index projects_user_id_idx on projects(user_id);
create index projects_created_at_idx on projects(created_at desc);
create index projects_url_idx on projects(lower(regexp_replace(url, '^www\.', '')));

-- Create function to clean up old projects
create or replace function public.cleanup_old_projects()
returns void as $$
begin
  delete from public.projects
  where created_at < now() - interval '1 year'
  and user_id not in (
    select id from auth.users where email_confirmed_at is not null
  );
end;
$$ language plpgsql security definer;

-- Grant necessary permissions
grant usage on schema public to anon, authenticated;
grant all on public.projects to authenticated;
grant execute on function public.handle_updated_at to authenticated;

-- Enable row level security on all tables
alter table public.projects force row level security;