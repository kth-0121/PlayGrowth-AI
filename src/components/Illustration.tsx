// 일러스트 플레이스홀더: 원과 라운드 사각형 조합.
// 실제 일러스트가 나오면 이 컴포넌트 안만 <img>로 바꾸면 됩니다.

type Variant = "soft" | "sage";

// 도형 배치 프리셋 (seed로 골라서 화면마다 조금씩 다르게)
const LAYOUTS = [
  [
    { k: "circle", x: 14, y: 28, s: 62, c: 0 },
    { k: "rect", x: 44, y: 46, w: 70, h: 44, c: 1 },
    { k: "circle", x: 70, y: 18, s: 34, c: 2 },
    { k: "rect", x: 78, y: 58, w: 26, h: 26, c: 3 },
  ],
  [
    { k: "rect", x: 10, y: 50, w: 52, h: 40, c: 1 },
    { k: "circle", x: 46, y: 22, s: 54, c: 0 },
    { k: "circle", x: 76, y: 56, s: 30, c: 3 },
    { k: "rect", x: 66, y: 14, w: 22, h: 22, c: 2 },
  ],
  [
    { k: "circle", x: 30, y: 52, s: 70, c: 1 },
    { k: "rect", x: 8, y: 16, w: 30, h: 30, c: 2 },
    { k: "rect", x: 62, y: 36, w: 56, h: 36, c: 0 },
    { k: "circle", x: 84, y: 18, s: 24, c: 3 },
  ],
] as const;

const COLORS: Record<Variant, string[]> = {
  soft: ["bg-illu-1", "bg-illu-2", "bg-illu-3", "bg-illu-4", "bg-illu-5"],
  sage: ["bg-illu-s1", "bg-illu-s2", "bg-illu-s3", "bg-illu-s4"],
};

export function Illustration({
  height,
  variant = "soft",
  seed = 0,
  className = "",
  children,
}: {
  height: number;
  variant?: Variant;
  seed?: number;
  className?: string;
  children?: React.ReactNode;
}) {
  const layout = LAYOUTS[Math.abs(seed) % LAYOUTS.length];
  const colors = COLORS[variant];
  return (
    <div
      className={`relative overflow-hidden ${variant === "sage" ? "bg-sage" : "bg-sage-xlight"} ${className}`}
      style={{ height }}
      aria-hidden
    >
      {layout.map((d, i) => {
        const size = d.k === "circle" ? { width: d.s, height: d.s } : { width: d.w, height: d.h };
        return (
          <span
            key={i}
            className={`absolute -translate-x-1/2 -translate-y-1/2 ${d.k === "circle" ? "rounded-full" : "rounded-[14px]"} ${colors[d.c % colors.length]}`}
            style={{ left: `${d.x}%`, top: `${d.y}%`, ...size }}
          />
        );
      })}
      {children}
    </div>
  );
}
