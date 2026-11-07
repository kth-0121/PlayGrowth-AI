"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { ChevronRight } from "lucide-react";
import { BOARD_LABEL } from "@/types";
import { Button, TextButton } from "@/components/Button";
import { Card } from "@/components/Card";
import { AreaChip } from "@/components/Chip";
import { EmptyState } from "@/components/EmptyState";
import { Icon } from "@/components/Icon";
import { H1, PageHeader } from "@/components/PageHeader";
import { timeAgo } from "@/lib/dates";
import { commentsFor, DEMO_POSTS, isDemoPost } from "@/lib/demo-posts";
import { currentChild, deleteComment, loadComments, saveComment, useLocalData } from "@/lib/local-store";
import { getPlay } from "@/lib/recommend";

const INPUT =
  "w-full rounded-[12px] border border-line bg-card px-3.5 py-3 text-[15px] font-medium leading-[1.5] outline-none placeholder:text-mute focus:border-sage focus:ring-[0.5px] focus:ring-sage";

export default function PostView() {
  const id = useSearchParams().get("id") ?? "";
  const data = useLocalData();
  const [body, setBody] = useState("");

  const demo = isDemoPost(id);
  useEffect(() => {
    if (id && !demo) void loadComments(id);
  }, [id, demo]);

  if (!data) return <main className="flex-1" />;
  const post = [...data.posts, ...DEMO_POSTS].find((p) => p.id === id);
  if (!post) {
    return (
      <main className="flex flex-1 flex-col gap-6 px-5 pb-10">
        <PageHeader back />
        <EmptyState text="글을 찾을 수 없어요. 지워졌거나 주소가 잘못됐어요." action="커뮤니티로" href="/community" />
      </main>
    );
  }

  const now = new Date();
  const comments = commentsFor(post.id, data.comments);
  const play = post.playId ? getPlay(post.playId) : undefined;
  const child = currentChild(data);
  const text = body.trim();

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!text || !post) return;
    saveComment({ postId: post.id, nickname: child ? `${child.nickname}네` : "익명", body: text }, demo);
    setBody("");
  }

  return (
    <main className="flex flex-1 flex-col px-5 pb-[calc(32px+env(safe-area-inset-bottom))]">
      <PageHeader back title={BOARD_LABEL[post.board]} />

      <article className="mt-2">
        <H1>{post.title}</H1>
        <p className="mt-2 text-[12.5px] font-medium text-mute">
          {post.nickname} · {timeAgo(post.createdAt, now)}
        </p>
        <p className="mt-4 whitespace-pre-line text-[15px] font-medium leading-[1.65]">{post.body}</p>
      </article>

      {play && (
        <Link href={`/play/${play.id}`} className="pressable mt-5 block">
          <Card className="flex items-center gap-3">
            <div className="min-w-0 flex-1">
              <p className="text-[12px] font-semibold text-sub">이 글의 놀이</p>
              <div className="mt-1.5 flex items-center gap-2">
                <AreaChip area={play.area} />
                <span className="truncate text-[14.5px] font-bold">{play.title}</span>
              </div>
            </div>
            <Icon icon={ChevronRight} size={18} className="shrink-0 text-mute" />
          </Card>
        </Link>
      )}

      <section className="mt-8" aria-label="댓글">
        <h2 className="text-[15px] font-bold">
          댓글 <span className="text-sage-dark">{comments.length}</span>
        </h2>

        {comments.length === 0 ? (
          <p className="mt-3 text-[13.5px] font-medium text-sub">아직 댓글이 없어요. 첫 댓글을 남겨 보세요.</p>
        ) : (
          <ul className="mt-3 overflow-hidden rounded-[18px] bg-card">
            {comments.map((c) => (
              <li key={c.id} className="border-b border-line-soft px-[18px] py-3.5 last:border-b-0">
                <div className="flex items-center gap-2">
                  <span className="text-[13px] font-bold">{c.nickname}</span>
                  {c.mine && <span className="text-[11.5px] font-semibold text-sage-dark">내 댓글</span>}
                  <span className="text-[12px] font-medium text-mute">{timeAgo(c.createdAt, now)}</span>
                  {c.mine && (
                    <TextButton
                      onClick={() => confirm("댓글을 지울까요?") && deleteComment(c.id)}
                      className="ml-auto text-[12.5px]"
                    >
                      삭제
                    </TextButton>
                  )}
                </div>
                <p className="mt-1 whitespace-pre-line text-[14px] font-medium leading-[1.55]">{c.body}</p>
              </li>
            ))}
          </ul>
        )}

        <form onSubmit={submit} className="mt-4 flex flex-col gap-2">
          <label htmlFor="comment" className="sr-only">
            댓글 쓰기
          </label>
          <textarea
            id="comment"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={3}
            maxLength={500}
            placeholder="따뜻한 한마디를 남겨 주세요"
            className={INPUT}
          />
          <p className="text-[12px] font-medium leading-[1.5] text-sub">
            아이 실명·얼굴 사진·연락처는 쓰지 말아 주세요. 다른 부모의 경험은 참고만 하고, 걱정되는 점은 전문기관과
            상담해 주세요.
          </p>
          <Button type="submit" disabled={!text} className="self-end px-6">
            댓글 등록
          </Button>
        </form>
      </section>
    </main>
  );
}
