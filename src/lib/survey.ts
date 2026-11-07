// 설문 문항 고르기·결과 계산 (영아용·유아용 각 9문항)
import questionsJson from "../../data/questions.json";
import {
  AGE_GROUP,
  FREQUENCY_SCORE,
  type AgeGroup,
  type Area,
  type DevQuestion,
  type Frequency,
  type Level,
  type PlayStyle,
  type QuestionSet,
  type SurveyAnswers,
  type SurveyResult,
  type TempItem,
  type TempQuestion,
} from "@/types";

export const QUESTION_SET = questionsJson as QuestionSet;
export const AREA_ORDER: Area[] = ["lang", "cog", "soc", "gross", "fine"];
export const TEMP_ORDER: TempItem[] = ["explore", "cautious", "initiative", "recovery"];

export const LEVEL_MARK: Record<Level, string> = { 0: "아직이에요", 1: "①", 2: "②", 3: "③" };
export const FREQUENCY_LABEL: Record<Frequency, string> = {
  often: "자주 그래요",
  sometimes: "가끔 그래요",
  rarely: "거의 아니에요",
};

/** 월령 → 기본 문항 세트 (영아 0~35개월, 유아 36~83개월) */
export function groupFor(months: number): AgeGroup {
  return months <= AGE_GROUP.infant.months[1] ? "infant" : "preschool";
}

export function devQuestionsFor(group: AgeGroup): DevQuestion[] {
  return QUESTION_SET.dev
    .filter((q) => q.group === group)
    .sort((a, b) => AREA_ORDER.indexOf(a.area) - AREA_ORDER.indexOf(b.area));
}

export function tempQuestionsFor(group: AgeGroup): TempQuestion[] {
  return QUESTION_SET.temp
    .filter((q) => q.group === group)
    .sort((a, b) => TEMP_ORDER.indexOf(a.item) - TEMP_ORDER.indexOf(b.item));
}

/** 결과 규칙은 src/types.ts의 SurveyResult 주석 참고 */
export function scoreSurvey(answers: SurveyAnswers): SurveyResult {
  const { group, dev, temp } = answers;
  const levels = Object.fromEntries(AREA_ORDER.map((a) => [a, dev[a]])) as Record<Area, Level>;

  const min = Math.min(...AREA_ORDER.map((a) => levels[a]));
  const focus = min < 3 ? AREA_ORDER.filter((a) => levels[a] === min) : [];

  const startStep = Object.fromEntries(
    AREA_ORDER.map((a) => [a, Math.max(1, levels[a]) as 1 | 2 | 3]),
  ) as Record<Area, 1 | 2 | 3>;

  // 동점이면 신중형 → 탐색형 → 주도형 순으로 우선
  const styleScore: [PlayStyle, number][] = [
    ["careful", FREQUENCY_SCORE[temp.cautious]],
    ["explorer", FREQUENCY_SCORE[temp.explore]],
    ["leader", FREQUENCY_SCORE[temp.initiative]],
  ];
  const style = styleScore.reduce((best, cur) => (cur[1] > best[1] ? cur : best))[0];

  const consultAreas = new Set(devQuestionsFor(group).filter((q) => q.consultIfNotYet).map((q) => q.area));
  const notYet = AREA_ORDER.filter((a) => levels[a] === 0);
  const suggestConsult = notYet.some((a) => consultAreas.has(a)) || notYet.length >= 2;

  return { group, levels, focus, startStep, style, lowRecovery: temp.recovery === "rarely", suggestConsult };
}
