"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import type { Done, Reaction } from "@/types";
import { BottomSheet } from "@/components/BottomSheet";
import { Button, ButtonLink, TextButton } from "@/components/Button";
import { AreaChip, DONE_LABEL, REACTION_LABEL, ReactionTag } from "@/components/Chip";
import { Illustration } from "@/components/Illustration";
import { H1, PageHeader } from "@/components/PageHeader";
import { SegmentedControl } from "@/components/SegmentedControl";
import { PageSkeleton } from "@/components/Skeleton";
import { NoResult } from "@/components/StatusViews";
import { toast } from "@/components/Toast";
import { logTimeLabel } from "@/lib/dates";
import { deletePlayLog, updatePlayLog, useLocalData } from "@/lib/local-store";
import { getPlay } from "@/lib/recommend";

const DONE: Done[] = ["done", "partial", "notDone"];
const REACTIONS: Reaction[] = ["enjoyed", "neutral", "hard"];

export default function LogDetail() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const data = useLocalData();
  const [editing, setEditing] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [done, setDone] = useState<Done>("done");
  const [reaction, setReaction] = useState<Reaction>("neutral");
  const [memo, setMemo] = useState("");

  if (!data) return <PageSkeleton withTab={false} />;
  const log = data.playLogs.find((l) => l.id === id);
  if (!log) {
    return (
      <main className="flex flex-1 flex-col gap-4 px-5 pb-10">
        <PageHeader back />
        <NoResult text="이 기록을 찾을 수 없어요. 이미 지웠거나 다른 기기에서 남긴 기록일 수 있어요." action={<Link href="/logs" className="inline-flex min-h-11 items-center text-[14px] font-semibold text-sage-dark">놀이 일기로 가기</Link>} />
      </main>
    );
  }
  const play = getPlay(log.playId);

  function startEdit() {
    if (!log) return;
    setDone(log.done);
    setReaction(log.reaction);
    setMemo(log.memo ?? "");
    setEditing(true);
  }
  function save() {
    if (!log) return;
    updatePlayLog(log.id, { done, reaction, memo: memo.trim() || null });
    setEditing(false);
    toast("기록을 고쳤어요");
  }
  function remove() {
    if (!log) return;
    deletePlayLog(log.id);
    toast("기록을 지웠어요");
    router.push("/logs");
  }

  return (
    <main className="flex flex-1 flex-col px-5 pb-[calc(32px+env(safe-area-inset-bottom))]">
      <PageHeader
        back
        title="놀이 기록"
        right={!editing && <TextButton onClick={startEdit} className="-mr-2">고치기</TextButton>}
      />

      <p className="mt-2 text-[12px] font-semibold text-mute">{logTimeLabel(log.createdAt)}</p>
      <div className="mt-1.5 flex items-start justify-between gap-3">
        <H1>{play?.title ?? "삭제된 놀이"}</H1>
        {play && <AreaChip area={play.area} />}
      </div>

      {editing ? (
        <div className="mt-6 flex flex-col gap-6">
          <div>
            <p className="mb-2 text-[13px] font-semibold text-sub">놀이를 해 봤나요?</p>
            <SegmentedControl label="수행 여부" value={done} onChange={setDone} options={DONE.map((d) => ({ value: d, label: DONE_LABEL[d] }))} />
          </div>
          <div>
            <p className="mb-2 text-[13px] font-semibold text-sub">아이 반응은요?</p>
            <SegmentedControl label="아이 반응" value={reaction} onChange={setReaction} options={REACTIONS.map((r) => ({ value: r, label: REACTION_LABEL[r] }))} />
          </div>
          <label className="flex flex-col gap-2">
            <span className="text-[13px] font-semibold text-sub">메모</span>
            <textarea
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
              rows={4}
              maxLength={500}
              className="rounded-[12px] border border-line bg-card p-3.5 text-[15px] font-medium leading-[1.5] outline-none focus:border-sage focus:ring-[0.5px] focus:ring-sage"
            />
          </label>
          <div className="flex gap-2">
            <Button onClick={save} className="flex-1">
              고친 내용 저장
            </Button>
            <Button variant="secondary" onClick={() => setEditing(false)} className="w-[92px] shrink-0 px-0">
              취소
            </Button>
          </div>
        </div>
      ) : (
        <>
          <section className="mt-5 rounded-[18px] bg-card p-[18px]">
            {log.memo ? (
              <p className="text-[15px] font-medium leading-[1.6] text-memo">“{log.memo}”</p>
            ) : (
              <p className="text-[14px] font-medium text-sub">남긴 메모가 없어요.</p>
            )}
            {log.photoPath && (
              <div className="mt-3 overflow-hidden rounded-[12px]" role="img" aria-label="놀이 사진">
                {/* TODO(DB 연결): Storage 이미지로 교체 */}
                <Illustration height={180} seed={log.id.length} />
              </div>
            )}
            <div className="mt-4 flex gap-1.5">
              <ReactionTag reaction={log.reaction} />
              <ReactionTag done={log.done} />
            </div>
          </section>

          {play && (
            <ButtonLink href={`/play/${play.id}`} variant="secondary" full className="mt-3">
              이 놀이 다시 보기
            </ButtonLink>
          )}

          <TextButton onClick={() => setConfirmDelete(true)} className="mt-auto self-start pt-8 text-danger!">
            이 기록 지우기
          </TextButton>
        </>
      )}

      <BottomSheet open={confirmDelete} title="이 기록을 지울까요?" onClose={() => setConfirmDelete(false)}>
        <p className="text-[14px] font-medium leading-[1.55] text-sub">지운 기록은 되돌릴 수 없고, 상담 리포트에서도 빠져요.</p>
        <div className="mt-5 flex gap-2">
          <Button variant="secondary" onClick={() => setConfirmDelete(false)} className="flex-1">
            그대로 둘게요
          </Button>
          <button
            type="button"
            onClick={remove}
            className="pressable h-12 flex-1 rounded-[13px] border-[1.5px] border-danger bg-card text-[15px] font-bold text-danger"
          >
            지우기
          </button>
        </div>
      </BottomSheet>
    </main>
  );
}
