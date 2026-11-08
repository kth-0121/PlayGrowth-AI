"use client";

import { useState } from "react";
import { Bookmark } from "lucide-react";
import { AREA_LABEL, type Area, type Play } from "@/types";
import { Icon } from "@/components/Icon";
import { PlayArt } from "@/components/PlayArt";
import { ListGroup, ListRow } from "@/components/ListRow";
import { H1 } from "@/components/PageHeader";
import { SegmentedControl } from "@/components/SegmentedControl";
import { PageSkeleton } from "@/components/Skeleton";
import { NoResult } from "@/components/StatusViews";
import { TAB_SAFE } from "@/components/TabBar";
import { ageInMonths } from "@/lib/age";
import { callName } from "@/lib/copy";
import { childLogs, currentChild, latestRecommendation, latestSurvey, useLocalData } from "@/lib/local-store";
import { PLAYS, playsForMonths } from "@/lib/recommend";
import { AREA_ORDER } from "@/lib/survey";

type Tab = "rec" | "saved" | "done";

export default function PlayListPage() {
  const data = useLocalData();
  const [tab, setTab] = useState<Tab>("rec");
  const [area, setArea] = useState<Area | null>(null);
  const [short, setShort] = useState(false);
  const [few, setFew] = useState(false);

  if (!data) return <PageSkeleton />;
  const child = currentChild(data);
  const months = child ? ageInMonths(child.birthDate) : null;
  const pool = months !== null ? playsForMonths(months) : PLAYS;

  // 추천: 오늘의 놀이 → 더 함께하면 좋은 영역 → 나머지
  const recId = child ? latestRecommendation(data, child.id)?.playId : undefined;
  const focus = child ? (latestSurvey(data, child.id)?.result.focus ?? []) : [];
  const rank = (p: Play) => (p.id === recId ? -1 : focus.includes(p.area) ? focus.indexOf(p.area) : 9) * 10 + p.step;
  const doneIds = new Set(child ? childLogs(data, child.id).map((l) => l.playId) : []);

  const byTab =
    tab === "rec"
      ? [...pool].sort((a, b) => rank(a) - rank(b))
      : tab === "saved"
        ? data.savedPlays.map((id) => PLAYS.find((p) => p.id === id)).filter((p): p is Play => !!p)
        : PLAYS.filter((p) => doneIds.has(p.id));
  const list = byTab.filter(
    (p) => (!area || p.area === area) && (!short || p.minutes <= 10) && (!few || p.materials.length <= 2),
  );

  const filtered = area !== null || short || few;
  const emptyText =
    tab === "saved"
      ? "저장한 놀이가 없어요. 놀이 상세에서 북마크를 누르면 여기 모여요."
      : tab === "done"
        ? "아직 해 본 놀이가 없어요. 기록을 남기면 여기 모여요."
        : "조건에 맞는 놀이가 없어요.";

  return (
    <main className={`flex flex-1 flex-col px-5 ${TAB_SAFE}`}>
      <div className="h-8" aria-hidden />
      <div className="mt-2 flex items-baseline justify-between gap-3">
        <H1>놀이 고르기</H1>
        <span className="text-[13px] font-medium text-sub">{list.length}개</span>
      </div>
      <p className="mt-1 text-[13.5px] font-medium text-sub">
        {child ? `${callName(child.nickname)} 월령(${months}개월)에 맞는 놀이만 보여요.` : "집에 있는 물건으로 하는 10~20분 놀이예요."}
      </p>

      <div className="mt-5">
        <SegmentedControl
          label="놀이 목록 종류"
          value={tab}
          onChange={setTab}
          options={[
            { value: "rec", label: "추천" },
            { value: "saved", label: `저장 ${data.savedPlays.length}` },
            { value: "done", label: `해 본 놀이 ${doneIds.size}` },
          ]}
        />
      </div>

      <div className="-mx-5 mt-3 flex gap-1.5 overflow-x-auto px-5 pb-1" role="group" aria-label="영역과 조건으로 거르기">
        <FilterChip on={area === null} onClick={() => setArea(null)}>
          전체
        </FilterChip>
        {AREA_ORDER.map((a) => (
          <FilterChip key={a} on={area === a} onClick={() => setArea(area === a ? null : a)}>
            {AREA_LABEL[a]}
          </FilterChip>
        ))}
        <span className="mx-1 w-px shrink-0 bg-line" aria-hidden />
        <FilterChip on={short} onClick={() => setShort(!short)}>
          10분 이하
        </FilterChip>
        <FilterChip on={few} onClick={() => setFew(!few)}>
          준비물 2개 이하
        </FilterChip>
      </div>

      <div className="mt-3">
        {list.length === 0 ? (
          <NoResult
            text={emptyText}
            action={
              filtered && (
                <button
                  type="button"
                  onClick={() => {
                    setArea(null);
                    setShort(false);
                    setFew(false);
                  }}
                  className="pressable min-h-11 text-[14px] font-semibold text-sage-dark"
                >
                  조건 지우기
                </button>
              )
            }
          />
        ) : (
          <ListGroup>
            {list.map((p) => (
              <ListRow key={p.id} href={`/play/${p.id}`} chevron>
                <div className="flex items-center gap-3">
                  <div className="size-14 shrink-0 overflow-hidden rounded-[12px]">
                    <PlayArt play={p} height={56} crop />
                  </div>
                  <div className="min-w-0 flex-1">
                    {p.id === recId && <p className="mb-0.5 text-[12px] font-semibold text-sage-dark">오늘의 놀이</p>}
                    <p className="text-[15px] font-bold leading-[1.35]">
                      {p.title}
                      {data.savedPlays.includes(p.id) && (
                        <Icon icon={Bookmark} size={14} className="ml-1 inline align-[-1px] text-sage-dark" />
                      )}
                    </p>
                    <p className="mt-0.5 text-[12.5px] font-medium text-sub">
                      {AREA_LABEL[p.area]} · {p.minutes}분 · 준비물 {p.materials.length}개
                    </p>
                  </div>
                </div>
              </ListRow>
            ))}
          </ListGroup>
        )}
      </div>
    </main>
  );
}

function FilterChip({ on, onClick, children }: { on: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={on}
      className={`pressable min-h-11 shrink-0 rounded-[8px] px-3 text-[13px] font-semibold ${
        on ? "bg-sage-light text-sage-dark" : "bg-card text-sub"
      }`}
    >
      {children}
    </button>
  );
}
