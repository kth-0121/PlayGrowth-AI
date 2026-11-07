"use client";

import { useState } from "react";
import { BOARD_LABEL, type Board } from "@/types";
import { Fab } from "@/components/Button";
import { ListGroup, ListRow } from "@/components/ListRow";
import { H1, PageHeader } from "@/components/PageHeader";
import { PageSkeleton } from "@/components/Skeleton";
import { NoResult } from "@/components/StatusViews";
import { TAB_FAB_SAFE } from "@/components/TabBar";
import { timeAgo } from "@/lib/dates";
import { useLocalData } from "@/lib/local-store";
import { DEMO_COMMENTS, DEMO_POSTS } from "@/mocks/community";

const BOARDS: { key: Board; label: string }[] = [
  { key: "review", label: "놀이 후기" },
  { key: "center", label: "센터 준비" },
  { key: "worry", label: "고민 나누기" },
];

export default function CommunityPage() {
  const data = useLocalData();
  const [board, setBoard] = useState<Board>("review");

  if (!data) return <PageSkeleton />;
  const now = new Date();
  const posts = [...data.posts, ...DEMO_POSTS].filter((p) => p.board === board);
  const commentCount = (id: string) =>
    DEMO_COMMENTS.filter((c) => c.postId === id).length + data.comments.filter((c) => c.postId === id).length;

  return (
    <main className={`flex flex-1 flex-col px-5 ${TAB_FAB_SAFE}`}>
      <PageHeader logo />
      <H1 className="mt-2">이야기</H1>
      <p className="mt-1 text-[13.5px] font-medium text-sub">같은 시간을 보내는 부모들의 {BOARD_LABEL[board]}</p>

      <div role="tablist" aria-label="게시판" className="mt-4 flex gap-5 border-b border-line">
        {BOARDS.map((b) => {
          const on = board === b.key;
          return (
            <button
              key={b.key}
              role="tab"
              aria-selected={on}
              onClick={() => setBoard(b.key)}
              className={`pressable -mb-px min-h-11 border-b-2 text-[15px] ${
                on ? "border-ink font-bold text-ink" : "border-transparent font-semibold text-mute"
              }`}
            >
              {b.label}
            </button>
          );
        })}
      </div>

      <p className="mt-3 text-[12px] font-medium text-sub">
        실명·센터 이름은 쓰지 않아요. 효과를 단정하는 글에는 &lsquo;검증되지 않은 정보&rsquo;가 붙어요.
      </p>

      <div className="mt-3">
        {posts.length === 0 ? (
          <NoResult text="아직 글이 없어요. 첫 이야기를 남겨 보세요." />
        ) : (
          <ListGroup>
            {posts.map((p) => (
              <ListRow key={p.id} href={`/community/${p.id}`}>
                {p.unverified && (
                  <span className="mb-1.5 inline-flex rounded-[7px] bg-neutral-chip px-2 py-1 text-[12px] font-bold leading-none text-sub">
                    검증되지 않은 정보
                  </span>
                )}
                <p className="text-[15px] font-bold leading-[1.4]">{p.title}</p>
                <p className="mt-1 line-clamp-2 text-[13.5px] font-medium leading-[1.55] text-sub">{p.body}</p>
                <p className="mt-1.5 text-[12px] font-medium text-mute">
                  {p.nickname} · {timeAgo(p.createdAt, now)} · 댓글 {commentCount(p.id)}
                </p>
              </ListRow>
            ))}
          </ListGroup>
        )}
      </div>

      <Fab href={`/community/write?board=${board}`} label="글쓰기" />
    </main>
  );
}
