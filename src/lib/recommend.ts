// 규칙 기반 추천 (LLM 없음). README "추천 방식" 참고.
import playsJson from "../../data/plays.json";
import type { CheckAnswers, DevArea, Nuri, Play, Temperament } from "@/types";

export const PLAYS = playsJson as Play[];

// 동점일 때 쓰는 고정 순서
const DEV_ORDER: DevArea[] = ["gross", "fine", "lang", "cog", "soc"];

// 발달 영역 → 누리과정 영역 (걱정 영역 동점 처리용)
const AREA_NURI: Record<DevArea, Nuri> = {
  gross: "신체운동·건강",
  fine: "신체운동·건강",
  lang: "의사소통",
  cog: "자연탐구",
  soc: "사회관계",
};

/** 발달 5문항 중 점수가 가장 낮은 영역. 동점이면 걱정 영역과 맞는 것 → 고정 순서. */
export function lowestArea(answers: CheckAnswers, concern: Nuri | null): DevArea {
  const min = Math.min(...DEV_ORDER.map((a) => answers[a]));
  const tied = DEV_ORDER.filter((a) => answers[a] === min);
  return tied.find((a) => concern && AREA_NURI[a] === concern) ?? tied[0];
}

/** 기질 3문항 중 가장 높은 점수. 동점이면 신중형 → 탐색형 → 주도형. */
export function temperament(answers: CheckAnswers): Temperament {
  const order: [keyof CheckAnswers, Temperament][] = [
    ["cautious", "신중형"],
    ["explore", "탐색형"],
    ["initiative", "주도형"],
  ];
  const max = Math.max(...order.map(([k]) => answers[k]));
  return order.find(([k]) => answers[k] === max)![1];
}

/** 만 나이 */
export function ageInYears(birthDate: string, today = new Date()): number {
  const b = new Date(birthDate);
  let age = today.getFullYear() - b.getFullYear();
  const m = today.getMonth() - b.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < b.getDate())) age--;
  return age;
}

// 감수 전 놀이는 추천 금지. 개발·시연용으로만 NEXT_PUBLIC_ALLOW_UNREVIEWED=true 허용.
const ALLOW_UNREVIEWED = process.env.NEXT_PUBLIC_ALLOW_UNREVIEWED === "true";

export function isRecommendable(p: Play): boolean {
  return ALLOW_UNREVIEWED || p.reviewedBy !== null;
}

/** 영역·나이에 맞는 감수된 놀이. 나이 맞는 게 없으면 영역만 맞춰서. 없으면 null. */
export function pickPlay(area: DevArea, age: number, plays: Play[] = PLAYS): Play | null {
  const inArea = plays.filter((p) => p.area === area && isRecommendable(p));
  return inArea.find((p) => age >= p.ageYears[0] && age <= p.ageYears[1]) ?? inArea[0] ?? null;
}

export function getPlay(id: string): Play | undefined {
  return PLAYS.find((p) => p.id === id);
}
