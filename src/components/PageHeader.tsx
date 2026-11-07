"use client";

import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { Icon, Logo } from "./Icon";

/** 화면 상단: 뒤로가기(선택) 또는 로고 + 우측 보조 정보 */
export function PageHeader({
  back = false,
  logo = false,
  title,
  right,
}: {
  back?: boolean;
  logo?: boolean;
  title?: string;
  right?: React.ReactNode;
}) {
  const router = useRouter();
  return (
    <header className="flex h-14 items-center gap-1">
      {back && (
        <button
          type="button"
          onClick={() => router.back()}
          aria-label="뒤로"
          className="pressable -ml-2.5 flex size-11 items-center justify-center text-ink"
        >
          <Icon icon={ChevronLeft} size={22} />
        </button>
      )}
      {logo && <Logo />}
      {title && <span className="text-[15px] font-bold">{title}</span>}
      <div className="ml-auto">{right}</div>
    </header>
  );
}

/** 화면 제목 (H1 23px/800) */
export function H1({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <h1 className={`whitespace-pre-line text-[23px] font-extrabold leading-[1.35] tracking-[-0.035em] ${className}`}>
      {children}
    </h1>
  );
}
