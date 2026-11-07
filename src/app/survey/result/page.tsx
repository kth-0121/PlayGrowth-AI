"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { AREA_LABEL, type Level } from "@/types";
import { Box, MissingStep, Notice, PageTitle, PrimaryButton } from "@/components/ui";
import { ageInMonths } from "@/lib/age";
import { currentChild, latestSurvey, saveRecommendation, useLocalData } from "@/lib/local-store";
import { firstRecommendation } from "@/lib/recommend";
import { AREA_ORDER, QUESTION_SET } from "@/lib/survey";

// 단계 0~3 → 부모가 이해하기 쉬운 말 (전문 용어·점수 숫자 노출 안 함)
function levelText(level: Level) {
  if (level === 3) return { text: "잘하고 있어요", cls: "bg-calm-soft text-calm" };
  if (level === 2) return { text: "조금씩 자라는 중", cls: "bg-brand-soft text-brand" };
  return { text: "함께 놀이해 봐요", cls: "bg-brand-soft text-brand font-bold" };
}

export default function SurveyResultPage() {
  const router = useRouter();
  const data = useLocalData();
  const [noPlay, setNoPlay] = useState(false);

  if (!data) return <p className="text-muted">불러오는 중…</p>;
  const child = currentChild(data);
  const survey = child && latestSurvey(data, child.id);
  if (!child || !survey)
    return <MissingStep text="설문을 먼저 해 주세요." href={child ? "/survey" : "/child"} label="설문하러 가기" />;

  const { levels, focus, style, lowRecovery, suggestConsult } = survey.result;
  const styleInfo = QUESTION_SET.styles[style];

  function goPlay() {
    if (!child || !survey) return;
    const rec = firstRecommendation(survey.result, ageInMonths(child.birthDate));
    if (!rec) return setNoPlay(true);
    saveRecommendation({ childId: child.id, playId: rec.play.id, reason: rec.reason });
    router.push(`/play/${rec.play.id}`);
  }

  return (
    <div className="flex flex-col gap-6">
      <PageTitle step="2 / 4" title={`${child.nickname}의 결과`} desc="평소 모습을 바탕으로 정리했어요." />
      <Notice>진단 결과가 아니에요. 어떤 놀이부터 하면 좋을지 고르기 위한 참고예요.</Notice>

      <Box title="영역별 모습">
        <ul className="flex flex-col gap-3">
          {AREA_ORDER.map((a) => {
            const lv = levelText(levels[a]);
            return (
              <li key={a} className="flex items-center gap-3">
                <span className="w-14 shrink-0 text-sm font-medium">{AREA_LABEL[a]}</span>
                <span className="h-2.5 flex-1 overflow-hidden rounded-full bg-line">
                  <span
                    className="block h-full rounded-full bg-calm"
                    style={{ width: `${Math.max(8, (levels[a] / 3) * 100)}%` }}
                  />
                </span>
                <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs ${lv.cls}`}>{lv.text}</span>
              </li>
            );
          })}
        </ul>
      </Box>

      <Box title="놀이로 더 도와주면 좋은 영역">
        {focus.length > 0 ? (
          <p className="text-sm leading-relaxed">
            <b className="text-brand">{focus.map((a) => AREA_LABEL[a]).join(", ")}</b> 영역을 놀이로 함께 키워 봐요.
          </p>
        ) : (
          <p className="text-sm">전체적으로 고르게 자라고 있어요. 좋아하는 놀이로 즐겁게 이어가 봐요.</p>
        )}
      </Box>

      <Box title={`우리 아이 놀이 스타일 · ${styleInfo.label}`}>
        <ul className="flex flex-col gap-1.5 text-sm leading-relaxed">
          <li>{styleInfo.tip}</li>
          {lowRecovery && <li>{QUESTION_SET.lowRecoveryTip}</li>}
        </ul>
      </Box>

      {suggestConsult && (
        <section className="rounded-2xl border-2 border-brand bg-brand-soft p-5 text-sm leading-relaxed">
          <p className="font-bold">전문기관 상담을 받아 보시길 권해요</p>
          <p className="mt-1">
            일부 응답은 전문가와 한번 이야기해 보면 좋은 모습이에요. 걱정하실 일이라는 뜻은 아니에요. 가까운 발달지원센터나
            소아청소년과에 상담을 문의해 보세요.
          </p>
        </section>
      )}

      {noPlay && <Notice tone="brand">지금 월령에 맞는 놀이를 준비하고 있어요. 조금만 기다려 주세요.</Notice>}
      <PrimaryButton type="button" onClick={goPlay}>
        추천 놀이 보기
      </PrimaryButton>
    </div>
  );
}
