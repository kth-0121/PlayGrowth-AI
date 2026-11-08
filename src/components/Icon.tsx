// 아이콘: lucide-react 라인 아이콘으로 통일 (stroke 1.8, 색은 currentColor)
import type { LucideIcon } from "lucide-react";

export type IconType = LucideIcon | typeof BlocksIcon;

export function Icon({ icon: I, size = 18, className }: { icon: IconType; size?: number; className?: string }) {
  return <I size={size} strokeWidth={1.8} className={className} aria-hidden />;
}

type SvgProps = { size?: number; strokeWidth?: number; className?: string };

/** 블록 3개가 쌓인 아이콘 (탭바 '놀이') */
export function BlocksIcon({ size = 24, strokeWidth = 1.8, className }: SvgProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <rect x="3" y="13" width="8" height="8" rx="1.5" />
      <rect x="13" y="13" width="8" height="8" rx="1.5" />
      <rect x="8" y="3" width="8" height="8" rx="1.5" />
    </svg>
  );
}

/** 다리 모양: 아치 곡선 + 세로선 3개 (로고 심볼) */
export function BridgeIcon({ size = 18, strokeWidth = 1.8, className }: SvgProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <path d="M2 18h20" />
      <path d="M3 18C6 9 18 9 21 18" />
      <path d="M8 18v-6.2M12 18v-7.5M16 18v-6.2" />
    </svg>
  );
}

/** 로고: 26px sage 박스 + 워드마크(놀이=ink, 다리=sage) */
export function Logo() {
  return (
    <span className="inline-flex items-center gap-2">
      <span className="flex size-[26px] items-center justify-center rounded-[8px] bg-sage text-white">
        <BridgeIcon size={18} />
      </span>
      <span className="text-[17px] font-extrabold tracking-[-0.03em]">
        놀이<span className="text-sage">다리</span>
      </span>
    </span>
  );
}

