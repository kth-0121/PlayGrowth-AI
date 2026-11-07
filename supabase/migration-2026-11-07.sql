-- 2026-11-07 변경 (이미 schema.sql을 실행한 DB에 적용). 새로 만드는 DB는 schema.sql만 실행하면 됨
alter table profiles add column if not exists center_name text,
  add column if not exists wait_start date,
  add column if not exists consult_date date;

alter table play_logs add column if not exists photo_paths text[] not null default '{}';
update play_logs set photo_paths = array[photo_path] where photo_path is not null;
alter table play_logs drop column if exists photo_path;

alter table posts add column if not exists nickname text not null default '익명';
