// 기록 → 센터 상담용 요약
// 사실 정리(횟수·즐거워한/어려워한 놀이)는 규칙으로, 문장은 로컬 AI(Ollama)로.
// 로컬 AI가 없거나 답이 이상하면 규칙으로 만든 문장을 씁니다.
// ⚠️ SYSTEM·facts 형식은 ai/make_dataset.mjs와 같아야 학습한 모델이 제대로 답합니다.
import { AREA_LABEL, type PlayLog } from "@/types";
import { getPlay } from "./recommend";

export type ReportText = { interests: string; difficulties: string; summary: string; by: "ai" | "rule" };

export const SYSTEM = `너는 '놀이다리'의 기록 정리 도우미야.
부모가 남긴 놀이 기록 정리를 읽고, 센터 상담 때 보여줄 정리를 JSON으로만 답한다.
규칙:
- 기록에 있는 사실만 쓴다. 기록에 없는 행동이나 놀이를 지어내지 않는다.
- 진단, 발달 수준 판정, 놀이 효과 단정("좋아졌다", "향상됐다", "지연이다")을 하지 않는다.
- 정리된 사실(횟수, 즐거워한 놀이, 어려워한 놀이)과 부모 메모만 근거로 쓴다. 숫자를 바꾸지 않는다.
- 어려워한 놀이가 '없음'이면 difficulties에 '기록에서 어려워한 놀이는 없었어요.'라고 쓴다.
- '발달', '향상', '점차', '늘었다'처럼 변화나 효과를 말하는 표현을 쓰지 않는다. 무엇을 했고 어떻게 반응했는지만 쓴다.
- 부모를 탓하거나 평가하지 않는다. 쉬운 말로 쓴다.
형식: {"interests": "아이가 흥미를 보인 점 1~2문장", "difficulties": "아이가 어려워한 점 1~2문장", "summary": "기간 동안의 놀이 모습 요약 3문장"}`;

const BANNED = /진단|지연|향상|좋아졌|발달|점차|늘어|효과|적응|관심이 없|보여주|변화|성장|능력|수준/;

const mmdd = (iso: string) => iso.slice(5, 10);
const title = (l: PlayLog) => getPlay(l.playId)?.title ?? l.playId;

function tally(items: string[]): [string, number][] {
  const m = new Map<string, number>();
  for (const x of items) m.set(x, (m.get(x) ?? 0) + 1);
  return [...m];
}
const list = (logs: PlayLog[]) => tally(logs.map(title)).map(([t, c]) => `${t}(${c}회)`).join(", ") || "없음";

/** 모델에 넘기는 사실 정리. logs는 기간 안의 기록 */
export function facts(logs: PlayLog[]): string {
  const sorted = [...logs].sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  const areas = tally(sorted.map((l) => AREA_LABEL[getPlay(l.playId)?.area ?? "lang"]))
    .map(([a, c]) => `${a} ${c}회`)
    .join(", ");
  const memos = sorted.filter((l) => l.memo).map((l) => `- ${mmdd(l.createdAt)} ${title(l)}: "${l.memo}"`);
  return [
    `기록 기간: ${mmdd(sorted[0].createdAt)} ~ ${mmdd(sorted.at(-1)!.createdAt)} (${sorted.length}회)`,
    `영역별 횟수: ${areas}`,
    `즐거워한 놀이: ${list(sorted.filter((l) => l.reaction === "enjoyed"))}`,
    `어려워한 놀이: ${list(sorted.filter((l) => l.reaction === "hard"))}`,
    `못한 놀이: ${list(sorted.filter((l) => l.done === "notDone"))}`,
    `부모 메모:`,
    ...(memos.length ? memos : ["- 없음"]),
  ].join("\n");
}

/** 로컬 AI 없이 규칙으로 만든 문장 */
export function ruleReport(logs: PlayLog[]): ReportText {
  const enjoyed = list(logs.filter((l) => l.reaction === "enjoyed"));
  const hard = list(logs.filter((l) => l.reaction === "hard"));
  const done = logs.filter((l) => l.done === "done").length;
  return {
    interests: enjoyed === "없음" ? "기록에서 특히 즐거워한 놀이는 없었어요." : `즐거워한 놀이: ${enjoyed}`,
    difficulties: hard === "없음" ? "기록에서 어려워한 놀이는 없었어요." : `어려워한 놀이: ${hard}`,
    summary: `기간 동안 놀이를 ${logs.length}번 기록했고, 그중 ${done}번은 끝까지 했어요.`,
    by: "rule",
  };
}

/** 로컬 AI 답을 검사. 형식이 틀리거나 금지 표현이 있으면 null */
export function parseAiReport(raw: string): ReportText | null {
  try {
    const j = JSON.parse(raw);
    if (typeof j.interests !== "string" || typeof j.difficulties !== "string" || typeof j.summary !== "string") return null;
    if (BANNED.test(j.interests + j.difficulties + j.summary)) return null;
    return { interests: j.interests, difficulties: j.difficulties, summary: j.summary, by: "ai" };
  } catch {
    return null;
  }
}
