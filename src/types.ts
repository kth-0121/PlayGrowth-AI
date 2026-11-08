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
// 영아용·유아용 각 9문항 = 발달 5문항(영역별 1개) + 기질 4문항.
// 발달이 느린 아이도 쓰므로 "할 수 있나요?"가 아니라 "지금 모습에 가장 가까운 단계"를 고른다.

export type AgeGroup = "infant" | "preschool"; // 영아 · 유아
export const AGE_GROUP: Record<AgeGroup, { label: string; months: MonthRange }> = {
  infant: { label: "영아", months: [0, 35] },
  preschool: { label: "유아", months: [36, 83] },
};

// 발달 문항: 0 아직이에요 · 1 ① · 2 ② · 3 ③
export type Level = 0 | 1 | 2 | 3;

export type DevQuestion = {
  id: string;                       // "infant-lang"
  group: AgeGroup;
  area: Area;
  levels: [string, string, string]; // ①②③ 쉬운 모습 → 발전한 모습 (일상에서 관찰 가능한 행동)
  notYet: string;                   // '아직이에요' 선택지 문구
  consultIfNotYet: boolean;         // true면 '아직이에요' 응답 시 전문기관 상담 권유
};

// 기질 문항: 놀이를 고르지 않고 놀이 진행 방식(팁)만 바꾼다
export type TempItem = "explore" | "cautious" | "initiative" | "recovery"; // 탐색 · 신중 · 주도 · 회복
export type Frequency = "often" | "sometimes" | "rarely"; // 자주 그래요 · 가끔 그래요 · 거의 아니에요
export const FREQUENCY_SCORE: Record<Frequency, number> = { often: 2, sometimes: 1, rarely: 0 };

export type TempQuestion = {
  id: string;            // "infant-explore"
  group: AgeGroup;
  item: TempItem;
  text: string;
};

// 화면에서는 '기질' 대신 '우리 아이 놀이 스타일'로 표시
export type PlayStyle = "explorer" | "careful" | "leader"; // 탐색형 · 신중형 · 주도형

export type QuestionSet = {
  dev: DevQuestion[];
  temp: TempQuestion[];
  styles: Record<PlayStyle, { label: string; tip: string }>;
  lowRecoveryTip: string; // 회복 '거의 아니에요'일 때 추가 팁
};

export type SurveyAnswers = {
  group: AgeGroup;       // 월령 기본값. 부모가 "더 쉬운 문항으로 보기"로 영아용을 고를 수 있음
  dev: Record<Area, Level>;
  temp: Record<TempItem, Frequency>;
};

// 결과 규칙
// - focus: 가장 낮은 단계인 영역들 (모두 ③이면 빈 배열)
// - startStep: 아직이에요·① → 1단계, ② → 2단계, ③ → 3단계 놀이부터
// - style: 탐색·신중·주도 중 점수가 가장 높은 것. 동점이면 신중형 (부담이 가장 적음)
// - suggestConsult: consultIfNotYet 영역에서 '아직이에요', 또는 '아직이에요'가 2개 영역 이상
export type SurveyResult = {
  group: AgeGroup;
  levels: Record<Area, Level>;
  focus: Area[];
  startStep: Record<Area, 1 | 2 | 3>;
  style: PlayStyle;
  lowRecovery: boolean;  // 회복 '거의 아니에요'
  suggestConsult: boolean;
};

// ── 아이 정보: 부모가 고르는 관심 (선택, MY에서 언제든 수정) ──────────
// 진단이 아니라 부모의 바람. 화면 문구는 '발달이 느린 영역'이 아니라 '더 함께 놀아 주고 싶은 영역'.
// 추천 순서
// - 영역: 설문 focus와 concernAreas 둘 다 → focus만 → concernAreas만 (설문이 없으면 concernAreas만)
// - 모두 잘하고 있으면(focus·concernAreas 없음) likes 영역부터
// - 균형 맞출 때(한 영역에 몰림) 덜 해본 영역 중 위 순서 → likes 순으로
// - 부모가 고르는 이름(놀이 영역·누리과정 영역)은 추천할 때 areas로 발달 영역에 연결
export type ChildPrefs = {
  likes: PlayCorner[];      // 좋아하는 놀이 (어린이집·유치원 흥미 영역)
  concernAreas: NuriArea[]; // 더 함께 놀아 주고 싶은 영역 (누리과정 5개 영역)
};

export type PlayCorner = "language" | "math" | "blocks" | "role" | "art" | "music" | "science" | "physical";
export const PLAY_CORNER: Record<PlayCorner, { label: string; areas: Area[] }> = {
  language: { label: "언어영역", areas: ["lang"] },
  math: { label: "수조작영역", areas: ["cog", "fine"] },
  blocks: { label: "쌓기영역", areas: ["fine", "cog"] },
  role: { label: "역할영역", areas: ["soc", "lang"] },
  art: { label: "미술영역", areas: ["fine"] },
  music: { label: "음률영역", areas: ["lang", "gross"] },
  science: { label: "과학영역", areas: ["cog"] },
  physical: { label: "신체영역", areas: ["gross"] },
};

export type NuriArea = "body" | "comm" | "social" | "arts" | "nature";
export const NURI_AREA: Record<NuriArea, { label: string; desc: string; areas: Area[] }> = {
  body: { label: "신체운동·건강", desc: "몸을 움직이고 균형 잡기", areas: ["gross", "fine"] },
  comm: { label: "의사소통", desc: "말하기·듣기·그림책", areas: ["lang"] },
  social: { label: "사회관계", desc: "또래·가족과 어울리기", areas: ["soc"] },
  arts: { label: "예술경험", desc: "그리기·노래·표현하기", areas: ["fine"] },
  nature: { label: "자연탐구", desc: "관찰하고 궁금해하기", areas: ["cog"] },
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
  photoPaths: string[]; // Storage 경로 (최대 4장). 돌아보기용, AI가 사진으로 판단하지 않음
  createdAt: string;
};

// ── 기능 4. 부모 커뮤니티 ────────────────────────────────
export type Board = "review" | "center" | "worry"; // 놀이 후기·아이디어 · 센터 이용·준비 경험 · 고민 나누기
export const BOARD_LABEL: Record<Board, string> = {
  review: "놀이 후기·아이디어",
  center: "센터 이용·준비 경험",
  worry: "고민 나누기",
};
