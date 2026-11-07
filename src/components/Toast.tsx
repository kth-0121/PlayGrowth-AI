"use client";
// 화면 이동 후에도 보이도록 레이아웃에 한 번만 두는 토스트
import { useSyncExternalStore } from "react";
import { Check } from "lucide-react";
import { Icon } from "./Icon";

type ToastItem = { id: number; text: string };
let current: ToastItem | null = null;
let timer: ReturnType<typeof setTimeout> | undefined;
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());

export function toast(text: string) {
  current = { id: Date.now(), text };
  emit();
  clearTimeout(timer);
  timer = setTimeout(() => {
    current = null;
    emit();
  }, 2600);
}

export function Toaster() {
  const item = useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    () => current,
    () => null,
  );
  return (
    <div
      aria-live="polite"
      className="pointer-events-none fixed bottom-[calc(74px+env(safe-area-inset-bottom)+84px)] left-1/2 z-40 flex w-full max-w-[480px] -translate-x-1/2 justify-center px-5"
    >
      {item && (
        <p key={item.id} className="anim-up inline-flex items-center gap-2 rounded-[14px] bg-ink px-4 py-3 text-[14px] font-semibold text-white">
          <Icon icon={Check} size={18} className="text-sage-light" />
          {item.text}
        </p>
      )}
    </div>
  );
}
