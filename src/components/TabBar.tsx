"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BlockBearChar, BubbleDuckChar, KittenChar, PencilSquirrelChar, SproutChar } from "./TabCharacters";

type Char = (p: { className?: string }) => React.ReactElement;

const TABS: { href: string; label: string; char: Char; match: (p: string) => boolean }[] = [
  { href: "/", label: "홈", char: SproutChar, match: (p) => p === "/" },
  { href: "/play", label: "놀이", char: BlockBearChar, match: (p) => p.startsWith("/play") },
  { href: "/logs", label: "기록", char: PencilSquirrelChar, match: (p) => p.startsWith("/logs") },
  { href: "/community", label: "커뮤니티", char: BubbleDuckChar, match: (p) => p.startsWith("/community") },
  { href: "/my", label: "MY", char: KittenChar, match: (p) => p.startsWith("/my") },
];

// 한 가지 일에 집중하는 화면에서는 탭바를 숨김
const HIDDEN = [/^\/onboarding/, /^\/child/, /^\/survey/, /^\/play\/[^/]+\/log/, /^\/community\/write/];

export default function TabBar() {
  const pathname = usePathname();
  if (HIDDEN.some((r) => r.test(pathname))) return null;
  return (
    <nav
      aria-label="주요 메뉴"
      className="fixed bottom-0 left-1/2 z-30 w-full max-w-[480px] -translate-x-1/2 border-t border-line bg-tabbar pb-[env(safe-area-inset-bottom)]"
    >
      <ul className="grid h-[74px] grid-cols-5">
        {TABS.map((t) => {
          const on = t.match(pathname);
          return (
            <li key={t.href}>
              <Link
                href={t.href}
                aria-current={on ? "page" : undefined}
                className={`pressable flex h-full flex-col items-center justify-center gap-0.5 ${on ? "text-ink" : "text-mute"}`}
              >
                {/* 선택 안 된 탭은 흑백으로 */}
                <t.char
                  className={`size-[30px] transition-[filter,opacity,transform] ${
                    on ? "-translate-y-0.5" : "opacity-55 grayscale"
                  }`}
                />
                <span className="text-[10.5px] font-semibold">{t.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

/** 탭바가 있는 화면의 스크롤 영역 하단 여백 */
export const TAB_SAFE = "pb-[calc(90px+env(safe-area-inset-bottom))]";
/** 탭바 + FAB이 있는 화면 */
export const TAB_FAB_SAFE = "pb-[calc(160px+env(safe-area-inset-bottom))]";
