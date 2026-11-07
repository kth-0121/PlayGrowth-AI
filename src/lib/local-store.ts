"use client";
// 임시 저장소 (브라우저 localStorage). DB 연결 전까지 화면 흐름을 이어 주는 용도.
// DB 연결 시 이 파일의 함수만 Supabase 호출로 바꾸면 됩니다. 필드는 supabase/schema.sql 기준.
import { useSyncExternalStore } from "react";
import type { Answer, PlayLog, SurveyResult } from "@/types";

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
  answers: Record<string, Answer>; // { questionId: answer }
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

type Data = {
  currentChildId: string | null;
  children: Child[];
  surveys: Survey[];
  recommendations: Recommendation[];
  playLogs: PlayLog[];
};

const KEY = "noridari:v1";
const EMPTY: Data = { currentChildId: null, children: [], surveys: [], recommendations: [], playLogs: [] };
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
const uid = () => crypto.randomUUID();

export function saveChild(c: Pick<Child, "nickname" | "birthDate">): Child {
  const row: Child = { ...c, id: uid(), consentAt: now(), createdAt: now() };
  write((d) => ({ ...d, currentChildId: row.id, children: [...d.children, row] }));
  return row;
}

export function saveSurvey(s: Omit<Survey, "id" | "createdAt">): Survey {
  const row: Survey = { ...s, id: uid(), createdAt: now() };
  write((d) => ({ ...d, surveys: [...d.surveys, row] }));
  return row;
}

export function saveRecommendation(r: Omit<Recommendation, "id" | "createdAt">): Recommendation {
  const row: Recommendation = { ...r, id: uid(), createdAt: now() };
  write((d) => ({ ...d, recommendations: [...d.recommendations, row] }));
  return row;
}

export function savePlayLog(l: Omit<PlayLog, "id" | "createdAt">): PlayLog {
  const row: PlayLog = { ...l, id: uid(), createdAt: now() };
  write((d) => ({ ...d, playLogs: [...d.playLogs, row] }));
  return row;
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
