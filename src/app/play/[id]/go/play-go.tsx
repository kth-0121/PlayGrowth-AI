"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Check, Lightbulb } from "lucide-react";
import type { Play } from "@/types";
import { BottomSheet } from "@/components/BottomSheet";
import { Button, TextButton } from "@/components/Button";
import { AreaChip } from "@/components/Chip";
import { Icon } from "@/components/Icon";
import { PageHeader } from "@/components/PageHeader";
import { MaterialArt } from "@/components/PlayArt";
import { ProgressBar } from "@/components/ProgressBar";
import { StepArt } from "@/components/StepArt";
import { PageSkeleton } from "@/components/Skeleton";
import { Timer } from "@/components/Timer";
import { currentChild, latestSurvey, saveProgress, useLocalData } from "@/lib/local-store";
import { QUESTION_SET } from "@/lib/survey";

/** 놀이 진행 모드: 0 = 준비물 챙기기, 1~n = 진행 순서 한 단계씩 */
export default function PlayGo({ play }: { play: Play }) {
  const router = useRouter();
  const data = useLocalData();
  const [tipsOpen, setTipsOpen] = useState(false);
  // 준비물 체크는 이번 놀이에서만 (매번 새로 챙기므로 저장하지 않음)
  const [checked, setChecked] = useState<number[]>([]);
  const toggle = (i: number) => setChecked((c) => (c.includes(i) ? c.filter((x) => x !== i) : [...c, i]));

  if (!data) return <PageSkeleton withTab={false} />;
  const total = play.steps.length;
  const step = Math.min(data.progress[play.id] ?? 0, total);
  const child = currentChild(data);
  const style = child ? latestSurvey(data, child.id)?.result.style : undefined;
  const styleTip = style ? QUESTION_SET.styles[style] : undefined;
  const isLast = step === total;

  function go(to: number) {
    saveProgress(play.id, to);
  }
  function finish() {
    saveProgress(play.id, null);
    router.push(`/play/${play.id}/log`);
  }

  return (
    <main className="flex flex-1 flex-col px-5 pb-[calc(24px+env(safe-area-inset-bottom))]">
      <PageHeader back title={play.title} />
      <ProgressBar value={step / total} label="놀이 진행률" />
      <p className="mt-2 text-[12px] font-medium text-sub">{step === 0 ? "준비" : `${step}/${total} 단계`}</p>

      {step === 0 ? (
        <Prep play={play} checked={checked} onToggle={toggle} />
      ) : (
        <section className="mt-7" aria-live="polite">
          <p className="text-[13px] font-extrabold text-sage">{String(step).padStart(2, "0")}</p>
          <h1 className="mt-2 text-balance text-[23px] font-extrabold leading-[1.45] tracking-[-0.035em]">
            {play.steps[step - 1]}
          </h1>
          <StepArt key={step} play={play} step={step} height={210} className="anim-up mt-5 rounded-[22px]" />
          <button
            type="button"
            onClick={() => setTipsOpen(true)}
            className="pressable mt-4 inline-flex min-h-11 items-center gap-1.5 rounded-[12px] bg-sage-light px-3.5 text-[14px] font-semibold text-sage-dark"
          >
            <Icon icon={Lightbulb} size={18} />
            아이가 어려워하면
          </button>
        </section>
      )}

      <div className="mt-auto flex flex-col gap-3 pt-10">
        <Timer minutes={play.minutes} />
        <Button full onClick={() => (isLast ? finish() : go(step + 1))}>
          {step === 0 ? "놀이 시작" : isLast ? "놀이 마치고 기록하기" : "다음 단계"}
        </Button>
        <div className="flex justify-between">
          <TextButton onClick={() => go(step - 1)} disabled={step === 0}>
            이전 단계
          </TextButton>
          {!isLast && step > 0 && <TextButton onClick={finish}>여기서 마칠게요</TextButton>}
        </div>
      </div>

      <BottomSheet open={tipsOpen} title="아이가 어려워하면" onClose={() => setTipsOpen(false)}>
        <ul className="flex flex-col gap-2.5 pb-2">
          {play.tips.map((t) => (
            <li key={t} className="border-l-[3px] border-warm pl-3 text-[14px] font-medium leading-[1.55]">
              {t}
            </li>
          ))}
          {styleTip && (
            <li className="mt-2 rounded-[12px] bg-sage-xlight px-4 py-3 text-[13.5px] font-medium leading-[1.55]">
              <span className="text-sub">놀이 스타일 · {styleTip.label}</span>
              <br />
              {styleTip.tip}
            </li>
          )}
          <li className="mt-1 text-[13px] font-medium text-sub">잘 안 되는 날도 있어요. 오늘은 여기까지 해도 괜찮아요.</li>
        </ul>
      </BottomSheet>
    </main>
  );
}

/** "숟가락 1개" → { name: "숟가락", count: "1개" }, "딸랑이 (없으면 …)" → note */
function splitMaterial(m: string) {
  const [, main, note] = m.match(/^([^(]+?)\s*(?:\((.+)\))?$/) ?? [m, m, undefined];
  const cnt = main.match(/^(.*?)\s+(\d[\d~]*\s*(?:개|장|권|켤레|짝|곡|조각)|몇 조각)$/);
  return { name: cnt ? cnt[1] : main, count: cnt ? cnt[2] : null, note: note ?? null };
}

/** 준비 화면: 준비물마다 그림이 있는 큰 카드, 눌러서 챙김 표시 */
function Prep({ play, checked, onToggle }: { play: Play; checked: number[]; onToggle: (i: number) => void }) {
  const none = play.materials.length === 1 && play.materials[0].startsWith("없음");
  const n = play.materials.length;
  const done = checked.length === n;
  return (
    <section className="mt-5">
      <AreaChip area={play.area} />
      <h1 className="mt-2 text-[26px] font-extrabold leading-[1.3] tracking-[-0.035em]">
        {none ? (
          "준비물 없이 바로 할 수 있어요"
        ) : (
          <>
            준비물 <span className="text-sage">{n}가지</span>를 챙겨요
          </>
        )}
      </h1>
      <p className="mt-1.5 text-[13.5px] font-medium leading-[1.55] text-sub">
        {none ? "아래만 있으면 충분해요." : "없는 건 비슷한 물건으로 바꿔도 괜찮아요."}
      </p>

      <ul className={`mt-5 grid gap-3 ${n === 1 ? "grid-cols-1" : "grid-cols-2"}`}>
        {play.materials.map((m, i) => {
          const on = checked.includes(i);
          const { name, count, note } = splitMaterial(none ? m.replace(/^없음\s*\(?/, "").replace(/\)$/, "") : m);
          return (
            <li key={m} className={n % 2 === 1 && i === n - 1 && n > 1 ? "col-span-2" : ""}>
              <button
                type="button"
                role="checkbox"
                aria-checked={on}
                onClick={() => onToggle(i)}
                className={`pressable relative flex h-full w-full flex-col rounded-[18px] bg-card p-2.5 text-left ${
                  on ? "outline-[1.5px] outline-sage outline-solid" : ""
                }`}
              >
                <span className={`block overflow-hidden rounded-[13px] bg-sage-xlight ${n === 1 ? "h-[180px]" : "h-[120px]"}`}>
                  <MaterialArt material={m} className={on ? "opacity-60" : ""} />
                </span>
                <span
                  aria-hidden
                  className={`absolute right-4 top-4 flex size-7 items-center justify-center rounded-full ${
                    on ? "bg-sage text-white" : "border-[1.5px] border-line bg-card"
                  }`}
                >
                  {on && <Icon icon={Check} size={16} />}
                </span>
                <span className="mt-2.5 px-1 text-[16px] font-bold leading-[1.35] tracking-[-0.02em]">{name.replace(/[(]?\s*$/, "")}</span>
                {count && <span className="px-1 text-[13px] font-semibold text-sage-dark">{count}</span>}
                {note && <span className="mt-0.5 px-1 pb-1 text-[12px] font-medium leading-[1.45] text-sub">{note}</span>}
              </button>
            </li>
          );
        })}
      </ul>

      {!none && (
        <p className="mt-3 text-[13px] font-medium text-sub" aria-live="polite">
          {done ? (
            "다 챙겼어요. 시작해 볼까요?"
          ) : (
            <>
              <span className="font-extrabold text-ink">{checked.length}</span>/{n} 챙겼어요 · 눌러서 표시해요
            </>
          )}
        </p>
      )}
    </section>
  );
}
