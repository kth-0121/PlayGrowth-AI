"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { House, MessageSquare, NotebookPen, User } from "lucide-react";
import { BlocksIcon, Icon, type IconType } from "./Icon";

const TABS: { href: string; label: string; icon: IconType; match: (p: string) => boolean }[] = [
  { href: "/", label: "홈", icon: House, match: (p) => p === "/" },
  { href: "/play", label: "놀이", icon: BlocksIcon, match: (p) => p.startsWith("/play") },
  { href: "/logs", label: "기록", icon: NotebookPen, match: (p) => p.startsWith("/logs") },
  { href: "/community", label: "커뮤니티", icon: MessageSquare, match: (p) => p.startsWith("/community") },
  { href: "/my", label: "MY", icon: User, match: (p) => p.startsWith("/my") },
];

// 한 가지 일에 집중하는 화면에서는 탭바를 숨김
const HIDDEN = [/^\/onboarding/, /^\/child/, /^\/survey/, /^\/play\/[^/]+\/log/, /^\/community\/write/, /^\/my\/prefs/];

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
                className={`pressable flex h-full flex-col items-center justify-center gap-1 ${on ? "text-ink" : "text-mute"}`}
              >
                <Icon icon={t.icon} size={22} />
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
