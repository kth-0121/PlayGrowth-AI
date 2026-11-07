"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import type { Reaction } from "@/types";
import { REACTION_LABEL } from "@/lib/questions";
import { getPlay } from "@/lib/recommend";
import { saveLog, selectCard, useDB } from "@/lib/store";

const REACTIONS: { key: Reaction; emoji: string }[] = [
  { key: "done", emoji: "🙂" },
  { key: "difficult", emoji: "😥" },
  { key: "loved", emoji: "😆" },
];

export default function LogForm() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const db = useDB();
  const [reaction, setReaction] = useState<Reaction | null>(null);
  const [memo, setMemo] = useState("");
  const [preview, setPreview] = useState<string | null>(null);

  function pickPhoto(file: File | null) {
    if (preview) URL.revokeObjectURL(preview);
    setPreview(file ? URL.createObjectURL(file) : null);
  }

  if (!db) return <p className="text-muted">불러오는 중…</p>;
  const data = selectCard(db, id);
  const play = data && getPlay(data.card.play_id);
  if (!data || !play) return <p>카드를 찾을 수 없어요.</p>;

  const shared = data.child?.share_consent ?? false;

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!reaction) return;
    // TODO(Supabase): 사진을 Storage에 올리고 photo_path 저장
    saveLog({ card_id: id, reaction, memo: memo.trim() || null, photo_path: null });
    router.push(`/card/${id}`);
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-6">
      <div>
        <Link href={`/card/${id}`} className="text-sm text-muted">
          ← {play.title}
        </Link>
        <h1 className="mt-2 text-2xl font-bold">오늘 놀이는 어땠나요?</h1>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {REACTIONS.map((r) => (
          <button
            key={r.key}
            type="button"
            onClick={() => setReaction(r.key)}
            aria-pressed={reaction === r.key}
            className={`flex flex-col items-center gap-1 rounded-2xl border py-4 text-sm ${
              reaction === r.key ? "border-brand bg-brand-soft font-bold text-brand" : "border-line bg-card"
            }`}
          >
            <span className="text-3xl">{r.emoji}</span>
            {REACTION_LABEL[r.key]}
          </button>
        ))}
      </div>

      <label className="flex flex-col gap-1 text-sm">
        메모 <span className="text-xs text-muted">아이가 한 말, 잘한 점, 어려웠던 순간 등</span>
        <textarea
          value={memo}
          onChange={(e) => setMemo(e.target.value)}
          rows={4}
          maxLength={500}
          className="rounded-xl border border-line bg-card p-3 text-base"
        />
      </label>

      <label className="flex flex-col gap-2 text-sm">
        사진 (선택)
        <input
          type="file"
          accept="image/*"
          onChange={(e) => pickPhoto(e.target.files?.[0] ?? null)}
          className="text-sm file:mr-3 file:rounded-full file:border-0 file:bg-brand-soft file:px-4 file:py-2 file:text-brand"
        />
        {/* eslint-disable-next-line @next/next/no-img-element -- 로컬 blob 미리보기 */}
        {preview && <img src={preview} alt="선택한 사진 미리보기" className="max-h-60 rounded-xl object-cover" />}
      </label>

      <p className="text-xs text-muted">
        {shared ? "기록은 센터 선생님께 함께 전달돼요." : "센터 공유에 동의하지 않아 기록은 부모님만 볼 수 있어요."}
      </p>

      <button
        type="submit"
        disabled={!reaction}
        className="h-13 rounded-full bg-brand text-lg font-bold text-white disabled:opacity-40 dark:text-black"
      >
        {shared ? "센터로 보내기" : "기록 저장"}
      </button>
    </form>
  );
}
