"use client";

import { useState } from "react";
import plays from "../../../data/plays.json";
import { AREA_LABEL, type Area, type Done, type Play, type PlayLog, type Reaction } from "@/types";

// 가짜 기록 (DB 연결 전). 실제 아이 정보 아님.
const FAKE_LOGS: PlayLog[] = [
  { id: "log-1", childId: "child-1", playId: "lang-sound-1", done: "done", reaction: "enjoyed", memo: "뚜껑 소리에 깔깔 웃었어요. '땡!'을 처음 따라 했어요.", photoPath: null, createdAt: "2026-11-01T10:00:00+09:00" },
  { id: "log-2", childId: "child-1", playId: "fine-clip-1", done: "partial", reaction: "hard", memo: "집게를 누르는 걸 어려워해서 3개만 했어요.", photoPath: null, createdAt: "2026-11-02T16:30:00+09:00" },
  { id: "log-3", childId: "child-1", playId: "lang-sound-2", done: "done", reaction: "neutral", memo: null, photoPath: null, createdAt: "2026-11-03T11:00:00+09:00" },
  { id: "log-4", childId: "child-1", playId: "fine-clip-1", done: "done", reaction: "neutral", memo: "어제보다 손에 힘이 들어가는 것 같아요.", photoPath: null, createdAt: "2026-11-03T19:00:00+09:00" },
  { id: "log-5", childId: "child-1", playId: "lang-sound-2", done: "notDone", reaction: "hard", memo: "졸려 해서 시작만 하고 멈췄어요.", photoPath: null, createdAt: "2026-11-04T20:10:00+09:00" },
  { id: "log-6", childId: "child-1", playId: "lang-sound-2", done: "done", reaction: "enjoyed", memo: "차례 바꾸기를 이해하고 기다려 줬어요!", photoPath: null, createdAt: "2026-11-05T10:20:00+09:00" },
  { id: "log-7", childId: "child-1", playId: "fine-clip-1", done: "done", reaction: "enjoyed", memo: "컵을 다 꾸미고 자랑했어요.", photoPath: null, createdAt: "2026-11-06T15:00:00+09:00" },
  { id: "log-8", childId: "child-1", playId: "lang-sound-1", done: "partial", reaction: "neutral", memo: null, photoPath: null, createdAt: "2026-11-07T09:40:00+09:00" },
];

const PLAY_BY_ID = new Map((plays as Play[]).map((p) => [p.id, p]));

const DONE_LABEL: Record<Done, string> = { done: "완료", partial: "일부 진행", notDone: "못함" };
const DONE_STYLE: Record<Done, string> = {
  done: "bg-emerald-50 text-emerald-700",
  partial: "bg-amber-50 text-amber-700",
  notDone: "bg-stone-100 text-stone-500",
};

const REACTION_LABEL: Record<Reaction, string> = { enjoyed: "즐거워함", neutral: "보통", hard: "어려워함" };
const REACTION_EMOJI: Record<Reaction, string> = { enjoyed: "😊", neutral: "🙂", hard: "😣" };

const AREA_ORDER: Area[] = ["lang", "cog", "soc", "gross", "fine"];

type View = "date" | "area";

function dateKey(iso: string) {
  return iso.slice(0, 10); // YYYY-MM-DD (한국 시간 기준으로 저장된 가짜 데이터)
}

function formatDate(key: string) {
  const [y, m, d] = key.split("-").map(Number);
  const day = "일월화수목금토"[new Date(y, m - 1, d).getDay()];
  return `${m}월 ${d}일 (${day})`;
}

function LogCard({ log, showDate }: { log: PlayLog; showDate: boolean }) {
  const play = PLAY_BY_ID.get(log.playId);
  return (
    <li className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-orange-100">
      {showDate && <p className="mb-1 text-xs text-stone-500">{formatDate(dateKey(log.createdAt))}</p>}
      <div className="flex items-start justify-between gap-2">
        <p className="font-semibold text-stone-800">{play?.title ?? "알 수 없는 놀이"}</p>
        <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium ${DONE_STYLE[log.done]}`}>
          {DONE_LABEL[log.done]}
        </span>
      </div>
      <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-stone-600">
        {play && (
          <span className="rounded-full bg-orange-50 px-2 py-0.5 text-xs text-orange-700">
            {AREA_LABEL[play.area]}
          </span>
        )}
        <span>
          {REACTION_EMOJI[log.reaction]} {REACTION_LABEL[log.reaction]}
        </span>
      </div>
      {log.memo && (
        <p className="mt-3 rounded-xl bg-orange-50/70 px-3 py-2 text-sm leading-relaxed text-stone-700">
          {log.memo}
        </p>
      )}
    </li>
  );
}

export default function LogsPage() {
  const [view, setView] = useState<View>("date");

  const sorted = [...FAKE_LOGS].sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  const groups: { key: string; title: string; logs: PlayLog[] }[] =
    view === "date"
      ? Array.from(new Set(sorted.map((l) => dateKey(l.createdAt)))).map((key) => ({
          key,
          title: formatDate(key),
          logs: sorted.filter((l) => dateKey(l.createdAt) === key),
        }))
      : AREA_ORDER.map((area) => ({
          key: area,
          title: AREA_LABEL[area],
          logs: sorted.filter((l) => PLAY_BY_ID.get(l.playId)?.area === area),
        })).filter((g) => g.logs.length > 0);

  return (
    <main className="min-h-full flex-1 bg-[#fdf7f0] text-stone-800">
      <div className="mx-auto w-full max-w-md px-4 pb-12 pt-8">
        <header>
          <h1 className="text-2xl font-bold">기록 모아보기</h1>
          <p className="mt-1 text-sm text-stone-500">지금까지 함께한 놀이 {FAKE_LOGS.length}번</p>
        </header>

        <div className="sticky top-0 z-10 -mx-4 mt-5 bg-[#fdf7f0]/95 px-4 py-2 backdrop-blur">
          <div role="tablist" className="grid grid-cols-2 rounded-full bg-orange-100/70 p-1">
            {(["date", "area"] as const).map((v) => (
              <button
                key={v}
                role="tab"
                aria-selected={view === v}
                onClick={() => setView(v)}
                className={`rounded-full py-2 text-sm font-semibold transition ${
                  view === v ? "bg-white text-orange-700 shadow-sm" : "text-stone-500"
                }`}
              >
                {v === "date" ? "날짜별" : "영역별"}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-4 flex flex-col gap-6">
          {groups.map((g) => (
            <section key={g.key}>
              <h2 className="mb-2 flex items-baseline gap-2 text-sm font-semibold text-stone-600">
                {g.title}
                <span className="text-xs font-normal text-stone-400">{g.logs.length}개</span>
              </h2>
              <ul className="flex flex-col gap-3">
                {g.logs.map((log) => (
                  <LogCard key={log.id} log={log} showDate={view === "area"} />
                ))}
              </ul>
            </section>
          ))}
        </div>
      </div>
    </main>
  );
}
