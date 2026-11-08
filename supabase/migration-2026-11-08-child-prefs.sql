-- 이미 만든 DB에 아이 관심(좋아하는 놀이·더 함께하고 싶은 영역) 칸 추가. Supabase SQL Editor에서 한 번 실행.
-- schema.sql의 children 테이블과 같은 내용 (src/types.ts ChildPrefs)
alter table children add column if not exists likes text[] not null default '{}';
alter table children add column if not exists concern_areas text[] not null default '{}';
