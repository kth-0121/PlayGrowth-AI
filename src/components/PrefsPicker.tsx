"use client";
// 아이 관심 고르기 (온보딩·MY 공통): 좋아하는 놀이 종류 + 더 함께 놀아 주고 싶은 영역. 모두 선택 사항
import { AREA_LABEL, type Area, type ChildPrefs } from "@/types";
import { AREA_PLAY_NAME } from "@/lib/copy";
import { AREA_ORDER } from "@/lib/survey";

export function PrefsPicker({ value, onChange }: { value: ChildPrefs; onChange: (v: ChildPrefs) => void }) {
  return (
    <div className="flex flex-col gap-6">
      <ChipGroup
        legend="우리 아이가 좋아하는 놀이는? (여러 개 선택)"
        labels={AREA_PLAY_NAME}
        selected={value.likes}
        onChange={(likes) => onChange({ ...value, likes })}
      />
      <ChipGroup
        legend="더 함께 놀아 주고 싶은 영역은? (여러 개 선택)"
        hint="진단이 아니에요. 집에서 본 모습대로 골라 주세요."
        labels={AREA_LABEL}
        selected={value.concernAreas}
        onChange={(concernAreas) => onChange({ ...value, concernAreas })}
      />
    </div>
  );
}

function ChipGroup({
  legend,
  hint,
  labels,
  selected,
  onChange,
}: {
  legend: string;
  hint?: string;
  labels: Record<Area, string>;
  selected: Area[];
  onChange: (v: Area[]) => void;
}) {
  const toggle = (a: Area) => onChange(selected.includes(a) ? selected.filter((x) => x !== a) : [...selected, a]);
  const chip = (on: boolean) =>
    `pressable min-h-11 rounded-full px-4 text-[14px] font-semibold ${
      on ? "border-[1.5px] border-sage bg-sage-light text-sage-dark" : "border border-line bg-card text-sub"
    }`;
  return (
    <fieldset>
      <legend className="text-[14px] font-bold">{legend}</legend>
      {hint && <p className="mt-1 text-[12.5px] font-medium text-sub">{hint}</p>}
      <div className="mt-2.5 flex flex-wrap gap-2">
        {AREA_ORDER.map((a) => (
          <button key={a} type="button" aria-pressed={selected.includes(a)} onClick={() => toggle(a)} className={chip(selected.includes(a))}>
            {labels[a]}
          </button>
        ))}
        {/* '잘 모르겠어요' = 아무것도 고르지 않음 */}
        <button type="button" aria-pressed={selected.length === 0} onClick={() => onChange([])} className={chip(selected.length === 0)}>
          잘 모르겠어요
        </button>
      </div>
    </fieldset>
  );
}
