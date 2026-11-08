// 커뮤니티 화면 확인용 가짜 글·댓글 (DB 연결 전)
import type { Comment } from "@/lib/comments";
import type { Post } from "@/lib/local-store";

const hoursAgo = (h: number) => new Date(Date.UTC(2026, 10, 7, 9) - h * 3_600_000).toISOString();

export const DEMO_POSTS: Post[] = [
  { id: "p1", board: "review", nickname: "콩이네", title: "냄비 뚜껑 놀이, 3일째 하고 있어요", body: "처음엔 소리에 놀라서 울었는데 손바닥으로 살살 두드리는 걸로 바꾸니까 이제 먼저 숟가락을 들고 와요. 하루 10분이라도 같이 앉아 있는 시간이 생겨서 저도 좋네요.", playId: "lang-sound-1", comments: 3, unverified: false, createdAt: hoursAgo(2) },
  { id: "p2", board: "review", nickname: "도토리맘", title: "빨래집게 대신 큰 집게로 시작했어요", body: "손힘이 약해서 문구점 큰 집게로 먼저 해 봤는데 훨씬 잘 따라 했어요. 혹시 비슷한 고민 있으시면 참고하세요.", playId: "fine-clip-1", comments: 1, unverified: false, createdAt: hoursAgo(9) },
  { id: "p3", board: "review", nickname: "봄봄", title: "이 놀이 매일 하면 말이 확 늘어요", body: "저희 아이는 2주 만에 단어가 열 개 넘게 늘었어요. 무조건 매일 하세요!", playId: "lang-babble-2", comments: 2, unverified: true, createdAt: hoursAgo(26) },
  { id: "p4", board: "center", nickname: "하늘이아빠", title: "첫 상담 전에 준비하면 좋았던 것", body: "놀이 기록을 2주치 정리해서 가져갔더니 선생님이 아이 모습을 훨씬 빨리 파악하셨어요. 사진보다 메모가 도움이 됐어요.", playId: null, comments: 2, unverified: false, createdAt: hoursAgo(5) },
  { id: "p5", board: "center", nickname: "별이네", title: "대기 순번 문의는 어떻게 하셨어요?", body: "3개월째 기다리는 중인데 중간에 연락드려도 되는지 고민이에요. 경험 있으신 분 계실까요?", playId: null, comments: 0, unverified: false, createdAt: hoursAgo(30) },
  { id: "p6", board: "worry", nickname: "익명", title: "다른 아이와 비교하게 돼요", body: "놀이터에서 또래 아이들을 보면 자꾸 비교하게 되고 마음이 무거워요. 다들 어떻게 마음을 다잡으세요?", playId: null, comments: 2, unverified: false, createdAt: hoursAgo(4) },
  { id: "p7", board: "worry", nickname: "구름", title: "기다리는 동안 제가 뭘 해야 할지 막막해요", body: "매일 15분이라도 같이 놀자고 마음먹었는데 피곤한 날은 그것도 어렵네요.", playId: null, comments: 1, unverified: false, createdAt: hoursAgo(50) },
];

export const DEMO_COMMENTS: Comment[] = [
  { id: "c1", authorId: "", postId: "p1", nickname: "도토리맘", body: "손바닥으로 바꾸는 거 좋은 방법이네요. 저도 해 볼게요.", createdAt: hoursAgo(1.5) },
  { id: "c2", authorId: "", postId: "p1", nickname: "구름", body: "같이 앉아 있는 시간이 생긴다는 말에 공감해요.", createdAt: hoursAgo(1) },
  { id: "c3", authorId: "", postId: "p1", nickname: "익명", body: "저희는 냄비 대신 플라스틱 그릇으로 했어요. 소리가 덜 커서 좋았어요.", createdAt: hoursAgo(0.5) },
  { id: "c4", authorId: "", postId: "p2", nickname: "콩이네", body: "큰 집게 팁 감사해요!", createdAt: hoursAgo(8) },
  { id: "c5", authorId: "", postId: "p3", nickname: "하늘이아빠", body: "아이마다 속도가 달라서 너무 기대하지 않는 게 마음이 편하더라고요.", createdAt: hoursAgo(20) },
  { id: "c6", authorId: "", postId: "p3", nickname: "별이네", body: "매일 못 해도 괜찮다고 들었어요. 즐겁게 하는 게 먼저래요.", createdAt: hoursAgo(18) },
  { id: "c7", authorId: "", postId: "p4", nickname: "봄봄", body: "메모가 더 도움이 됐다는 거 신기하네요. 저도 정리해 볼게요.", createdAt: hoursAgo(4) },
  { id: "c8", authorId: "", postId: "p4", nickname: "구름", body: "리포트 기능으로 정리하니까 편했어요.", createdAt: hoursAgo(3) },
  { id: "c9", authorId: "", postId: "p6", nickname: "콩이네", body: "저도 그래요. 어제보다 하나 더 한 것만 보려고 해요.", createdAt: hoursAgo(3) },
  { id: "c10", authorId: "", postId: "p6", nickname: "도토리맘", body: "비교하는 마음이 드는 것 자체가 자연스러운 거래요. 힘내요.", createdAt: hoursAgo(2) },
  { id: "c11", authorId: "", postId: "p7", nickname: "하늘이아빠", body: "피곤한 날은 5분만 해도 충분하대요.", createdAt: hoursAgo(40) },
];
