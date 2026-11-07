import { Suspense } from "react";
import PostView from "./post-view";

// 글 상세 + 댓글. 글 id는 ?id=로 받음 (글은 사용자가 만들어서 미리 만들 수 있는 경로가 없음)
export default function CommunityPostPage() {
  return (
    <Suspense fallback={<main className="flex-1" />}>
      <PostView />
    </Suspense>
  );
}
