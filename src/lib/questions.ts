// 체크 문항 문구 (초안). 기획 확정 시 이 파일만 고치면 됩니다.
import type { DevArea, Nuri, Reaction, Score, TempItem } from "@/types";

export const REACTION_LABEL: Record<Reaction, string> = {
  done: "해봤어요",
  difficult: "어려웠어요",
  loved: "반응 좋았어요",
};

export const DEV_QUESTIONS: { key: DevArea; label: string; text: string }[] = [
  { key: "gross", label: "대근육", text: "뛰기·계단 오르기·공 차기를 또래만큼 해요" },
  { key: "fine", label: "소근육", text: "블록 쌓기·가위질·크레파스 쥐기를 혼자 해요" },
  { key: "lang", label: "언어", text: "원하는 것을 말(두세 단어 이상)로 표현해요" },
  { key: "cog", label: "인지", text: "색·모양·크기를 구분하고 간단한 규칙을 따라요" },
  { key: "soc", label: "사회성", text: "다른 사람과 눈을 맞추고 번갈아 놀이를 해요" },
];

export const TEMP_QUESTIONS: { key: TempItem; text: string }[] = [
  { key: "explore", text: "새로운 장난감이나 장소에 먼저 다가가요" },
  { key: "cautious", text: "처음 보는 사람·상황에서는 한참 지켜본 뒤 움직여요" },
  { key: "initiative", text: "놀이를 스스로 정하고 이끌려고 해요" },
  { key: "recovery", text: "속상한 일이 있어도 금방 다시 놀이로 돌아와요" },
];

export const SCORE_LABELS: Record<Score, string> = {
  1: "거의 아니에요",
  2: "가끔 그래요",
  3: "자주 그래요",
};

export const LIKED_AREAS = [
  "몸놀이",
  "블록·만들기",
  "그림·미술",
  "음악·노래",
  "책·이야기",
  "역할놀이",
  "자연·관찰",
  "퍼즐·숫자",
] as const;

export const NURI_AREAS: Nuri[] = ["신체운동·건강", "의사소통", "사회관계", "예술경험", "자연탐구"];

export const DEV_LABEL: Record<DevArea, string> = Object.fromEntries(
  DEV_QUESTIONS.map((q) => [q.key, q.label]),
) as Record<DevArea, string>;
