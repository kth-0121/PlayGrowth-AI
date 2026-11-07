"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { AGE_GROUP, AREA_LABEL, type AgeGroup, type Area, type Frequency, type Level, type TempItem } from "@/types";
import { Choice, MissingStep, Notice, PageTitle, PrimaryButton } from "@/components/ui";
import { ageInMonths, formatMonths } from "@/lib/age";
import { currentChild, saveSurvey, useLocalData } from "@/lib/local-store";
import { FREQUENCY_LABEL, LEVEL_MARK, devQuestionsFor, groupFor, scoreSurvey, tempQuestionsFor } from "@/lib/survey";

const FREQUENCIES: Frequency[] = ["often", "sometimes", "rarely"];
const LEVELS: (1 | 2 | 3)[] = [1, 2, 3];

export default function SurveyPage() {
  const router = useRouter();
  const data = useLocalData();
  const [easier, setEasier] = useState(false); // 유아인데 영아용 문항으로 보기
  const [dev, setDev] = useState<Partial<Record<Area, Level>>>({});
  const [temp, setTemp] = useState<Partial<Record<TempItem, Frequency>>>({});

  if (!data) return <p className="text-muted">불러오는 중…</p>;
  const child = currentChild(data);
  if (!child) return <MissingStep text="아이 정보를 먼저 입력해 주세요." href="/child" label="아이 정보 입력하기" />;

  const months = ageInMonths(child.birthDate);
  const baseGroup = groupFor(months);
  const group: AgeGroup = baseGroup === "preschool" && easier ? "infant" : baseGroup;
  const devQs = devQuestionsFor(group);
  const tempQs = tempQuestionsFor(group);
  const total = devQs.length + tempQs.length;
  const answered = devQs.filter((q) => dev[q.area] !== undefined).length + tempQs.filter((q) => temp[q.item]).length;
  const done = total > 0 && answered === total;

  function switchGroup() {
    setEasier((v) => !v);
    setDev({});
    setTemp({});
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!done || !child) return;
    const answers = { group, dev: dev as Record<Area, Level>, temp: temp as Record<TempItem, Frequency> };
    saveSurvey({ childId: child.id, answers, result: scoreSurvey(answers) });
    router.push("/survey/result");
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-6">
      <PageTitle
        step="2 / 4"
        title="발달 상태 확인"
        desc={`${child.nickname} · ${formatMonths(months)} · ${AGE_GROUP[group].label}용 질문`}
      />
      <Notice>진단이 아니라 놀이 추천을 위한 참고예요. 정답은 없으니 요즘 모습 그대로 골라 주세요.</Notice>

      {baseGroup === "preschool" && (
        <button type="button" onClick={switchGroup} className="self-start text-sm font-bold text-brand underline">
          {easier ? "원래 질문(유아용)으로 돌아가기" : "질문이 어렵게 느껴지면 더 쉬운 질문(영아용)으로 보기"}
        </button>
      )}

      <p className="text-right text-xs text-muted">
        {answered} / {total}
      </p>

      <section className="flex flex-col gap-4">
        <h2 className="font-bold">요즘 아이 모습에 가장 가까운 것을 골라 주세요</h2>
        {devQs.map((q, i) => (
          <fieldset key={q.id} className="rounded-2xl border border-line bg-card p-4">
            <legend className="sr-only">{AREA_LABEL[q.area]}</legend>
            <p className="text-xs font-medium text-calm">
              {i + 1} · {AREA_LABEL[q.area]}
            </p>
            <div className="mt-3 flex flex-col gap-2">
              {LEVELS.map((lv) => (
                <Choice
                  key={lv}
                  on={dev[q.area] === lv}
                  onClick={() => setDev((p) => ({ ...p, [q.area]: lv }))}
                  className="px-3 py-2.5 text-left"
                >
                  {LEVEL_MARK[lv]} {q.levels[lv - 1]}
                </Choice>
              ))}
              <Choice
                on={dev[q.area] === 0}
                onClick={() => setDev((p) => ({ ...p, [q.area]: 0 }))}
                className="px-3 py-2.5 text-left"
              >
                {LEVEL_MARK[0]} · {q.notYet}
              </Choice>
            </div>
          </fieldset>
        ))}
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="font-bold">우리 아이 놀이 스타일</h2>
        {tempQs.map((q, i) => (
          <fieldset key={q.id} className="rounded-2xl border border-line bg-card p-4">
            <legend className="sr-only">{q.text}</legend>
            <p className="text-xs font-medium text-calm">{devQs.length + i + 1}</p>
            <p className="mt-1 font-medium">{q.text}</p>
            <div className="mt-3 grid grid-cols-3 gap-2">
              {FREQUENCIES.map((f) => (
                <Choice key={f} on={temp[q.item] === f} onClick={() => setTemp((p) => ({ ...p, [q.item]: f }))} className="h-11">
                  {FREQUENCY_LABEL[f]}
                </Choice>
              ))}
            </div>
          </fieldset>
        ))}
      </section>

      <PrimaryButton type="submit" disabled={!done}>
        {done ? "결과 보기" : `${total - answered}개 남았어요`}
      </PrimaryButton>
    </form>
  );
}
