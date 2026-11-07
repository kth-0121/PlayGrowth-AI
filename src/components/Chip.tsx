import { Clock } from "lucide-react";
import { AREA_LABEL, type Area, type Done, type Reaction } from "@/types";
import { Icon, type IconType } from "./Icon";

/** 발달 영역 칩 */
export function AreaChip({ area }: { area: Area }) {
  return (
    <span className="inline-flex items-center rounded-[8px] bg-sage-light px-[9px] py-[5px] text-[12px] font-semibold leading-none text-sage-dark">
      {AREA_LABEL[area]}
    </span>
  );
}

/** 메타 정보 칩 (15분, 24개월 이상 등) */
export function MetaChip({ children, icon }: { children: React.ReactNode; icon?: IconType }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-[8px] bg-neutral-chip px-[9px] py-[5px] text-[12px] font-semibold leading-none text-sub">
      {icon && <Icon icon={icon} size={13} />}
      {children}
    </span>
  );
}

export function TimeChip({ minutes }: { minutes: number }) {
  return <MetaChip icon={Clock}>{minutes}분</MetaChip>;
}

const REACTION_LABEL: Record<Reaction, string> = { enjoyed: "즐거워함", neutral: "보통", hard: "어려워함" };
const DONE_LABEL: Record<Done, string> = { done: "완료", partial: "일부 진행", notDone: "못함" };

/** 반응·수행 여부 태그. '즐거워함'만 joy 색, 나머지는 중립 */
export function ReactionTag({ reaction, done }: { reaction?: Reaction; done?: Done }) {
  const joy = reaction === "enjoyed";
  const label = reaction ? REACTION_LABEL[reaction] : done ? DONE_LABEL[done] : "";
  return (
    <span
      className={`inline-flex items-center rounded-[7px] px-2 py-1 text-[12px] font-bold leading-none ${
        joy ? "bg-joy-bg text-joy" : "bg-neutral-chip text-sub"
      }`}
    >
      {label}
    </span>
  );
}

export { REACTION_LABEL, DONE_LABEL };
