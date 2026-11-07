// 추천 규칙 (외부 AI 없이 규칙으로 계산)
// 1) 첫 추천: 지원이 더 필요해 보이는 영역(focus) → 설문 단계(startStep)에 맞는 놀이 (startStep 이하 중 가장 높은 단계)
// 2) 다음 추천: 마지막 기록 반응으로 단계 조정
//    즐거워함+완료 → 같은 놀이 한 단계 위 / 어려워함·못함 → 한 단계 아래, 이미 가장 쉬우면 다른 방식 / 그 외 → 같은 단계의 다른 놀이
// 3) 균형: 최근 기록 3개가 모두 같은 영역이면 덜 해본 영역으로 바꿈
import playsJson from "../../data/plays.json";
import { AREA_LABEL, type Area, type ChildPrefs, type Play, type PlayLog, type SurveyResult } from "@/types";

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

const NO_PREFS: ChildPrefs = { likes: [], concernAreas: [] };

/** 먼저 함께할 영역 순서: 설문 focus·부모 선택 둘 다 → focus만 → 부모 선택만 (규칙은 src/types.ts ChildPrefs) */
export function areaPriority(result: SurveyResult | null, prefs: ChildPrefs = NO_PREFS): Area[] {
  const focus = result?.focus ?? [];
  const concern = prefs.concernAreas;
  const both = focus.filter((a) => concern.includes(a));
  return [...new Set([...both, ...focus, ...concern])];
}

export function firstRecommendation(
  result: SurveyResult | null,
  months: number,
  plays = PLAYS,
  prefs: ChildPrefs = NO_PREFS,
): Pick | null {
  const ok = eligible(months, plays);
  for (const area of areaPriority(result, prefs)) {
    const play = atStartStep(ok, area, result);
    if (!play) continue;
    const chosen = prefs.concernAreas.includes(area);
    const why = chosen && !result?.focus.includes(area) ? "더 함께하고 싶다고 고른" : "";
    const lead = why ? `${why} ${AREA_LABEL[area]} 영역을` : `${AREA_LABEL[area]} 영역을 지금 모습에 맞는`;
    return { play, reason: `${lead} ${play.step}단계부터 시작해요` };
  }
  // 함께할 영역이 따로 없으면 좋아하는 놀이 종류부터
  for (const area of prefs.likes) {
    const play = atStartStep(ok, area, result);
    if (play) return { play, reason: `좋아하는 ${AREA_LABEL[area]} 놀이로 시작해요` };
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
  prefs: ChildPrefs = NO_PREFS,
): Pick | null {
  const ok = eligible(months, plays);
  const sorted = [...logs].sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  const last = sorted.at(-1);
  const lastPlay = last && plays.find((p) => p.id === last.playId);
  if (!last || !lastPlay) return firstRecommendation(result, months, plays, prefs);

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
    const order = [...areaPriority(result, prefs), ...prefs.likes];
    const areas = [...new Set(ok.map((p) => p.area))]
      .filter((a) => a !== chosen.play.area)
      .sort((a, b) => count(a) - count(b) || (order.indexOf(a) + 1 || 99) - (order.indexOf(b) + 1 || 99));
    const alt = areas.length ? atStartStep(ok, areas[0], result) : undefined;
    if (alt) return { play: alt, reason: `한 영역에 몰리지 않게 ${AREA_LABEL[alt.area]} 놀이를 골랐어요` };
  }
  return chosen;
}

/** 월령에 맞고 추천 가능한 놀이 (놀이 목록 화면) */
export function playsForMonths(months: number, plays = PLAYS): Play[] {
  return eligible(months, plays);
}

/** 홈 '다른 놀이': 같은 월령에서 지금 놀이 다음 순서의 놀이 (한 바퀴 돌면 처음으로) */
export function nextPlay(currentId: string, months: number, plays = PLAYS): Play | null {
  const list = eligible(months, plays);
  if (list.length === 0) return null;
  const i = list.findIndex((p) => p.id === currentId);
  return list[(i + 1) % list.length];
}

/**
 * 홈 '다른 놀이' → 영역 고르기: 고른 영역에서 지금 놀이를 뺀 놀이 중
 * 설문 단계(startStep) 이하에서 가장 높은 단계 → 그 단계에서 덜 해본 놀이 순
 */
export function pickInArea(
  area: Area,
  result: SurveyResult | null,
  months: number,
  currentId: string | null,
  logs: PlayLog[],
  plays = PLAYS,
): Pick | null {
  const inArea = eligible(months, plays).filter((p) => p.area === area && p.id !== currentId);
  if (!inArea.length) return null;
  const start = result?.startStep[area] ?? 1;
  const steps = inArea.map((p) => p.step).filter((s) => s <= start);
  const target = steps.length ? Math.max(...steps) : Math.min(...inArea.map((p) => p.step));
  const done = (id: string) => logs.filter((l) => l.playId === id).length;
  const play = inArea.filter((p) => p.step === target).sort((a, b) => done(a.id) - done(b.id))[0];
  return { play, reason: `${AREA_LABEL[area]} 놀이로 골랐어요` };
}

/** 이 월령에서 추천 가능한 놀이가 있는 영역 */
export function areasForMonths(months: number, plays = PLAYS): Set<Area> {
  return new Set(eligible(months, plays).map((p) => p.area));
}
