"use client";

import { useRouter } from "next/navigation";
import { Check } from "lucide-react";
import { AREA_LABEL, type AgeGroup, type Area, type Frequency, type Level, type TempItem } from "@/types";
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

// 3지선다. 발달 문항은 기획 데이터의 중간 단계(②) 행동을 질문으로 쓰고,
// 답을 단계 값으로 바꿔 저장 (자주=2, 가끔=1, 아직=0) → SurveyAnswers 계약 그대로
const DEV_ANSWERS: { label: string; value: Level }[] = [
  { label: "자주 그렇다", value: 2 },
  { label: "가끔 그렇다", value: 1 },
  { label: "아직 아니다", value: 0 },
];
const TEMP_ANSWERS: { label: string; value: Frequency }[] = [
  { label: "자주 그렇다", value: "often" },
  { label: "가끔 그렇다", value: "sometimes" },
  { label: "거의 아니다", value: "rarely" },
];

type Item = { kind: "dev"; key: Area; text: string } | { kind: "temp"; key: TempItem; text: string };

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
  const baseGroup = groupFor(ageInMonths(child.birthDate));
  const saved = data.surveyDraft?.childId === child.id ? data.surveyDraft : null;
  const draft: SurveyDraft = saved ?? { childId: child.id, group: baseGroup, dev: {}, temp: {}, index: 0 };
  const group: AgeGroup = draft.group;

  const items: Item[] = [
    ...devQuestionsFor(group).map((q): Item => ({ kind: "dev", key: q.area, text: q.levels[1] })),
    ...tempQuestionsFor(group).map((q): Item => ({ kind: "temp", key: q.item, text: q.text })),
  ];
  const index = Math.min(draft.index, items.length - 1);
  const item = items[index];
  const isLast = index === items.length - 1;
  const selected = item.kind === "dev" ? draft.dev[item.key] : draft.temp[item.key];
  const options = item.kind === "dev" ? DEV_ANSWERS : TEMP_ANSWERS;

  // 답할 때마다 자동 저장 → 나갔다 와도 이어서
  function choose(value: Level | Frequency) {
    if (item.kind === "dev") saveSurveyDraft({ ...draft, dev: { ...draft.dev, [item.key]: value as Level } });
    else saveSurveyDraft({ ...draft, temp: { ...draft.temp, [item.key]: value as Frequency } });
  }

  function go(to: number) {
    saveSurveyDraft({ ...draft, index: to });
  }

  function switchGroup() {
    saveSurveyDraft({ childId: draft.childId, group: group === "infant" ? baseGroup : "infant", dev: {}, temp: {}, index: 0 });
  }

  function next() {
    if (selected === undefined || !child) return;
    if (!isLast) return go(index + 1);
    const answers = { group, dev: draft.dev as Record<Area, Level>, temp: draft.temp as Record<TempItem, Frequency> };
    saveSurvey({ childId: child.id, answers, result: scoreSurvey(answers) });
    router.push("/survey/result");
  }

  function pause() {
    toast("여기까지 저장했어요. 홈에서 이어서 할 수 있어요");
    router.push("/");
  }

  const caption = item.kind === "dev" ? AREA_LABEL[item.key] : "놀이 스타일";

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
        </p>
      </div>

      <p className="mt-6 text-[13px] font-semibold text-sub">{item.kind === "dev" ? `요즘 ${name}는` : `${name}는 평소에`}</p>
      <H1 className="mt-1 text-balance">{item.text}</H1>

      <fieldset className="mt-6 flex flex-col gap-2.5">
        <legend className="sr-only">{item.text}</legend>
        {options.map((o) => {
          const on = selected === o.value;
          return (
            <button
              key={o.label}
              type="button"
              aria-pressed={on}
              onClick={() => choose(o.value)}
              className={`pressable flex h-14 items-center justify-between gap-3 rounded-[14px] px-[18px] text-left text-[16px] font-semibold ${
                on ? "border-[1.5px] border-sage bg-sage-xlight" : "border border-line bg-card"
              }`}
            >
              {o.label}
              {on && <Icon icon={Check} size={20} className="shrink-0 text-sage" />}
            </button>
          );
        })}
      </fieldset>

      {index === 0 && baseGroup === "preschool" && (
        <TextButton onClick={switchGroup} className="mt-3 self-start">
          {group === "infant" ? "원래 질문으로 돌아가기" : "질문이 어렵게 느껴지면 더 쉬운 질문으로 보기"}
        </TextButton>
      )}

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
