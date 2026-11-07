"use client";

/** 2~4개 중 하나 고르기 (탭 전환·기간 선택) */
export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  label,
}: {
  options: { value: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
  label: string;
}) {
  return (
    <div
      role="radiogroup"
      aria-label={label}
      className="grid gap-1 rounded-[13px] bg-neutral-chip p-1"
      style={{ gridTemplateColumns: `repeat(${options.length}, minmax(0, 1fr))` }}
    >
      {options.map((o) => {
        const on = o.value === value;
        return (
          <button
            key={o.value}
            type="button"
            role="radio"
            aria-checked={on}
            onClick={() => onChange(o.value)}
            className={`pressable min-h-10 rounded-[10px] px-2 text-[14px] ${
              on ? "bg-card font-bold text-ink" : "font-semibold text-sub"
            }`}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}
