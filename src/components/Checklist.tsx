"use client";

import { Check } from "lucide-react";
import { Icon } from "./Icon";

/** 준비물 체크리스트 (체크 상태는 부모가 저장) */
export function Checklist({
  items,
  checked,
  onToggle,
}: {
  items: string[];
  checked: number[];
  onToggle: (index: number) => void;
}) {
  return (
    <ul className="overflow-hidden rounded-[18px] bg-card">
      {items.map((item, i) => {
        const on = checked.includes(i);
        return (
          <li key={item} className="border-b border-line-soft last:border-b-0">
            <button
              type="button"
              role="checkbox"
              aria-checked={on}
              onClick={() => onToggle(i)}
              className="pressable flex min-h-[52px] w-full items-center gap-3 px-[18px] py-3 text-left"
            >
              <span
                className={`flex size-6 shrink-0 items-center justify-center rounded-[7px] ${
                  on ? "bg-sage text-white" : "border-[1.5px] border-line bg-card"
                }`}
              >
                {on && <Icon icon={Check} size={16} />}
              </span>
              <span className={`text-[15px] font-medium leading-[1.4] ${on ? "text-sub line-through" : ""}`}>{item}</span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}
