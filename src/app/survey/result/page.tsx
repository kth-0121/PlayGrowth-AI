"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { AREA_LABEL, type Area, type Level } from "@/types";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { EmptyState } from "@/components/EmptyState";
import { H1, PageHeader } from "@/components/PageHeader";
import { ProgressBar } from "@/components/ProgressBar";
import { PageSkeleton } from "@/components/Skeleton";
import { ageInMonths } from "@/lib/age";
import { callName, josa } from "@/lib/copy";
import { childPrefs, currentChild, latestSurvey, saveRecommendation, useLocalData } from "@/lib/local-store";
import { firstRecommendation } from "@/lib/recommend";
import { AREA_ORDER, QUESTION_SET } from "@/lib/survey";

// 단계·점수 대신 짧은 문장으로 (진단처럼 보이지 않게)
// 3지선다 응답(자주=2, 가끔=1, 아직=0) 기준
function sentence(area: Area, level: Level) {
  const name = AREA_LABEL[area];
  if (level >= 2) return `${name}: 요즘 자주 보여요`;
  if (level === 1) return `${name}: 가끔 보여요`;
  return `${name}: 놀이로 자주 만나 보면 좋아요`;
}

export default function SurveyResultPage() {
  const router = useRouter();
  const data = useLocalData();
  const [noPlay, setNoPlay] = useState(false);

  if (!data) return <PageSkeleton withTab={false} />;
  const child = currentChild(data);
  const survey = child && latestSurvey(data, child.id);
  if (!child || !survey) {
    return (
      <main className="flex flex-1 flex-col gap-6 px-5 pb-10">
        <PageHeader back />
        <EmptyState
          text="질문에 답하면 영역별로 정리해서 보여 드려요."
          action="발달 상태 확인"
          href={child ? "/survey" : "/onboarding"}
        />
      </main>
    );
  }

  const { levels, focus, style, lowRecovery, suggestConsult } = survey.result;
  const styleInfo = QUESTION_SET.styles[style];
  const name = callName(child.nickname);
  const first = firstRecommendation(survey.result, ageInMonths(child.birthDate), undefined, childPrefs(child));
  // 모든 영역이 같은 답이면 고르게 자라는 중으로 안내
  const even = AREA_ORDER.every((a) => levels[a] === levels.lang);
  const focusAreas = even ? [] : focus;

  function goPlay() {
    if (!child || !first) return setNoPlay(true);
    saveRecommendation({ childId: child.id, playId: first.play.id, reason: first.reason });
    router.push(`/play/${first.play.id}`);
  }

  return (
    <main className="flex flex-1 flex-col px-5 pb-[calc(32px+env(safe-area-inset-bottom))]">
      <PageHeader back />
      <H1 className="mt-2">
        {focusAreas.length > 0
          ? `${josa(name, "과", "와")} 함께\n${focusAreas.slice(0, 2).map((a) => AREA_LABEL[a]).join("·")} 놀이부터 해요`
          : `${josa(name, "이", "가")} 좋아하는\n놀이로 이어가요`}
      </H1>
      <p className="mt-2 text-[13.5px] font-medium leading-[1.55] text-sub">
        {focusAreas.length > 0
          ? `${focusAreas.map((a) => AREA_LABEL[a]).join(", ")} 영역 놀이를 더 추천해 드릴게요. 진단 결과가 아니라 놀이를 고르기 위한 참고예요.`
          : "여러 영역을 골고루 섞어서 추천해 드릴게요. 진단 결과가 아니라 놀이를 고르기 위한 참고예요."}
      </p>

      <Card className="mt-6">
        <ul className="flex flex-col gap-4">
          {AREA_ORDER.map((a) => (
            <li key={a} className="flex flex-col gap-2">
              <p className="text-[14px] font-medium">{sentence(a, levels[a])}</p>
              <ProgressBar value={Math.max(0.06, Math.min(levels[a], 2) / 2)} label={AREA_LABEL[a]} />
            </li>
          ))}
        </ul>
      </Card>

      <Card className="mt-3">
        <p className="text-[13px] font-semibold text-sub">놀이 스타일 · {styleInfo.label}</p>
        <p className="mt-1.5 text-[14px] font-medium leading-[1.5]">{styleInfo.tip}</p>
        {lowRecovery && <p className="mt-1 text-[14px] font-medium leading-[1.5]">{QUESTION_SET.lowRecoveryTip}</p>}
      </Card>

      {suggestConsult && (
        <section className="mt-3 rounded-[18px] bg-sage-xlight px-[18px] py-4">
          <h2 className="text-[15px] font-bold">전문가와 한번 이야기해 보세요</h2>
          <p className="mt-1.5 text-[13.5px] font-medium leading-[1.55] text-sub">
            일부 답변은 전문가와 함께 살펴보면 좋은 모습이에요. 걱정할 일이라는 뜻은 아니에요. 기다리는 센터나 가까운
            소아청소년과에 상담을 문의해 보세요.
          </p>
        </section>
      )}

      {noPlay && <p className="mt-4 text-[13.5px] font-medium text-sub">지금 월령에 맞는 놀이를 준비하고 있어요.</p>}

      <div className="mt-auto pt-8">
        <Button full onClick={goPlay}>
          첫 놀이 보기
        </Button>
      </div>
    </main>
  );
}
