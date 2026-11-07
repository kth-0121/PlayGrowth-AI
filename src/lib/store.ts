"use client";
// 저장 계층. 지금은 localStorage 임시 구현, Supabase 연동 시 이 파일만 교체.
// 필드명은 supabase/schema.sql 컬럼과 동일하게 맞춤.
import { useSyncExternalStore } from "react";
import type { CardStatus, CheckAnswers, Nuri, Reaction, Temperament } from "@/types";

export type ChildRow = {
  id: string;
  nickname: string;
  birth_date: string;
  gender: "남" | "여" | null; // schema.sql에 아직 없음 (논의 필요)
  concern_nuri: Nuri | null;
  liked_areas: string[];
  share_consent: boolean;
  created_at: string;
};
export type CheckRow = {
  id: string;
  child_id: string;
  answers: CheckAnswers;
  temperament: Temperament;
  created_at: string;
};
export type CardRow = {
  id: string;
  child_id: string;
  play_id: string;
  status: CardStatus;
  center_note: string | null;
  created_at: string;
};
export type PlayLogRow = {
  id: string;
  card_id: string;
  reaction: Reaction;
  memo: string | null;
  photo_path: string | null;
  created_at: string;
};

type DB = { children: ChildRow[]; checks: CheckRow[]; cards: CardRow[]; play_logs: PlayLogRow[] };

const KEY = "harunoli:v1";
const EMPTY: DB = { children: [], checks: [], cards: [], play_logs: [] };
const listeners = new Set<() => void>();

let cacheRaw: string | null | undefined;
let cacheDb: DB = EMPTY;

function read(): DB {
  let raw: string | null = null;
  try {
    raw = localStorage.getItem(KEY);
  } catch {}
  if (raw !== cacheRaw) {
    cacheRaw = raw;
    try {
      cacheDb = raw ? { ...EMPTY, ...JSON.parse(raw) } : EMPTY;
    } catch {
      cacheDb = EMPTY;
    }
  }
  return cacheDb;
}

function write(update: (db: DB) => DB) {
  const next = update(read());
  try {
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {}
  listeners.forEach((l) => l());
}

const now = () => new Date().toISOString();
const uid = () => crypto.randomUUID();

export function saveChild(c: Omit<ChildRow, "id" | "created_at">): ChildRow {
  const row = { ...c, id: uid(), created_at: now() };
  write((db) => ({ ...db, children: [...db.children, row] }));
  return row;
}

export function saveCheck(c: Omit<CheckRow, "id" | "created_at">): CheckRow {
  const row = { ...c, id: uid(), created_at: now() };
  write((db) => ({ ...db, checks: [...db.checks, row] }));
  return row;
}

export function createCard(child_id: string, play_id: string): CardRow {
  const row: CardRow = { id: uid(), child_id, play_id, status: "draft", center_note: null, created_at: now() };
  write((db) => ({ ...db, cards: [...db.cards, row] }));
  return row;
}

export function saveLog(l: Omit<PlayLogRow, "id" | "created_at">): PlayLogRow {
  const row = { ...l, id: uid(), created_at: now() };
  write((db) => ({ ...db, play_logs: [...db.play_logs, row] }));
  return row;
}

/** 클라이언트에서만 값이 생김. 서버 렌더·하이드레이션 중엔 null. */
export function useDB(): DB | null {
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

/** 카드 + 아이 + 최신 체크 + 기록 */
export function selectCard(db: DB, cardId: string) {
  const card = db.cards.find((c) => c.id === cardId);
  if (!card) return null;
  const child = db.children.find((c) => c.id === card.child_id) ?? null;
  const check =
    db.checks.filter((c) => c.child_id === card.child_id).sort((a, b) => b.created_at.localeCompare(a.created_at))[0] ??
    null;
  const logs = db.play_logs.filter((l) => l.card_id === cardId);
  return { card, child, check, logs };
}
