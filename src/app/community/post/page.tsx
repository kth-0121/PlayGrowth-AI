import { Suspense } from "react";
import PostView from "./post-view";

// 글 보기 (?id=글id). 사용자가 쓴 글도 열 수 있게 쿼리로 받음
export default function CommunityPostPage() {
  return (
    <Suspense fallback={<main className="flex-1" />}>
      <PostView />
    </Suspense>
  );
}
