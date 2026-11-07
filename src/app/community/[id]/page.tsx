import { Suspense } from "react";
import { PageSkeleton } from "@/components/Skeleton";
import PostDetail from "./post-detail";

export default function PostPage() {
  return (
    <Suspense fallback={<PageSkeleton withTab={false} />}>
      <PostDetail />
    </Suspense>
  );
}
