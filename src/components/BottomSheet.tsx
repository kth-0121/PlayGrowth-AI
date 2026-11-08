"use client";

import { useEffect, useRef } from "react";
import { X } from "lucide-react";
import { Icon } from "./Icon";

/**
 * 확인·선택용 바텀시트. 사용자가 누른 동작에만 띄움 (진입 직후 팝업 금지).
 * 열리면 시트로 포커스 이동, Esc·배경·닫기 버튼으로 닫힘.
 */
export function BottomSheet({
  open,
  title,
  onClose,
  children,
}: {
  open: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const prev = document.activeElement as HTMLElement | null;
    ref.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      prev?.focus();
    };
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <button type="button" aria-label="닫기" className="absolute inset-0 bg-scrim" onClick={onClose} />
      <div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        tabIndex={-1}
        className="anim-up relative w-full max-w-[480px] rounded-t-[22px] bg-card px-5 pb-[calc(20px+env(safe-area-inset-bottom))] pt-3 outline-none"
      >
        <span className="mx-auto block h-1 w-9 rounded-full bg-line" aria-hidden />
        <div className="mt-3 flex items-center justify-between gap-3">
          <h2 className="text-[18px] font-bold tracking-[-0.03em]">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="닫기"
            className="pressable -mr-2 flex size-11 items-center justify-center text-sub"
          >
            <Icon icon={X} size={20} />
          </button>
        </div>
        <div className="mt-2">{children}</div>
      </div>
    </div>
  );
}
