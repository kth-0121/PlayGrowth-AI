// 놀이별 장면 일러스트 (직접 그린 SVG, 일러스트 팔레트 토큰만 사용)
// 소품을 그려 두고 놀이마다 조합합니다. 실제 그림이 생기면 SCENES의 항목을 <image>로 바꾸면 됩니다.
import type { Play } from "@/types";

export const C = {
  ink: "var(--color-ink)",
  card: "var(--color-card)",
  chip: "var(--color-neutral-chip)",
  line: "var(--color-line)",
  sage: "var(--color-sage)",
  sageL: "var(--color-sage-light)",
  warm: "var(--color-warm)",
  g1: "var(--color-illu-1)",
  g2: "var(--color-illu-2)",
  g3: "var(--color-illu-5)",
  g4: "var(--color-illu-s1)",
  g5: "var(--color-illu-s2)",
  b1: "var(--color-illu-3)",
  b2: "var(--color-illu-4)",
  b3: "var(--color-illu-s3)",
  b4: "var(--color-illu-s4)",
};
export const S = { stroke: C.ink, strokeWidth: 2.2, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };

// ── 소품 (원점 기준, 대략 ±40) ─────────────────────────────
export const P: Record<string, () => React.ReactNode> = {
  lid: () => (
    <g {...S}>
      <ellipse cx="0" cy="6" rx="40" ry="8" fill={C.card} />
      <path d="M-38 6 Q0 -34 38 6 Q0 12 -38 6 Z" fill={C.chip} />
      <path d="M-22 -6 Q-10 -16 4 -16" fill="none" stroke={C.card} strokeWidth="3" />
      <path d="M-7 -20 h14 v-6 a4 4 0 0 0 -4 -4 h-6 a4 4 0 0 0 -4 4 Z" fill={C.b2} />
    </g>
  ),
  spoon: () => (
    <g {...S} transform="rotate(-35)">
      <rect x="-4" y="-6" width="8" height="52" rx="4" fill={C.b2} />
      <ellipse cx="0" cy="-18" rx="11" ry="16" fill={C.b2} />
    </g>
  ),
  sound: () => (
    <g fill="none" stroke={C.sage} strokeWidth="3" strokeLinecap="round">
      <path d="M0 -14 q10 14 0 28" />
      <path d="M12 -22 q16 22 0 44" />
    </g>
  ),
  cup: () => (
    <g {...S}>
      <path d="M-24 -30 L24 -30 L17 30 L-17 30 Z" fill={C.card} />
      <ellipse cx="0" cy="-30" rx="24" ry="6" fill={C.b3} />
      <path d="M-20 -6 L20 -6" stroke={C.b2} strokeWidth="5" />
    </g>
  ),
  pin: () => (
    <g {...S}>
      <rect x="-4" y="-18" width="8" height="30" rx="2.5" fill={C.g3} />
      <rect x="-1.5" y="-4" width="3" height="6" fill={C.card} stroke="none" />
    </g>
  ),
  pinB: () => (
    <g {...S}>
      <rect x="-4" y="-18" width="8" height="30" rx="2.5" fill={C.b2} />
    </g>
  ),
  book: () => (
    <g {...S}>
      <path d="M0 -26 Q-22 -34 -46 -26 V24 Q-22 16 0 24 Z" fill={C.card} />
      <path d="M0 -26 Q22 -34 46 -26 V24 Q22 16 0 24 Z" fill={C.card} />
      <circle cx="-24" cy="-4" r="10" fill={C.b2} />
      <path d="M-34 12 h20" />
      <path d="M12 -8 l10 -10 l10 10 z" fill={C.g2} />
      <path d="M12 8 h22" />
    </g>
  ),
  photo: () => (
    <g {...S}>
      <rect x="-30" y="-24" width="60" height="48" rx="4" fill={C.card} />
      <rect x="-24" y="-18" width="48" height="30" rx="2" fill={C.g1} />
      <circle cx="12" cy="-8" r="5" fill={C.b2} stroke="none" />
      <path d="M-24 12 l14 -14 l12 10 l8 -6 l14 10" fill="none" />
    </g>
  ),
  cards: () => (
    <g {...S}>
      {[-34, 0, 34].map((x, i) => (
        <g key={x} transform={`translate(${x} ${i === 1 ? -4 : 2}) rotate(${(i - 1) * 6})`}>
          <rect x="-15" y="-20" width="30" height="40" rx="4" fill={C.card} />
          <circle cx="0" cy="-4" r="7" fill={[C.b2, C.g2, C.b1][i]} />
          <path d="M-8 10 h16" />
        </g>
      ))}
    </g>
  ),
  sock: () => (
    <g {...S}>
      <path d="M-8 -26 h16 v28 q0 10 10 12 q8 2 6 10 q-2 6 -12 4 q-14 -2 -20 -14 Z" fill={C.b2} />
      <path d="M-8 -18 h16" />
    </g>
  ),
  sockG: () => (
    <g {...S}>
      <path d="M-8 -26 h16 v28 q0 10 10 12 q8 2 6 10 q-2 6 -12 4 q-14 -2 -20 -14 Z" fill={C.g2} />
      <path d="M-8 -18 h16" />
    </g>
  ),
  ball: () => (
    <g {...S}>
      <circle r="18" fill={C.b2} />
      <path d="M-17 -5 Q0 6 17 -5" fill="none" />
      <path d="M-6 -17 Q4 0 -6 17" fill="none" />
    </g>
  ),
  rollLines: () => (
    <g fill="none" stroke={C.ink} strokeWidth="2.2" strokeLinecap="round" strokeDasharray="2 7">
      <path d="M-50 0 H0" />
    </g>
  ),
  shop: () => (
    <g {...S}>
      <rect x="-44" y="-6" width="88" height="34" rx="3" fill={C.card} />
      <path d="M-50 -10 L-44 -34 H44 L50 -10 Z" fill={C.g2} />
      <path d="M-28 -34 L-32 -10 M-10 -34 L-12 -10 M10 -34 L12 -10 M28 -34 L32 -10" />
      <circle cx="-22" cy="-14" r="0" />
      <circle cx="-20" cy="4" r="7" fill={C.b2} />
      <circle cx="-4" cy="4" r="7" fill={C.g3} />
      <circle cx="14" cy="4" r="7" fill={C.b1} />
    </g>
  ),
  cushion: () => (
    <g {...S}>
      <rect x="-28" y="-12" width="56" height="24" rx="11" fill={C.g2} />
      <circle r="2.5" fill={C.ink} stroke="none" />
    </g>
  ),
  cushionB: () => (
    <g {...S}>
      <rect x="-28" y="-12" width="56" height="24" rx="11" fill={C.b1} />
      <circle r="2.5" fill={C.ink} stroke="none" />
    </g>
  ),
  feet: () => (
    <g fill={C.ink} opacity="0.55">
      <ellipse cx="-5" cy="0" rx="3.5" ry="6" />
      <ellipse cx="5" cy="-6" rx="3.5" ry="6" />
    </g>
  ),
  tape: () => <path d="M-60 0 H60" stroke={C.sage} strokeWidth="4" strokeLinecap="round" strokeDasharray="10 8" />,
  paper: () => (
    <g {...S}>
      <path d="M-34 -24 L30 -28 L36 22 L-30 26 Z" fill={C.card} />
      <path d="M-20 -10 l12 -4 l4 12 l-12 4 z" fill={C.b2} />
      <path d="M2 -4 l10 2 l-2 12 l-12 -2 z" fill={C.g2} />
      <path d="M-14 8 l8 0 l2 8 l-10 2 z" fill={C.b1} />
    </g>
  ),
  scraps: () => (
    <g {...S}>
      <path d="M-10 -6 l12 -2 l2 10 l-12 3 z" fill={C.g3} />
      <path d="M8 6 l10 2 l-3 9 l-10 -3 z" fill={C.b2} />
    </g>
  ),
  dotted: () => (
    <g>
      <rect x="-40" y="-26" width="80" height="52" rx="4" fill={C.card} stroke={C.ink} strokeWidth="2.2" />
      <path d="M-28 10 Q-14 -18 0 4 T28 -6" fill="none" stroke={C.ink} strokeWidth="2.2" strokeDasharray="3 5" strokeLinecap="round" />
      <path d="M-28 10 Q-20 -6 -12 -2" fill="none" stroke={C.sage} strokeWidth="3.5" strokeLinecap="round" />
    </g>
  ),
  crayon: () => (
    <g {...S} transform="rotate(40)">
      <rect x="-5" y="-22" width="10" height="34" rx="2" fill={C.g3} />
      <path d="M-5 12 L0 22 L5 12 Z" fill={C.g3} />
      <path d="M-5 -10 h10" />
    </g>
  ),
  scissors: () => (
    <g {...S}>
      <circle cx="-14" cy="14" r="8" fill={C.g2} />
      <circle cx="6" cy="18" r="8" fill={C.g2} />
      <path d="M-8 8 L22 -24 M0 12 L26 -16" fill="none" />
    </g>
  ),
  bubbleBig: () => (
    <g {...S}>
      <path d="M-30 -20 h60 a8 8 0 0 1 8 8 v20 a8 8 0 0 1 -8 8 h-38 l-12 10 v-10 h-10 a8 8 0 0 1 -8 -8 v-20 a8 8 0 0 1 8 -8 z" fill={C.card} />
      <text x="0" y="4" textAnchor="middle" fontSize="18" fontWeight="800" fill={C.ink} stroke="none">
        바바?
      </text>
    </g>
  ),
  bubbleSmall: () => (
    <g {...S}>
      <path d="M-20 -14 h40 a7 7 0 0 1 7 7 v14 a7 7 0 0 1 -7 7 h-6 v9 l-10 -9 h-24 a7 7 0 0 1 -7 -7 v-14 a7 7 0 0 1 7 -7 z" fill={C.g1} />
      <text x="0" y="5" textAnchor="middle" fontSize="16" fontWeight="800" fill={C.ink} stroke="none">
        바!
      </text>
    </g>
  ),
  bubbleWords: () => (
    <g {...S}>
      <path d="M-34 -16 h68 a8 8 0 0 1 8 8 v16 a8 8 0 0 1 -8 8 h-40 l-10 9 v-9 h-18 a8 8 0 0 1 -8 -8 v-16 a8 8 0 0 1 8 -8 z" fill={C.card} />
      <text x="0" y="5" textAnchor="middle" fontSize="15" fontWeight="800" fill={C.ink} stroke="none">
        곰돌이 밥
      </text>
    </g>
  ),
  basket: () => (
    <g {...S}>
      <rect x="-14" y="-40" width="8" height="26" rx="3" fill={C.b2} transform="rotate(-12)" />
      <path d="M8 -36 h14 v18 h-14 z" fill={C.g2} transform="rotate(10)" />
      <path d="M-38 -14 H38 L30 22 H-30 Z" fill={C.b4} />
      <path d="M-34 -2 H34 M-32 10 H32" />
    </g>
  ),
  bear: () => (
    <g {...S}>
      <circle cx="-14" cy="-26" r="7" fill={C.b2} />
      <circle cx="14" cy="-26" r="7" fill={C.b2} />
      <circle cy="-14" r="17" fill={C.b2} />
      <ellipse cy="20" rx="20" ry="18" fill={C.b2} />
      <circle cx="-6" cy="-16" r="1.8" fill={C.ink} stroke="none" />
      <circle cx="6" cy="-16" r="1.8" fill={C.ink} stroke="none" />
      <ellipse cy="-8" rx="5" ry="3.5" fill={C.b1} />
    </g>
  ),
  rattle: () => (
    <g {...S}>
      <rect x="-4" y="6" width="8" height="34" rx="4" fill={C.b2} />
      <circle cy="-8" r="16" fill={C.g2} />
      <circle cx="-5" cy="-11" r="3" fill={C.card} stroke="none" />
    </g>
  ),
  eyes: () => (
    <g fill="none" stroke={C.sage} strokeWidth="3" strokeLinecap="round">
      <path d="M-20 0 q20 -16 40 0" strokeDasharray="1 8" />
    </g>
  ),
  cloth: () => (
    <g {...S}>
      <path d="M-34 18 Q-30 -22 0 -24 Q30 -22 34 18 Q16 12 0 18 Q-16 12 -34 18 Z" fill={C.b3} />
      <path d="M-12 -8 q4 -4 8 0 M6 -2 q4 -4 8 0" fill="none" stroke={C.b4} />
    </g>
  ),
  peekToy: () => (
    <g {...S}>
      <circle cx="-8" cy="-6" r="5" fill={C.b2} />
      <circle cx="8" cy="-6" r="5" fill={C.b2} />
      <path d="M-14 4 Q0 -14 14 4 Z" fill={C.b2} />
    </g>
  ),
  box: () => (
    <g {...S}>
      <rect x="-30" y="-14" width="60" height="38" rx="5" fill={C.card} />
      <rect x="-34" y="-24" width="68" height="12" rx="4" fill={C.g2} />
    </g>
  ),
  blocks: () => (
    <g {...S}>
      <rect x="-12" y="-12" width="20" height="20" rx="3" fill={C.b2} />
      <circle cx="18" cy="2" r="10" fill={C.g3} />
    </g>
  ),
  face: () => (
    <g {...S}>
      <circle r="26" fill={C.b1} />
      <path d="M-26 -6 Q-22 -30 0 -28 Q20 -30 26 -8 Q10 -20 -8 -16 Z" fill={C.b4} />
      <circle cx="-9" cy="2" r="2.2" fill={C.ink} stroke="none" />
      <circle cx="9" cy="2" r="2.2" fill={C.ink} stroke="none" />
      <path d="M-8 12 q8 7 16 0" fill="none" />
    </g>
  ),
  faceHidden: () => (
    <g {...S}>
      <circle r="26" fill={C.b1} />
      <path d="M-26 -6 Q-22 -30 0 -28 Q20 -30 26 -8 Q10 -20 -8 -16 Z" fill={C.b4} />
      <path d="M-30 0 Q-28 -10 -4 -8 Q-2 6 -28 8 Z" fill={C.b2} />
      <path d="M30 0 Q28 -10 4 -8 Q2 6 28 8 Z" fill={C.b2} />
      <path d="M-8 14 q8 7 16 0" fill="none" />
    </g>
  ),
  notes: () => (
    <g {...S} fill={C.sage} stroke={C.sage}>
      <path d="M0 0 V-24 L14 -28 V-6" fill="none" strokeWidth="2.6" />
      <ellipse cx="-4" cy="0" rx="5" ry="4" />
      <ellipse cx="10" cy="-6" rx="5" ry="4" />
    </g>
  ),
  nameCall: () => (
    <g {...S}>
      <path d="M-30 -14 h60 a8 8 0 0 1 8 8 v12 a8 8 0 0 1 -8 8 h-44 l-10 8 v-8 h-6 a8 8 0 0 1 -8 -8 v-12 a8 8 0 0 1 8 -8 z" fill={C.card} />
      <text x="0" y="5" textAnchor="middle" fontSize="14" fontWeight="800" fill={C.ink} stroke="none">
        어딨나?
      </text>
    </g>
  ),
  towel: () => (
    <g {...S}>
      <rect x="-40" y="-12" width="80" height="24" rx="12" fill={C.g1} />
      <path d="M-20 -12 v24 M0 -12 v24 M20 -12 v24" stroke={C.g3} />
      <ellipse cx="40" cy="0" rx="6" ry="12" fill={C.card} />
    </g>
  ),
  sofa: () => (
    <g {...S}>
      <rect x="-60" y="-30" width="120" height="30" rx="10" fill={C.g2} />
      <rect x="-66" y="-14" width="132" height="30" rx="10" fill={C.g1} />
      <path d="M0 -14 v30" />
      <path d="M-56 16 v8 M56 16 v8" />
    </g>
  ),
  hill: () => (
    <g {...S}>
      <rect x="-56" y="-2" width="54" height="22" rx="10" fill={C.g2} />
      <rect x="2" y="-2" width="54" height="22" rx="10" fill={C.b1} />
      <rect x="-28" y="-22" width="56" height="22" rx="10" fill={C.g1} />
    </g>
  ),
  tissueBox: () => (
    <g {...S}>
      <path d="M-6 -16 Q-20 -40 -2 -46 Q14 -40 6 -16" fill={C.b3} />
      <path d="M8 -16 Q22 -34 30 -26" fill="none" stroke={C.b4} strokeWidth="5" />
      <rect x="-34" y="-16" width="68" height="36" rx="6" fill={C.b2} />
      <ellipse cx="0" cy="-16" rx="14" ry="3" fill={C.card} />
    </g>
  ),
  plate: () => (
    <g {...S}>
      <ellipse cx="0" cy="8" rx="42" ry="12" fill={C.card} />
      {[-18, -4, 10, 22, 2].map((x, i) => (
        <ellipse key={i} cx={x} cy={i === 4 ? -2 : 6} rx="7" ry="4.5" fill={C.b3} />
      ))}
    </g>
  ),
  hand: () => (
    <g {...S}>
      <path d="M-12 8 Q-24 -2 -26 6 Q-26 12 -12 20" fill={C.b1} />
      <path d="M-12 24 V-4 Q-12 -10 -7 -10 Q-2 -10 -2 -4 V-16 Q-2 -22 3 -22 Q8 -22 8 -16 V-12 Q8 -18 13 -18 Q18 -18 18 -12 V10 Q18 26 4 26 H-8 Q-12 26 -12 24 Z" fill={C.b1} />
      <path d="M-2 -4 V6 M8 -12 V6" fill="none" />
    </g>
  ),
  cupTower: () => (
    <g {...S}>
      {[
        [-16, 18],
        [16, 18],
        [0, -14],
      ].map(([x, y]) => (
        <path key={`${x}${y}`} d={`M${x - 14} ${y + 14} L${x + 14} ${y + 14} L${x + 10} ${y - 14} L${x - 10} ${y - 14} Z`} fill={C.card} />
      ))}
    </g>
  ),
  scribble: () => <path d="M-30 6 q8 -14 14 0 t14 0 t14 0 t14 -2" fill="none" stroke={C.g3} strokeWidth="3.5" strokeLinecap="round" />,
  laundry: () => (
    <g {...S}>
      <rect x="-30" y="0" width="60" height="10" rx="3" fill={C.g2} />
      <rect x="-30" y="-12" width="60" height="10" rx="3" fill={C.b1} />
      <rect x="-30" y="-24" width="60" height="10" rx="3" fill={C.card} />
    </g>
  ),
  chair: () => (
    <g {...S}>
      <rect x="-16" y="-34" width="32" height="30" rx="4" fill={C.b4} />
      <rect x="-20" y="-6" width="40" height="10" rx="3" fill={C.b2} />
      <path d="M-16 4 v22 M16 4 v22" />
    </g>
  ),
  // ── 준비물 전용 ──
  phone: () => (
    <g {...S}>
      <rect x="-20" y="-34" width="40" height="68" rx="8" fill={C.ink} />
      <rect x="-15" y="-26" width="30" height="48" rx="3" fill={C.g1} stroke="none" />
      <circle cx="6" cy="-14" r="5" fill={C.b2} stroke="none" />
      <path d="M-15 16 l10 -12 l8 7 l6 -5 l6 10" fill="none" stroke={C.ink} strokeWidth="2" />
    </g>
  ),
  goods: () => (
    <g {...S}>
      <rect x="-34" y="-8" width="34" height="34" rx="3" fill={C.b4} />
      <path d="M-34 4 h34" />
      <circle cx="14" cy="10" r="14" fill={C.g3} />
      <path d="M14 -4 q4 -8 10 -8" fill="none" />
      <rect x="-18" y="-30" width="26" height="22" rx="3" fill={C.b1} />
    </g>
  ),
  money: () => (
    <g {...S}>
      <rect x="-34" y="-14" width="60" height="32" rx="4" fill={C.g1} transform="rotate(-8)" />
      <rect x="-26" y="-20" width="60" height="32" rx="4" fill={C.card} />
      <circle cx="4" cy="-4" r="8" fill={C.g2} />
      <text x="4" y="0" textAnchor="middle" fontSize="10" fontWeight="800" fill={C.ink} stroke="none">
        원
      </text>
    </g>
  ),
  tapeRoll: () => (
    <g {...S}>
      <circle r="24" fill={C.b3} />
      <circle r="11" fill={C.card} />
      <path d="M20 12 L40 26 L34 34 L14 20" fill={C.b3} />
    </g>
  ),
  glue: () => (
    <g {...S}>
      <rect x="-12" y="-14" width="24" height="44" rx="5" fill={C.g2} />
      <rect x="-8" y="-30" width="16" height="16" rx="3" fill={C.card} />
      <path d="M-12 4 h24" />
    </g>
  ),
  sheet: () => (
    <g {...S}>
      <rect x="-30" y="-34" width="60" height="68" rx="3" fill={C.card} />
      <path d="M-30 -24 h60" stroke={C.g3} />
      <path d="M-18 -6 q10 -12 20 0 t18 0" fill="none" stroke={C.b2} strokeWidth="3" />
    </g>
  ),
  blanket: () => (
    <g {...S}>
      <path d="M-40 -18 Q-20 -28 0 -18 Q20 -8 40 -18 V18 Q20 28 0 18 Q-20 8 -40 18 Z" fill={C.g1} />
      <path d="M-40 0 Q-20 -10 0 0 Q20 10 40 0" fill="none" stroke={C.g3} />
    </g>
  ),
  plateEmpty: () => (
    <g {...S}>
      <ellipse cx="0" cy="4" rx="40" ry="14" fill={C.card} />
      <ellipse cx="0" cy="2" rx="24" ry="7" fill="none" stroke={C.line} />
    </g>
  ),
  cups: () => (
    <g {...S}>
      {[-20, 0, 20].map((x, i) => (
        <path key={x} d={`M${x - 12} 26 L${x + 12} 26 L${x + 9} -6 L${x - 9} -6 Z`} fill={i === 1 ? C.b3 : C.card} transform={i === 1 ? "translate(0 -26)" : undefined} />
      ))}
    </g>
  ),
};

type Put = [prop: string, x: number, y: number, scale?: number];

// 준비물 문구 → 그림 (앞에서부터 처음 맞는 것)
const MATERIAL_ART: [RegExp, string, number?][] = [
  [/딸랑이|소리 나는/, "rattle", 1.2],
  [/말랑한 공/, "ball", 1.8],
  [/없음.*얼굴/, "face", 1.3],
  [/동요/, "notes", 1.8],
  [/냄비/, "lid", 1.1],
  [/빨래집게/, "pin", 2],
  [/종이컵 4/, "cups", 1.2],
  [/종이컵/, "cup", 1.2],
  [/휴대폰/, "phone"],
  [/그림책이나 사진/, "cards", 0.95],
  [/그림책/, "book"],
  [/생활용품|바구니/, "basket", 1.05],
  [/빨래/, "laundry", 1.2],
  [/양말/, "sock", 1.4],
  [/인형/, "bear", 1.1],
  [/상자/, "goods"],
  [/돈/, "money"],
  [/테이프/, "tapeRoll", 1.1],
  [/의자/, "chair", 1.2],
  [/소파|탁자/, "sofa", 0.62],
  [/이불/, "blanket", 1.05],
  [/쿠션|베개/, "cushion", 1.4],
  [/공이나 블록|블록/, "blocks", 1.6],
  [/공/, "ball", 1.8],
  [/풀/, "glue", 1.1],
  [/색종이|전단지|두꺼운 종이/, "paper", 1.15],
  [/스케치북|이면지|큰 종이/, "sheet", 1.1],
  [/크레파스|색연필/, "crayon", 1.5],
  [/가위/, "scissors", 1.4],
  [/손수건/, "cloth", 1.2],
  [/플라스틱 통/, "box", 1.2],
  [/수건/, "towel", 0.95],
  [/떡뻥|과자/, "plate", 1.05],
  [/접시/, "plateEmpty", 1.05],
  [/숟가락|컵/, "spoon", 1.2],
  [/장난감/, "bear", 1.1],
];

/** 준비물 한 가지 그림 (정사각형) */
export function MaterialArt({ material, className = "" }: { material: string; className?: string }) {
  const hit = MATERIAL_ART.find(([re]) => re.test(material));
  const [, name, scale = 1] = hit ?? [/./, "blocks", 1.6];
  return (
    <svg viewBox="-50 -50 100 100" className={`block h-full w-full ${className}`} role="img" aria-label={`${material} 그림`}>
      <ellipse cx="0" cy="40" rx="36" ry="5" fill={C.g1} />
      <g transform={`scale(${scale})`}>{P[name]?.()}</g>
    </svg>
  );
}

// 놀이 id → 장면 (첫 번째 소품이 썸네일 중심)
const SCENES: Record<string, Put[]> = {
  "lang-sound-1": [["lid", 140, 104], ["spoon", 196, 82], ["sound", 232, 62]],
  "lang-sound-2": [["lid", 110, 106], ["lid", 212, 106], ["spoon", 152, 80, 0.85], ["spoon", 252, 80, 0.85], ["sound", 70, 70, 0.8]],
  "fine-clip-1": [["cup", 160, 96], ["pin", 140, 62], ["pinB", 160, 58], ["pin", 180, 62], ["pinB", 196, 72], ["pin", 230, 120, 0.9]],
  "lang-story-1": [["book", 160, 92], ["bubbleWords", 232, 50, 0.7]],
  "lang-story-2": [["photo", 150, 92], ["bubbleWords", 238, 50, 0.75]],
  "lang-story-3": [["cards", 160, 92]],
  "cog-sock-1": [["sock", 120, 92], ["sock", 156, 92], ["sockG", 212, 92]],
  "cog-sock-2": [["sock", 120, 88, 1.3], ["sockG", 200, 98, 0.8], ["sockG", 236, 100, 0.65]],
  "cog-sock-3": [["laundry", 160, 100, 1.2], ["sock", 236, 96, 0.8]],
  "soc-ball-1": [["ball", 176, 112], ["rollLines", 154, 112], ["cushion", 96, 118, 0.8], ["cushionB", 236, 118, 0.8]],
  "soc-ball-2": [["ball", 160, 104], ["rollLines", 138, 104], ["hand", 82, 108], ["hand", 240, 108]],
  "soc-ball-3": [["shop", 160, 96]],
  "gross-cushion-1": [["cushion", 104, 112], ["cushionB", 164, 98], ["cushion", 224, 112], ["feet", 164, 70]],
  "gross-cushion-2": [["cushion", 100, 112], ["cushionB", 220, 112], ["feet", 160, 96], ["feet", 160, 66]],
  "gross-cushion-3": [["cushion", 92, 116], ["chair", 168, 106], ["tape", 160, 140], ["cushionB", 246, 116]],
  "fine-paper-1": [["paper", 156, 92], ["scraps", 232, 112]],
  "fine-paper-2": [["dotted", 150, 92], ["crayon", 214, 72]],
  "fine-paper-3": [["paper", 140, 96], ["scissors", 214, 88]],
  "lang-babble-1": [["bubbleBig", 128, 70], ["bubbleSmall", 212, 104]],
  "lang-babble-2": [["basket", 160, 106]],
  "lang-babble-3": [["bear", 120, 100], ["bubbleWords", 216, 62, 0.85]],
  "cog-peek-1": [["rattle", 160, 92], ["eyes", 160, 40]],
  "cog-peek-2": [["cloth", 150, 108], ["bear", 198, 112, 0.55], ["cloth", 196, 120, 0.7]],
  "cog-peek-3": [["box", 150, 108], ["blocks", 218, 116]],
  "soc-peekaboo-1": [["face", 150, 92], ["notes", 214, 70]],
  "soc-peekaboo-2": [["face", 120, 98, 0.9], ["cushion", 120, 122, 1.4], ["nameCall", 214, 62]],
  "soc-peekaboo-3": [["faceHidden", 140, 90], ["ball", 220, 116, 0.8]],
  "gross-tummy-1": [["towel", 150, 116], ["rattle", 224, 92, 0.7]],
  "gross-tummy-2": [["sofa", 150, 108], ["bear", 240, 102, 0.6]],
  "gross-tummy-3": [["hill", 160, 104]],
  "fine-grab-1": [["tissueBox", 160, 108], ["hand", 222, 70, 0.8]],
  "fine-grab-2": [["plate", 160, 112], ["hand", 200, 80, 0.8]],
  "fine-grab-3": [["cupTower", 136, 96], ["scribble", 230, 120], ["crayon", 236, 80, 0.8]],
};

// 장면이 없는 새 놀이는 영역 기본 장면
const AREA_SCENE: Record<Play["area"], Put[]> = {
  lang: [["book", 160, 92]],
  cog: [["blocks", 160, 100, 1.4]],
  soc: [["ball", 160, 100, 1.3]],
  gross: [["hill", 160, 104]],
  fine: [["cup", 160, 96]],
};

export function PlayArt({
  play,
  height,
  variant = "soft",
  crop = false,
  className = "",
}: {
  play: Pick<Play, "id" | "area" | "title">;
  height: number;
  variant?: "soft" | "sage";
  crop?: boolean; // 썸네일: 대표 소품만 크게
  className?: string;
}) {
  const scene = SCENES[play.id] ?? AREA_SCENE[play.area];
  const [, cx, cy] = scene[0];
  const viewBox = crop ? `${cx - 52} ${cy - 52} 104 104` : "0 0 320 160";
  const bg = variant === "sage" ? "bg-sage" : "bg-sage-xlight";
  const ground = variant === "sage" ? C.g4 : C.g1;
  return (
    <div className={`${bg} overflow-hidden ${className}`} style={{ height }}>
      <svg
        viewBox={viewBox}
        preserveAspectRatio="xMidYMid meet"
        className="block h-full w-full"
        role="img"
        aria-label={`${play.title} 그림`}
      >
        {!crop && <ellipse cx="160" cy="146" rx="150" ry="12" fill={ground} />}
        <g transform={crop ? undefined : "translate(160 96) scale(1.35) translate(-160 -96)"}>
          {scene.map(([name, x, y, s = 1], i) => (
            <g key={i} transform={`translate(${x} ${y}) scale(${s})`}>
              {P[name]?.()}
            </g>
          ))}
        </g>
      </svg>
    </div>
  );
}
