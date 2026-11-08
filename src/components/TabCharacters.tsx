// 하단 탭 캐릭터 (놀이다리 자체 캐릭터). 색은 globals.css 토큰만 사용
type Props = { className?: string };

const INK = "var(--color-ink)";
const S = { stroke: INK, strokeWidth: 1.4, strokeLinecap: "round", strokeLinejoin: "round" } as const;

/** 눈 두 개 + 볼터치 + 입 */
function Face({ x = 16, y = 19, gap = 3.6 }: { x?: number; y?: number; gap?: number }) {
  return (
    <>
      <circle cx={x - gap} cy={y} r={1.15} fill={INK} />
      <circle cx={x + gap} cy={y} r={1.15} fill={INK} />
      <ellipse cx={x - gap - 2.4} cy={y + 2.4} rx={1.7} ry={1.05} fill="var(--color-joy)" opacity={0.35} />
      <ellipse cx={x + gap + 2.4} cy={y + 2.4} rx={1.7} ry={1.05} fill="var(--color-joy)" opacity={0.35} />
      <path d={`M${x - 1.2} ${y + 2} q1.2 1.1 2.4 0`} fill="none" {...S} />
    </>
  );
}

/** 홈 · 새싹이: 머리에 새싹 두 잎 */
export function SproutChar({ className }: Props) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden>
      <path d="M16 10.5V6.5" fill="none" {...S} />
      <path d="M16 7.5c-1-3-4.5-3.8-6.5-2.6 1 2.6 3.8 3.6 6.5 2.6z" fill="var(--color-illu-5)" {...S} />
      <path d="M16 7c1.2-2.8 4.6-3.4 6.4-2.1-1.1 2.5-3.9 3.3-6.4 2.1z" fill="var(--color-illu-5)" {...S} />
      <path d="M5.5 20.5C5.5 14 10 10.5 16 10.5S26.5 14 26.5 20.5 22 28.5 16 28.5 5.5 27 5.5 20.5z" fill="var(--color-illu-2)" {...S} />
      <Face y={19.5} />
    </svg>
  );
}

/** 놀이 · 블록곰: 블록을 안은 곰 */
export function BlockBearChar({ className }: Props) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden>
      <circle cx={8.5} cy={9.5} r={3.3} fill="var(--color-illu-4)" {...S} />
      <circle cx={23.5} cy={9.5} r={3.3} fill="var(--color-illu-4)" {...S} />
      <ellipse cx={16} cy={17} rx={10.5} ry={9.5} fill="var(--color-illu-4)" {...S} />
      <ellipse cx={16} cy={20.2} rx={3.4} ry={2.4} fill="var(--color-illu-3)" {...S} />
      <circle cx={11.8} cy={16} r={1.15} fill={INK} />
      <circle cx={20.2} cy={16} r={1.15} fill={INK} />
      <ellipse cx={16} cy={19.3} rx={1} ry={0.7} fill={INK} />
      <ellipse cx={9.2} cy={19.2} rx={1.6} ry={1} fill="var(--color-joy)" opacity={0.35} />
      <ellipse cx={22.8} cy={19.2} rx={1.6} ry={1} fill="var(--color-joy)" opacity={0.35} />
      <rect x={18.5} y={22} width={8} height={8} rx={1.8} fill="var(--color-sage)" {...S} />
      <circle cx={22.5} cy={26} r={1.3} fill="var(--color-card)" />
    </svg>
  );
}

/** 기록 · 연필 다람쥐: 큰 꼬리 + 연필 */
export function PencilSquirrelChar({ className }: Props) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden>
      <path d="M19 27.5c8 2 13-5 11.5-12.5C29.6 9.8 24 7 21 10.5c-.9 1-.6 2.3.6 2.6 2.8.7 4.4 3.2 3.4 6.4" fill="var(--color-warm)" {...S} />
      <path d="M24.5 12.5c1.5 1.2 2.3 3 2.2 5" fill="none" stroke="var(--color-illu-4)" strokeWidth={1.4} strokeLinecap="round" />
      <ellipse cx={9.5} cy={9.8} rx={2.3} ry={3} fill="var(--color-illu-4)" {...S} />
      <ellipse cx={20.5} cy={9.8} rx={2.3} ry={3} fill="var(--color-illu-4)" {...S} />
      <circle cx={15} cy={18.5} r={9.5} fill="var(--color-illu-4)" {...S} />
      <ellipse cx={15} cy={23} rx={4} ry={3} fill="var(--color-illu-3)" />
      <Face x={15} y={18} gap={3.3} />
      <path d="M3.5 28.5 8 24" fill="none" stroke="var(--color-sage)" strokeWidth={3} strokeLinecap="round" />
      <path d="M3.2 28.8l.9-.9" fill="none" {...S} />
    </svg>
  );
}

/** 이야기 · 말풍선 오리 */
export function BubbleDuckChar({ className }: Props) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden>
      <path d="M19 2.8h9.5a2 2 0 012 2v4.4a2 2 0 01-2 2h-5.5l-2.5 2.3v-2.3H19a2 2 0 01-2-2V4.8a2 2 0 012-2z" fill="var(--color-card)" {...S} />
      <circle cx={21} cy={7} r={0.8} fill={INK} />
      <circle cx={23.8} cy={7} r={0.8} fill={INK} />
      <circle cx={26.6} cy={7} r={0.8} fill={INK} />
      <path d="M13 9.5c.3-1.6 1.6-2.4 2.8-2" fill="none" {...S} />
      <circle cx={14.5} cy={19.5} r={9.5} fill="var(--color-illu-3)" {...S} />
      <path d="M21.5 19.8c2.5-.6 5 .2 5.5 1.4-.7 1.4-3.3 2-5.7 1.3" fill="var(--color-joy)" {...S} />
      <circle cx={11} cy={18} r={1.15} fill={INK} />
      <circle cx={17.4} cy={17.4} r={1.15} fill={INK} />
      <ellipse cx={9} cy={21.4} rx={1.6} ry={1} fill="var(--color-joy)" opacity={0.35} />
    </svg>
  );
}

/** MY · 줄무늬 아기 고양이 */
export function KittenChar({ className }: Props) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden>
      <path d="M6.5 14 6 5.5l6.5 4.5M25.5 14l.5-8.5-6.5 4.5" fill="var(--color-illu-3)" {...S} />
      <ellipse cx={16} cy={19} rx={11} ry={9.5} fill="var(--color-illu-3)" {...S} />
      <path d="M13.5 10.5v2.3M16 10v2.6M18.5 10.5v2.3" fill="none" stroke="var(--color-illu-4)" strokeWidth={1.6} strokeLinecap="round" />
      <Face y={18.5} gap={4} />
      <path d="M2.8 19.5l4.2.6M2.8 22.5l4.2-.6M29.2 19.5l-4.2.6M29.2 22.5l-4.2-.6" fill="none" stroke={INK} strokeWidth={1} strokeLinecap="round" />
    </svg>
  );
}
