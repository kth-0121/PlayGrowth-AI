// 커뮤니티 공통 도우미
import { DEMO_COMMENTS, DEMO_POSTS } from "./demo-posts";
import type { Comment, Post, PostFeedback } from "./local-store";

type CommunityData = { posts: Post[]; comments: Comment[]; feedback: { postId: string; kind: PostFeedback }[] };

// 효과를 단정하는 표현이 있으면 '검증되지 않은 정보' 표시 (TODO: 관리자 검토로 대체)
const CLAIM_WORDS = ["효과", "좋아졌", "나아졌", "확 늘", "고쳐", "완치", "무조건"];
export const isUnverifiedClaim = (text: string) => CLAIM_WORDS.some((w) => text.includes(w));

export const allPosts = (d: CommunityData): Post[] => [...d.posts, ...DEMO_POSTS];

export const findPost = (d: CommunityData, id: string) => allPosts(d).find((p) => p.id === id);

/** 글의 댓글 (오래된 순) */
export function postComments(d: CommunityData, postId: string): Comment[] {
  return [...DEMO_COMMENTS, ...d.comments]
    .filter((c) => c.postId === postId)
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
}

export const FEEDBACK_LABEL: Record<PostFeedback, string> = { helpful: "도움이 됐어요", cheer: "응원해요" };

/** 반응 수 = 예시 글의 기본 수 + 이 기기에서 누른 것 */
export function feedbackCount(d: CommunityData, post: Post, kind: PostFeedback) {
  const base = post.feedback?.[kind] ?? 0;
  return base + (d.feedback.some((f) => f.postId === post.id && f.kind === kind) ? 1 : 0);
}

export const feedbackOn = (d: CommunityData, postId: string, kind: PostFeedback) =>
  d.feedback.some((f) => f.postId === postId && f.kind === kind);
