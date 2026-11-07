"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { BOARD_LABEL } from "@/types";
import { Button, TextButton } from "@/components/Button";
import { Card } from "@/components/Card";
import { EmptyState } from "@/components/EmptyState";
import { H1, PageHeader } from "@/components/PageHeader";
import { TAB_SAFE } from "@/components/TabBar";
import {
  FEEDBACK_LABEL,
  feedbackCount,
  feedbackOn,
  findPost,
  isUnverifiedClaim,
  postComments,
} from "@/lib/community";
import { timeAgo } from "@/lib/dates";
import {
  currentChild,
  deleteComment,
  saveComment,
  toggleFeedback,
  useLocalData,
  type PostFeedback,
} from "@/lib/local-store";
import { getPlay } from "@/lib/recommend";

const KINDS: PostFeedback[] = ["helpful", "cheer"];

export default function PostView() {
  const id = useSearchParams().get("id") ?? "";
  const data = useLocalData();
  const [draft, setDraft] = useState("");
  const [reported, setReported] = useState(false);

  if (!data) return <main className={`flex-1 ${TAB_SAFE}`} />;
  const post = findPost(data, id);
  if (!post) {
    return (
      <main className={`flex flex-1 flex-col gap-6 px-5 ${TAB_SAFE}`}>
        <PageHeader back />
        <EmptyState text="글을 찾을 수 없어요. 지워졌거나 주소가 바뀌었을 수 있어요." action="이야기로 돌아가기" href="/community" />
      </main>
    );
  }

  const now = new Date();
  const comments = postComments(data, post.id);
  const play = post.playId ? getPlay(post.playId) : undefined;
  const child = currentChild(data);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const body = draft.trim();
    if (!body || !post) return;
    saveComment({ postId: post.id, nickname: child ? `${child.nickname}네` : "익명", body });
    setDraft("");
  }

  return (
    <main className={`flex flex-1 flex-col px-5 ${TAB_SAFE}`}>
      <PageHeader
        back
        title={BOARD_LABEL[post.board]}
        right={
          <TextButton onClick={() => setReported(true)} disabled={reported}>
            {reported ? "신고됨" : "신고"}
          </TextButton>
        }
      />
      {reported && (
        <p role="status" className="rounded-[12px] bg-sage-xlight px-4 py-3 text-[13px] font-medium">
          신고가 접수됐어요. 관리자가 확인할게요.
        </p>
      )}

      <H1 className="mt-3">{post.title}</H1>
      <p className="mt-1.5 text-[12.5px] font-medium text-sub">
        {post.nickname} · {timeAgo(post.createdAt, now)}
      </p>
      {isUnverifiedClaim(post.title + post.body) && (
        <p className="mt-3 rounded-[12px] bg-warm px-4 py-3 text-[12.5px] font-medium leading-[1.5] text-sub">
          <b className="font-bold">검증되지 않은 정보</b> · 아이마다 달라요. 효과는 전문가와 확인해 주세요.
        </p>
      )}

      <Card className="mt-4">
        <p className="whitespace-pre-line text-[15px] font-medium leading-[1.7] text-memo">{post.body}</p>
        {play && (
          <Link href={`/play/${play.id}`} className="pressable mt-3 inline-flex min-h-11 items-center text-[13.5px] font-semibold text-sage-dark">
            이 놀이 보기 · {play.title}
          </Link>
        )}
      </Card>

      <div className="mt-3 grid grid-cols-2 gap-2">
        {KINDS.map((k) => {
          const on = feedbackOn(data, post.id, k);
          return (
            <button
              key={k}
              type="button"
              aria-pressed={on}
              onClick={() => toggleFeedback(post.id, k)}
              className={`pressable min-h-12 rounded-[13px] text-[14px] font-bold ${
                on ? "border-[1.5px] border-sage bg-sage-light text-sage-dark" : "border border-line bg-card text-sub"
              }`}
            >
              {FEEDBACK_LABEL[k]} {feedbackCount(data, post, k)}
            </button>
          );
        })}
      </div>

      <section className="mt-6">
        <h2 className="text-[15px] font-bold">
          댓글 <span className="text-sub">{comments.length}</span>
        </h2>
        {comments.length === 0 ? (
          <p className="mt-2 text-[13.5px] font-medium text-sub">아직 댓글이 없어요. 첫 마음을 나눠 주세요.</p>
        ) : (
          <ul className="mt-3 overflow-hidden rounded-[18px] bg-card">
            {comments.map((c) => (
              <li key={c.id} className="border-b border-line-soft px-[18px] py-3.5 last:border-b-0">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[13px] font-bold">
                    {c.nickname}
                    {c.mine && <span className="ml-1.5 text-[11.5px] font-semibold text-sage-dark">내 댓글</span>}
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="text-[12px] font-medium text-sub">{timeAgo(c.createdAt, now)}</span>
                    {c.mine && (
                      <TextButton onClick={() => deleteComment(c.id)} aria-label="내 댓글 삭제" className="-mr-2 text-[12.5px]">
                        삭제
                      </TextButton>
                    )}
                  </span>
                </div>
                <p className="mt-1 whitespace-pre-line text-[14px] font-medium leading-[1.55] text-memo">{c.body}</p>
              </li>
            ))}
          </ul>
        )}
      </section>

      <form onSubmit={submit} className="mt-4 flex flex-col gap-2">
        <label htmlFor="comment" className="text-[13px] font-semibold text-sub">
          댓글 쓰기
        </label>
        <textarea
          id="comment"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          rows={3}
          maxLength={500}
          placeholder="따뜻한 한마디를 남겨 주세요"
          className="rounded-[12px] border border-line bg-card px-4 py-3 text-[15px] font-medium leading-[1.5] outline-none placeholder:text-mute focus:border-sage focus:ring-[0.5px] focus:ring-sage"
        />
        <p className="text-[12px] font-medium text-sub">실명이나 센터 이름은 쓰지 말아 주세요. 닉네임으로만 보여요.</p>
        <Button type="submit" full disabled={draft.trim() === ""}>
          댓글 올리기
        </Button>
      </form>
    </main>
  );
}
