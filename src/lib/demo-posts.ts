// 커뮤니티 화면 확인용 가짜 글 (DB 연결 전)
import type { Post } from "./local-store";

const hoursAgo = (h: number) => new Date(Date.UTC(2026, 10, 7, 9) - h * 3_600_000).toISOString();

export const DEMO_POSTS: Post[] = [
  { id: "p1", board: "review", nickname: "콩이네", title: "냄비 뚜껑 놀이, 3일째 하고 있어요", body: "처음엔 소리에 놀라서 울었는데 손바닥으로 살살 두드리는 걸로 바꾸니까 이제 먼저 숟가락을 들고 와요.", playId: "lang-sound-1", comments: 8, createdAt: hoursAgo(2) },
  { id: "p2", board: "review", nickname: "도토리맘", title: "빨래집게 대신 큰 집게로 시작했어요", body: "손힘이 약해서 문구점 큰 집게로 먼저 해 봤는데 훨씬 잘 따라 했어요. 혹시 비슷한 고민 있으시면 참고하세요.", playId: "fine-clip-1", comments: 3, createdAt: hoursAgo(9) },
  { id: "p3", board: "review", nickname: "봄봄", title: "소리 주고받기에서 처음으로 차례를 기다렸어요", body: "'이번엔 엄마 차례!' 했더니 숟가락을 내려놓고 기다리더라고요. 별거 아닌데 울컥했어요.", playId: "lang-sound-2", comments: 12, createdAt: hoursAgo(26) },
  { id: "p4", board: "center", nickname: "하늘이아빠", title: "첫 상담 전에 준비하면 좋았던 것", body: "놀이 기록을 2주치 정리해서 가져갔더니 선생님이 아이 모습을 훨씬 빨리 파악하셨어요. 사진보다 메모가 도움이 됐어요.", playId: null, comments: 15, createdAt: hoursAgo(5) },
  { id: "p5", board: "center", nickname: "별이네", title: "대기 순번 문의는 어떻게 하셨어요?", body: "3개월째 기다리는 중인데 중간에 연락드려도 되는지 고민이에요. 경험 있으신 분 계실까요?", playId: null, comments: 6, createdAt: hoursAgo(30) },
  { id: "p6", board: "worry", nickname: "익명", title: "다른 아이와 비교하게 돼요", body: "놀이터에서 또래 아이들을 보면 자꾸 비교하게 되고 마음이 무거워요. 다들 어떻게 마음을 다잡으세요?", playId: null, comments: 21, createdAt: hoursAgo(4) },
  { id: "p7", board: "worry", nickname: "구름", title: "기다리는 동안 제가 뭘 해야 할지 막막해요", body: "매일 15분이라도 같이 놀자고 마음먹었는데 피곤한 날은 그것도 어렵네요.", playId: null, comments: 9, createdAt: hoursAgo(50) },
];
