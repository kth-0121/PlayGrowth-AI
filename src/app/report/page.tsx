"use client";

import { useState } from "react";
import { Download, Link2 } from "lucide-react";
import { AREA_LABEL, type Area, type PlayLog } from "@/types";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { EmptyState } from "@/components/EmptyState";
import { Icon, Logo } from "@/components/Icon";
import { H1, PageHeader } from "@/components/PageHeader";
import { ProgressBar } from "@/components/ProgressBar";
import { SegmentedControl } from "@/components/SegmentedControl";
import { PageSkeleton } from "@/components/Skeleton";
import { ErrorState, NoResult } from "@/components/StatusViews";
import { TAB_SAFE } from "@/components/TabBar";
import { toast } from "@/components/Toast";
import { formatMonths, ageInMonths } from "@/lib/age";
import { callName } from "@/lib/copy";
import { childLogs, currentChild, useLocalData } from "@/lib/local-store";
import { getPlay } from "@/lib/recommend";
import { ruleReport, type ReportText } from "@/lib/report";
import { AREA_ORDER } from "@/lib/survey";

type Period = "14" | "28" | "all";
const fmt = (d: Date) => `${d.getMonth() + 1}월 ${d.getDate()}일`;

// 상담용 리포트: 기간 선택 → 요약 → 미리보기 → PDF 저장·링크 공유
export default function ReportPage() {
  const data = useLocalData();
  const [period, setPeriod] = useState<Period>("14");
  const [text, setText] = useState<ReportText | null>(null);
  const [loading, setLoading] = useState(false);
  const [failed, setFailed] = useState(false);
  const [preview, setPreview] = useState(false);

  if (!data) return <PageSkeleton />;
  const child = currentChild(data);
  const all = child ? childLogs(data, child.id) : [];
  if (!child || all.length === 0) {
    return (
      <main className={`flex flex-1 flex-col gap-6 px-5 ${TAB_SAFE}`}>
        <PageHeader back />
        <EmptyState text="기록이 쌓이면 상담 때 보여줄 리포트를 만들 수 있어요." action="놀이 일기 보기" href="/logs" />
      </main>
    );
  }

  // 서버 렌더 중엔 위에서 Skeleton으로 끝나므로 여기서만 현재 시각을 읽음
  const since = period === "all" ? 0 : new Date().getTime() - Number(period) * 86_400_000;
  const logs = all.filter((l) => new Date(l.createdAt).getTime() >= since);

  async function makeText(target: PlayLog[]) {
    setLoading(true);
    setFailed(false);
    try {
      const r = await fetch("/api/report", { method: "POST", body: JSON.stringify({ logs: target }) });
      if (!r.ok) throw new Error();
      setText((await r.json()) as ReportText);
    } catch {
      // 서버에 닿지 않아도 기기 안에서 규칙 문장으로 정리
      setText(ruleReport(target));
      setFailed(true);
    } finally {
      setLoading(false);
    }
  }

  function changePeriod(p: Period) {
    setPeriod(p);
    setText(null);
  }

  async function copyLink() {
    // TODO(DB 연결): reports.share_token으로 실제 공유 링크 생성
    const url = `${location.origin}/r/demo-${child!.id.slice(0, 8)}`;
    try {
      await navigator.clipboard.writeText(url);
      toast("공유 링크를 복사했어요");
    } catch {
      toast("링크를 복사하지 못했어요. 다시 시도해 주세요");
    }
  }

  const name = callName(child.nickname);
  const from = logs.length ? new Date(logs[logs.length - 1].createdAt) : null;
  const to = logs.length ? new Date(logs[0].createdAt) : null;
  const byArea = AREA_ORDER.map((a) => ({ area: a as Area, n: logs.filter((l) => getPlay(l.playId)?.area === a).length })).filter((x) => x.n > 0);
  const max = Math.max(1, ...byArea.map((x) => x.n));
  const titles = (r: "enjoyed" | "hard") => [...new Set(logs.filter((l) => l.reaction === r).map((l) => getPlay(l.playId)?.title ?? ""))];
  const memos = logs.filter((l) => l.memo).slice(0, 4);

  const body = (
    <>
      <Card className="mt-3">
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
        <p className="mt-1.5 text-[14px] font-medium leading-[1.5]">{titles("enjoyed").join(", ") || "이 기간에는 없어요"}</p>
        <h2 className="mt-4 text-[13px] font-semibold text-sub">어려워한 놀이</h2>
        <p className="mt-1.5 text-[14px] font-medium leading-[1.5]">{titles("hard").join(", ") || "이 기간에는 없어요"}</p>
      </Card>
      {memos.length > 0 && (
        <Card className="mt-3">
          <h2 className="text-[13px] font-semibold text-sub">보호자 관찰 메모</h2>
          <ul className="mt-2 flex flex-col gap-2">
            {memos.map((l) => (
              <li key={l.id} className="text-[13.5px] font-medium leading-[1.55] text-memo">
                <span className="text-[12px] text-sub">{fmt(new Date(l.createdAt))} · </span>“{l.memo}”
              </li>
            ))}
          </ul>
        </Card>
      )}
    </>
  );

  // 미리보기: 센터 선생님이 보게 될 모습 (인쇄하면 PDF)
  if (preview) {
    return (
      <main className={`flex flex-1 flex-col bg-paper px-5 ${TAB_SAFE}`}>
        <div className="no-print">
          <PageHeader back title="미리보기" />
        </div>
        <div className="mt-2 flex items-center justify-between">
          <Logo />
          <span className="text-[12px] font-semibold text-mute">상담용 놀이 기록</span>
        </div>
        <H1 className="mt-5">{`${name} · ${formatMonths(ageInMonths(child.birthDate))}`}</H1>
        <p className="mt-1 text-[13.5px] font-medium text-sub">
          {from && to ? `${fmt(from)} ~ ${fmt(to)} · 놀이 ${logs.length}번` : ""}
          {data.center ? ` · ${data.center.name} 상담 준비` : ""}
        </p>
        {text && (
          <Card className="mt-4">
            <p className="text-[14px] font-medium leading-[1.6]">{text.summary}</p>
          </Card>
        )}
        {body}
        <p className="mt-4 text-[12px] font-medium leading-[1.6] text-sub">
          보호자가 집에서 남긴 놀이 기록을 정리한 자료예요. 진단이 아니며, 해석과 평가는 전문가의 몫이에요.
        </p>
        <div className="no-print mt-6 flex gap-2">
          <Button onClick={() => window.print()} className="flex-1">
            <Icon icon={Download} size={18} />
            PDF로 저장
          </Button>
          <Button variant="secondary" onClick={copyLink} className="flex-1">
            <Icon icon={Link2} size={18} />
            링크 복사
          </Button>
        </div>
      </main>
    );
  }

  return (
    <main className={`flex flex-1 flex-col px-5 ${TAB_SAFE}`}>
      <PageHeader back title="상담용 리포트" />
      <H1 className="mt-2">{`${name} 놀이 기록을\n상담 날 보여 줄 수 있게 정리해요`}</H1>
      <p className="mt-1.5 text-[13.5px] font-medium text-sub">해석과 평가는 전문가의 몫이에요. 있었던 일만 모아요.</p>

      <div className="mt-5">
        <SegmentedControl
          label="기간"
          value={period}
          onChange={changePeriod}
          options={[
            { value: "14", label: "최근 2주" },
            { value: "28", label: "최근 4주" },
            { value: "all", label: "전체" },
          ]}
        />
      </div>

      {logs.length === 0 ? (
        <div className="mt-3">
          <NoResult text="이 기간에는 기록이 없어요. 기간을 넓혀 보세요." />
        </div>
      ) : (
        <>
          <p className="mt-4 text-[13px] font-medium text-sub">
            {from && to && `${fmt(from)} ~ ${fmt(to)} · `}
            <span className="text-[15px] font-extrabold text-ink">{logs.length}</span>번 기록
          </p>
          {body}

          <Card className="mt-3">
            <h2 className="text-[13px] font-semibold text-sub">상담 때 보여줄 정리 문장</h2>
            {failed && !text ? (
              <div className="mt-2">
                <ErrorState text="정리 문장을 만들지 못했어요." onRetry={() => makeText(logs)} />
              </div>
            ) : text ? (
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

          <Button full className="mt-5" onClick={() => setPreview(true)}>
            미리보기
          </Button>
        </>
      )}
    </main>
  );
}
