// 날짜 표시 도우미 (모두 브라우저 로컬 시간 기준, 클라이언트에서만 호출)
export const WEEKDAY = ["일", "월", "화", "수", "목", "금", "토"];
export const WEEKDAY_LONG = ["일요일", "월요일", "화요일", "수요일", "목요일", "금요일", "토요일"];

export const ymd = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

/** 오늘 포함 이번 주(일~토) 날짜 7개 */
export function thisWeek(today: Date): Date[] {
  const start = new Date(today);
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() - start.getDay());
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    return d;
  });
}

/** "11월 7일 토요일" */
export const longDate = (d: Date) => `${d.getMonth() + 1}월 ${d.getDate()}일 ${WEEKDAY_LONG[d.getDay()]}`;

function partOfDay(h: number) {
  if (h < 6) return "새벽";
  if (h < 12) return "오전";
  if (h < 17) return "오후";
  return "저녁";
}

/** "11월 6일 금 · 저녁" */
export function logTimeLabel(iso: string) {
  const d = new Date(iso);
  return `${d.getMonth() + 1}월 ${d.getDate()}일 ${WEEKDAY[d.getDay()]} · ${partOfDay(d.getHours())}`;
}

/** 두 날짜(YYYY-MM-DD) 사이 일수 */
export function daysBetween(from: string, to: string) {
  const a = new Date(from + "T00:00:00");
  const b = new Date(to + "T00:00:00");
  return Math.round((b.getTime() - a.getTime()) / 86_400_000);
}

/** "3시간 전", "2일 전" */
export function timeAgo(iso: string, now: Date) {
  const min = Math.floor((now.getTime() - new Date(iso).getTime()) / 60_000);
  if (min < 1) return "방금";
  if (min < 60) return `${min}분 전`;
  if (min < 60 * 24) return `${Math.floor(min / 60)}시간 전`;
  return `${Math.floor(min / 60 / 24)}일 전`;
}
