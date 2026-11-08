"use client";
import { createClient } from "@supabase/supabase-js";

// 브라우저용 클라이언트. 공개 키(publishable/anon)만 사용하고, 접근 제한은 DB의 RLS가 담당.
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
);

/** 사진을 내 폴더(<uid>/)에 올리고 저장 경로를 돌려줌 */
export async function uploadPhoto(file: File): Promise<string> {
  const { data } = await supabase.auth.getUser();
  if (!data.user) throw new Error("로그인이 필요해요");
  const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const path = `${data.user.id}/${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage.from("photos").upload(path, file, { contentType: file.type });
  if (error) throw error;
  return path;
}

/** 비공개 사진을 잠깐 볼 수 있는 주소 (1시간) */
export async function photoUrl(path: string): Promise<string | null> {
  const { data } = await supabase.storage.from("photos").createSignedUrl(path, 3600);
  return data?.signedUrl ?? null;
}
