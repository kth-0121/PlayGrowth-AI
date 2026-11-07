"use client";

import { useState } from "react";
import { AREA_LABEL, type Area, type PlayLog } from "@/types";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { ruleReport, type ReportText } from "@/lib/report";
import { EmptyState } from "@/components/EmptyState";
import { H1, PageHeader } from "@/components/PageHeader";
import { ProgressBar } from "@/components/ProgressBar";
import { TAB_SAFE } from "@/components/TabBar";
import { callName } from "@/lib/copy";
import { childLogs, currentChild, useLocalData } from "@/lib/local-store";
import { getPlay } from "@/lib/recommend";
import { AREA_ORDER } from "@/lib/survey";

// 상담용 요약 리포트. 정리 문장은 /api/report (로컬 AI, 꺼져 있으면 규칙 문장)
export default function ReportPage() {
  const data = useLocalData();
  const [shared, setShared] = useState(false);
  const [text, setText] = useState<ReportText | null>(null);
  const [loading, setLoading] = useState(false);

  async function makeText(logs: PlayLog[]) {
    setLoading(true);
    try {
      const r = await fetch("/api/report", { method: "POST", body: JSON.stringify({ logs }) });
      setText(r.ok ? ((await r.json()) as ReportText) : ruleReport(logs));
    } catch {
      setText(ruleReport(logs));
    } finally {
      setLoading(false);
    }
  }

  if (!data) return <main className={`flex-1 ${TAB_SAFE}`} />;
  const child = currentChild(data);
  const logs = child ? childLogs(data, child.id) : [];
  if (!child || logs.length === 0) {
    return (
      <main className={`flex flex-1 flex-col gap-6 px-5 ${TAB_SAFE}`}>
        <PageHeader back />
        <EmptyState text="기록이 쌓이면 상담 때 보여줄 리포트를 만들 수 있어요." action="기록 보러 가기" href="/logs" />
      </main>
    );
  }

  const byArea = AREA_ORDER.map((a) => ({
    area: a as Area,
    n: logs.filter((l) => getPlay(l.playId)?.area === a).length,
  })).filter((x) => x.n > 0);
  const max = Math.max(...byArea.map((x) => x.n));
  const titles = (r: "enjoyed" | "hard") => [
    ...new Set(logs.filter((l) => l.reaction === r).map((l) => getPlay(l.playId)?.title ?? "")),
  ];
  const memos = logs.filter((l) => l.memo).slice(0, 3);
  const from = new Date(logs[logs.length - 1].createdAt);
  const to = new Date(logs[0].createdAt);
  const fmt = (d: Date) => `${d.getMonth() + 1}월 ${d.getDate()}일`;

  return (
    <main className={`flex flex-1 flex-col px-5 ${TAB_SAFE}`}>
      <PageHeader back title="상담용 리포트" />
      <H1 className="mt-2">{`${callName(child.nickname)} 놀이 기록\n${fmt(from)} ~ ${fmt(to)}`}</H1>
      <p className="mt-1.5 text-[13.5px] font-medium text-sub">
        놀이 {logs.length}번의 기록을 모았어요. 해석과 평가는 전문가의 몫이에요.
      </p>

      <Card className="mt-6">
        <h2 className="text-[13px] font-semibold text-sub">영역별 놀이 횟수</h2>
        <ul className="mt-3 flex flex-col gap-3">
          {byArea.map((x) => (
            <li key={x.area} className="flex items-center gap-3">
              <span className="w-12 shrink-0 text-[14px] font-medium">{AREA_LABEL[x.area]}</span>
              <div className="flex-1">
                <ProgressBar value={x.n / max} label={AREA_LABEL[x.area]} />
              </div>
              <span className="w-8 shrink-0 text-right text-[13px] font-semibold">{x.n}번</span>
            </li>
          ))}
        </ul>
      </Card>

      <Card className="mt-3">
        <h2 className="text-[13px] font-semibold text-sub">즐거워한 놀이</h2>
        <p className="mt-1.5 text-[14px] font-medium leading-[1.5]">{titles("enjoyed").join(", ") || "아직 없어요"}</p>
        <h2 className="mt-4 text-[13px] font-semibold text-sub">어려워한 놀이</h2>
        <p className="mt-1.5 text-[14px] font-medium leading-[1.5]">{titles("hard").join(", ") || "아직 없어요"}</p>
      </Card>

      <Card className="mt-3">
        <h2 className="text-[13px] font-semibold text-sub">상담 때 보여줄 정리</h2>
        {text ? (
          <div className="mt-2 flex flex-col gap-2 text-[14px] font-medium leading-[1.55]">
            <p>{text.interests}</p>
            <p>{text.difficulties}</p>
            <p>{text.summary}</p>
            <p className="text-[12px] text-sub">
              {text.by === "ai" ? "이 기기의 로컬 AI가 기록만 보고 정리했어요." : "기록 횟수로 자동 정리했어요."} 진단이 아니에요.
            </p>
          </div>
        ) : (
          <Button variant="secondary" full className="mt-3" disabled={loading} onClick={() => makeText(logs)}>
            {loading ? "정리하는 중…" : "기록으로 정리 문장 만들기"}
          </Button>
        )}
      </Card>

      {memos.length > 0 && (
        <Card className="mt-3">
          <h2 className="text-[13px] font-semibold text-sub">보호자 관찰 메모</h2>
          <ul className="mt-2 flex flex-col gap-2">
            {memos.map((l) => (
              <li key={l.id} className="text-[13.5px] font-medium leading-[1.55] text-memo">
                “{l.memo}”
              </li>
            ))}
          </ul>
        </Card>
      )}

      <label className="mt-3 flex min-h-[56px] items-center justify-between gap-3 rounded-[18px] bg-card px-[18px] py-3">
        <span>
          <span className="block text-[15px] font-semibold">센터에 공유하기</span>
          <span className="block text-[12px] font-medium text-sub">켜면 공유 링크가 생기고, 끄면 바로 사라져요</span>
        </span>
        <input
          type="checkbox"
          role="switch"
          checked={shared}
          onChange={(e) => setShared(e.target.checked)}
          className="peer sr-only"
        />
        <span
          aria-hidden
          className={`relative h-7 w-12 shrink-0 rounded-full transition-colors ${shared ? "bg-sage" : "bg-neutral-chip"}`}
        >
          <span
            className={`absolute top-1 size-5 rounded-full bg-card transition-[left] ${shared ? "left-6" : "left-1"}`}
          />
        </span>
      </label>
      {shared && (
        <p className="mt-2 text-[12px] font-medium text-sub">TODO: 공유 링크 생성은 DB 연결 후 동작해요.</p>
      )}
    </main>
  );
}
