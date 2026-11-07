-- 사진 저장 공간 (schema.sql 다음에 실행)
-- 비공개 버킷. 파일 경로는 "<보호자 uid>/<파일명>"이고, 본인 폴더만 읽고 쓰고 지울 수 있음.
insert into storage.buckets (id, name, public) values ('photos', 'photos', false)
on conflict (id) do nothing;

create policy photos_own_read on storage.objects for select
  using (bucket_id = 'photos' and (storage.foldername(name))[1] = auth.uid()::text);
create policy photos_own_write on storage.objects for insert
  with check (bucket_id = 'photos' and (storage.foldername(name))[1] = auth.uid()::text);
create policy photos_own_delete on storage.objects for delete
  using (bucket_id = 'photos' and (storage.foldername(name))[1] = auth.uid()::text);
