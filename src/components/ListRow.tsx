import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { Icon } from "./Icon";

/** 흰 컨테이너 하나 + 구분선으로 나눈 행 목록 */
export function ListGroup({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <ul className={`overflow-hidden rounded-[18px] bg-card ${className}`}>{children}</ul>;
}

type RowProps = {
  children: React.ReactNode;
  href?: string;
  onClick?: () => void;
  chevron?: boolean;
  trailing?: React.ReactNode;
};

/** 행 사이 1px line-soft, 마지막 행은 선 없음 */
export function ListRow({ children, href, onClick, chevron = false, trailing }: RowProps) {
  const inner = (
    <>
      <div className="min-w-0 flex-1">{children}</div>
      {trailing}
      {chevron && <Icon icon={ChevronRight} size={18} className="shrink-0 text-mute" />}
    </>
  );
  const cls = "pressable flex min-h-[52px] w-full items-center gap-3 px-[18px] py-[14px] text-left";
  return (
    <li className="border-b border-line-soft last:border-b-0">
      {href ? (
        <Link href={href} className={cls}>
          {inner}
        </Link>
      ) : onClick ? (
        <button type="button" onClick={onClick} className={cls}>
          {inner}
        </button>
      ) : (
        <div className={cls}>{inner}</div>
      )}
    </li>
  );
}
