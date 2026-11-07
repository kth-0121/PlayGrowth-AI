// ⚠️ 임시 추천 규칙. 화면 연결용이며 실제 규칙(단계·균형)은 데이터·추천 담당이 이 파일을 교체합니다.
// 지금 규칙: 지원이 필요한 영역(focus) 순서대로 → 월령에 맞고 설문 단계(startStep)에 가장 가까운 놀이
// (startStep 이하 중 가장 높은 단계, 없으면 가장 쉬운 단계). 없으면 월령에 맞는 아무 놀이.
import playsJson from "../../data/plays.json";
import { AREA_LABEL, type Play, type SurveyResult } from "@/types";

export const PLAYS = playsJson as Play[];

// 감수 전 놀이(reviewedBy: null)는 추천 금지. 개발·시연 중에만 .env.local에서 허용.
const ALLOW_UNREVIEWED = process.env.NEXT_PUBLIC_ALLOW_UNREVIEWED === "true";

export function getPlay(id: string): Play | undefined {
  return PLAYS.find((p) => p.id === id);
}

export function firstRecommendation(result: SurveyResult, months: number): { play: Play; reason: string } | null {
  const ok = PLAYS.filter(
    (p) => (ALLOW_UNREVIEWED || p.reviewedBy !== null) && months >= p.months[0] && months <= p.months[1],
  );
  for (const area of result.focus) {
    const start = result.startStep[area];
    const inArea = ok.filter((p) => p.area === area).sort((a, b) => a.step - b.step);
    const play = inArea.filter((p) => p.step <= start).at(-1) ?? inArea[0];
    if (play) return { play, reason: `${AREA_LABEL[area]} 영역을 지금 모습에 맞는 ${play.step}단계부터 시작해요` };
  }
  const play = [...ok].sort((a, b) => a.step - b.step)[0];
  return play ? { play, reason: "월령에 맞는 놀이로 시작해요" } : null;
}
