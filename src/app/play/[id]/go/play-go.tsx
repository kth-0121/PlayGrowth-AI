"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Lightbulb } from "lucide-react";
import type { Play } from "@/types";
import { BottomSheet } from "@/components/BottomSheet";
import { Button, TextButton } from "@/components/Button";
import { Checklist } from "@/components/Checklist";
import { AreaChip } from "@/components/Chip";
import { Icon } from "@/components/Icon";
import { PageHeader } from "@/components/PageHeader";
import { ProgressBar } from "@/components/ProgressBar";
import { PageSkeleton } from "@/components/Skeleton";
import { Timer } from "@/components/Timer";
import { currentChild, latestSurvey, saveProgress, toggleChecklist, useLocalData } from "@/lib/local-store";
import { QUESTION_SET } from "@/lib/survey";

/** 놀이 진행 모드: 0 = 준비물 챙기기, 1~n = 진행 순서 한 단계씩 */
export default function PlayGo({ play }: { play: Play }) {
  const router = useRouter();
  const data = useLocalData();
  const [tipsOpen, setTipsOpen] = useState(false);

  if (!data) return <PageSkeleton withTab={false} />;
  const total = play.steps.length;
  const step = Math.min(data.progress[play.id] ?? 0, total);
  const checked = data.checklist[play.id] ?? [];
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
        <section className="mt-6">
          <AreaChip area={play.area} />
          <h1 className="mt-2 text-[23px] font-extrabold leading-[1.35] tracking-[-0.035em]">먼저 준비물을 챙겨요</h1>
          <p className="mt-1.5 text-[13.5px] font-medium leading-[1.55] text-sub">
            없는 건 비슷한 물건으로 바꿔도 괜찮아요. 체크한 건 다음에도 기억해 둘게요.
          </p>
          <div className="mt-5">
            <Checklist items={play.materials} checked={checked} onToggle={(i) => toggleChecklist(play.id, i)} />
          </div>
        </section>
      ) : (
        <section className="mt-8" aria-live="polite">
          <p className="text-[13px] font-extrabold text-sage">{String(step).padStart(2, "0")}</p>
          <h1 className="mt-2 text-balance text-[23px] font-extrabold leading-[1.45] tracking-[-0.035em]">
            {play.steps[step - 1]}
          </h1>
          <button
            type="button"
            onClick={() => setTipsOpen(true)}
            className="pressable mt-6 inline-flex min-h-11 items-center gap-1.5 rounded-[12px] bg-sage-light px-3.5 text-[14px] font-semibold text-sage-dark"
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
