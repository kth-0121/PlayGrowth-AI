"use client";

import { useEffect, useState } from "react";
import { Pause, Play, RotateCcw } from "lucide-react";
import { Icon } from "./Icon";

/** 선택형 타이머. 끝나도 소리·경고 없이 "충분해요"만 보여 줌 (시간 압박 금지) */
export function Timer({ minutes }: { minutes: number }) {
  const total = minutes * 60;
  const [left, setLeft] = useState(total);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    if (!running) return;
    const t = setInterval(() => {
      setLeft((s) => {
        if (s <= 1) {
          setRunning(false);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [running]);

  const mm = String(Math.floor(left / 60)).padStart(2, "0");
  const ss = String(left % 60).padStart(2, "0");
  const done = left === 0;

  return (
    <div className="flex items-center gap-3 rounded-[16px] bg-card px-4 py-3">
      <div className="min-w-0 flex-1">
        <p className="text-[12px] font-semibold text-sub">타이머 (선택)</p>
        <p className="text-[20px] font-extrabold tabular-nums tracking-[-0.03em]" aria-live="off">
          {done ? "충분히 놀았어요" : `${mm}:${ss}`}
        </p>
      </div>
      <button
        type="button"
        onClick={() => {
          setLeft(total);
          setRunning(false);
        }}
        aria-label="타이머 처음으로"
        className="pressable flex size-11 items-center justify-center rounded-[12px] bg-neutral-chip text-sub"
      >
        <Icon icon={RotateCcw} size={18} />
      </button>
      {!done && (
        <button
          type="button"
          onClick={() => setRunning((r) => !r)}
          aria-label={running ? "타이머 멈추기" : "타이머 시작"}
          className="pressable flex size-11 items-center justify-center rounded-[12px] bg-sage-light text-sage-dark"
        >
          <Icon icon={running ? Pause : Play} size={18} />
        </button>
      )}
    </div>
  );
}
