-- App Store 審査対応（Guideline 1.2 UGC）：ユーザー間ブロック機能
-- Supabase の SQL Editor でこの内容を実行してください。

create table if not exists public.user_blocks (
  id uuid primary key default gen_random_uuid(),
  blocker_id uuid not null,          -- ブロックした人
  blocked_id uuid not null,          -- ブロックされた人
  blocked_name text,                 -- 表示名（記録用）
  created_at timestamptz not null default now(),
  unique (blocker_id, blocked_id)
);

create index if not exists idx_user_blocks_blocker on public.user_blocks (blocker_id);
create index if not exists idx_user_blocks_blocked on public.user_blocks (blocked_id);

-- RLS：本人のブロックだけ読み書きできる
alter table public.user_blocks enable row level security;

drop policy if exists "own blocks select" on public.user_blocks;
create policy "own blocks select" on public.user_blocks
  for select using (auth.uid() = blocker_id);

drop policy if exists "own blocks insert" on public.user_blocks;
create policy "own blocks insert" on public.user_blocks
  for insert with check (auth.uid() = blocker_id);

drop policy if exists "own blocks delete" on public.user_blocks;
create policy "own blocks delete" on public.user_blocks
  for delete using (auth.uid() = blocker_id);
