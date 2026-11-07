// 팀 공통 계약. 바꿀 땐 PR로 팀원 전원 확인.

// 발달 체크 5영역 (체크 문항 기준)
export type DevArea = "gross" | "fine" | "lang" | "cog" | "soc";

// 누리과정 5영역 (부모가 고르는 "걱정되는 영역", 놀이 카드 연계 표시)
export type Nuri = "신체운동·건강" | "의사소통" | "사회관계" | "예술경험" | "자연탐구";

// 기질 4문항
export type TempItem = "explore" | "cautious" | "initiative" | "recovery";
export type Temperament = "탐색형" | "신중형" | "주도형";

// 1 거의 아니에요 · 2 가끔 그래요 · 3 자주 그래요
export type Score = 1 | 2 | 3;
export type CheckAnswers = Record<DevArea | TempItem, Score>;

export type Play = {
  id: string;              // "lang-001"
  title: string;
  area: DevArea;
  nuri: Nuri;
  ageYears: [number, number]; // 만 나이 [최소, 최대], MVP는 3~5
  level: "쉬움" | "보통";
  materials: string[];
  steps: { text: string; minutes: number }[];
  questions: string[];     // 부모가 건네는 발문 예시
  points: string[];        // 발달 포인트
  next: string;            // 다음 단계 도전
  reviewedBy: string | null; // 감수자, null이면 추천 금지
};

// 놀이 카드 상태: AI(규칙) 추천 → 센터 확인 → 부모에게 발송
export type CardStatus = "draft" | "confirmed" | "sent";

export type Reaction = "done" | "difficult" | "loved"; // 해봤어요 · 어려웠어요 · 반응 좋았어요
