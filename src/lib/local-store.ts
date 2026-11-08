"use client";
// 저장소: 화면은 브라우저 캐시(localStorage)를 바로 읽고, 저장할 때마다 Supabase에도 함께 저장.
// 로그인하면 syncFromServer()로 서버의 내 데이터를 캐시에 채움. 필드는 supabase/schema.sql 기준.
// 이 기기에만 두는 것: 저장한 놀이, 놀이 진행 위치, 설문 임시 저장, 알림 설정 (schema.sql에 없음 → 통합 담당과 논의)
import { useSyncExternalStore } from "react";
import type { AgeGroup, Area, Board, ChildPrefs, Frequency, Level, PlayLog, SurveyAnswers, SurveyResult, TempItem } from "@/types";
import { supabase } from "./supabase";

export type Child = {
  id: string;
  nickname: string;
  birthDate: string; // YYYY-MM-DD
  consentAt: string; // 보호자 동의 시각
  likes?: Area[]; // ChildPrefs (예전 캐시에는 없을 수 있음 → childPrefs()로 읽기)
  concernAreas?: Area[];
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
  unverified?: boolean; // '검증되지 않은 정보' 표시
};

/** 설문 중간 저장 (다시 열면 이어서) */
export type SurveyDraft = {
  childId: string;
  group: AgeGroup;
  dev: Partial<Record<Area, Level>>;
  temp: Partial<Record<TempItem, Frequency>>;
  index: number;
  choice?: Record<string, number>; // 문항 키 → 고른 보기 순서 (0 자주 · 1 가끔 · 2 아직/거의)
  easy?: Record<string, boolean>; // 문항 키 → 더 쉬운 질문으로 보는 중
};

export type Settings = { notify: boolean; notifyTime: string };

export type Data = {
  currentChildId: string | null;
  children: Child[];
  surveys: Survey[];
  recommendations: Recommendation[];
  playLogs: PlayLog[];
  center: CenterWait | null;
  posts: Post[];
  savedPlays: string[];
  progress: Record<string, number>; // playId → 진행 모드 단계
  surveyDraft: SurveyDraft | null;
  settings: Settings;
};

const KEY = "noridari:v2"; // v2: 설문 형식 변경(영아·유아 9문항). 이전 임시 데이터는 무시
export const EMPTY: Data = {
  currentChildId: null,
  children: [],
  surveys: [],
  recommendations: [],
  playLogs: [],
  center: null,
  posts: [],
  savedPlays: [],
  progress: {},
  surveyDraft: null,
  settings: { notify: false, notifyTime: "19:30" },
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
      // 예전 캐시(사진 1장 photoPath) → photoPaths
      cache.playLogs = cache.playLogs.map((l) => ({ ...l, photoPaths: l.photoPaths ?? [] }));
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

const logError =
  (what: string) =>
  ({ error }: { error: { message: string } | null }) => {
    if (error) console.error(`[noridari] ${what} 실패`, error.message);
  };

// ponytail: 실패하면 콘솔에만 남기고 재시도 안 함. 오프라인 사용이 필요해지면 대기열 추가
function push(table: string, row: object): PromiseLike<void> {
  return supabase.from(table).insert(snake(row)).then(logError(`${table} 저장`));
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
  // 이 기기에만 두는 값(저장한 놀이·진행 위치 등)은 유지
  write((d) => ({
    ...d,
    currentChildId: kids.some((k) => k.id === d.currentChildId) ? d.currentChildId : (kids.at(-1)?.id ?? null),
    children: kids,
    surveys,
    recommendations,
    playLogs,
    posts,
    center,
  }));
}

/** 로그아웃 시 이 기기의 캐시 비우기 */
export function clearLocal() {
  userId = null;
  admin = false;
  write(() => EMPTY);
}

const now = () => new Date().toISOString();
export const uid = () => crypto.randomUUID();

// ── 아이 ──
export function saveChild(c: Pick<Child, "nickname" | "birthDate">): Child {
  const row: Child = { ...c, id: uid(), consentAt: now(), createdAt: now() };
  write((d) => ({ ...d, currentChildId: row.id, children: [...d.children, row] }));
  if (userId) push("children", { ...row, parentId: userId });
  return row;
}
export function switchChild(id: string) {
  write((d) => ({ ...d, currentChildId: id }));
}

/** 아이의 관심(좋아하는 놀이·더 함께하고 싶은 영역). 없으면 빈 배열 */
export const childPrefs = (c: Child | null | undefined): ChildPrefs => ({
  likes: c?.likes ?? [],
  concernAreas: c?.concernAreas ?? [],
});

/**
 * 관심 저장 (온보딩·MY에서). 아이 행과 따로 update해서,
 * 서버에 새 칸(likes·concern_areas)이 아직 없어도 아이 정보 저장은 실패하지 않음
 */
export function saveChildPrefs(childId: string, prefs: ChildPrefs) {
  write((d) => ({ ...d, children: d.children.map((c) => (c.id === childId ? { ...c, ...prefs } : c)) }));
  if (userId)
    supabase
      .from("children")
      .update({ likes: prefs.likes, concern_areas: prefs.concernAreas })
      .eq("id", childId)
      .then(logError("관심 저장"));
}

// ── 설문 ──
export function saveSurvey(s: Omit<Survey, "id" | "createdAt">): Survey {
  const row: Survey = { ...s, id: uid(), createdAt: now() };
  write((d) => ({ ...d, surveys: [...d.surveys, row], surveyDraft: null }));
  if (userId) push("surveys", row);
  return row;
}
export function saveSurveyDraft(draft: SurveyDraft | null) {
  write((d) => ({ ...d, surveyDraft: draft }));
}

// ── 추천·놀이 ──
export function saveRecommendation(r: Omit<Recommendation, "id" | "createdAt">): Recommendation {
  const row: Recommendation = { ...r, id: uid(), createdAt: now() };
  write((d) => ({ ...d, recommendations: [...d.recommendations, row] }));
  if (userId) push("recommendations", row);
  return row;
}
export function toggleSaved(playId: string) {
  write((d) => ({
    ...d,
    savedPlays: d.savedPlays.includes(playId) ? d.savedPlays.filter((p) => p !== playId) : [playId, ...d.savedPlays],
  }));
}
export function saveProgress(playId: string, step: number | null) {
  write((d) => {
    const progress = { ...d.progress };
    if (step === null) delete progress[playId];
    else progress[playId] = step;
    return { ...d, progress };
  });
}

// ── 기록 ──
export function savePlayLog(l: Omit<PlayLog, "id" | "createdAt">): PlayLog {
  const row: PlayLog = { ...l, id: uid(), createdAt: now() };
  write((d) => ({ ...d, playLogs: [...d.playLogs, row] }));
  if (userId) push("play_logs", row);
  return row;
}
export function updatePlayLog(id: string, patch: Partial<Pick<PlayLog, "done" | "reaction" | "memo" | "photoPaths">>) {
  write((d) => ({ ...d, playLogs: d.playLogs.map((l) => (l.id === id ? { ...l, ...patch } : l)) }));
  if (userId) supabase.from("play_logs").update(snake(patch)).eq("id", id).then(logError("기록 수정"));
}
export function deletePlayLog(id: string) {
  write((d) => ({ ...d, playLogs: d.playLogs.filter((l) => l.id !== id) }));
  if (userId) supabase.from("play_logs").delete().eq("id", id).then(logError("기록 삭제"));
}
async function removeMyPhotos() {
  if (!userId) return;
  const me = userId;
  const { data: files } = await supabase.storage.from("photos").list(me, { limit: 1000 });
  if (files?.length) await supabase.storage.from("photos").remove(files.map((f) => `${me}/${f.name}`));
}
export async function deleteAllPhotos() {
  const ids = read().playLogs.map((l) => l.id);
  write((d) => ({ ...d, playLogs: d.playLogs.map((l) => ({ ...l, photoPaths: [] })) }));
  if (!userId) return;
  await removeMyPhotos();
  if (ids.length) await supabase.from("play_logs").update({ photo_paths: [] }).in("id", ids).then(logError("사진 삭제"));
}
export async function deleteAllLogs() {
  const childIds = read().children.map((c) => c.id);
  write((d) => ({ ...d, playLogs: [], recommendations: [], progress: {} }));
  if (!userId || !childIds.length) return;
  await removeMyPhotos();
  await supabase.from("play_logs").delete().in("child_id", childIds).then(logError("기록 삭제"));
  await supabase.from("recommendations").delete().in("child_id", childIds).then(logError("추천 삭제"));
}

// ── 센터·설정 ──
export function saveCenter(c: CenterWait | null) {
  write((d) => ({ ...d, center: c }));
  if (userId)
    supabase
      .from("profiles")
      .update({ center_name: c?.name ?? null, wait_start: c?.waitStart || null, consult_date: c?.consultDate || null })
      .eq("id", userId)
      .then(logError("센터 정보 저장"));
}
export function saveSettings(s: Settings) {
  write((d) => ({ ...d, settings: s }));
}

// ── 커뮤니티 (댓글은 lib/comments.ts에서 서버로 바로) ──
export function savePost(p: Omit<Post, "id" | "createdAt" | "comments" | "authorId">): Post {
  const row: Post = { ...p, id: uid(), comments: 0, createdAt: now(), authorId: userId ?? undefined };
  write((d) => ({ ...d, posts: [row, ...d.posts] }));
  if (userId) push("posts", { id: row.id, authorId: userId, nickname: row.nickname, board: row.board, playId: row.playId, title: row.title, body: row.body });
  return row;
}

/** 지금 로그인한 보호자 id (내 글 구분용) */
export const myUserId = () => userId;
/** 이 글·댓글을 지울 수 있는지: 내가 쓴 것이거나 운영자 */
export const canDelete = (authorId?: string) => !!userId && (admin || authorId === userId);

/** 내 글 삭제 (운영자는 모든 글). 권한은 서버 RLS가 판단 */
export function deletePost(id: string) {
  write((d) => ({ ...d, posts: d.posts.filter((p) => p.id !== id) }));
  supabase.from("posts").delete().eq("id", id).then(logError("글 삭제"));
}

/** 댓글 수 갱신 (댓글을 쓰거나 지웠을 때, comments.ts에서 호출) */
export function bumpComments(postId: string, delta: number) {
  write((d) => ({ ...d, posts: d.posts.map((p) => (p.id === postId ? { ...p, comments: Math.max(0, p.comments + delta) } : p)) }));
}

/** 동의 철회 = 아이 정보·기록·사진 전부 삭제 (서버 포함). 커뮤니티 글은 남김 */
export async function clearAll() {
  write((d) => ({ ...EMPTY, posts: d.posts }));
  if (!userId) return;
  await removeMyPhotos();
  // children을 지우면 설문·추천·기록·리포트도 함께 지워짐 (on delete cascade)
  const { error } = await supabase.from("children").delete().eq("parent_id", userId);
  if (error) console.error("[noridari] 삭제 실패", error.message);
  saveCenter(null);
}

/** 클라이언트에서만 값이 생김. 서버 렌더·하이드레이션 중엔 null(→ Skeleton). */
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
