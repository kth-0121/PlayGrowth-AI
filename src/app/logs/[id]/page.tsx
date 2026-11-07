import { Suspense } from "react";
import { PageSkeleton } from "@/components/Skeleton";
import LogDetail from "./log-detail";

// 기록 id는 기기마다 달라서 요청 시점에 읽음 → Suspense로 감쌈 (cacheComponents)
export default function LogDetailPage() {
  return (
    <Suspense fallback={<PageSkeleton withTab={false} />}>
      <LogDetail />
    </Suspense>
  );
}
