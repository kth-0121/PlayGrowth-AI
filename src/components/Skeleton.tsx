import { TAB_SAFE } from "./TabBar";

/** 불러오는 동안 자리 표시 (깜빡임 없이 은은한 pulse) */
export function Skeleton({ className = "" }: { className?: string }) {
  return <span className={`block animate-pulse rounded-[10px] bg-neutral-chip motion-reduce:animate-none ${className}`} aria-hidden />;
}

/** 화면 전체 로딩: 헤더 + 제목 + 카드 몇 개 */
export function PageSkeleton({ withTab = true }: { withTab?: boolean }) {
  return (
    <main className={`flex flex-1 flex-col gap-3 px-5 ${withTab ? TAB_SAFE : "pb-10"}`} aria-busy="true" aria-label="불러오는 중">
      <div className="flex h-14 items-center">
        <Skeleton className="h-[26px] w-24" />
      </div>
      <Skeleton className="mt-2 h-4 w-28" />
      <Skeleton className="h-8 w-56" />
      <Skeleton className="mt-4 h-24 w-full rounded-[18px]" />
      <Skeleton className="h-56 w-full rounded-[22px]" />
      <Skeleton className="h-20 w-full rounded-[18px]" />
    </main>
  );
}
