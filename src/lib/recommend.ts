// 추천 규칙 (외부 AI 없이 규칙으로 계산)
// 1) 첫 추천: 지원이 더 필요해 보이는 영역(focus) → 설문 단계(startStep)에 맞는 놀이 (startStep 이하 중 가장 높은 단계)
// 2) 다음 추천: 마지막 기록 반응으로 단계 조정
//    즐거워함+완료 → 같은 놀이 한 단계 위 / 어려워함·못함 → 한 단계 아래, 이미 가장 쉬우면 다른 방식 / 그 외 → 같은 단계의 다른 놀이
// 3) 균형: 최근 기록 3개가 모두 같은 영역이면 덜 해본 영역으로 바꿈
import playsJson from "../../data/plays.json";
import { AREA_LABEL, type Area, type Play, type PlayLog, type SurveyResult } from "@/types";

export const PLAYS = playsJson as Play[];

// 감수 전 놀이(reviewedBy: null)는 추천 금지. 개발·시연 중에만 .env.local에서 허용.
const ALLOW_UNREVIEWED = process.env.NEXT_PUBLIC_ALLOW_UNREVIEWED === "true";
const BALANCE_WINDOW = 3;

export type Pick = { play: Play; reason: string };

export function getPlay(id: string): Play | undefined {
  return PLAYS.find((p) => p.id === id);
}

function eligible(months: number, plays: Play[]): Play[] {
  return plays.filter(
    (p) => (ALLOW_UNREVIEWED || p.reviewedBy !== null) && months >= p.months[0] && months <= p.months[1],
  );
}

const easiest = (ps: Play[]) => [...ps].sort((a, b) => a.step - b.step)[0];

/** 영역 안에서 설문 단계(startStep) 이하 중 가장 높은 단계의 놀이. 설문이 없으면 가장 쉬운 단계 */
function atStartStep(ok: Play[], area: Area, result: SurveyResult | null): Play | undefined {
  const inArea = ok.filter((p) => p.area === area);
  if (!inArea.length) return undefined;
  const start = result?.startStep[area] ?? 1;
  const steps = inArea.map((p) => p.step).filter((s) => s <= start);
  const target = steps.length ? Math.max(...steps) : Math.min(...inArea.map((p) => p.step));
  return inArea.find((p) => p.step === target);
}

export function firstRecommendation(result: SurveyResult, months: number, plays = PLAYS): Pick | null {
  const ok = eligible(months, plays);
  for (const area of result.focus) {
    const play = atStartStep(ok, area, result);
    if (play) return { play, reason: `${AREA_LABEL[area]} 영역을 지금 모습에 맞는 ${play.step}단계부터 시작해요` };
  }
  const play = easiest(ok);
  return play ? { play, reason: "월령에 맞는 놀이로 시작해요" } : null;
}

/** 기록을 반영한 다음 추천. logs는 이 아이의 기록 전체(순서 무관). */
export function nextRecommendation(
  result: SurveyResult | null,
  months: number,
  logs: PlayLog[],
  plays = PLAYS,
): Pick | null {
  const ok = eligible(months, plays);
  const sorted = [...logs].sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  const last = sorted.at(-1);
  const lastPlay = last && plays.find((p) => p.id === last.playId);
  if (!last || !lastPlay) {
    if (result) return firstRecommendation(result, months, plays);
    const play = easiest(ok);
    return play ? { play, reason: "월령에 맞는 놀이로 시작해요" } : null;
  }

  const sameSeries = ok.filter((p) => p.series === lastPlay.series);
  const otherInArea = ok.filter((p) => p.area === lastPlay.area && p.series !== lastPlay.series);
  let pick: Pick | null = null;

  if (last.reaction === "enjoyed" && last.done === "done") {
    const up = sameSeries.find((p) => p.step === lastPlay.step + 1);
    if (up) pick = { play: up, reason: "즐거워해서 한 단계 발전된 놀이를 골랐어요" };
  } else if (last.reaction === "hard" || last.done === "notDone") {
    const down = sameSeries.find((p) => p.step === lastPlay.step - 1);
    const other = easiest(otherInArea);
    if (down) pick = { play: down, reason: "어려워해서 더 쉬운 단계로 바꿨어요" };
    else if (other) pick = { play: other, reason: "어려워해서 다른 방식의 놀이로 바꿨어요" };
  } else {
    const other = otherInArea.find((p) => p.step === lastPlay.step) ?? easiest(otherInArea);
    if (other) pick = { play: other, reason: `같은 ${AREA_LABEL[lastPlay.area]} 영역의 다른 놀이예요` };
  }
  const chosen = pick ?? { play: lastPlay, reason: "한 번 더 해 보면 좋아요" };

  // 균형: 최근 기록이 모두 같은 영역이고, 추천도 그 영역이면 덜 해본 영역으로
  const recent = sorted.slice(-BALANCE_WINDOW).map((l) => plays.find((p) => p.id === l.playId)?.area);
  const stuck = recent.length === BALANCE_WINDOW && recent.every((a) => a === chosen.play.area);
  if (stuck) {
    const count = (a: Area) => sorted.filter((l) => plays.find((p) => p.id === l.playId)?.area === a).length;
    const order = [...(result?.focus ?? [])];
    const areas = [...new Set(ok.map((p) => p.area))]
      .filter((a) => a !== chosen.play.area)
      .sort((a, b) => count(a) - count(b) || (order.indexOf(a) + 1 || 99) - (order.indexOf(b) + 1 || 99));
    const alt = areas.length ? atStartStep(ok, areas[0], result) : undefined;
    if (alt) return { play: alt, reason: `한 영역에 몰리지 않게 ${AREA_LABEL[alt.area]} 놀이를 골랐어요` };
  }
  return chosen;
}
