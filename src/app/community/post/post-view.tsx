"use client";
// 글 상세: 본문 + 댓글. 내가 쓴 글·댓글은 내가, 운영자는 모든 글·댓글을 지울 수 있음
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Button, TextButton } from "@/components/Button";
import { EmptyState } from "@/components/EmptyState";
import { PageHeader } from "@/components/PageHeader";
import { PrivacyCheckDialog } from "@/components/PrivacyCheckDialog";
import { timeAgo } from "@/lib/dates";
import { DEMO_POSTS } from "@/lib/demo-posts";
import { addComment, deleteComment, fetchComments, type Comment } from "@/lib/comments";
import { findIdentifyingTerms } from "@/lib/privacy";
import { canDelete, currentChild, deletePost, myUserId, useLocalData } from "@/lib/local-store";
import { BOARD_LABEL } from "@/types";

export default function PostView() {
  const router = useRouter();
  const id = useSearchParams().get("id") ?? "";
  const data = useLocalData();
  const post = data ? [...data.posts, ...DEMO_POSTS].find((p) => p.id === id) : undefined;
  const isDemo = DEMO_POSTS.some((p) => p.id === id);
  const [comments, setComments] = useState<Comment[] | null>(null);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [checkTerms, setCheckTerms] = useState<string[]>([]);

  useEffect(() => {
    if (id && !isDemo) fetchComments(id).then(setComments);
  }, [id, isDemo]);

  if (!data) return <main className="flex-1" />;
  if (!post) {
    return (
      <main className="flex flex-1 flex-col gap-6 px-5 pb-10">
        <PageHeader back />
        <EmptyState text="지워졌거나 없는 글이에요." action="이야기 목록으로" href="/community" />
      </main>
    );
  }
  const now = new Date();
  const child = currentChild(data);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const body = text.trim();
    if (!body || busy || isDemo) return;
    // 실명·기관명으로 보이는 표현이 있으면 올리기 전에 한 번 더 확인
    const terms = findIdentifyingTerms(body);
    if (terms.length) setCheckTerms(terms);
    else send();
  }

  async function send() {
    setCheckTerms([]);
    const body = text.trim();
    setBusy(true);
    const c = await addComment(id, child ? `${child.nickname}네` : "익명", body);
    if (c) {
      setComments((prev) => [...(prev ?? []), c]);
      setText("");
    }
    setBusy(false);
  }

  async function removeComment(c: Comment) {
    if (!confirm("이 댓글을 지울까요? 되돌릴 수 없어요.")) return;
    if (await deleteComment(c.id, id)) setComments((prev) => (prev ?? []).filter((x) => x.id !== c.id));
  }

  function removePost() {
    if (!confirm("이 글을 지울까요? 댓글도 함께 지워지고 되돌릴 수 없어요.")) return;
    deletePost(id);
    router.push("/community");
  }

  return (
    <main className="flex flex-1 flex-col px-5 pb-[calc(32px+env(safe-area-inset-bottom))]">
      <PageHeader back title={BOARD_LABEL[post.board]} />

      <article className="mt-2 rounded-[18px] bg-card p-[18px]">
        <h1 className="text-[18px] font-bold leading-[1.4]">{post.title}</h1>
        <p className="mt-1.5 text-[12px] font-medium text-mute">
          {post.nickname} · {timeAgo(post.createdAt, now)}
        </p>
        <p className="mt-4 whitespace-pre-wrap text-[15px] font-medium leading-[1.65]">{post.body}</p>
        {canDelete(post.authorId) && (
          <div className="mt-3 flex justify-end">
            <TextButton onClick={removePost} className="text-danger">
              {post.authorId === myUserId() ? "글 삭제" : "운영자 삭제"}
            </TextButton>
          </div>
        )}
      </article>

      <h2 className="mt-7 text-[13px] font-semibold text-sub">댓글 {isDemo ? post.comments : (comments?.length ?? "…")}</h2>
      {isDemo ? (
        <p className="mt-2 text-[13px] font-medium text-sub">예시 글이라 댓글을 볼 수 없어요.</p>
      ) : (
        <ul className="mt-2 flex flex-col gap-2">
          {comments?.map((c) => (
            <li key={c.id} className="rounded-[14px] bg-card px-4 py-3">
              <div className="flex items-start justify-between gap-2">
                <p className="whitespace-pre-wrap text-[14px] font-medium leading-[1.55]">{c.body}</p>
                {canDelete(c.authorId) && (
                  <TextButton onClick={() => removeComment(c)} className="shrink-0 text-danger" aria-label="댓글 삭제">
                    {c.authorId === myUserId() ? "삭제" : "운영자 삭제"}
                  </TextButton>
                )}
              </div>
              <p className="mt-1 text-[12px] font-medium text-mute">
                {c.nickname} · {timeAgo(c.createdAt, now)}
              </p>
            </li>
          ))}
          {comments?.length === 0 && <p className="text-[13px] font-medium text-sub">첫 댓글을 남겨 보세요.</p>}
        </ul>
      )}

      {!isDemo && (
        <form onSubmit={submit} className="mt-5 flex flex-col gap-2">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={3}
            maxLength={300}
            placeholder="따뜻한 말 한마디를 남겨 주세요. 실명·센터 이름은 쓰지 말아 주세요."
            className="rounded-[12px] border border-line bg-card p-3.5 text-[15px] font-medium leading-[1.5] outline-none placeholder:text-mute focus:border-sage focus:ring-[0.5px] focus:ring-sage"
          />
          <Button type="submit" full disabled={!text.trim() || busy}>
            {busy ? "올리는 중…" : "댓글 남기기"}
          </Button>
        </form>
      )}
      <PrivacyCheckDialog terms={checkTerms} onEdit={() => setCheckTerms([])} onConfirm={send} />
    </main>
  );
}
