"use client";
// 임시 저장소 (브라우저 localStorage). DB 연결 전까지 화면 흐름을 이어 주는 용도.
// DB 연결 시 이 파일의 함수만 Supabase 호출로 바꾸면 됩니다. 필드는 supabase/schema.sql 기준.
import { useSyncExternalStore } from "react";
import type { Board, PlayLog, SurveyAnswers, SurveyResult } from "@/types";
import { scoreSurvey } from "./survey";

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

// 센터 대기 정보 (schema.sql에 아직 없음 → 통합 담당과 논의 필요)
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

export function saveCenter(c: CenterWait | null) {
  write((d) => ({ ...d, center: c }));
}

export function savePost(p: Omit<Post, "id" | "createdAt" | "comments">): Post {
  const row: Post = { ...p, id: uid(), comments: 0, createdAt: now() };
  write((d) => ({ ...d, posts: [row, ...d.posts] }));
  return row;
}

export function clearAll() {
  write(() => EMPTY);
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
    photoPath: null,
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
    children: [{ id: childId, nickname: "하린", birthDate: birth.toISOString().slice(0, 10), consentAt: at(30, 9), createdAt: at(30, 9) }],
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
