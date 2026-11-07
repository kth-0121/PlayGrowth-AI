// 팀 공통 계약. 바꿀 땐 PR로 팀원 전원 확인.

// 발달 5영역
export type Area = "lang" | "cog" | "soc" | "gross" | "fine"; // 언어·인지·사회성·대근육·소근육

export const AREA_LABEL: Record<Area, string> = {
  lang: "언어",
  cog: "인지",
  soc: "사회성",
  gross: "대근육",
  fine: "소근육",
};

// 월령 범위 [최소, 최대] (개월, 0~83 = 만 0~6세)
export type MonthRange = [number, number];

// ── 기능 1. 발달 상태 확인 설문 ──────────────────────────
// data/questions.json
export type Question = {
  id: string;            // "lang-12-01"
  area: Area;
  months: MonthRange;    // 이 월령의 아이에게만 나오는 질문
  text: string;          // "이름을 부르면 돌아보나요?" (일상에서 관찰 가능한 행동)
  redFlag: boolean;      // true면 "아직 아니다" 응답 시 전문기관 상담 권유
};

export type Answer = "often" | "sometimes" | "notYet"; // 자주 그렇다 · 가끔 그렇다 · 아직 아니다
export const ANSWER_SCORE: Record<Answer, number> = { often: 2, sometimes: 1, notYet: 0 };

export type SurveyResult = {
  scores: Record<Area, number>; // 영역별 평균 0~2
  focus: Area[];                // 지원이 더 필요해 보이는 영역 (점수 낮은 순)
  suggestConsult: boolean;      // 상담 권유 문구 표시 여부
};

// ── 기능 2. 맞춤 놀이 추천 ───────────────────────────────
// data/plays.json
export type Play = {
  id: string;            // "lang-sound-1"
  series: string;        // 같은 놀이의 단계 묶음 "lang-sound"
  step: 1 | 2 | 3;       // 1 쉬움 → 3 발전 (즐거워하면 +1, 어려워하면 -1)
  title: string;
  area: Area;
  months: MonthRange;
  minutes: number;       // 10~20
  materials: string[];   // 집에 있는 물건 우선
  steps: string[];
  tips: string[];        // 아이가 어려워할 때 대처 팁
  reviewedBy: string | null; // 전문가 자문 확인자, null이면 추천 금지
};

// ── 기능 3. 기록 · 추천 고도화 ───────────────────────────
export type Done = "done" | "partial" | "notDone";       // 완료 · 일부 진행 · 못함
export type Reaction = "enjoyed" | "neutral" | "hard";   // 즐거워함 · 보통 · 어려워함

export type PlayLog = {
  id: string;
  childId: string;
  playId: string;
  done: Done;
  reaction: Reaction;
  memo: string | null;
  photoPath: string | null; // 돌아보기용. AI가 사진으로 판단하지 않음
  createdAt: string;
};

// ── 기능 4. 부모 커뮤니티 ────────────────────────────────
export type Board = "review" | "center" | "worry"; // 놀이 후기·아이디어 · 센터 이용·준비 경험 · 고민 나누기
export const BOARD_LABEL: Record<Board, string> = {
  review: "놀이 후기·아이디어",
  center: "센터 이용·준비 경험",
  worry: "고민 나누기",
};
