import { Suspense } from "react";
import PostView from "./post-view";

export default function CommunityPostPage() {
  return (
    <Suspense fallback={<main className="flex-1" />}>
      <PostView />
    </Suspense>
  );
}
