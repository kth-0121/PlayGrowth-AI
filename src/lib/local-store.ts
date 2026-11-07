"use client";
// 임시 저장소 (브라우저 localStorage). DB 연결 전까지 화면 흐름을 이어 주는 용도.
// DB 연결 시 이 파일의 함수만 Supabase 호출로 바꾸면 됩니다. 필드는 supabase/schema.sql 기준.
// schema.sql에 아직 없는 것(센터 대기, 저장한 놀이, 준비물 체크, 진행 위치, 설문 임시 저장, 알림)은 통합 담당과 논의 필요.
import { useSyncExternalStore } from "react";
import type { AgeGroup, Area, Board, Frequency, Level, PlayLog, SurveyAnswers, SurveyResult, TempItem } from "@/types";

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
  unverified: boolean; // '검증되지 않은 정보' 표시
  createdAt: string;
};

export type Comment = { id: string; postId: string; nickname: string; body: string; createdAt: string };

/** 설문 중간 저장 (다시 열면 이어서) */
export type SurveyDraft = {
  childId: string;
  group: AgeGroup;
  dev: Partial<Record<Area, Level>>;
  temp: Partial<Record<TempItem, Frequency>>;
  index: number;
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
  comments: Comment[];
  savedPlays: string[];
  checklist: Record<string, number[]>; // playId → 체크한 준비물 index
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
  comments: [],
  savedPlays: [],
  checklist: {},
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

const now = () => new Date().toISOString();
export const uid = () => crypto.randomUUID();

// ── 아이 ──
export function saveChild(c: Pick<Child, "nickname" | "birthDate">): Child {
  const row: Child = { ...c, id: uid(), consentAt: now(), createdAt: now() };
  write((d) => ({ ...d, currentChildId: row.id, children: [...d.children, row] }));
  return row;
}
export function switchChild(id: string) {
  write((d) => ({ ...d, currentChildId: id }));
}

// ── 설문 ──
export function saveSurvey(s: Omit<Survey, "id" | "createdAt">): Survey {
  const row: Survey = { ...s, id: uid(), createdAt: now() };
  write((d) => ({ ...d, surveys: [...d.surveys, row], surveyDraft: null }));
  return row;
}
export function saveSurveyDraft(draft: SurveyDraft | null) {
  write((d) => ({ ...d, surveyDraft: draft }));
}

// ── 추천·놀이 ──
export function saveRecommendation(r: Omit<Recommendation, "id" | "createdAt">): Recommendation {
  const row: Recommendation = { ...r, id: uid(), createdAt: now() };
  write((d) => ({ ...d, recommendations: [...d.recommendations, row] }));
  return row;
}
export function toggleSaved(playId: string) {
  write((d) => ({
    ...d,
    savedPlays: d.savedPlays.includes(playId) ? d.savedPlays.filter((p) => p !== playId) : [playId, ...d.savedPlays],
  }));
}
export function toggleChecklist(playId: string, index: number) {
  write((d) => {
    const cur = d.checklist[playId] ?? [];
    const next = cur.includes(index) ? cur.filter((i) => i !== index) : [...cur, index];
    return { ...d, checklist: { ...d.checklist, [playId]: next } };
  });
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
  return row;
}
export function updatePlayLog(id: string, patch: Partial<Pick<PlayLog, "done" | "reaction" | "memo" | "photoPath">>) {
  write((d) => ({ ...d, playLogs: d.playLogs.map((l) => (l.id === id ? { ...l, ...patch } : l)) }));
}
export function deletePlayLog(id: string) {
  write((d) => ({ ...d, playLogs: d.playLogs.filter((l) => l.id !== id) }));
}
export function deleteAllPhotos() {
  write((d) => ({ ...d, playLogs: d.playLogs.map((l) => ({ ...l, photoPath: null })) }));
}
export function deleteAllLogs() {
  write((d) => ({ ...d, playLogs: [], recommendations: [] }));
}

// ── 센터·설정 ──
export function saveCenter(c: CenterWait | null) {
  write((d) => ({ ...d, center: c }));
}
export function saveSettings(s: Settings) {
  write((d) => ({ ...d, settings: s }));
}

// ── 커뮤니티 ──
export function savePost(p: Omit<Post, "id" | "createdAt" | "comments">): Post {
  const row: Post = { ...p, id: uid(), comments: 0, createdAt: now() };
  write((d) => ({ ...d, posts: [row, ...d.posts] }));
  return row;
}
export function saveComment(c: Omit<Comment, "id" | "createdAt">): Comment {
  const row: Comment = { ...c, id: uid(), createdAt: now() };
  write((d) => ({ ...d, comments: [...d.comments, row] }));
  return row;
}

/** 동의 철회 = 이 기기의 아이 정보와 기록 전부 삭제 */
export function clearAll() {
  write(() => EMPTY);
}

/** 시연 데이터 등 전체 교체 */
export function replaceAll(data: Data) {
  write(() => data);
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
