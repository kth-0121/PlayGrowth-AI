"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { AREA_LABEL, type Answer } from "@/types";
import { Choice, MissingStep, Notice, PageTitle, PrimaryButton } from "@/components/ui";
import { ageInMonths, formatMonths } from "@/lib/age";
import { currentChild, saveSurvey, useLocalData } from "@/lib/local-store";
import { ANSWER_LABEL, QUESTIONS, questionsFor, scoreSurvey } from "@/lib/survey";

const ANSWERS: Answer[] = ["often", "sometimes", "notYet"];

export default function SurveyPage() {
  const router = useRouter();
  const data = useLocalData();
  const [answers, setAnswers] = useState<Record<string, Answer>>({});
  const [useSample, setUseSample] = useState(false);

  if (!data) return <p className="text-muted">불러오는 중…</p>;
  const child = currentChild(data);
  if (!child) return <MissingStep text="아이 정보를 먼저 입력해 주세요." href="/child" label="아이 정보 입력하기" />;

  const months = ageInMonths(child.birthDate);
  const matched = questionsFor(months);
  // 이 월령 문항이 아직 없으면(기획에서 채우는 중) 예시 문항으로 체험
  const questions = matched.length > 0 ? matched : useSample ? QUESTIONS : [];
  const answered = questions.filter((q) => answers[q.id]).length;
  const done = questions.length > 0 && answered === questions.length;

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!done || !child) return;
    saveSurvey({ childId: child.id, answers, result: scoreSurvey(questions, answers) });
    router.push("/survey/result");
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-6">
      <PageTitle
        step="2 / 4"
        title="발달 상태 확인"
        desc={`${child.nickname} · ${formatMonths(months)}. 평소 모습에 가장 가까운 답을 골라 주세요.`}
      />
      <Notice>진단이 아니라 놀이 추천을 위한 참고예요. 정답은 없으니 편하게 답해 주세요.</Notice>

      {matched.length === 0 && !useSample && (
        <div className="flex flex-col gap-3 rounded-2xl border border-line bg-card p-5 text-sm">
          <p>{formatMonths(months)} 아이를 위한 질문을 준비하고 있어요.</p>
          <button type="button" onClick={() => setUseSample(true)} className="self-start font-bold text-brand underline">
            예시 질문으로 먼저 해 보기
          </button>
        </div>
      )}

      {questions.length > 0 && (
        <>
          <p className="text-right text-xs text-muted">
            {answered} / {questions.length}
          </p>
          <ol className="flex flex-col gap-4">
            {questions.map((q, i) => (
              <li key={q.id}>
                <fieldset className="rounded-2xl border border-line bg-card p-4">
                  <legend className="sr-only">{q.text}</legend>
                  <p className="text-xs font-medium text-calm">
                    {i + 1} · {AREA_LABEL[q.area]}
                  </p>
                  <p className="mt-1 font-medium">{q.text}</p>
                  <div className="mt-3 grid grid-cols-3 gap-2">
                    {ANSWERS.map((a) => (
                      <Choice
                        key={a}
                        on={answers[q.id] === a}
                        onClick={() => setAnswers((prev) => ({ ...prev, [q.id]: a }))}
                        className="h-11"
                      >
                        {ANSWER_LABEL[a]}
                      </Choice>
                    ))}
                  </div>
                </fieldset>
              </li>
            ))}
          </ol>
          <PrimaryButton type="submit" disabled={!done}>
            {done ? "결과 보기" : `${questions.length - answered}개 남았어요`}
          </PrimaryButton>
        </>
      )}
    </form>
  );
}
