"use client";

import Link from "next/link";
import { useState } from "react";
import { ChevronRight, FileText } from "lucide-react";
import type { PlayLog } from "@/types";
import { Fab, TextButton } from "@/components/Button";
import { AreaChip, ReactionTag } from "@/components/Chip";
import { EmptyState } from "@/components/EmptyState";
import { Icon } from "@/components/Icon";
import { Illustration } from "@/components/Illustration";
import { PageSkeleton } from "@/components/Skeleton";
import { TAB_FAB_SAFE, TAB_SAFE } from "@/components/TabBar";
import { callName } from "@/lib/copy";
import { logTimeLabel, thisWeek, WEEKDAY, ymd } from "@/lib/dates";
import { childLogs, currentChild, latestRecommendation, useLocalData } from "@/lib/local-store";
import { getPlay } from "@/lib/recommend";

export default function LogsPage() {
  const data = useLocalData();
  const [selected, setSelected] = useState<string | null>(null);

  if (!data) return <PageSkeleton />;
  const child = currentChild(data);
  if (!child) {
    return (
      <main className={`flex flex-1 flex-col gap-6 px-5 ${TAB_SAFE}`}>
        <div className="h-8" aria-hidden />
        <EmptyState text="아이 정보를 넣고 놀이를 하면 여기에 일기처럼 쌓여요." action="아이 정보 입력" href="/onboarding" />
      </main>
    );
  }

  const today = new Date();
  const logs = childLogs(data, child.id);
  const rec = latestRecommendation(data, child.id);
  const logHref = rec ? `/play/${rec.playId}/log` : "/play";
  // 마지막 기록 뒤에 만들어진 추천 = 기록을 반영한 다음 놀이
  const nextPlay = rec && logs[0] && rec.createdAt >= logs[0].createdAt ? getPlay(rec.playId) : undefined;
  const monthCount = logs.filter((l) => {
    const d = new Date(l.createdAt);
    return d.getFullYear() === today.getFullYear() && d.getMonth() === today.getMonth();
  }).length;
  const shown = selected ? logs.filter((l) => ymd(new Date(l.createdAt)) === selected) : logs;

  return (
    <main className={`flex flex-1 flex-col px-5 ${TAB_FAB_SAFE}`}>
      <div className="h-8" aria-hidden />

      <div className="mt-2 flex items-baseline justify-between gap-3">
        <h1 className="text-[22px] font-extrabold tracking-[-0.035em]">{callName(child.nickname)} 놀이 일기</h1>
        <span className="shrink-0 text-[13px] font-medium text-sub">
          {today.getMonth() + 1}월 · {monthCount}개
        </span>
      </div>

      {nextPlay && rec && (
        <Link href={`/play/${nextPlay.id}`} className="pressable mt-4 flex items-center gap-3 rounded-[16px] bg-card px-4 py-3.5">
          <div className="min-w-0 flex-1">
            <p className="text-[12px] font-semibold text-sage-dark">기록을 반영한 다음 놀이</p>
            <p className="mt-0.5 truncate text-[15px] font-bold">{nextPlay.title}</p>
            {rec.reason && <p className="mt-0.5 text-[12.5px] font-medium text-sub">{rec.reason}</p>}
          </div>
          <Icon icon={ChevronRight} size={18} className="shrink-0 text-mute" />
        </Link>
      )}

      <WeekBar logs={logs} today={today} selected={selected} onSelect={setSelected} />

      <div className="mt-2 flex items-center justify-between">
        <Link
          href="/report"
          className="pressable inline-flex min-h-11 items-center gap-1.5 text-[14px] font-semibold text-sage-dark"
        >
          <Icon icon={FileText} size={18} />
          상담용 리포트 만들기
        </Link>
        {selected && <TextButton onClick={() => setSelected(null)}>전체 보기</TextButton>}
      </div>

      {logs.length === 0 ? (
        <div className="mt-4">
          <EmptyState text="아직 기록이 없어요. 오늘 놀이를 해 보고 첫 기록을 남겨 보세요." action="오늘 놀이 고르기" href="/" />
        </div>
      ) : shown.length === 0 ? (
        <p className="mt-6 text-[13.5px] font-medium text-sub">이날은 기록이 없어요.</p>
      ) : (
        <ol className="relative mt-4 pl-[22px]">
          <span className="absolute bottom-2 left-[5px] top-2 w-0.5 bg-line" aria-hidden />
          {shown.map((l, i) => (
            <TimelineItem key={l.id} log={l} recent={i === 0} />
          ))}
        </ol>
      )}

      <Fab href={logHref} label="오늘 기록하기" />
    </main>
  );
}

function WeekBar({
  logs,
  today,
  selected,
  onSelect,
}: {
  logs: PlayLog[];
  today: Date;
  selected: string | null;
  onSelect: (d: string | null) => void;
}) {
  const days = new Set(logs.map((l) => ymd(new Date(l.createdAt))));
  return (
    <div className="mt-4 grid grid-cols-7 rounded-[16px] bg-card px-2.5 py-3">
      {thisWeek(today).map((d) => {
        const key = ymd(d);
        const on = selected === key;
        return (
          <button
            key={key}
            type="button"
            onClick={() => onSelect(on ? null : key)}
            aria-pressed={on}
            aria-label={`${d.getMonth() + 1}월 ${d.getDate()}일${days.has(key) ? ", 기록 있음" : ""}`}
            className="pressable flex min-h-11 flex-col items-center gap-1"
          >
            <span className="text-[11px] font-medium text-mute">{WEEKDAY[d.getDay()]}</span>
            <span
              className={`flex size-8 items-center justify-center rounded-[10px] text-[15px] font-semibold ${
                on ? "bg-ink text-white" : ""
              }`}
            >
              {d.getDate()}
            </span>
            <span className={`size-[5px] rounded-full ${days.has(key) ? "bg-sage" : ""}`} />
          </button>
        );
      })}
    </div>
  );
}

function TimelineItem({ log, recent }: { log: PlayLog; recent: boolean }) {
  const play = getPlay(log.playId);
  return (
    <li className="relative pb-5 last:pb-0">
      <span
        className={`absolute -left-[22px] top-[3px] size-2.5 rounded-full border-2 border-bg ${recent ? "bg-sage" : "bg-mute"}`}
        aria-hidden
      />
      <p className="text-[12px] font-semibold text-mute">{logTimeLabel(log.createdAt)}</p>
      <Link href={`/logs/${log.id}`} className="pressable mt-2 block rounded-[16px] bg-card p-3.5">
        <div className="flex items-start justify-between gap-2">
          <h2 className="text-[15px] font-bold leading-[1.35]">{play?.title ?? "삭제된 놀이"}</h2>
          {play && <AreaChip area={play.area} />}
        </div>
        {log.memo && <p className="mt-2 text-[13.5px] font-medium leading-[1.55] text-memo">“{log.memo}”</p>}
        {log.photoPath && (
          <div className="mt-2.5 flex gap-1.5">
            {/* TODO(DB 연결): Storage 이미지 URL로 교체 */}
            <span className="block size-16 overflow-hidden rounded-[10px]" role="img" aria-label="놀이 사진">
              <Illustration height={64} seed={log.id.length} />
            </span>
          </div>
        )}
        <div className="mt-3 flex gap-1.5">
          <ReactionTag reaction={log.reaction} />
          <ReactionTag done={log.done} />
        </div>
      </Link>
    </li>
  );
}
