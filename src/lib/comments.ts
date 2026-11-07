"use client";
// 커뮤니티 댓글: 캐시에 두지 않고 화면에서 바로 서버를 읽고 씀.
// 삭제 권한은 서버 RLS가 판단 (본인 또는 운영자)
import { supabase } from "./supabase";
import { bumpComments, myUserId } from "./local-store";

export type Comment = { id: string; postId: string; authorId: string; nickname: string; body: string; createdAt: string };

type Row = { id: string; post_id: string; author_id: string; nickname: string; body: string; created_at: string };
const toComment = (r: Row): Comment => ({
  id: r.id,
  postId: r.post_id,
  authorId: r.author_id,
  nickname: r.nickname,
  body: r.body,
  createdAt: r.created_at,
});

export async function fetchComments(postId: string): Promise<Comment[]> {
  const { data, error } = await supabase
    .from("comments")
    .select("id, post_id, author_id, nickname, body, created_at")
    .eq("post_id", postId)
    .order("created_at");
  if (error) console.error("[noridari] 댓글 불러오기 실패", error.message);
  return ((data ?? []) as Row[]).map(toComment);
}

export async function addComment(postId: string, nickname: string, body: string): Promise<Comment | null> {
  const authorId = myUserId();
  if (!authorId) return null;
  const { data, error } = await supabase
    .from("comments")
    .insert({ post_id: postId, author_id: authorId, nickname, body })
    .select("id, post_id, author_id, nickname, body, created_at")
    .single();
  if (error || !data) {
    console.error("[noridari] 댓글 저장 실패", error?.message);
    return null;
  }
  bumpComments(postId, 1);
  return toComment(data as Row);
}

export async function deleteComment(id: string, postId: string): Promise<boolean> {
  const { error, count } = await supabase.from("comments").delete({ count: "exact" }).eq("id", id);
  if (error || !count) {
    console.error("[noridari] 댓글 삭제 실패", error?.message ?? "권한 없음");
    return false;
  }
  bumpComments(postId, -1);
  return true;
}
