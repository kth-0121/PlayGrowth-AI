-- 초안. 변경 시 src/types.ts와 함께 PR.
-- 흐름: 센터가 부모 초대 → 부모가 9문항 체크 → 규칙 추천(draft) → 센터 확인(confirmed) → 발송(sent) → 부모 기록

create table centers (
  id uuid primary key default gen_random_uuid(),
  name text not null
);

create table profiles (
  id uuid primary key references auth.users on delete cascade,
  role text not null check (role in ('parent','center')),
  center_id uuid not null references centers
);

create table children (
  id uuid primary key default gen_random_uuid(),
  parent_id uuid not null references profiles on delete cascade,
  center_id uuid not null references centers,
  nickname text not null,             -- 애칭, 실명 저장 안 함
  birth_date date not null,
  concern_nuri text,                  -- 걱정되는 누리과정 영역 (null = 모름)
  liked_areas text[] not null default '{}',
  share_consent boolean not null default false, -- 센터와 기록 공유 동의 (언제든 변경)
  created_at timestamptz default now()
);

create table checks (
  id uuid primary key default gen_random_uuid(),
  child_id uuid not null references children on delete cascade,
  answers jsonb not null,             -- CheckAnswers
  temperament text not null,
  created_at timestamptz default now()
);

create table cards (
  id uuid primary key default gen_random_uuid(),
  child_id uuid not null references children on delete cascade,
  play_id text not null,              -- data/plays.json의 id
  status text not null default 'draft' check (status in ('draft','confirmed','sent')),
  center_note text,
  created_at timestamptz default now()
);

create table play_logs (
  id uuid primary key default gen_random_uuid(),
  card_id uuid not null references cards on delete cascade,
  reaction text not null check (reaction in ('done','difficult','loved')),
  memo text,
  photo_path text,                    -- Supabase Storage 경로
  created_at timestamptz default now()
);

create table messages (
  id uuid primary key default gen_random_uuid(),
  child_id uuid not null references children on delete cascade,
  sender_id uuid not null references profiles,
  body text not null,
  created_at timestamptz default now()
);

alter table centers enable row level security;
alter table profiles enable row level security;
alter table children enable row level security;
alter table checks enable row level security;
alter table cards enable row level security;
alter table play_logs enable row level security;
alter table messages enable row level security;

-- 부모: 자기 아이만 / 센터: 공유 동의한 소속 센터 아이만
create function can_see(c uuid) returns boolean language sql stable security definer as $$
  select exists (
    select 1 from children ch join profiles p on p.id = auth.uid()
    where ch.id = c and (
      ch.parent_id = p.id
      or (p.role = 'center' and ch.center_id = p.center_id and ch.share_consent)
    )
  )
$$;

create policy own_profile on profiles for select using (id = auth.uid());
create policy see_children on children for all using (can_see(id)) with check (parent_id = auth.uid() or can_see(id));
create policy see_checks on checks for all using (can_see(child_id));
create policy see_cards on cards for all using (can_see(child_id));
create policy see_logs on play_logs for all using (can_see((select child_id from cards where cards.id = card_id)));
create policy see_messages on messages for all using (can_see(child_id));
