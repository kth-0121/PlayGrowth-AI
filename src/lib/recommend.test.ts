// 추천 규칙 점검: npx tsx src/lib/recommend.test.ts
import assert from "node:assert/strict";
import type { Play, PlayLog, Reaction, Done, SurveyResult } from "@/types";
import { areaPriority, firstRecommendation, nextRecommendation, pickInArea } from "./recommend";

const mk = (id: string, series: string, step: 1 | 2 | 3, area: Play["area"]): Play => ({
  id, series, step, area, title: id, months: [0, 83], minutes: 10, materials: [], steps: [], tips: [], reviewedBy: "test",
});
const PLAYS = [
  mk("a1", "a", 1, "lang"), mk("a2", "a", 2, "lang"), mk("a3", "a", 3, "lang"),
  mk("b1", "b", 1, "lang"),
  mk("c1", "c", 1, "fine"),
];
let t = 0;
const log = (playId: string, done: Done, reaction: Reaction): PlayLog => ({
  id: String(t), childId: "k", playId, done, reaction, memo: null, photoPaths: [],
  createdAt: new Date(2026, 10, 1, 0, 0, t++).toISOString(),
});
const result: SurveyResult = {
  group: "infant", levels: { lang: 1, cog: 3, soc: 3, gross: 3, fine: 1 }, focus: ["lang", "fine"],
  startStep: { lang: 1, cog: 3, soc: 3, gross: 3, fine: 1 }, style: "careful", lowRecovery: false, suggestConsult: false,
};
const next = (logs: PlayLog[]) => nextRecommendation(result, 24, logs, PLAYS)!.play.id;

assert.equal(firstRecommendation(result, 24, PLAYS)!.play.id, "a1");            // focus 첫 영역, 설문 단계 1
assert.equal(                                                                   // 설문 단계 2면 2단계부터
  firstRecommendation({ ...result, startStep: { ...result.startStep, lang: 2 } }, 24, PLAYS)!.play.id,
  "a2",
);
assert.equal(next([]), "a1");                                                   // 기록 없으면 첫 추천
assert.equal(next([log("a1", "done", "enjoyed")]), "a2");                       // 즐거워함 → 한 단계 위
assert.equal(next([log("a2", "partial", "hard")]), "a1");                       // 어려워함 → 한 단계 아래
assert.equal(next([log("a1", "notDone", "neutral")]), "b1");                    // 가장 쉬운데 못함 → 다른 방식
assert.equal(next([log("a2", "done", "neutral")]), "b1");                       // 보통 → 같은 영역 다른 놀이
assert.equal(next([log("a3", "done", "enjoyed")]), "a3");                       // 더 위 단계 없음 → 한 번 더
assert.equal(                                                                   // 언어만 3번 → 균형으로 소근육
  next([log("a1", "done", "enjoyed"), log("a2", "done", "enjoyed"), log("b1", "done", "neutral")]),
  "c1",
);
assert.equal(                                                                   // 균형 이동도 설문 단계 기준 (fine 2단계)
  nextRecommendation({ ...result, startStep: { ...result.startStep, fine: 2 } }, 24,
    [log("a1", "done", "enjoyed"), log("a2", "done", "enjoyed"), log("b1", "done", "neutral")],
    [...PLAYS, mk("c2", "c", 2, "fine")])!.play.id,
  "c2",
);

// 부모 관심(ChildPrefs)
const G = [...PLAYS, mk("g1", "g", 1, "gross"), mk("g2", "g", 2, "gross"), mk("s1", "s", 1, "soc")];
const prefs = (concernAreas: Play["area"][], likes: Play["area"][] = []) => ({ concernAreas, likes });
assert.deepEqual(areaPriority(result, prefs(["fine", "soc"])), ["fine", "lang", "soc"]); // 둘 다 → focus만 → 부모 선택만
assert.equal(firstRecommendation(result, 24, G, prefs(["fine"]))!.play.id, "c1");        // focus∩선택(소근육)이 1순위
assert.equal(firstRecommendation(null, 24, G, prefs(["soc"]))!.play.id, "s1");           // 설문 없으면 부모 선택 영역
const allGood: SurveyResult = { ...result, focus: [], startStep: { lang: 3, cog: 3, soc: 3, gross: 2, fine: 3 } };
assert.equal(firstRecommendation(allGood, 24, G, prefs([], ["gross"]))!.play.id, "g2");  // 모두 ③이면 좋아하는 놀이, 설문 단계
assert.equal(                                                                            // 균형 이동 때 좋아하는 영역 먼저
  nextRecommendation(allGood, 24,
    [log("a1", "done", "enjoyed"), log("a2", "done", "enjoyed"), log("b1", "done", "neutral")],
    G, prefs([], ["gross"]))!.play.area,
  "gross",
);
assert.equal(pickInArea("lang", result, 24, "a1", [], G)!.play.id, "b1");                   // 영역 고르기: 지금 놀이 빼고 같은 단계
console.log("recommend: all checks passed");
