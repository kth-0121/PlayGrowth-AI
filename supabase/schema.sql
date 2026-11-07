-- 초안. 변경 시 src/types.ts와 함께 PR.
-- 흐름: 가입 → 아이 정보 → 설문 → 추천 → 놀이 → 기록 → 다음 추천 → (원할 때) 센터에 리포트 공유

create table profiles (
  id uuid primary key references auth.users on delete cascade,
  nickname text not null,             -- 커뮤니티 표시 이름
  is_admin boolean not null default false,
  center_name text,                   -- 대기 중인 센터 (선택)
  wait_start date,                    -- 대기 시작일
  consult_date date                   -- 첫 상담 예정일
);

create table children (
  id uuid primary key default gen_random_uuid(),
  parent_id uuid not null references profiles on delete cascade,
  nickname text not null,             -- 애칭, 실명 저장 안 함
  birth_date date not null,
  consent_at timestamptz not null,    -- 보호자 동의 시각
  created_at timestamptz default now()
);

create table surveys (
  id uuid primary key default gen_random_uuid(),
  child_id uuid not null references children on delete cascade,
  answers jsonb not null,             -- SurveyAnswers { group, dev: { 영역: 0~3 }, temp: { 항목: often|sometimes|rarely } }
  result jsonb not null,              -- SurveyResult
  created_at timestamptz default now()
);

create table recommendations (
  id uuid primary key default gen_random_uuid(),
  child_id uuid not null references children on delete cascade,
  play_id text not null,              -- data/plays.json의 id
  reason text,                        -- "즐거워해서 다음 단계" 등
  created_at timestamptz default now()
);

create table play_logs (
  id uuid primary key default gen_random_uuid(),
  child_id uuid not null references children on delete cascade,
  play_id text not null,
  done text not null check (done in ('done','partial','notDone')),
  reaction text not null check (reaction in ('enjoyed','neutral','hard')),
  memo text,
  photo_paths text[] not null default '{}', -- Storage 경로 (최대 4장), 보호자가 언제든 삭제
  created_at timestamptz default now()
);

create table reports (
  id uuid primary key default gen_random_uuid(),
  child_id uuid not null references children on delete cascade,
  period_from date not null,
  period_to date not null,
  summary text not null,
  share_token text unique,            -- 보호자가 공유를 켰을 때만 생성, 끄면 null
  created_at timestamptz default now()
);

create table posts (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references profiles on delete cascade,
  nickname text not null default '익명', -- 글 쓸 때의 닉네임 (프로필은 본인만 볼 수 있어서 글에 함께 저장)
  board text not null check (board in ('review','center','worry')),
  play_id text,                       -- 놀이 카드에서 바로 쓴 후기면 연결
  title text not null,
  body text not null,
  photo_path text,
  unverified boolean not null default false, -- '검증되지 않은 정보' 표시
  hidden boolean not null default false,     -- 관리자 검토 후 숨김
  created_at timestamptz default now()
);

create table comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references posts on delete cascade,
  author_id uuid not null references profiles on delete cascade,
  body text not null,
  created_at timestamptz default now()
);

create table post_reports (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references posts on delete cascade,
  reporter_id uuid not null references profiles on delete cascade,
  reason text not null,
  created_at timestamptz default now()
);

alter table profiles enable row level security;
alter table children enable row level security;
alter table surveys enable row level security;
alter table recommendations enable row level security;
alter table play_logs enable row level security;
alter table reports enable row level security;
alter table posts enable row level security;
alter table comments enable row level security;
alter table post_reports enable row level security;

create function is_my_child(c uuid) returns boolean language sql stable security definer as $$
  select exists (select 1 from children where id = c and parent_id = auth.uid())
$$;
create function is_admin() returns boolean language sql stable security definer as $$
  select coalesce((select is_admin from profiles where id = auth.uid()), false)
$$;

-- 아이 데이터: 보호자 본인만
create policy own_profile on profiles for all using (id = auth.uid()) with check (id = auth.uid());
create policy own_children on children for all using (parent_id = auth.uid()) with check (parent_id = auth.uid());
create policy own_surveys on surveys for all using (is_my_child(child_id)) with check (is_my_child(child_id));
create policy own_recs on recommendations for all using (is_my_child(child_id)) with check (is_my_child(child_id));
create policy own_logs on play_logs for all using (is_my_child(child_id)) with check (is_my_child(child_id));
create policy own_reports on reports for all using (is_my_child(child_id)) with check (is_my_child(child_id));
-- 센터 공유 리포트는 share_token으로 서버에서 조회 (service role), 로그인 불필요

-- 커뮤니티: 로그인한 부모 누구나 읽기, 본인 글만 수정, 관리자는 숨김 처리
create policy read_posts on posts for select using (auth.uid() is not null and (not hidden or is_admin()));
create policy write_posts on posts for insert with check (author_id = auth.uid());
create policy edit_posts on posts for update using (author_id = auth.uid() or is_admin());
create policy delete_posts on posts for delete using (author_id = auth.uid() or is_admin());
create policy read_comments on comments for select using (auth.uid() is not null);
create policy write_comments on comments for insert with check (author_id = auth.uid());
create policy delete_comments on comments for delete using (author_id = auth.uid() or is_admin());
create policy write_reports on post_reports for insert with check (reporter_id = auth.uid());
create policy read_reports on post_reports for select using (is_admin());

-- 가입하면 프로필 자동 생성 (닉네임: 가입 시 metadata.nickname, 없으면 이메일 앞부분)
create function handle_new_user() returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into profiles (id, nickname)
  values (new.id, coalesce(new.raw_user_meta_data->>'nickname', split_part(new.email, '@', 1)));
  return new;
end
$$;
create trigger on_auth_user_created after insert on auth.users for each row execute function handle_new_user();
