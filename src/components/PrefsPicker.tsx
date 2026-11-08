"use client";
// 아이 관심 고르기 (온보딩·MY 공통): 좋아하는 놀이(흥미 영역) + 더 함께 놀아 주고 싶은 영역(누리과정 5개 영역). 모두 선택 사항
import { NURI_AREA, PLAY_CORNER, type ChildPrefs, type NuriArea, type PlayCorner } from "@/types";

const CORNERS = Object.keys(PLAY_CORNER) as PlayCorner[];
const NURIS = Object.keys(NURI_AREA) as NuriArea[];

const toggle = <T,>(list: T[], v: T) => (list.includes(v) ? list.filter((x) => x !== v) : [...list, v]);

export function PrefsPicker({ value, onChange }: { value: ChildPrefs; onChange: (v: ChildPrefs) => void }) {
  const chip = (on: boolean) =>
    `pressable min-h-11 rounded-full px-4 text-[14px] font-semibold ${
      on ? "border-[1.5px] border-sage bg-sage-light text-sage-dark" : "border border-line bg-card text-sub"
    }`;
  const card = (on: boolean) =>
    `pressable flex w-full flex-col items-start gap-0.5 rounded-[14px] px-4 py-3 text-left ${
      on ? "border-[1.5px] border-sage bg-sage-light" : "border border-line bg-card"
    }`;
  const { likes, concernAreas } = value;

  return (
    <div className="flex flex-col gap-6">
      <fieldset>
        <legend className="text-[14px] font-bold">우리 아이가 좋아하는 놀이는? (여러 개 선택)</legend>
        <div className="mt-2.5 flex flex-wrap gap-2">
          {CORNERS.map((c) => (
            <button
              key={c}
              type="button"
              aria-pressed={likes.includes(c)}
              onClick={() => onChange({ ...value, likes: toggle(likes, c) })}
              className={chip(likes.includes(c))}
            >
              {PLAY_CORNER[c].label}
            </button>
          ))}
          {/* '잘 모르겠어요' = 아무것도 고르지 않음 */}
          <button
            type="button"
            aria-pressed={likes.length === 0}
            onClick={() => onChange({ ...value, likes: [] })}
            className={chip(likes.length === 0)}
          >
            잘 모르겠어요
          </button>
        </div>
      </fieldset>

      <fieldset>
        <legend className="text-[14px] font-bold">더 함께 놀아 주고 싶은 영역은? (여러 개 선택)</legend>
        <p className="mt-1 text-[12.5px] font-medium text-sub">누리과정 5개 영역이에요. 진단이 아니니 집에서 본 모습대로 골라 주세요.</p>
        <div className="mt-2.5 flex flex-col gap-2">
          {NURIS.map((n) => {
            const on = concernAreas.includes(n);
            return (
              <button
                key={n}
                type="button"
                aria-pressed={on}
                onClick={() => onChange({ ...value, concernAreas: toggle(concernAreas, n) })}
                className={card(on)}
              >
                <span className={`text-[15px] font-bold ${on ? "text-sage-dark" : ""}`}>{NURI_AREA[n].label}</span>
                <span className="text-[12.5px] font-medium text-sub">{NURI_AREA[n].desc}</span>
              </button>
            );
          })}
          <button
            type="button"
            aria-pressed={concernAreas.length === 0}
            onClick={() => onChange({ ...value, concernAreas: [] })}
            className={card(concernAreas.length === 0)}
          >
            <span className={`text-[15px] font-bold ${concernAreas.length === 0 ? "text-sage-dark" : ""}`}>잘 모르겠어요</span>
            <span className="text-[12.5px] font-medium text-sub">발달 체크 결과로만 추천해요</span>
          </button>
        </div>
      </fieldset>
    </div>
  );
}
