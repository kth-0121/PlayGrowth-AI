"use client";

import Link from "next/link";
import { useState } from "react";
import type { Done, Reaction } from "@/types";
import { Choice, MissingStep, Notice, PageTitle, PrimaryButton, PrimaryLink } from "@/components/ui";
import { currentChild, savePlayLog, useLocalData } from "@/lib/local-store";

const DONE: { key: Done; label: string }[] = [
  { key: "done", label: "완료" },
  { key: "partial", label: "일부 진행" },
  { key: "notDone", label: "못함" },
];

const REACTION: { key: Reaction; emoji: string; label: string }[] = [
  { key: "enjoyed", emoji: "😆", label: "즐거워함" },
  { key: "neutral", emoji: "🙂", label: "보통" },
  { key: "hard", emoji: "😥", label: "어려워함" },
];

export default function LogForm({ playId, playTitle }: { playId: string; playTitle: string }) {
  const data = useLocalData();
  const [done, setDone] = useState<Done | null>(null);
  const [reaction, setReaction] = useState<Reaction | null>(null);
  const [memo, setMemo] = useState("");
  const [preview, setPreview] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  if (!data) return <p className="text-muted">불러오는 중…</p>;
  const child = currentChild(data);
  if (!child) return <MissingStep text="아이 정보를 먼저 입력해 주세요." href="/child" label="아이 정보 입력하기" />;

  function pickPhoto(file: File | null) {
    if (preview) URL.revokeObjectURL(preview);
    setPreview(file ? URL.createObjectURL(file) : null);
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!child || !done || !reaction) return;
    // TODO(DB 연결): 사진을 Storage에 올리고 photoPath 저장
    savePlayLog({ childId: child.id, playId, done, reaction, memo: memo.trim() || null, photoPath: null });
    setSaved(true);
  }

  if (saved) {
    return (
      <div className="flex flex-col items-center gap-5 py-10 text-center">
        <span className="text-5xl">🎉</span>
        <h1 className="text-2xl font-bold">기록했어요!</h1>
        <p className="text-sm text-muted">
          {child.nickname}와(과) 함께한 시간이 쌓이고 있어요.
          <br />
          남겨 주신 기록은 다음 놀이를 고를 때 반영돼요.
        </p>
        {/* 기록 모아보기(/logs)는 기록·리포트 담당 화면 */}
        <div className="flex w-full flex-col gap-3">
          <PrimaryLink href="/logs">기록 모아보기</PrimaryLink>
          <Link href={`/play/${playId}`} className="text-sm text-muted underline">
            놀이 카드로 돌아가기
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-6">
      <div>
        <Link href={`/play/${playId}`} className="text-sm text-muted">
          ← {playTitle}
        </Link>
        <div className="mt-2">
          <PageTitle step="4 / 4" title="오늘 놀이는 어땠나요?" />
        </div>
      </div>

      <fieldset className="flex flex-col gap-2">
        <legend className="mb-2 font-bold">놀이를 해 봤나요?</legend>
        <div className="grid grid-cols-3 gap-2">
          {DONE.map((d) => (
            <Choice key={d.key} on={done === d.key} onClick={() => setDone(d.key)} className="h-12">
              {d.label}
            </Choice>
          ))}
        </div>
      </fieldset>

      <fieldset className="flex flex-col gap-2">
        <legend className="mb-2 font-bold">아이 반응은요?</legend>
        <div className="grid grid-cols-3 gap-2">
          {REACTION.map((r) => (
            <Choice
              key={r.key}
              on={reaction === r.key}
              onClick={() => setReaction(r.key)}
              className="flex flex-col items-center gap-1 py-3"
            >
              <span className="text-3xl">{r.emoji}</span>
              {r.label}
            </Choice>
          ))}
        </div>
      </fieldset>

      <label className="flex flex-col gap-1.5 font-bold">
        메모 <span className="text-xs font-normal text-muted">아이가 한 말, 좋아했던 순간, 어려웠던 점 등 (선택)</span>
        <textarea
          value={memo}
          onChange={(e) => setMemo(e.target.value)}
          rows={4}
          maxLength={500}
          className="rounded-xl border border-line bg-card p-3 text-base font-normal"
        />
      </label>

      <label className="flex flex-col gap-2 font-bold">
        사진 <span className="text-xs font-normal text-muted">나중에 돌아보기 위한 용도예요 (선택)</span>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => pickPhoto(e.target.files?.[0] ?? null)}
          className="text-sm font-normal file:mr-3 file:rounded-full file:border-0 file:bg-brand-soft file:px-4 file:py-2 file:text-brand"
        />
        {/* eslint-disable-next-line @next/next/no-img-element -- 로컬 blob 미리보기 */}
        {preview && <img src={preview} alt="선택한 사진 미리보기" className="max-h-60 rounded-xl object-cover" />}
      </label>

      <Notice>사진으로 발달 수준을 판단하지 않아요. 사진은 보호자만 볼 수 있고 언제든 지울 수 있어요.</Notice>

      <PrimaryButton type="submit" disabled={!done || !reaction}>
        기록 저장
      </PrimaryButton>
    </form>
  );
}
