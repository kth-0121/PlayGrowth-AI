"use client";

import { useState } from "react";
import { Button } from "@/components/Button";
import { EmptyState } from "@/components/EmptyState";
import { ListGroup, ListRow } from "@/components/ListRow";
import { H1, PageHeader } from "@/components/PageHeader";
import { TAB_SAFE } from "@/components/TabBar";
import { ageInMonths, formatMonths } from "@/lib/age";
import { AREA_PLAY_NAME } from "@/lib/copy";
import { childLogs, childPrefs, clearAll, currentChild, saveCenter, seedDemo, useLocalData } from "@/lib/local-store";
import { supabase } from "@/lib/supabase";
import { AREA_LABEL, type ChildPrefs } from "@/types";

/** "좋아해요: 몸 놀이 · 함께하고 싶어요: 언어" */
function prefsSummary(p: ChildPrefs) {
  const parts = [
    p.likes.length ? `좋아해요: ${p.likes.map((a) => AREA_PLAY_NAME[a]).join(", ")}` : "",
    p.concernAreas.length ? `함께하고 싶어요: ${p.concernAreas.map((a) => AREA_LABEL[a]).join(", ")}` : "",
  ].filter(Boolean);
  return parts.length ? parts.join(" · ") : "아직 고르지 않았어요";
}

const INPUT =
  "h-[52px] w-full rounded-[12px] border border-line bg-card px-4 text-[15px] font-medium outline-none placeholder:text-mute focus:border-sage focus:ring-[0.5px] focus:ring-sage";

export default function MyPage() {
  const data = useLocalData();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState("");
  const [waitStart, setWaitStart] = useState("");
  const [consultDate, setConsultDate] = useState("");

  if (!data) return <main className={`flex-1 ${TAB_SAFE}`} />;
  const child = currentChild(data);
  const c = data.center;

  function openCenter() {
    setName(c?.name ?? "");
    setWaitStart(c?.waitStart ?? "");
    setConsultDate(c?.consultDate ?? "");
    setEditing(true);
  }
  function submitCenter(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !waitStart || !consultDate || consultDate < waitStart) return;
    saveCenter({ name: name.trim(), waitStart, consultDate });
    setEditing(false);
  }
  function wipe() {
    if (confirm("아이 정보와 모든 기록을 지울까요? 되돌릴 수 없어요.")) clearAll();
  }

  return (
    <main className={`flex flex-1 flex-col px-5 ${TAB_SAFE}`}>
      <PageHeader logo />
      <H1 className="mt-2">MY</H1>

      {child ? (
        <div className="mt-5 flex items-center gap-3.5">
          <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-sage-light text-[18px] font-extrabold text-sage-dark">
            {child.nickname.slice(0, 1)}
          </span>
          <div>
            <p className="text-[18px] font-bold tracking-[-0.03em]">{child.nickname}</p>
            <p className="text-[13px] font-medium text-sub">
              {formatMonths(ageInMonths(child.birthDate))} · 기록 {childLogs(data, child.id).length}개
            </p>
          </div>
        </div>
      ) : (
        <div className="mt-5">
          <EmptyState text="아이 정보를 넣으면 프로필과 기록이 여기 모여요." action="아이 정보 입력" href="/onboarding" />
        </div>
      )}

      <h2 id="center" className="mt-7 scroll-mt-4 text-[13px] font-semibold text-sub">
        센터 대기
      </h2>
      {editing ? (
        <form onSubmit={submitCenter} className="mt-2 flex flex-col gap-3 rounded-[18px] bg-card p-4">
          <label className="flex flex-col gap-2">
            <span className="text-[13px] font-semibold text-sub">센터 이름 (나만 보여요)</span>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="예: 새싹발달센터" className={INPUT} />
          </label>
          <label className="flex flex-col gap-2">
            <span className="text-[13px] font-semibold text-sub">대기 신청일</span>
            <input type="date" value={waitStart} onChange={(e) => setWaitStart(e.target.value)} className={INPUT} />
          </label>
          <label className="flex flex-col gap-2">
            <span className="text-[13px] font-semibold text-sub">첫 상담 예정일</span>
            <input type="date" value={consultDate} onChange={(e) => setConsultDate(e.target.value)} className={INPUT} />
          </label>
          <div className="mt-1 flex gap-2">
            <Button type="submit" className="flex-1" disabled={!name.trim() || !waitStart || !consultDate || consultDate < waitStart}>
              저장
            </Button>
            <Button variant="secondary" onClick={() => setEditing(false)} className="w-[92px] shrink-0 px-0">
              취소
            </Button>
          </div>
        </form>
      ) : (
        <ListGroup className="mt-2">
          <ListRow onClick={openCenter} chevron>
            <p className="text-[15px] font-semibold">{c ? c.name : "상담 예정일 등록"}</p>
            {c && <p className="mt-0.5 text-[12.5px] font-medium text-sub">첫 상담 {c.consultDate.replaceAll("-", ".")}</p>}
          </ListRow>
          {c && (
            <ListRow onClick={() => saveCenter(null)}>
              <p className="text-[15px] font-semibold text-sub">센터 대기 정보 지우기</p>
            </ListRow>
          )}
        </ListGroup>
      )}

      <h2 className="mt-7 text-[13px] font-semibold text-sub">아이·기록</h2>
      <ListGroup className="mt-2">
        <ListRow href="/onboarding" chevron>
          <p className="text-[15px] font-semibold">{child ? "아이 정보 다시 입력" : "아이 정보 입력"}</p>
        </ListRow>
        {child && (
          <ListRow href="/my/prefs" chevron>
            <p className="text-[15px] font-semibold">관심 놀이·영역 바꾸기</p>
            <p className="mt-0.5 text-[12.5px] font-medium text-sub">{prefsSummary(childPrefs(child))}</p>
          </ListRow>
        )}
        <ListRow href="/survey" chevron>
          <p className="text-[15px] font-semibold">발달 상태 다시 확인</p>
        </ListRow>
        <ListRow href="/report" chevron>
          <p className="text-[15px] font-semibold">상담용 리포트</p>
        </ListRow>
      </ListGroup>

      <h2 className="mt-7 text-[13px] font-semibold text-sub">시연·데이터</h2>
      <ListGroup className="mt-2">
        <ListRow onClick={seedDemo} chevron>
          <p className="text-[15px] font-semibold">예시 데이터 넣기</p>
          <p className="mt-0.5 text-[12.5px] font-medium text-sub">가짜 아이 “하린”과 기록 6개로 바꿔요</p>
        </ListRow>
        <ListRow onClick={wipe}>
          <p className="text-[15px] font-semibold text-danger">아이 정보와 기록 모두 지우기</p>
        </ListRow>
      </ListGroup>

      <ListGroup className="mt-7">
        <ListRow onClick={() => supabase.auth.signOut()}>
          <p className="text-[15px] font-semibold">로그아웃</p>
        </ListRow>
      </ListGroup>

      <p className="mt-8 text-[12px] font-medium leading-[1.6] text-sub">
        놀이다리는 의료 서비스가 아니며 발달지연이나 발달장애를 진단하지 않아요. 놀이 추천은 전문 평가와 치료를 대신하지
        않아요. 정보는 로그인한 계정에만 저장되고, 언제든 지울 수 있어요.
      </p>
    </main>
  );
}
