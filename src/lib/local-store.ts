"use client";
// 저장소: 화면은 브라우저 캐시(localStorage)를 바로 읽고, 저장할 때마다 Supabase에도 함께 저장.
// 로그인하면 syncFromServer()로 서버의 내 데이터를 캐시에 채움. 필드는 supabase/schema.sql 기준.
import { useSyncExternalStore } from "react";
import type { Board, PlayLog, SurveyAnswers, SurveyResult } from "@/types";
import { scoreSurvey } from "./survey";
import { supabase } from "./supabase";

export type Child = {
  id: string;
  nickname: string;
  birthDate: string; // YYYY-MM-DD
  consentAt: string; // 보호자 동의 시각
  createdAt: string;
};

export type Survey = {
  id: string;
  childId: string;
  answers: SurveyAnswers;
  result: SurveyResult;
  createdAt: string;
};

export type Recommendation = {
  id: string;
  childId: string;
  playId: string;
  reason: string | null;
  createdAt: string;
};

// 센터 대기 정보 (profiles의 center_name·wait_start·consult_date)
export type CenterWait = {
  name: string;
  waitStart: string; // 대기 시작일 YYYY-MM-DD
  consultDate: string; // 첫 상담 예정일 YYYY-MM-DD
};

export type Post = {
  id: string;
  board: Board;
  nickname: string;
  title: string;
  body: string;
  playId: string | null;
  comments: number;
  createdAt: string;
  authorId?: string; // 내 글이면 삭제 버튼 표시. 예시 글은 없음
};

type Data = {
  currentChildId: string | null;
  children: Child[];
  surveys: Survey[];
  recommendations: Recommendation[];
  playLogs: PlayLog[];
  center: CenterWait | null;
  posts: Post[];
};

const KEY = "noridari:v2"; // v2: 설문 형식 변경(영아·유아 9문항). 이전 임시 데이터는 무시
const EMPTY: Data = {
  currentChildId: null,
  children: [],
  surveys: [],
  recommendations: [],
  playLogs: [],
  center: null,
  posts: [],
};
const listeners = new Set<() => void>();
let cacheRaw: string | null | undefined;
let cache: Data = EMPTY;

function read(): Data {
  let raw: string | null = null;
  try {
    raw = localStorage.getItem(KEY);
  } catch {}
  if (raw !== cacheRaw) {
    cacheRaw = raw;
    try {
      cache = raw ? { ...EMPTY, ...JSON.parse(raw) } : EMPTY;
    } catch {
      cache = EMPTY;
    }
  }
  return cache;
}

function write(update: (d: Data) => Data) {
  const next = update(read());
  try {
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {}
  listeners.forEach((l) => l());
}

// 캐시 행(camelCase) → DB 행(snake_case)
const snake = (row: object) =>
  Object.fromEntries(Object.entries(row).map(([k, v]) => [k.replace(/[A-Z]/g, (c) => "_" + c.toLowerCase()), v]));
const camel = <T,>(row: Record<string, unknown>) =>
  Object.fromEntries(Object.entries(row).map(([k, v]) => [k.replace(/_([a-z])/g, (_, c) => c.toUpperCase()), v])) as T;

let userId: string | null = null; // AuthGate가 로그인 상태에 맞춰 설정
let admin = false; // 운영자 여부 (profiles.is_admin, 대시보드에서만 지정)

// ponytail: 실패하면 콘솔에만 남기고 재시도 안 함. 오프라인 사용이 필요해지면 대기열 추가
function push(table: string, row: object): PromiseLike<void> {
  return supabase
    .from(table)
    .insert(snake(row))
    .then(({ error }) => {
      if (error) console.error(`[noridari] ${table} 저장 실패`, error.message);
    });
}

/** 로그인 직후 서버의 내 데이터를 캐시로 가져옴 (RLS로 본인 것만 옴) */
export async function syncFromServer(uid: string) {
  userId = uid;
  const get = async <T,>(table: string, select = "*") => {
    const { data, error } = await supabase.from(table).select(select).order("created_at");
    if (error) throw error;
    return ((data ?? []) as unknown as Record<string, unknown>[]).map((r) => camel<T>(r));
  };
  const [children, surveys, recommendations, playLogs, rawPosts, profile] = await Promise.all([
    get<Child & { parentId?: string }>("children"),
    get<Survey>("surveys"),
    get<Recommendation>("recommendations"),
    get<PlayLog>("play_logs"),
    get<{ id: string; authorId: string; board: Post["board"]; title: string; body: string; playId: string | null; createdAt: string; nickname: string; comments: { count: number }[] }>(
      "posts",
      "id, author_id, board, nickname, title, body, play_id, created_at, comments(count)",
    ),
    supabase.from("profiles").select("center_name, wait_start, consult_date, is_admin").eq("id", uid).single(),
  ]);
  const kids = children.map(({ parentId: _, ...c }) => c); // eslint-disable-line @typescript-eslint/no-unused-vars
  const posts: Post[] = rawPosts
    .map((p) => ({ id: p.id, authorId: p.authorId, board: p.board, title: p.title, body: p.body, playId: p.playId, createdAt: p.createdAt, nickname: p.nickname, comments: p.comments[0]?.count ?? 0 }))
    .reverse(); // 최신 글 먼저
  const pr = profile.data;
  admin = !!pr?.is_admin;
  const center = pr?.center_name ? { name: pr.center_name, waitStart: pr.wait_start ?? "", consultDate: pr.consult_date ?? "" } : null;
  write(() => ({ currentChildId: kids.at(-1)?.id ?? null, children: kids, surveys, recommendations, playLogs, posts, center }));
}

/** 로그아웃 시 이 기기의 캐시 비우기 */
export function clearLocal() {
  userId = null;
  admin = false;
  write(() => EMPTY);
}

const now = () => new Date().toISOString();
const uid = () => crypto.randomUUID();

export function saveChild(c: Pick<Child, "nickname" | "birthDate">): Child {
  const row: Child = { ...c, id: uid(), consentAt: now(), createdAt: now() };
  write((d) => ({ ...d, currentChildId: row.id, children: [...d.children, row] }));
  if (userId) push("children", { ...row, parentId: userId });
  return row;
}

export function saveSurvey(s: Omit<Survey, "id" | "createdAt">): Survey {
  const row: Survey = { ...s, id: uid(), createdAt: now() };
  write((d) => ({ ...d, surveys: [...d.surveys, row] }));
  push("surveys", row);
  return row;
}

export function saveRecommendation(r: Omit<Recommendation, "id" | "createdAt">): Recommendation {
  const row: Recommendation = { ...r, id: uid(), createdAt: now() };
  write((d) => ({ ...d, recommendations: [...d.recommendations, row] }));
  push("recommendations", row);
  return row;
}

export function savePlayLog(l: Omit<PlayLog, "id" | "createdAt">): PlayLog {
  const row: PlayLog = { ...l, id: uid(), createdAt: now() };
  write((d) => ({ ...d, playLogs: [...d.playLogs, row] }));
  push("play_logs", row);
  return row;
}

export function saveCenter(c: CenterWait | null) {
  write((d) => ({ ...d, center: c }));
  if (userId)
    supabase
      .from("profiles")
      .update({ center_name: c?.name ?? null, wait_start: c?.waitStart || null, consult_date: c?.consultDate || null })
      .eq("id", userId)
      .then(({ error }) => error && console.error("[noridari] 센터 정보 저장 실패", error.message));
}

export function savePost(p: Omit<Post, "id" | "createdAt" | "comments">): Post {
  const row: Post = { ...p, id: uid(), comments: 0, createdAt: now(), authorId: userId ?? undefined };
  write((d) => ({ ...d, posts: [row, ...d.posts] }));
  if (userId) push("posts", { id: row.id, authorId: userId, nickname: row.nickname, board: row.board, playId: row.playId, title: row.title, body: row.body });
  return row;
}

/** 지금 로그인한 보호자 id (내 글 구분용) */
export const myUserId = () => userId;
/** 운영자면 모든 글·댓글을 지울 수 있음 (서버 RLS도 is_admin으로 허용) */
export const isAdmin = () => admin;
/** 이 글·댓글을 지울 수 있는지: 내가 쓴 것이거나 운영자 */
export const canDelete = (authorId?: string) => !!userId && (admin || authorId === userId);

/** 내 글 삭제 (운영자는 모든 글). 권한은 서버 RLS가 판단 */
export function deletePost(id: string) {
  write((d) => ({ ...d, posts: d.posts.filter((p) => p.id !== id) }));
  supabase
    .from("posts")
    .delete()
    .eq("id", id)
    .then(({ error }) => error && console.error("[noridari] 글 삭제 실패", error.message));
}

/** 댓글 수 갱신 (댓글을 쓰거나 지웠을 때, comments.ts에서 호출) */
export function bumpComments(postId: string, delta: number) {
  write((d) => ({ ...d, posts: d.posts.map((p) => (p.id === postId ? { ...p, comments: Math.max(0, p.comments + delta) } : p)) }));
}

/** 아이 정보·기록·사진 전부 삭제 (서버 포함). 커뮤니티 글은 남김 */
export async function clearAll() {
  write((d) => ({ ...EMPTY, posts: d.posts }));
  if (!userId) return;
  const uidNow = userId;
  const { data: files } = await supabase.storage.from("photos").list(uidNow, { limit: 1000 });
  if (files?.length) await supabase.storage.from("photos").remove(files.map((f) => `${uidNow}/${f.name}`));
  // children을 지우면 설문·추천·기록·리포트도 함께 지워짐 (on delete cascade)
  const { error } = await supabase.from("children").delete().eq("parent_id", uidNow);
  if (error) console.error("[noridari] 삭제 실패", error.message);
  saveCenter(null);
}

/** 시연용 가짜 데이터 (실제 아이 정보 금지 규칙에 따라 전부 가짜) */
export function seedDemo() {
  const at = (daysAgo: number, hour: number) => {
    const t = new Date();
    t.setDate(t.getDate() - daysAgo);
    t.setHours(hour, 0, 0, 0);
    return t.toISOString();
  };
  const day = (offset: number) => at(-offset, 12).slice(0, 10);
  const childId = uid();
  const birth = new Date();
  birth.setMonth(birth.getMonth() - 18);
  const log = (playId: string, done: PlayLog["done"], reaction: PlayLog["reaction"], memo: string | null, daysAgo: number, hour: number): PlayLog => ({
    id: uid(),
    childId,
    playId,
    done,
    reaction,
    memo,
    photoPaths: [],
    createdAt: at(daysAgo, hour),
  });
  const demoAnswers: SurveyAnswers = {
    group: "infant",
    dev: { lang: 1, cog: 2, soc: 2, gross: 3, fine: 1 },
    temp: { explore: "sometimes", cautious: "often", initiative: "rarely", recovery: "sometimes" },
  };
  write(() => ({
    ...EMPTY,
    currentChildId: childId,
    children: [{ id: childId, nickname: "하린", birthDate: birth.toISOString().slice(0, 10), consentAt: at(30, 9), createdAt: now() }],
    surveys: [
      {
        id: uid(),
        childId,
        answers: demoAnswers,
        result: scoreSurvey(demoAnswers),
        createdAt: at(29, 10),
      },
    ],
    recommendations: [{ id: uid(), childId, playId: "lang-sound-2", reason: "즐거워해서 한 단계 발전된 놀이를 골랐어요", createdAt: at(0, 8) }],
    playLogs: [
      log("lang-sound-1", "done", "enjoyed", "뚜껑 소리에 깔깔 웃으면서 '땡!'을 따라 했어요.", 1, 19),
      log("fine-clip-1", "partial", "hard", "집게 여는 걸 힘들어해서 두 개만 꽂았어요.", 2, 16),
      log("lang-sound-1", "done", "neutral", null, 3, 11),
      log("fine-clip-1", "done", "enjoyed", "왕관을 머리에 쓰고 거울을 한참 봤어요.", 5, 15),
      log("lang-sound-1", "partial", "neutral", "처음엔 숟가락만 만지작거렸어요.", 8, 10),
      log("fine-clip-1", "notDone", "hard", "졸려 해서 다음에 하기로 했어요.", 10, 20),
    ],
    center: { name: "새싹발달센터", waitStart: day(-60), consultDate: day(23) },
    posts: [],
  }));
  // 로그인 상태면 서버에도 저장 (새로고침해도 유지). 아이 createdAt을 지금으로 둬서 현재 아이로 선택됨
  if (!userId) return;
  const d = read();
  // 아이 행이 먼저 들어간 뒤에 나머지 저장 (외래 키)
  push("children", { ...d.children[0], parentId: userId }).then(() => {
    d.surveys.forEach((r) => push("surveys", r));
    d.recommendations.forEach((r) => push("recommendations", r));
    d.playLogs.forEach((r) => push("play_logs", r));
  });
  saveCenter(d.center);
}

/** 클라이언트에서만 값이 생김. 서버 렌더·하이드레이션 중엔 null. */
export function useLocalData(): Data | null {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      const onStorage = (e: StorageEvent) => e.key === KEY && cb();
      window.addEventListener("storage", onStorage);
      return () => {
        listeners.delete(cb);
        window.removeEventListener("storage", onStorage);
      };
    },
    read,
    () => null,
  );
}

const latest = <T extends { createdAt: string }>(rows: T[]) =>
  rows.reduce<T | null>((a, b) => (!a || b.createdAt > a.createdAt ? b : a), null);

export function currentChild(d: Data): Child | null {
  return d.children.find((c) => c.id === d.currentChildId) ?? null;
}

export function latestSurvey(d: Data, childId: string): Survey | null {
  return latest(d.surveys.filter((s) => s.childId === childId));
}

export function latestRecommendation(d: Data, childId: string): Recommendation | null {
  return latest(d.recommendations.filter((r) => r.childId === childId));
}

export function childLogs(d: Data, childId: string): PlayLog[] {
  return d.playLogs.filter((l) => l.childId === childId).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}
