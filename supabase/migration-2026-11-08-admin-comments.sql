-- 2026-11-08: 운영자 권한 보호 + 댓글 닉네임
-- 1) 일반 사용자가 스스로 is_admin을 바꾸지 못하게: 프로필은 정해진 칸만 수정 가능, 추가·삭제 불가 (가입 트리거는 security definer라 영향 없음)
revoke insert, update, delete on profiles from anon, authenticated;
grant update (nickname, center_name, wait_start, consult_date) on profiles to authenticated;

-- 2) 댓글에도 닉네임 저장 (프로필은 본인만 볼 수 있으므로)
alter table comments add column if not exists nickname text not null default '익명';

-- 운영자 지정 (가입한 뒤 이메일로 지정. 대시보드 SQL Editor에서만 실행 가능)
-- update profiles set is_admin = true where id = (select id from auth.users where email = '운영자@이메일');
