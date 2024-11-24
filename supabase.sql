-- Enable UUID extension if not already enabled
create extension if not exists "uuid-ossp";

-- Create function to normalize URLs (must be created before table)
create or replace function normalize_url(url text) returns text as $$
begin
  return lower(regexp_replace(
    regexp_replace(url, 'https?://', ''),
    '^www\.', 
    ''
  ));
end;
$$ language plpgsql immutable;

-- Create projects table
create table public.projects (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  url text not null,
  normalized_url text generated always as (normalize_url(url)) stored,
  industry text not null,
  services text[] default '{}',
  target_audience jsonb default '{
    "gender": [],
    "languages": [],
    "location": []
  }'::jsonb,
  user_id uuid references auth.users(id) on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Add unique constraint on user_id and normalized_url
alter table public.projects
add constraint unique_user_url unique (user_id, normalized_url);

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
alter publication supabase_realtime add table projects;

-- Create indexes for better performance
create index projects_user_id_idx on projects(user_id);
create index projects_created_at_idx on projects(created_at desc);
create index projects_normalized_url_idx on projects(normalized_url);

-- Grant necessary permissions
grant usage on schema public to anon, authenticated;
grant all on public.projects to authenticated;
grant execute on function public.handle_updated_at to authenticated;
grant execute on function public.normalize_url to authenticated;

-- Enable row level security on all tables
alter table public.projects force row level security;