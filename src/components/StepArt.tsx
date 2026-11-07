// 놀이 진행 단계 그림 (직접 그린 SVG, 일러스트 팔레트 토큰만 사용)
// 단계 문장의 행동과 대사를 장면으로: 부모·아이 인물 + 놀이 소품 + 말풍선
import type { Play } from "@/types";
import { C, P, PlayArt, S } from "./PlayArt";

// ── 사람·동작 소품 ─────────────────────────────
const HAND_PATH = "M-8 22 V-6 Q-8 -12 -3 -12 Q2 -12 2 -6 V-12 Q2 -18 7 -18 Q12 -18 12 -12 V12 Q12 24 2 24 Z";

const Q: Record<string, () => React.ReactNode> = {
  // 부모 (상반신)
  parent: () => (
    <g {...S}>
      <path d="M-34 46 Q-34 14 0 14 Q34 14 34 46 Z" fill={C.g2} />
      <circle cy="-8" r="22" fill={C.b1} />
      <path d="M-22 -8 Q-24 -34 0 -32 Q24 -34 22 -8 Q14 -24 -6 -22 Q-16 -21 -22 -8 Z" fill={C.b4} />
      <circle cx="-8" cy="-5" r="2.2" fill={C.ink} stroke="none" />
      <circle cx="8" cy="-5" r="2.2" fill={C.ink} stroke="none" />
      <path d="M-7 5 q7 6 14 0" fill="none" />
    </g>
  ),
  // 아이 (상반신, 작게)
  child: () => (
    <g {...S}>
      <path d="M-22 36 Q-22 12 0 12 Q22 12 22 36 Z" fill={C.b2} />
      <circle cy="-6" r="17" fill={C.b1} />
      <path d="M-5 -22 q5 -9 10 0" fill="none" />
      <circle cx="-6" cy="-5" r="1.9" fill={C.ink} stroke="none" />
      <circle cx="6" cy="-5" r="1.9" fill={C.ink} stroke="none" />
      <path d="M-5 3 q5 5 10 0" fill="none" />
      <circle cx="-11" cy="1" r="3" fill={C.b2} stroke="none" />
      <circle cx="11" cy="1" r="3" fill={C.b2} stroke="none" />
    </g>
  ),
  sparkle: () => (
    <g fill={C.sage}>
      <path d="M0 -14 L3 -3 L14 0 L3 3 L0 14 L-3 3 L-14 0 L-3 -3 Z" />
      <path d="M18 -18 l1.5 4 l4 1.5 l-4 1.5 l-1.5 4 l-1.5 -4 l-4 -1.5 l4 -1.5 Z" />
    </g>
  ),
  heart: () => (
    <path
      d="M0 14 C-22 0 -18 -18 -6 -16 Q-1 -15 0 -9 Q1 -15 6 -16 C18 -18 22 0 0 14 Z"
      fill={C.sageL}
      stroke={C.sage}
      strokeWidth="2.4"
      strokeLinejoin="round"
    />
  ),
  clap: () => (
    <g>
      <g {...S} transform="rotate(-18) translate(-10 0)">
        <path d={HAND_PATH} fill={C.b1} />
      </g>
      <g {...S} transform="rotate(18) translate(10 0) scale(-1 1)">
        <path d={HAND_PATH} fill={C.b1} />
      </g>
      <path d="M0 -30 v-8 M-16 -26 l-5 -6 M16 -26 l5 -6" stroke={C.sage} strokeWidth="3" strokeLinecap="round" />
    </g>
  ),
  arrowR: () => (
    <g fill="none" stroke={C.sage} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <path d="M-26 6 Q0 -14 24 2" />
      <path d="M14 -6 L25 2 L14 10" />
    </g>
  ),
  arrowLR: () => (
    <g fill="none" stroke={C.sage} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <path d="M-40 0 H40" strokeDasharray="2 8" />
      <path d="M-30 -9 L-41 0 L-30 9 M30 -9 L41 0 L30 9" />
    </g>
  ),
  arrowSwap: () => (
    <g fill="none" stroke={C.sage} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <path d="M-24 -8 H22 M12 -16 L23 -8 L12 0" />
      <path d="M24 10 H-22 M-12 2 L-23 10 L-12 18" />
    </g>
  ),
  arrowDown: () => (
    <g fill="none" stroke={C.sage} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <path d="M0 -18 V16 M-9 6 L0 17 L9 6" />
    </g>
  ),
  // 바닥 매트·이불 (얇게)
  mat: () => (
    <g {...S}>
      <rect x="-92" y="-10" width="184" height="22" rx="10" fill={C.g1} />
      <path d="M-80 1 H80" fill="none" stroke={C.g3} strokeDasharray="4 6" />
    </g>
  ),
  crown: () => (
    <g {...S}>
      <path d="M-22 10 L-22 -10 L-11 0 L0 -14 L11 0 L22 -10 L22 10 Z" fill={C.card} />
      {[-16, -6, 4, 14].map((x, i) => (
        <rect key={x} x={x} y="-2" width="5" height="14" rx="1.5" fill={i % 2 ? C.b2 : C.g3} />
      ))}
    </g>
  ),
};

/** 대사 말풍선. 글자 수로 너비 맞춤 */
function Bubble({ text, tone }: { text: string; tone: "card" | "sage" }) {
  const w = Math.max(44, [...text].length * 14 + 22);
  return (
    <g {...S}>
      <path
        d={`M${-w / 2 + 8} -17 H${w / 2 - 8} a8 8 0 0 1 8 8 V7 a8 8 0 0 1 -8 8 H-2 l-10 9 v-9 H${-w / 2 + 8} a8 8 0 0 1 -8 -8 V-9 a8 8 0 0 1 8 -8 Z`}
        fill={tone === "sage" ? C.g1 : C.card}
      />
      <text y="4" textAnchor="middle" fontSize="14" fontWeight="800" fill={C.ink} stroke="none">
        {text}
      </text>
    </g>
  );
}

type Put = [prop: string, x: number, y: number, scale?: number, text?: string];
// 부모 대사(흰 말풍선) / 아이 대사·칭찬(연두 말풍선)
const b = (text: string, x: number, y: number, s = 1): Put => ["@", x, y, s, text];
const g = (text: string, x: number, y: number, s = 1): Put => ["@sage", x, y, s, text];

// 놀이 id → 단계별 장면
const STEP_SCENES: Record<string, Put[][]> = {
  "lang-sound-1": [
    [["parent", 84, 96], ["lid", 196, 124], ["spoon", 226, 98, 0.8], b("땡!", 160, 40)],
    [["parent", 240, 96, 0.85], ["spoon", 168, 100, 0.75], ["arrowR", 168, 58, 0.9], ["child", 92, 102]],
    [["child", 110, 102], ["lid", 200, 126, 0.8], ["spoon", 226, 102, 0.7], g("땡!", 214, 44), ["sparkle", 54, 48]],
  ],
  "lang-sound-2": [
    [["parent", 92, 96], ["lid", 204, 124, 0.85], ["spoon", 232, 100, 0.7], b("땡땡", 166, 36), b("…", 240, 52, 0.8)],
    [["child", 96, 102], ["lid", 164, 128, 0.7], g("○○ 차례!", 226, 44)],
    [["child", 88, 102], ["parent", 234, 96], g("쿵쿵", 96, 40), b("딩동", 232, 36)],
  ],
  "fine-clip-1": [
    [["parent", 80, 96, 0.9], ["pin", 196, 98, 2.4], ["sparkle", 246, 52]],
    [["cup", 160, 106], ["pin", 140, 72], ["pinB", 160, 68], ["pin", 180, 72], ["child", 254, 104, 0.8]],
    [["child", 160, 108], ["crown", 160, 74, 0.9], g("왕관 완성!", 252, 40), ["sparkle", 70, 50]],
  ],
  "lang-story-1": [
    [["book", 150, 108], ["arrowDown", 124, 58, 0.8], b("누구야?", 232, 40)],
    [["parent", 80, 96], ["book", 206, 116, 0.75], b("강아지 달려", 210, 40)],
    [["child", 86, 102], g("강아지!", 92, 42), ["parent", 236, 96], b("강아지 달려!", 226, 38, 0.95)],
  ],
  "lang-story-2": [
    [["phone", 150, 102, 1.1], b("여기 어디였지?", 236, 40, 0.9)],
    [["parent", 80, 96], ["photo", 198, 112, 0.8], b("누구랑 뭐 했어?", 214, 40, 0.9)],
    [["child", 90, 102], ["parent", 234, 96], b("미끄럼틀 탔어!", 196, 36, 0.9)],
  ],
  "lang-story-3": [
    [["cards", 150, 108], b("뭐가 먼저일까?", 236, 38, 0.9)],
    [["cards", 160, 112, 0.85], b("처음에…", 76, 40), b("그다음에…", 238, 40)],
    [["child", 96, 102], ["parent", 236, 96, 0.9], b("왜 그랬을까?", 224, 36)],
  ],
  "cog-sock-1": [
    [["sock", 84, 104, 0.9], ["sockG", 134, 116, 0.9], ["sock", 190, 100, 0.9], ["sockG", 244, 112, 0.9]],
    [["parent", 86, 96], ["sockG", 172, 96], b("똑같은 친구?", 244, 40, 0.9)],
    [["sockG", 136, 104], ["sockG", 164, 104], ["sparkle", 210, 64], g("짝꿍 완성!", 248, 40)],
  ],
  "cog-sock-2": [
    [["basket", 100, 114, 0.9], ["basket", 222, 114, 0.9], b("엄마·아빠", 100, 44, 0.9), b("내 양말", 222, 44, 0.9)],
    [["sock", 120, 102, 1.3], ["sockG", 196, 112, 0.75], b("커? 작아?", 248, 42)],
    [["basket", 100, 116, 0.8], ["basket", 222, 116, 0.8], g("하나, 둘, 셋…", 160, 40)],
  ],
  "cog-sock-3": [
    [["laundry", 104, 112], ["sock", 220, 108], b("양말은 여기", 220, 40, 0.9)],
    [["sock", 96, 104], ["arrowR", 160, 86], ["laundry", 232, 114, 0.9]],
    [["child", 104, 102], g("색깔별로!", 218, 44)],
  ],
  "soc-ball-1": [
    [["parent", 80, 96], ["child", 240, 102], ["arrowLR", 160, 136, 0.9]],
    [["parent", 76, 96], ["rollLines", 156, 128], ["ball", 196, 128, 0.8], b("간다~", 130, 40)],
    [["child", 150, 102], ["ball", 196, 130, 0.65], ["clap", 74, 70, 0.9], ["sparkle", 240, 48]],
  ],
  "soc-ball-2": [
    [["parent", 88, 96], ["ball", 180, 128, 0.7], b("이번엔 엄마 차례!", 210, 40, 0.85)],
    [["parent", 66, 100, 0.8], ["child", 160, 106, 0.85], ["bear", 254, 112, 0.65], b("곰돌이 차례", 232, 38, 0.9)],
    [["child", 110, 102], ["heart", 196, 72], g("기다려 줘서 고마워", 206, 36, 0.8)],
  ],
  "soc-ball-3": [
    [["shop", 106, 104, 0.8], ["parent", 246, 100, 0.8], b("이거 주세요", 226, 36, 0.9)],
    [["goods", 104, 112, 0.8], ["money", 208, 110, 0.8], b("감사합니다", 160, 38)],
    [["child", 86, 104], ["arrowSwap", 160, 100], ["parent", 234, 98]],
  ],
  "gross-cushion-1": [
    [["cushion", 96, 124], ["cushionB", 160, 124], ["cushion", 224, 124]],
    [["cushion", 96, 128], ["cushionB", 160, 128], ["cushion", 224, 128], ["feet", 160, 100], ["notes", 252, 64]],
    [["clap", 160, 86, 1.3], ["sparkle", 96, 50], ["sparkle", 232, 54]],
  ],
  "gross-cushion-2": [
    [["cushion", 96, 126], ["cushionB", 224, 126], b("한 뼘", 160, 90)],
    [["parent", 150, 88, 0.85], ["cushion", 150, 140, 0.9], b("콩!", 236, 46)],
    [["child", 160, 96], ["cushion", 96, 136, 0.8], ["cushionB", 224, 136, 0.8], g("콩!", 250, 46)],
  ],
  "gross-cushion-3": [
    [["cushion", 66, 128, 0.8], ["arrowR", 112, 100, 0.6], ["chair", 160, 116, 0.9], ["arrowR", 206, 100, 0.6], ["ball", 256, 126, 0.8]],
    [["parent", 160, 96], ["tape", 160, 146]],
    [["child", 104, 102], g("다음 코스는?", 220, 42)],
  ],
  "fine-paper-1": [
    [["paper", 136, 104], ["scraps", 206, 118], ["hand", 230, 78, 0.8]],
    [["child", 104, 102], ["scraps", 196, 118], ["scraps", 238, 94, 0.9]],
    [["sheet", 150, 104, 0.95], ["scraps", 152, 108], b("무엇 같아?", 244, 42)],
  ],
  "fine-paper-2": [
    [["dotted", 150, 104], ["crayon", 222, 80]],
    [["dotted", 150, 104], ["hand", 214, 96, 0.7], ["crayon", 196, 82, 0.8]],
    [["sheet", 160, 104, 1.1], ["face", 160, 100, 0.75], ["sparkle", 230, 52]],
  ],
  "fine-paper-3": [
    [["sheet", 144, 104, 1.05], ["crayon", 210, 80]],
    [["paper", 132, 104], ["scissors", 206, 98], b("싹둑싹둑", 238, 42)],
    [["scraps", 116, 114, 1.2], ["scraps", 174, 104, 1.2], g("기차 완성!", 238, 42), ["sparkle", 70, 56]],
  ],
  "lang-babble-1": [
    [["parent", 116, 96], ["child", 206, 104], ["heart", 162, 46, 0.7]],
    [["child", 88, 102], g("바바", 92, 40), ["parent", 234, 96], b("바바", 232, 36)],
    [["parent", 96, 96], b("…", 172, 50), ["child", 240, 104, 0.9]],
  ],
  "lang-babble-2": [
    [["basket", 116, 116], ["cup", 222, 110, 0.65], b("컵!", 232, 46)],
    [["child", 96, 102], ["cup", 180, 118, 0.65], b("컵, 컵", 220, 44)],
    [["cup", 104, 122, 0.55], ["spoon", 172, 116, 0.6], ["sock", 236, 116, 0.7], b("컵 어딨지?", 168, 40)],
  ],
  "lang-babble-3": [
    [["parent", 80, 96], ["bear", 200, 108], b("곰돌이 맘마", 212, 36, 0.9)],
    [["child", 88, 102], ["spoon", 150, 108, 0.7], ["bear", 230, 108]],
    [["child", 86, 102], g("맘마!", 92, 42), ["bear", 238, 116, 0.65], b("곰돌이 맘마!", 226, 44, 0.9)],
  ],
  "cog-peek-1": [
    [["child", 96, 104], ["rattle", 206, 96], b("딸랑딸랑", 240, 40, 0.9)],
    [["rattle", 160, 98], ["arrowLR", 160, 140, 1.1], ["child", 160, 40, 0.6]],
    [["child", 104, 104], ["rattle", 196, 102, 0.8], ["hand", 150, 118, 0.6]],
  ],
  "cog-peek-2": [
    [["bear", 168, 112, 0.7], ["cloth", 136, 116]],
    [["cloth", 140, 114], ["hand", 210, 102, 0.75], b("어디 갔지?", 244, 40)],
    [["cloth", 160, 114, 1.2], b("어디 있을까?", 236, 40)],
  ],
  "cog-peek-3": [
    [["box", 150, 114], ["ball", 150, 58, 0.55], ["arrowDown", 196, 66, 0.8], b("쏙", 236, 50)],
    [["box", 134, 116], ["ball", 206, 114, 0.7], ["hand", 246, 84, 0.65]],
    [["child", 86, 102], ["box", 190, 118, 0.8], g("쏙!", 244, 50)],
  ],
  "soc-peekaboo-1": [
    [["parent", 112, 96], ["child", 210, 112, 0.85], ["heart", 162, 50, 0.6]],
    [["parent", 116, 96], ["notes", 214, 66], ["notes", 252, 98, 0.7]],
    [["parent", 92, 96], ["child", 226, 104], g("눈이 마주쳤네!", 160, 30, 0.85)],
  ],
  "soc-peekaboo-2": [
    [["child", 82, 104, 0.85], ["arrowR", 160, 86], b("○○야~", 244, 44)],
    [["child", 96, 104], ["rattle", 206, 96, 0.8], b("여기 있다!", 236, 38, 0.9)],
    [["bear", 210, 72, 0.6], ["hand", 210, 116, 0.7], ["child", 92, 104], b("이거 줄까?", 104, 38, 0.9)],
  ],
  "soc-peekaboo-3": [
    [["faceHidden", 116, 98, 1.3], g("까꿍!", 228, 46)],
    [["child", 140, 106], ["cloth", 140, 74, 0.5], ["sparkle", 222, 58]],
    [["parent", 66, 98, 0.8], ["rollLines", 150, 130], ["ball", 168, 130, 0.65], ["child", 254, 106, 0.8], b("줄게~", 108, 40)],
  ],
  "gross-tummy-1": [
    [["mat", 160, 136], ["towel", 160, 112, 0.9], ["rattle", 252, 98, 0.6]],
    [["child", 120, 108, 0.9], ["towel", 120, 140, 0.6], ["rattle", 222, 94, 0.8]],
    [["child", 140, 104], ["sparkle", 200, 52], g("우와 높다!", 244, 46)],
  ],
  "gross-tummy-2": [
    [["sofa", 172, 118], ["child", 96, 100, 0.75]],
    [["sofa", 160, 118], ["bear", 224, 82, 0.5]],
    [["sofa", 160, 118], ["child", 112, 92, 0.65], ["arrowR", 172, 62, 0.7], ["bear", 232, 82, 0.5]],
  ],
  "gross-tummy-3": [
    [["mat", 160, 138], ["hill", 160, 112, 0.9]],
    [["hill", 160, 116], ["bear", 160, 74, 0.5], b("올라가 볼까?", 254, 40, 0.85)],
    [["hill", 160, 120], ["child", 150, 72, 0.6], ["hand", 92, 96, 0.6]],
  ],
  "fine-grab-1": [
    [["hand", 136, 106], ["cloth", 196, 104, 0.7]],
    [["cloth", 160, 106, 0.8], ["hand", 96, 106, 0.7], ["hand", 224, 106, 0.7], b("영차!", 160, 44)],
    [["child", 116, 102], ["cloth", 196, 120, 0.6], g("내 거다!", 236, 44)],
  ],
  "fine-grab-2": [
    [["plate", 160, 118, 1.1]],
    [["hand", 160, 84], ["plate", 160, 132, 0.8], b("콕", 230, 50)],
    [["child", 108, 102], ["plate", 214, 124, 0.75]],
  ],
  "fine-grab-3": [
    [["cupTower", 130, 104], ["sparkle", 196, 70], b("와르르!", 236, 46)],
    [["cupTower", 120, 104], ["child", 238, 106, 0.8], b("높다!", 112, 40)],
    [["sheet", 150, 104, 1.15], ["scribble", 150, 108, 0.8], ["crayon", 218, 82]],
  ],
};

/** 놀이 진행 단계 그림. 단계 장면이 없는 새 놀이는 놀이 장면을 씀 */
export function StepArt({
  play,
  step,
  height,
  className = "",
}: {
  play: Pick<Play, "id" | "area" | "title" | "steps">;
  step: number; // 1부터
  height: number;
  className?: string;
}) {
  const scene = STEP_SCENES[play.id]?.[step - 1];
  if (!scene) return <PlayArt play={play} height={height} className={className} />;
  return (
    <div className={`overflow-hidden bg-sage-xlight ${className}`} style={{ height }}>
      <svg
        viewBox="0 0 320 170"
        preserveAspectRatio="xMidYMid meet"
        className="block h-full w-full"
        role="img"
        aria-label={`${step}단계 그림: ${play.steps[step - 1]}`}
      >
        <ellipse cx="160" cy="152" rx="148" ry="11" fill={C.g1} />
        {scene.map(([name, x, y, s = 1, text], i) => (
          <g key={i} transform={`translate(${x} ${y}) scale(${s})`}>
            {name === "@" ? (
              <Bubble text={text ?? ""} tone="card" />
            ) : name === "@sage" ? (
              <Bubble text={text ?? ""} tone="sage" />
            ) : (
              (Q[name] ?? P[name])?.()
            )}
          </g>
        ))}
      </svg>
    </div>
  );
}
