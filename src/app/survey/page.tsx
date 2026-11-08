"use client";

import { useRouter } from "next/navigation";
import { Check } from "lucide-react";
import { AREA_LABEL, type Area, type Frequency, type Level, type TempItem } from "@/types";
import { Button, TextButton } from "@/components/Button";
import { EmptyState } from "@/components/EmptyState";
import { Icon } from "@/components/Icon";
import { H1, PageHeader } from "@/components/PageHeader";
import { ProgressBar } from "@/components/ProgressBar";
import { PageSkeleton } from "@/components/Skeleton";
import { toast } from "@/components/Toast";
import { ageInMonths } from "@/lib/age";
import { callName } from "@/lib/copy";
import { currentChild, saveSurvey, saveSurveyDraft, useLocalData, type SurveyDraft } from "@/lib/local-store";
import { devQuestionsFor, groupFor, scoreSurvey, tempQuestionsFor } from "@/lib/survey";

// 3지선다. 보기 순서: 0 자주 · 1 가끔 · 2 아직(거의)
const DEV_LABELS = ["자주 그렇다", "가끔 그렇다", "아직 아니다"];
const TEMP_LABELS = ["자주 그렇다", "가끔 그렇다", "거의 아니다"];
const FREQ: Frequency[] = ["often", "sometimes", "rarely"];

// 발달 문항 → 단계 값 (SurveyAnswers 계약 그대로)
//  원래 질문 = 중간 단계(②) 행동: 자주 2 · 가끔 1 · 아직 0
//  쉬운 질문 = 첫 단계(①) 행동:   자주 1 · 가끔 1 · 아직 0
const DEV_LEVEL: Record<"normal" | "easy", Level[]> = { normal: [2, 1, 0], easy: [1, 1, 0] };

// 놀이 스타일 문항의 쉬운 말 (뜻은 같고 집에서 볼 법한 장면으로)
const EASY_TEMP: Record<TempItem, string> = {
  explore: "새 장난감을 보면 먼저 만져 보려고 해요",
  cautious: "처음 가는 곳에서는 엄마·아빠 곁에 한참 붙어 있어요",
  initiative: "놀 때 '이거 하자' 하고 먼저 골라요",
  recovery: "울다가도 안아 주면 금방 울음을 그쳐요",
};

type Item =
  | { kind: "dev"; key: string; area: Area; text: string; easyText: string }
  | { kind: "temp"; key: string; item: TempItem; text: string; easyText: string };

export default function SurveyPage() {
  const router = useRouter();
  const data = useLocalData();

  if (!data) return <PageSkeleton withTab={false} />;
  const child = currentChild(data);
  if (!child) {
    return (
      <main className="flex flex-1 flex-col gap-6 px-5 pb-10">
        <PageHeader back />
        <EmptyState text="질문을 아이 월령에 맞추려면 아이 정보가 먼저 필요해요." action="아이 정보 입력" href="/onboarding" />
      </main>
    );
  }

  const name = callName(child.nickname);
  const group = groupFor(ageInMonths(child.birthDate));
  const saved = data.surveyDraft?.childId === child.id && data.surveyDraft.group === group ? data.surveyDraft : null;
  const draft: SurveyDraft = saved ?? { childId: child.id, group, dev: {}, temp: {}, index: 0 };
  const choice = draft.choice ?? {};
  const easy = draft.easy ?? {};

  const items: Item[] = [
    ...devQuestionsFor(group).map(
      (q): Item => ({ kind: "dev", key: `dev:${q.area}`, area: q.area, text: q.levels[1], easyText: q.levels[0] }),
    ),
    ...tempQuestionsFor(group).map(
      (q): Item => ({ kind: "temp", key: `temp:${q.item}`, item: q.item, text: q.text, easyText: EASY_TEMP[q.item] }),
    ),
  ];
  const index = Math.min(draft.index, items.length - 1);
  const item = items[index];
  const isLast = index === items.length - 1;
  const isEasy = !!easy[item.key];
  const selected = choice[item.key];
  const labels = item.kind === "dev" ? DEV_LABELS : TEMP_LABELS;
  const text = isEasy ? item.easyText : item.text;

  // 답할 때마다 자동 저장 → 나갔다 와도 이어서
  function choose(i: number) {
    saveSurveyDraft({ ...draft, choice: { ...choice, [item.key]: i } });
  }
  function go(to: number) {
    saveSurveyDraft({ ...draft, index: to });
  }
  // 쉬운 질문 ↔ 원래 질문: 질문 뜻이 바뀌므로 이 문항의 답만 지움
  function toggleEasy() {
    const nextChoice = { ...choice };
    delete nextChoice[item.key];
    saveSurveyDraft({ ...draft, choice: nextChoice, easy: { ...easy, [item.key]: !isEasy } });
  }

  function next() {
    if (selected === undefined || !child) return;
    if (!isLast) return go(index + 1);
    const dev = {} as Record<Area, Level>;
    const temp = {} as Record<TempItem, Frequency>;
    for (const it of items) {
      const c = choice[it.key];
      if (it.kind === "dev") dev[it.area] = DEV_LEVEL[easy[it.key] ? "easy" : "normal"][c];
      else temp[it.item] = FREQ[c];
    }
    const answers = { group, dev, temp };
    saveSurvey({ childId: child.id, answers, result: scoreSurvey(answers) });
    router.push("/survey/result");
  }

  function pause() {
    toast("여기까지 저장했어요. 홈에서 이어서 할 수 있어요");
    router.push("/");
  }

  const caption = item.kind === "dev" ? AREA_LABEL[item.area] : "놀이 스타일";

  return (
    <main className="flex flex-1 flex-col px-5 pb-[calc(56px+env(safe-area-inset-bottom))]">
      <PageHeader
        back
        title={`${name} 요즘 모습`}
        right={
          <TextButton onClick={pause} className="-mr-2">
            나중에 이어서
          </TextButton>
        }
      />

      <div className="mt-1">
        <ProgressBar value={(index + 1) / items.length} label="질문 진행률" />
        <p className="mt-2 text-[12px] font-medium text-sub">
          {caption} · {index + 1}/{items.length}
          {isEasy && " · 쉬운 질문"}
        </p>
      </div>

      <p className="mt-6 text-[13px] font-semibold text-sub">{item.kind === "dev" ? `요즘 ${name}는` : `${name}는 평소에`}</p>
      <H1 className="mt-1 text-balance">{text}</H1>

      <fieldset className="mt-6 flex flex-col gap-2.5">
        <legend className="sr-only">{text}</legend>
        {labels.map((label, i) => {
          const on = selected === i;
          return (
            <button
              key={label}
              type="button"
              aria-pressed={on}
              onClick={() => choose(i)}
              className={`pressable flex h-14 items-center justify-between gap-3 rounded-[14px] px-[18px] text-left text-[16px] font-semibold ${
                on ? "border-[1.5px] border-sage bg-sage-xlight" : "border border-line bg-card"
              }`}
            >
              {label}
              {on && <Icon icon={Check} size={20} className="shrink-0 text-sage" />}
            </button>
          );
        })}
      </fieldset>

      <TextButton onClick={toggleEasy} className="mt-3 self-start">
        {isEasy ? "원래 질문으로 돌아가기" : "질문이 어렵게 느껴지면 더 쉬운 질문으로 보기"}
      </TextButton>

      <div className="mt-auto flex flex-col items-center gap-1 pt-10">
        <Button full onClick={next} disabled={selected === undefined}>
          {isLast ? "결과 보기" : "다음 질문"}
        </Button>
        <TextButton onClick={() => go(index - 1)} disabled={index === 0}>
          이전 질문
        </TextButton>
      </div>

      <p className="fixed bottom-0 left-1/2 w-full max-w-[480px] -translate-x-1/2 bg-bg px-5 pb-[calc(14px+env(safe-area-inset-bottom))] pt-2 text-center text-[12px] font-medium text-mute">
        진단이 아닌 놀이 추천을 위한 참고 정보예요
      </p>
    </main>
  );
}
