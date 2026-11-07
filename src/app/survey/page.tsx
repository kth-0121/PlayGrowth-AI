"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Check } from "lucide-react";
import { AREA_LABEL, type AgeGroup, type Area, type Frequency, type Level, type TempItem } from "@/types";
import { Button, TextButton } from "@/components/Button";
import { EmptyState } from "@/components/EmptyState";
import { Icon } from "@/components/Icon";
import { H1, PageHeader } from "@/components/PageHeader";
import { ProgressBar } from "@/components/ProgressBar";
import { ageInMonths } from "@/lib/age";
import { callName } from "@/lib/copy";
import { currentChild, saveSurvey, useLocalData } from "@/lib/local-store";
import { FREQUENCY_LABEL, devQuestionsFor, groupFor, scoreSurvey, tempQuestionsFor } from "@/lib/survey";

const FREQUENCIES: Frequency[] = ["often", "sometimes", "rarely"];

// 발달 문항 제목에 쓰는 쉬운 말
const AREA_PHRASE: Record<Area, string> = {
  lang: "말하기는",
  cog: "놀잇감 다루기는",
  soc: "다른 사람과 어울리기는",
  gross: "몸 움직이기는",
  fine: "손 쓰기는",
};

type Item =
  | { kind: "dev"; key: Area; options: { value: Level; label: string }[] }
  | { kind: "temp"; key: TempItem; text: string; options: { value: Frequency; label: string }[] };

export default function SurveyPage() {
  const router = useRouter();
  const data = useLocalData();
  const [easier, setEasier] = useState(false); // 유아인데 영아용 문항으로 보기
  const [dev, setDev] = useState<Partial<Record<Area, Level>>>({});
  const [temp, setTemp] = useState<Partial<Record<TempItem, Frequency>>>({});
  const [index, setIndex] = useState(0);

  if (!data) return <main className="flex-1" />;
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
  const group: AgeGroup = baseGroup === "preschool" && easier ? "infant" : baseGroup;

  // 발달 5문항(지금 모습에 가까운 단계) → 놀이 스타일 4문항
  const items: Item[] = [
    ...devQuestionsFor(group).map((q): Item => ({
      kind: "dev",
      key: q.area,
      options: [
        ...q.levels.map((label, i) => ({ value: (i + 1) as Level, label })),
        { value: 0 as Level, label: q.notYet },
      ],
    })),
    ...tempQuestionsFor(group).map((q): Item => ({
      kind: "temp",
      key: q.item,
      text: q.text,
      options: FREQUENCIES.map((f) => ({ value: f, label: FREQUENCY_LABEL[f] })),
    })),
  ];

  const item = items[index];
  const isLast = index === items.length - 1;
  const selected = item.kind === "dev" ? dev[item.key] : temp[item.key];

  function choose(value: Level | Frequency) {
    if (item.kind === "dev") setDev((p) => ({ ...p, [item.key]: value as Level }));
    else setTemp((p) => ({ ...p, [item.key]: value as Frequency }));
  }

  function switchGroup() {
    setEasier((v) => !v);
    setDev({});
    setTemp({});
    setIndex(0);
  }

  function next() {
    if (selected === undefined || !child) return;
    if (!isLast) return setIndex(index + 1);
    const answers = { group, dev: dev as Record<Area, Level>, temp: temp as Record<TempItem, Frequency> };
    saveSurvey({ childId: child.id, answers, result: scoreSurvey(answers) });
    router.push("/survey/result");
  }

  const caption = item.kind === "dev" ? AREA_LABEL[item.key] : "놀이 스타일";
  const title = item.kind === "dev" ? `요즘 ${name}의\n${AREA_PHRASE[item.key]} 어느 쪽에 가까워요?` : item.text;

  return (
    <main className="flex flex-1 flex-col px-5 pb-[calc(56px+env(safe-area-inset-bottom))]">
      <PageHeader back title={`${name} 평소 모습`} />

      <div className="mt-1">
        <ProgressBar value={(index + 1) / items.length} label="질문 진행률" />
        <p className="mt-2 text-[12px] font-medium text-sub">
          {caption} · {index + 1}/{items.length}
        </p>
      </div>

      <H1 className="mt-6 text-balance">{title}</H1>
      {item.kind === "dev" && (
        <p className="mt-1.5 text-[13.5px] font-medium text-sub">요즘 모습 그대로 골라 주세요. 정답은 없어요.</p>
      )}

      <fieldset className="mt-6 flex flex-col gap-2.5">
        <legend className="sr-only">{title}</legend>
        {item.options.map((o) => {
          const on = selected === o.value;
          return (
            <button
              key={String(o.value)}
              type="button"
              aria-pressed={on}
              onClick={() => choose(o.value)}
              className={`pressable flex min-h-14 items-center justify-between gap-3 rounded-[14px] px-[18px] py-3 text-left text-[16px] font-semibold leading-[1.4] ${
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
          {easier ? "원래 질문으로 돌아가기" : "질문이 어렵게 느껴지면 더 쉬운 질문으로 보기"}
        </TextButton>
      )}

      <div className="mt-auto flex flex-col items-center gap-1 pt-10">
        <Button full onClick={next} disabled={selected === undefined}>
          {isLast ? "결과 보기" : "다음 질문"}
        </Button>
        <TextButton onClick={() => setIndex(index - 1)} disabled={index === 0}>
          이전 질문
        </TextButton>
      </div>

      <p className="fixed bottom-0 left-1/2 w-full max-w-[480px] -translate-x-1/2 bg-bg px-5 pb-[calc(14px+env(safe-area-inset-bottom))] pt-2 text-center text-[12px] font-medium text-mute">
        진단이 아닌 놀이 추천을 위한 참고 정보예요
      </p>
    </main>
  );
}
