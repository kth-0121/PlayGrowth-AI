// 팀 공통 계약. 바꿀 땐 PR로 4명 모두 리뷰.
export type Domain = "gross_motor" | "fine_motor" | "cognition" | "language" | "social" | "self_care";

export type Play = {
  id: string;            // "lang-001"
  title: string;
  domain: Domain;
  ageMonths: [number, number]; // 대상 월령 [최소, 최대]
  minutes: number;
  materials: string[];
  steps: string[];
  successSigns: string[]; // "잘 되고 있다"는 신호
  reviewedBy: string | null; // 전문가 감수자, 미감수면 null (미감수 놀이는 추천 금지)
};

export type Reaction = "low" | "mid" | "high";

// AI 추천 API 응답: playIds는 반드시 plays.json에 있는 id만
export type Recommendation = {
  playIds: string[];
  explanation: string;
  redFlag: boolean; // true면 전문가 상담 안내를 먼저 표시
};
