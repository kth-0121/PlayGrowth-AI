// 커뮤니티 화면 확인용 가짜 글 (DB 연결 전)
import type { Comment, Post } from "./local-store";

const hoursAgo = (h: number) => new Date(Date.UTC(2026, 10, 7, 9) - h * 3_600_000).toISOString();

export const DEMO_POSTS: Post[] = [
  { id: "p1", board: "review", nickname: "콩이네", title: "냄비 뚜껑 놀이, 3일째 하고 있어요", body: "처음엔 소리에 놀라서 울었는데 손바닥으로 살살 두드리는 걸로 바꾸니까 이제 먼저 숟가락을 들고 와요.", playId: "lang-sound-1", comments: 0, createdAt: hoursAgo(2) },
  { id: "p2", board: "review", nickname: "도토리맘", title: "빨래집게 대신 큰 집게로 시작했어요", body: "손힘이 약해서 문구점 큰 집게로 먼저 해 봤는데 훨씬 잘 따라 했어요. 혹시 비슷한 고민 있으시면 참고하세요.", playId: "fine-clip-1", comments: 0, createdAt: hoursAgo(9) },
  { id: "p3", board: "review", nickname: "봄봄", title: "소리 주고받기에서 처음으로 차례를 기다렸어요", body: "'이번엔 엄마 차례!' 했더니 숟가락을 내려놓고 기다리더라고요. 별거 아닌데 울컥했어요.", playId: "lang-sound-2", comments: 0, createdAt: hoursAgo(26) },
  { id: "p4", board: "center", nickname: "하늘이아빠", title: "첫 상담 전에 준비하면 좋았던 것", body: "놀이 기록을 2주치 정리해서 가져갔더니 선생님이 아이 모습을 훨씬 빨리 파악하셨어요. 사진보다 메모가 도움이 됐어요.", playId: null, comments: 0, createdAt: hoursAgo(5) },
  { id: "p5", board: "center", nickname: "별이네", title: "대기 순번 문의는 어떻게 하셨어요?", body: "3개월째 기다리는 중인데 중간에 연락드려도 되는지 고민이에요. 경험 있으신 분 계실까요?", playId: null, comments: 0, createdAt: hoursAgo(30) },
  { id: "p6", board: "worry", nickname: "익명", title: "다른 아이와 비교하게 돼요", body: "놀이터에서 또래 아이들을 보면 자꾸 비교하게 되고 마음이 무거워요. 다들 어떻게 마음을 다잡으세요?", playId: null, comments: 0, createdAt: hoursAgo(4) },
  { id: "p7", board: "worry", nickname: "구름", title: "기다리는 동안 제가 뭘 해야 할지 막막해요", body: "매일 15분이라도 같이 놀자고 마음먹었는데 피곤한 날은 그것도 어렵네요.", playId: null, comments: 0, createdAt: hoursAgo(50) },
];

// 가짜 글에 달린 가짜 댓글 (실제 아이 정보 없음)
const c = (postId: string, n: number, nickname: string, body: string, h: number): Comment => ({
  id: `${postId}-c${n}`,
  postId,
  nickname,
  body,
  mine: false,
  createdAt: hoursAgo(h),
});

export const DEMO_COMMENTS: Comment[] = [
  c("p1", 1, "도토리맘", "저희 아이도 처음엔 소리에 놀랐어요. 손바닥으로 바꾸는 방법 참고할게요!", 1.5),
  c("p1", 2, "봄봄", "먼저 숟가락 들고 오는 모습 상상만 해도 뭉클해요.", 1),
  c("p2", 1, "콩이네", "큰 집게 좋은 아이디어네요. 문구점에 가 봐야겠어요.", 8),
  c("p3", 1, "구름", "차례 기다리기 정말 큰 일이죠. 축하드려요.", 20),
  c("p3", 2, "하늘이아빠", "저도 이 놀이에서 비슷한 순간이 있었어요. 기록해 두시면 상담 때 좋아요.", 18),
  c("p4", 1, "별이네", "메모가 도움이 됐다니 저도 기록 꾸준히 해 볼게요.", 4),
  c("p5", 1, "하늘이아빠", "저는 한 달에 한 번 정도 대기 상황만 여쭤봤어요. 친절하게 알려 주셨어요.", 28),
  c("p6", 1, "봄봄", "저도 그래요. 어제보다 오늘 한 가지 늘어난 걸 적어 보니 마음이 한결 가벼워졌어요.", 3),
  c("p6", 2, "익명", "비교하지 않기 정말 어렵죠. 여기서 같이 이야기 나눠요.", 2),
  c("p7", 1, "콩이네", "피곤한 날은 5분만 해도 충분하다고 생각하려고요. 같이 힘내요.", 40),
];

/** 글의 댓글: 가짜 글이면 가짜 댓글 + 이 기기에서 쓴 댓글, 실제 글이면 캐시의 댓글 */
export function commentsFor(postId: string, cached: Comment[]): Comment[] {
  const demo = DEMO_COMMENTS.filter((x) => x.postId === postId);
  return [...demo, ...cached.filter((x) => x.postId === postId)].sort((a, b) => a.createdAt.localeCompare(b.createdAt));
}

export const isDemoPost = (id: string) => DEMO_POSTS.some((p) => p.id === id);

/** 목록에 보여줄 댓글 수. 실제 글은 서버 개수(내가 쓴 댓글 반영), 가짜 글은 직접 셈 */
export const commentCount = (p: Post, cached: Comment[]) => (isDemoPost(p.id) ? commentsFor(p.id, cached).length : p.comments);
