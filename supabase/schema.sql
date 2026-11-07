-- 초안. 담당: 백엔드. 변경 시 src/types.ts와 함께 PR.
create table children (
  id uuid primary key default gen_random_uuid(),
  parent_id uuid not null references auth.users on delete cascade,
  nickname text not null,          -- 실명 저장 안 함
  birth_month date not null,
  consent_at timestamptz not null, -- 보호자 동의 시각 (필수)
  created_at timestamptz default now()
);

create table checks (
  id uuid primary key default gen_random_uuid(),
  child_id uuid not null references children on delete cascade,
  answers jsonb not null,
  focus_domains text[] not null,
  red_flag boolean not null default false,
  created_at timestamptz default now()
);

create table play_logs (
  id uuid primary key default gen_random_uuid(),
  child_id uuid not null references children on delete cascade,
  play_id text not null,           -- data/plays.json의 id
  reaction text not null check (reaction in ('low','mid','high')),
  memo text,
  created_at timestamptz default now()
);

alter table children enable row level security;
alter table checks enable row level security;
alter table play_logs enable row level security;

create policy own_children on children for all using (parent_id = auth.uid());
create policy own_checks on checks for all using (child_id in (select id from children where parent_id = auth.uid()));
create policy own_logs on play_logs for all using (child_id in (select id from children where parent_id = auth.uid()));
