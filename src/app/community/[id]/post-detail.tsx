"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import { Flag, SendHorizontal } from "lucide-react";
import { BOARD_LABEL } from "@/types";
import { BottomSheet } from "@/components/BottomSheet";
import { Button } from "@/components/Button";
import { Icon } from "@/components/Icon";
import { H1, PageHeader } from "@/components/PageHeader";
import { PageSkeleton } from "@/components/Skeleton";
import { NoResult } from "@/components/StatusViews";
import { toast } from "@/components/Toast";
import { timeAgo } from "@/lib/dates";
import { currentChild, saveComment, useLocalData } from "@/lib/local-store";
import { getPlay } from "@/lib/recommend";
import { DEMO_COMMENTS, DEMO_POSTS } from "@/mocks/community";

const REASONS = ["실명·기관명 등 개인정보가 있어요", "효과를 단정하거나 잘못된 정보예요", "광고·홍보예요", "불쾌하거나 상처 주는 말이에요"];

export default function PostDetail() {
  const { id } = useParams<{ id: string }>();
  const data = useLocalData();
  const [reportOpen, setReportOpen] = useState(false);
  const [reason, setReason] = useState<string | null>(null);
  const [text, setText] = useState("");

  if (!data) return <PageSkeleton withTab={false} />;
  const post = [...data.posts, ...DEMO_POSTS].find((p) => p.id === id);
  if (!post) {
    return (
      <main className="flex flex-1 flex-col gap-4 px-5 pb-10">
        <PageHeader back />
        <NoResult
          text="글을 찾을 수 없어요. 지워졌거나 숨겨진 글일 수 있어요."
          action={<Link href="/community" className="inline-flex min-h-11 items-center text-[14px] font-semibold text-sage-dark">이야기로 가기</Link>}
        />
      </main>
    );
  }
  const now = new Date();
  const comments = [...DEMO_COMMENTS, ...data.comments].filter((c) => c.postId === post.id);
  const play = post.playId ? getPlay(post.playId) : undefined;
  const child = currentChild(data);

  function send(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim() || !post) return;
    saveComment({ postId: post.id, nickname: child ? `${child.nickname}네` : "익명", body: text.trim() });
    setText("");
  }
  function report() {
    // TODO(DB 연결): post_reports에 저장 → 관리자 검토
    setReportOpen(false);
    setReason(null);
    toast("신고했어요. 관리자가 확인할게요");
  }

  return (
    <main className="flex flex-1 flex-col px-5 pb-[calc(96px+env(safe-area-inset-bottom))]">
      <PageHeader
        back
        title={BOARD_LABEL[post.board]}
        right={
          <button
            type="button"
            onClick={() => setReportOpen(true)}
            aria-label="이 글 신고"
            className="pressable -mr-2.5 flex size-11 items-center justify-center text-sub"
          >
            <Icon icon={Flag} size={18} />
          </button>
        }
      />

      {post.unverified && (
        <p className="mt-2 rounded-[12px] bg-neutral-chip px-4 py-3 text-[13px] font-medium leading-[1.55] text-sub">
          <b className="font-bold text-ink">검증되지 않은 정보</b> · 한 가정의 경험이에요. 아이마다 속도와 반응이 달라요.
        </p>
      )}

      <H1 className="mt-4">{post.title}</H1>
      <p className="mt-1.5 text-[12px] font-medium text-mute">
        {post.nickname} · {timeAgo(post.createdAt, now)}
      </p>
      <p className="mt-4 whitespace-pre-line text-[15px] font-medium leading-[1.65]">{post.body}</p>

      {play && (
        <Link href={`/play/${play.id}`} className="pressable mt-5 flex min-h-[52px] items-center rounded-[14px] bg-card px-4 text-[14px] font-semibold">
          <span className="text-sub">후기 놀이 ·&nbsp;</span>
          <span className="truncate">{play.title}</span>
        </Link>
      )}

      <h2 className="mt-8 text-[13px] font-semibold text-sub">댓글 {comments.length}</h2>
      {comments.length === 0 ? (
        <p className="mt-2 text-[14px] font-medium text-sub">첫 댓글로 마음을 나눠 주세요.</p>
      ) : (
        <ul className="mt-2 overflow-hidden rounded-[18px] bg-card">
          {comments.map((c) => (
            <li key={c.id} className="border-b border-line-soft px-[18px] py-3.5 last:border-b-0">
              <p className="text-[12px] font-semibold text-mute">
                {c.nickname} · {timeAgo(c.createdAt, now)}
              </p>
              <p className="mt-1 text-[14px] font-medium leading-[1.55]">{c.body}</p>
            </li>
          ))}
        </ul>
      )}

      <form
        onSubmit={send}
        className="fixed bottom-0 left-1/2 flex w-full max-w-[480px] -translate-x-1/2 items-center gap-2 border-t border-line bg-card px-5 pb-[calc(12px+env(safe-area-inset-bottom))] pt-3"
      >
        <label className="sr-only" htmlFor="comment">
          댓글
        </label>
        <input
          id="comment"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="따뜻한 한마디를 남겨 주세요"
          maxLength={300}
          className="h-11 min-w-0 flex-1 rounded-[12px] border border-line bg-bg px-3.5 text-[15px] font-medium outline-none placeholder:text-mute focus:border-sage"
        />
        <button
          type="submit"
          disabled={!text.trim()}
          aria-label="댓글 보내기"
          className="pressable flex size-11 shrink-0 items-center justify-center rounded-[12px] bg-sage text-white disabled:opacity-40"
        >
          <Icon icon={SendHorizontal} size={18} />
        </button>
      </form>

      <BottomSheet open={reportOpen} title="신고하는 이유" onClose={() => setReportOpen(false)}>
        <div className="flex flex-col gap-2" role="radiogroup" aria-label="신고 이유">
          {REASONS.map((r) => {
            const on = reason === r;
            return (
              <button
                key={r}
                type="button"
                role="radio"
                aria-checked={on}
                onClick={() => setReason(r)}
                className={`pressable min-h-12 rounded-[12px] px-4 text-left text-[15px] font-semibold ${
                  on ? "border-[1.5px] border-sage bg-sage-xlight" : "border border-line bg-card"
                }`}
              >
                {r}
              </button>
            );
          })}
        </div>
        <p className="mt-3 text-[12px] font-medium text-sub">신고한 사람은 글쓴이에게 알려지지 않아요.</p>
        <Button full className="mt-4" disabled={!reason} onClick={report}>
          신고하기
        </Button>
      </BottomSheet>
    </main>
  );
}
