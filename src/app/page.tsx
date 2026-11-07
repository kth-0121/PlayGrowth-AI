"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Check } from "lucide-react";
import { AREA_LABEL, type Area, type Done, type Play } from "@/types";
import { Button, TextButton } from "@/components/Button";
import { Card } from "@/components/Card";
import { AreaChip, TimeChip } from "@/components/Chip";
import { EmptyState } from "@/components/EmptyState";
import { Icon } from "@/components/Icon";
import { Illustration } from "@/components/Illustration";
import { H1, PageHeader } from "@/components/PageHeader";
import { ProgressBar } from "@/components/ProgressBar";
import { TAB_SAFE } from "@/components/TabBar";
import { ageInMonths } from "@/lib/age";
import { AREA_PLAY_NAME, callName, josa } from "@/lib/copy";
import { daysBetween, longDate, thisWeek, WEEKDAY, ymd } from "@/lib/dates";
import {
  childLogs,
  currentChild,
  latestRecommendation,
  latestSurvey,
  saveRecommendation,
  seedDemo,
  useLocalData,
} from "@/lib/local-store";
import { areasForMonths, firstRecommendation, getPlay, nextPlay, pickInArea } from "@/lib/recommend";
import { AREA_ORDER } from "@/lib/survey";

export default function Home() {
  const router = useRouter();
  const data = useLocalData();
  const [picking, setPicking] = useState(false); // '다른 놀이' 영역 고르기 시트

  if (!data) return <main className={`flex-1 px-5 ${TAB_SAFE}`} />;

  const today = new Date();
  const child = currentChild(data);

  if (!child) {
    return (
      <main className={`flex flex-1 flex-col gap-6 px-5 ${TAB_SAFE}`}>
        <PageHeader logo />
        <div className="flex flex-col gap-2">
          <p className="text-[13px] font-medium text-sub">{longDate(today)}</p>
          <H1>{"센터를 기다리는 동안\n집에서 하루 15분 놀이해요"}</H1>
        </div>
        <EmptyState
          text="아이 애칭과 생년월일을 넣으면 오늘 할 놀이가 정해져요."
          action="아이 정보 입력"
          href="/onboarding"
        />
        <TextButton onClick={seedDemo} className="self-start">
          시연용 예시 데이터로 둘러보기
        </TextButton>
      </main>
    );
  }

  const months = ageInMonths(child.birthDate);
  const survey = latestSurvey(data, child.id);
  const rec = latestRecommendation(data, child.id);
  const play: Play | null =
    (rec && getPlay(rec.playId)) || (survey ? (firstRecommendation(survey.result, months)?.play ?? null) : null);
  const logs = childLogs(data, child.id);
  const doneToday = logs.filter((l) => ymd(new Date(l.createdAt)) === ymd(today)).length;

  // 영역 고르기 시트에서 고른 결과. area가 null이면 '추천대로'(지금처럼 다음 놀이)
  function otherPlay(area: Area | null) {
    setPicking(false);
    if (!child || !play) return;
    if (area === null) {
      const p = nextPlay(play.id, months);
      if (p) saveRecommendation({ childId: child.id, playId: p.id, reason: "다른 놀이로 바꿨어요" });
      return;
    }
    const pick = pickInArea(area, survey?.result ?? null, months, play.id, logs);
    if (pick) saveRecommendation({ childId: child.id, playId: pick.play.id, reason: pick.reason });
  }

  function startPlay() {
    if (!child || !play) return;
    if (!rec || rec.playId !== play.id) saveRecommendation({ childId: child.id, playId: play.id, reason: null });
    router.push(`/play/${play.id}`);
  }

  return (
    <main className={`flex flex-1 flex-col px-5 ${TAB_SAFE}`}>
      <PageHeader logo />

      <div className="mt-2 flex flex-col gap-1.5">
        <p className="text-[13px] font-medium text-sub">{longDate(today)}</p>
        <H1>
          {play
            ? `${josa(child.nickname, "이랑", "랑")} 오늘은\n${AREA_PLAY_NAME[play.area]} 어때요?`
            : `${callName(child.nickname)}에게 맞는\n놀이를 골라 볼까요?`}
        </H1>
      </div>

      <div className="mt-6 flex flex-col gap-3">
        <WaitCard data={data} today={today} logCount={logs.length} />

        {play ? (
          <TodayPlay play={play} doneToday={doneToday} onStart={startPlay} onOther={() => setPicking(true)} />
        ) : (
          <EmptyState
            text={`${callName(child.nickname)}에게 맞는 놀이를 고르려면 평소 모습에 대한 질문에 답해 주세요.`}
            action="발달 상태 확인"
            href="/survey"
          />
        )}

        <WeekCard logs={logs} today={today} />
      </div>

      {picking && play && (
        <AreaSheet
          current={play.area}
          focus={survey?.result.focus ?? []}
          available={areasForMonths(months)}
          onPick={otherPlay}
          onClose={() => setPicking(false)}
        />
      )}
    </main>
  );
}

/** '다른 놀이' → 어떤 영역으로 바꿀지 고르는 바텀시트 */
function AreaSheet({
  current,
  focus,
  available,
  onPick,
  onClose,
}: {
  current: Area;
  focus: Area[]; // 설문에서 더 함께하면 좋은 영역 → '추천' 표시
  available: Set<Area>; // 이 월령에 놀이가 있는 영역
  onPick: (area: Area | null) => void;
  onClose: () => void;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center">
      <button type="button" aria-label="닫기" onClick={onClose} className="absolute inset-0 bg-ink/40" />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="area-sheet-title"
        className="relative w-full max-w-[480px] rounded-t-[22px] bg-card px-5 pb-[calc(24px+env(safe-area-inset-bottom))] pt-3"
      >
        <span className="mx-auto block h-1 w-10 rounded-full bg-line" aria-hidden />
        <h2 id="area-sheet-title" className="mt-4 text-[18px] font-bold">
          어떤 놀이를 해 볼까요?
        </h2>
        <p className="mt-1 text-[13px] font-medium text-sub">고른 영역에서 지금 단계에 맞는 놀이로 바꿔요.</p>

        <Button full onClick={() => onPick(null)} className="mt-4">
          추천대로 바꾸기
        </Button>

        <ul className="mt-3 grid grid-cols-2 gap-2">
          {AREA_ORDER.map((a) => {
            const ok = available.has(a);
            return (
              <li key={a}>
                <button
                  type="button"
                  disabled={!ok}
                  onClick={() => onPick(a)}
                  className="pressable flex min-h-[56px] w-full flex-col items-start justify-center rounded-[12px] border border-line bg-card px-3.5 py-2 text-left disabled:opacity-40"
                >
                  <span className="flex items-center gap-1.5 text-[14.5px] font-bold">
                    {AREA_PLAY_NAME[a]}
                    {focus.includes(a) && (
                      <span className="rounded-[6px] bg-sage-light px-1.5 py-0.5 text-[11px] font-bold text-sage-dark">
                        추천
                      </span>
                    )}
                  </span>
                  <span className="text-[12px] font-medium text-sub">
                    {AREA_LABEL[a]}
                    {a === current ? " · 지금 영역" : ""}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>

        <TextButton onClick={onClose} className="mt-3 w-full">
          닫기
        </TextButton>
      </div>
    </div>
  );
}

/** 대기 D-day 카드 */
function WaitCard({
  data,
  today,
  logCount,
}: {
  data: NonNullable<ReturnType<typeof useLocalData>>;
  today: Date;
  logCount: number;
}) {
  const c = data.center;
  if (!c) {
    return (
      <Card>
        <p className="text-[13px] font-medium text-sub">상담 예정일을 등록하면 남은 날짜를 세어 드려요.</p>
        <Link href="/my#center" className="mt-2 inline-flex min-h-11 items-center text-[14px] font-bold text-sage-dark">
          상담 예정일 등록
        </Link>
      </Card>
    );
  }
  const t = ymd(today);
  const left = daysBetween(t, c.consultDate);
  const total = Math.max(1, daysBetween(c.waitStart, c.consultDate));
  const passed = daysBetween(c.waitStart, t);
  return (
    <Card>
      <div className="flex items-baseline justify-between gap-3">
        <p className="text-[13px] font-medium text-sub">{c.name} 첫 상담까지</p>
        {left > 0 ? (
          <p className="shrink-0 text-ink">
            <span className="text-[20px] font-extrabold tracking-[-0.03em] text-sage">{left}</span>
            <span className="ml-0.5 text-[13px] font-semibold">일</span>
          </p>
        ) : (
          <p className="shrink-0 text-[14px] font-bold">{left === 0 ? "오늘" : "상담일 지남"}</p>
        )}
      </div>
      <div className="mt-3">
        <ProgressBar value={passed / total} label="대기 기간 진행률" />
      </div>
      <p className="mt-2.5 text-[12px] font-medium text-mute">
        그동안 쌓인 놀이 기록 {logCount}개 · 상담 때 리포트로 보여줄 수 있어요
      </p>
    </Card>
  );
}

/** 오늘의 놀이 (홈에서 가장 큰 요소) */
function TodayPlay({
  play,
  doneToday,
  onStart,
  onOther,
}: {
  play: Play;
  doneToday: number; // 오늘 남긴 기록 수. 1 이상이면 '하나 더' 흐름으로
  onStart: () => void;
  onOther: () => void;
}) {
  return (
    <Card large className="overflow-hidden">
      <Illustration height={128} seed={play.id.length}>
        <span className="absolute right-3 top-3 rounded-[6px] bg-card px-2 py-1 text-[11px] font-bold text-sage-dark">
          {doneToday > 0 ? `오늘 ${doneToday}개 했어요 ✓` : "오늘의 놀이"}
        </span>
      </Illustration>
      <div className="px-[18px] pb-[18px] pt-4">
        <div className="flex gap-1.5">
          <AreaChip area={play.area} />
          <TimeChip minutes={play.minutes} />
        </div>
        <h2 className="mt-2.5 text-[18px] font-bold leading-[1.3] tracking-[-0.03em]">{play.title}</h2>
        <p className="mt-1 text-[13.5px] font-medium leading-[1.55] text-sub">준비물 · {play.materials.join(", ")}</p>
        {doneToday > 0 && (
          <p className="mt-2 text-[13px] font-medium leading-[1.5] text-sage-dark">
            오늘 놀이 잘 마쳤어요. 아이가 더 놀고 싶어 하면 하나 더 해 봐요.
          </p>
        )}
        <div className="mt-4 flex gap-2">
          <Button onClick={onStart} className="flex-1">
            {doneToday > 0 ? "하나 더 놀기" : "놀이 시작"}
          </Button>
          <Button variant="secondary" onClick={onOther} className="w-[92px] shrink-0 px-0">
            다른 놀이
          </Button>
        </div>
      </div>
    </Card>
  );
}

/** 이번 주 놀이: 요일별 완료 / 일부 / 안 함 / 오늘 */
function WeekCard({ logs, today }: { logs: { createdAt: string; done: Done }[]; today: Date }) {
  const week = thisWeek(today);
  const t = ymd(today);
  const status = (day: string): Done | null => {
    const ofDay = logs.filter((l) => ymd(new Date(l.createdAt)) === day);
    if (ofDay.some((l) => l.done === "done")) return "done";
    if (ofDay.some((l) => l.done === "partial")) return "partial";
    return null;
  };
  const statuses = week.map((d) => status(ymd(d)));
  const together = statuses.filter(Boolean).length;

  return (
    <Card>
      <div className="flex items-baseline justify-between">
        <p className="text-[13px] font-medium text-sub">이번 주 놀이</p>
        <p className="text-[13px] font-bold">{together}일 함께했어요</p>
      </div>
      <ol className="mt-3.5 grid grid-cols-7">
        {week.map((d, i) => {
          const s = statuses[i];
          const isToday = ymd(d) === t;
          const circle =
            s === "done"
              ? "bg-sage text-white"
              : s === "partial"
                ? "bg-sage-light"
                : isToday
                  ? "border-2 border-dashed border-sage bg-card"
                  : "bg-neutral-chip";
          const label = s === "done" ? "완료" : s === "partial" ? "일부 진행" : isToday ? "오늘" : "안 함";
          return (
            <li key={i} className="flex flex-col items-center gap-1.5" aria-label={`${WEEKDAY[d.getDay()]}요일 ${label}`}>
              <span className={`flex size-[30px] items-center justify-center rounded-full ${circle}`}>
                {s === "done" && <Icon icon={Check} size={16} />}
              </span>
              <span className="text-[11px] font-medium text-mute">{WEEKDAY[d.getDay()]}</span>
            </li>
          );
        })}
      </ol>
    </Card>
  );
}
