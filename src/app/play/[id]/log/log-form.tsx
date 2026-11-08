"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Check, ImagePlus, X } from "lucide-react";
import type { Area, Done, Reaction } from "@/types";
import { Button, TextButton } from "@/components/Button";
import { Card } from "@/components/Card";
import { AreaChip, DONE_LABEL, REACTION_LABEL, TimeChip } from "@/components/Chip";
import { EmptyState } from "@/components/EmptyState";
import { Icon } from "@/components/Icon";
import { PageSkeleton } from "@/components/Skeleton";
import { H1, PageHeader } from "@/components/PageHeader";
import { callName } from "@/lib/copy";
import { ageInMonths } from "@/lib/age";
import { childLogs, childPrefs, currentChild, latestSurvey, savePlayLog, saveRecommendation, useLocalData } from "@/lib/local-store";
import { nextRecommendation, type Pick } from "@/lib/recommend";
import { uploadPhoto } from "@/lib/supabase";

const DONE: Done[] = ["done", "partial", "notDone"];
const REACTIONS: Reaction[] = ["enjoyed", "neutral", "hard"];

export default function LogForm({ playId, playTitle, area }: { playId: string; playTitle: string; area: Area }) {
  const router = useRouter();
  const data = useLocalData();
  const [done, setDone] = useState<Done | null>(null);
  const [reaction, setReaction] = useState<Reaction | null>(null);
  const [memo, setMemo] = useState("");
  const [photos, setPhotos] = useState<{ url: string; file: File }[]>([]);
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState<{ next: Pick | null } | null>(null);

  if (!data) return <PageSkeleton withTab={false} />;
  const child = currentChild(data);
  if (!child) {
    return (
      <main className="flex flex-1 flex-col gap-6 px-5 pb-10">
        <PageHeader back />
        <EmptyState text="기록을 남기려면 아이 정보가 먼저 필요해요." action="아이 정보 입력" href="/onboarding" />
      </main>
    );
  }

  function addPhotos(files: FileList | null) {
    if (!files) return;
    setPhotos((prev) => [...prev, ...Array.from(files).map((file) => ({ url: URL.createObjectURL(file), file }))].slice(0, 4));
  }
  function removePhoto(url: string) {
    URL.revokeObjectURL(url);
    setPhotos((prev) => prev.filter((p) => p.url !== url));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!child || !done || !reaction || busy) return;
    setBusy(true);
    // 사진은 내 폴더에 올림. 실패한 사진은 빼고 기록은 저장
    const uploaded = await Promise.allSettled(photos.map((p) => uploadPhoto(p.file)));
    const photoPaths = uploaded.flatMap((r) => (r.status === "fulfilled" ? [r.value] : []));
    if (photoPaths.length < photos.length) console.error("[noridari] 사진 일부 업로드 실패", uploaded);
    const log = savePlayLog({ childId: child.id, playId, done, reaction, memo: memo.trim() || null, photoPaths });
    // 방금 기록까지 반영해 다음 놀이 추천 → 기록 목록 상단과 홈 '오늘의 놀이'에 보임
    const logs = [...childLogs(data!, child.id), log];
    const next = nextRecommendation(latestSurvey(data!, child.id)?.result ?? null, ageInMonths(child.birthDate), logs, undefined, childPrefs(child));
    if (next) saveRecommendation({ childId: child.id, playId: next.play.id, reason: next.reason });
    // 저장 후 바로 다음 놀이로 이어갈 수 있게 완료 화면을 보여줌
    setSaved({ next });
    setBusy(false);
  }

  if (saved) {
    const next = saved.next;
    return (
      <main className="flex flex-1 flex-col px-5 pb-[calc(32px+env(safe-area-inset-bottom))]">
        <PageHeader title="기록 완료" />
        <div className="mt-6 flex flex-col items-center gap-3 text-center">
          <span className="flex size-14 items-center justify-center rounded-full bg-sage-light text-sage-dark">
            <Icon icon={Check} size={28} />
          </span>
          <H1>오늘 놀이 잘 마쳤어요</H1>
          <p className="text-[13.5px] font-medium leading-[1.55] text-sub">
            {callName(child.nickname)}가 더 놀고 싶어 하면 하나 더 해 봐요.
            <br />
            오늘은 여기까지 해도 충분해요.
          </p>
        </div>

        {next && (
          <Card className="mt-7">
            <p className="text-[12.5px] font-semibold text-sub">{next.play.id === playId ? "다시 해 볼 놀이" : "다음 놀이"}</p>
            <div className="mt-2 flex gap-1.5">
              <AreaChip area={next.play.area} />
              <TimeChip minutes={next.play.minutes} />
            </div>
            <h2 className="mt-2 text-[17px] font-bold leading-[1.35]">{next.play.title}</h2>
            <p className="mt-1 text-[13px] font-medium leading-[1.5] text-sub">{next.reason}</p>
          </Card>
        )}

        <div className="mt-auto flex flex-col gap-2 pt-8">
          {next && (
            <Button full onClick={() => router.push(`/play/${next.play.id}`)}>
              {next.play.id === playId ? "한 번 더 하기" : "다른 놀이 하기"}
            </Button>
          )}
          <Button full variant="secondary" onClick={() => router.push("/")}>
            오늘은 여기까지
          </Button>
          <TextButton onClick={() => router.push("/logs")} className="self-center">
            기록 보러 가기
          </TextButton>
        </div>
      </main>
    );
  }

  return (
    <form onSubmit={submit} className="flex flex-1 flex-col px-5 pb-[calc(32px+env(safe-area-inset-bottom))]">
      <PageHeader back title="오늘 기록하기" />

      <div className="mt-2 flex flex-col items-start gap-2">
        <AreaChip area={area} />
        <H1>{playTitle}</H1>
      </div>

      <Segment label="놀이를 해 봤나요?" options={DONE} labels={DONE_LABEL} value={done} onChange={setDone} />
      <Segment label="아이 반응은요?" options={REACTIONS} labels={REACTION_LABEL} value={reaction} onChange={setReaction} />

      <label className="mt-7 flex flex-col gap-2">
        <span className="text-[13px] font-semibold text-sub">메모</span>
        <textarea
          value={memo}
          onChange={(e) => setMemo(e.target.value)}
          rows={4}
          maxLength={500}
          placeholder={`오늘 ${callName(child.nickname)}는 어떤 모습이었나요?`}
          className="rounded-[12px] border border-line bg-card p-3.5 text-[15px] font-medium leading-[1.5] outline-none placeholder:text-mute focus:border-sage focus:ring-[0.5px] focus:ring-sage"
        />
      </label>

      <div className="mt-7 flex flex-col gap-2">
        <span className="text-[13px] font-semibold text-sub">사진</span>
        <div className="flex flex-wrap gap-1.5">
          {photos.map(({ url }) => (
            <div key={url} className="relative size-16">
              {/* eslint-disable-next-line @next/next/no-img-element -- 로컬 blob 미리보기 */}
              <img src={url} alt="추가한 사진" className="size-16 rounded-[10px] object-cover" />
              <button
                type="button"
                onClick={() => removePhoto(url)}
                aria-label="사진 빼기"
                className="absolute -right-1.5 -top-1.5 flex size-6 items-center justify-center rounded-full bg-ink text-white"
              >
                <Icon icon={X} size={14} />
              </button>
            </div>
          ))}
          {photos.length < 4 && (
            <label className="pressable flex size-16 cursor-pointer items-center justify-center rounded-[10px] border-[1.5px] border-dashed border-line bg-card text-sub">
              <Icon icon={ImagePlus} size={20} />
              <span className="sr-only">사진 추가</span>
              <input type="file" accept="image/*" multiple className="sr-only" onChange={(e) => addPhotos(e.target.files)} />
            </label>
          )}
        </div>
        <p className="text-[12px] font-medium text-sub">사진은 돌아보기용이에요. 사진으로 발달을 판단하지 않아요.</p>
      </div>

      <div className="mt-auto pt-8">
        <Button type="submit" full disabled={!done || !reaction || busy}>
          {busy ? "저장하는 중…" : "기록 저장"}
        </Button>
      </div>
    </form>
  );
}

function Segment<T extends string>({
  label,
  options,
  labels,
  value,
  onChange,
}: {
  label: string;
  options: T[];
  labels: Record<T, string>;
  value: T | null;
  onChange: (v: T) => void;
}) {
  return (
    <fieldset className="mt-7">
      <legend className="text-[13px] font-semibold text-sub">{label}</legend>
      <div className="mt-2 grid grid-cols-3 gap-2">
        {options.map((o) => {
          const on = value === o;
          return (
            <button
              key={o}
              type="button"
              onClick={() => onChange(o)}
              aria-pressed={on}
              className={`pressable h-12 rounded-[12px] text-[14px] font-semibold ${
                on
                  ? "border-[1.5px] border-sage bg-sage-light text-sage-dark"
                  : "border border-line bg-card text-sub"
              }`}
            >
              {labels[o]}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}
