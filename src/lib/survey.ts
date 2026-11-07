// 설문 문항 고르기·결과 계산
import questionsJson from "../../data/questions.json";
import { ANSWER_SCORE, type Answer, type Area, type Question, type SurveyResult } from "@/types";

export const QUESTIONS = questionsJson as Question[];
export const AREA_ORDER: Area[] = ["lang", "cog", "soc", "gross", "fine"];

export const ANSWER_LABEL: Record<Answer, string> = {
  often: "자주 그렇다",
  sometimes: "가끔 그렇다",
  notYet: "아직 아니다",
};

/** 월령에 맞는 문항. 영역 순서대로 정렬. */
export function questionsFor(months: number): Question[] {
  return QUESTIONS.filter((q) => months >= q.months[0] && months <= q.months[1]).sort(
    (a, b) => AREA_ORDER.indexOf(a.area) - AREA_ORDER.indexOf(b.area),
  );
}

// 영역 평균이 이 값보다 낮으면 "지원이 더 필요해 보이는 영역" (0~2점 중 "가끔"=1)
const FOCUS_BELOW = 1.5;

/** 설문 결과. 문항이 없는 영역은 scores에서 빠지고(-1), focus에도 들어가지 않음. */
export function scoreSurvey(questions: Question[], answers: Record<string, Answer>): SurveyResult {
  const sum: Partial<Record<Area, { total: number; n: number }>> = {};
  for (const q of questions) {
    const a = answers[q.id];
    if (!a) continue;
    const s = (sum[q.area] ??= { total: 0, n: 0 });
    s.total += ANSWER_SCORE[a];
    s.n += 1;
  }
  const scores = Object.fromEntries(
    AREA_ORDER.map((area) => {
      const s = sum[area];
      return [area, s ? Math.round((s.total / s.n) * 100) / 100 : -1];
    }),
  ) as Record<Area, number>;

  const focus = AREA_ORDER.filter((a) => scores[a] >= 0 && scores[a] < FOCUS_BELOW).sort(
    (a, b) => scores[a] - scores[b],
  );
  const suggestConsult = questions.some((q) => q.redFlag && answers[q.id] === "notYet");
  return { scores, focus, suggestConsult };
}
