"use client";

import Link from "next/link";
import { useState } from "react";
import { Check, Plus } from "lucide-react";
import { BottomSheet } from "@/components/BottomSheet";
import { Button } from "@/components/Button";
import { EmptyState } from "@/components/EmptyState";
import { Icon } from "@/components/Icon";
import { ListGroup, ListRow } from "@/components/ListRow";
import { H1 } from "@/components/PageHeader";
import { PageSkeleton } from "@/components/Skeleton";
import { TAB_SAFE } from "@/components/TabBar";
import { toast } from "@/components/Toast";
import { ageInMonths, formatMonths } from "@/lib/age";
import { daysBetween, ymd } from "@/lib/dates";
import {
  childLogs,
  clearAll,
  currentChild,
  deleteAllLogs,
  deleteAllPhotos,
  saveCenter,
  saveSettings,
  switchChild,
  useLocalData,
} from "@/lib/local-store";

const INPUT =
  "h-[52px] w-full rounded-[12px] border border-line bg-card px-4 text-[15px] font-medium outline-none placeholder:text-mute focus:border-sage focus:ring-[0.5px] focus:ring-sage";

type Confirm = "photos" | "logs" | "withdraw" | null;
const CONFIRM: Record<Exclude<Confirm, null>, { title: string; body: string; action: string; run: () => void; done: string }> = {
  photos: { title: "사진을 모두 지울까요?", body: "기록은 남고 사진만 지워져요. 되돌릴 수 없어요.", action: "사진 지우기", run: deleteAllPhotos, done: "사진을 모두 지웠어요" },
  logs: { title: "놀이 기록을 모두 지울까요?", body: "기록과 추천 내역이 지워지고 리포트도 비어요. 되돌릴 수 없어요.", action: "기록 지우기", run: deleteAllLogs, done: "기록을 모두 지웠어요" },
  withdraw: { title: "동의를 철회할까요?", body: "아이 정보, 설문, 기록, 사진이 이 기기에서 모두 지워지고 처음 화면으로 돌아가요.", action: "철회하고 모두 지우기", run: clearAll, done: "동의를 철회하고 모두 지웠어요" },
};

export default function MyPage() {
  const data = useLocalData();
  const [sheet, setSheet] = useState<"child" | "center" | "about" | null>(null);
  const [confirm, setConfirm] = useState<Confirm>(null);
  const [name, setName] = useState("");
  const [waitStart, setWaitStart] = useState("");
  const [consultDate, setConsultDate] = useState("");

  if (!data) return <PageSkeleton />;
  const child = currentChild(data);
  const c = data.center;
  const s = data.settings;
  const centerOk = name.trim() !== "" && !!waitStart && !!consultDate && consultDate >= waitStart;

  function openCenter() {
    setName(c?.name ?? "");
    setWaitStart(c?.waitStart ?? "");
    setConsultDate(c?.consultDate ?? "");
    setSheet("center");
  }

  return (
    <main className={`flex flex-1 flex-col px-5 ${TAB_SAFE}`}>
      <div className="h-8" aria-hidden />
      <H1 className="mt-2">MY</H1>

      {child ? (
        <button
          type="button"
          onClick={() => setSheet("child")}
          className="pressable mt-5 flex items-center gap-3.5 rounded-[18px] bg-card px-[18px] py-4 text-left"
          aria-label={`${child.nickname} 프로필, 아이 바꾸기`}
        >
          <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-sage-light text-[18px] font-extrabold text-sage-dark">
            {child.nickname.slice(0, 1)}
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-[18px] font-bold tracking-[-0.03em]">{child.nickname}</p>
            <p className="text-[13px] font-medium text-sub">
              {formatMonths(ageInMonths(child.birthDate))} · 기록 {childLogs(data, child.id).length}개
            </p>
          </div>
          <span className="text-[13px] font-semibold text-sage-dark">{data.children.length > 1 ? "바꾸기" : "추가"}</span>
        </button>
      ) : (
        <div className="mt-5">
          <EmptyState text="아이 정보를 넣으면 프로필과 기록이 여기 모여요." action="아이 정보 입력" href="/onboarding" />
        </div>
      )}

      <h2 id="center" className="mt-7 scroll-mt-4 text-[13px] font-semibold text-sub">
        센터·상담
      </h2>
      <ListGroup className="mt-2">
        <ListRow onClick={openCenter} chevron>
          <p className="text-[15px] font-semibold">{c ? c.name : "상담 예정일 등록"}</p>
          <p className="mt-0.5 text-[12.5px] font-medium text-sub">
            {c
              ? `첫 상담 ${c.consultDate.replaceAll("-", ".")} · ${Math.max(0, daysBetween(ymd(new Date()), c.consultDate))}일 남음`
              : "등록하면 홈에서 남은 날을 세어 드려요"}
          </p>
        </ListRow>
        <ListRow href="/report" chevron>
          <p className="text-[15px] font-semibold">상담용 리포트</p>
        </ListRow>
      </ListGroup>

      <h2 className="mt-7 text-[13px] font-semibold text-sub">알림</h2>
      <ListGroup className="mt-2">
        <ListRow
          onClick={() => {
            saveSettings({ ...s, notify: !s.notify });
            toast(s.notify ? "놀이 알림을 껐어요" : `매일 ${s.notifyTime}에 알려 드릴게요`);
          }}
          trailing={<Switch on={s.notify} />}
        >
          <p className="text-[15px] font-semibold">놀이 시간 알림</p>
          <p className="mt-0.5 text-[12.5px] font-medium text-sub">하루 한 번, 놓쳐도 다시 알리지 않아요</p>
        </ListRow>
        {s.notify && (
          <ListRow>
            <label className="flex items-center justify-between gap-3">
              <span className="text-[15px] font-semibold">알림 시간</span>
              <input
                type="time"
                value={s.notifyTime}
                onChange={(e) => saveSettings({ ...s, notifyTime: e.target.value })}
                className="h-11 rounded-[12px] border border-line bg-card px-3 text-[15px] font-semibold"
              />
            </label>
          </ListRow>
        )}
      </ListGroup>

      <h2 className="mt-7 text-[13px] font-semibold text-sub">데이터 관리</h2>
      <ListGroup className="mt-2">
        <ListRow onClick={() => setConfirm("photos")} chevron>
          <p className="text-[15px] font-semibold">사진 모두 지우기</p>
        </ListRow>
        <ListRow onClick={() => setConfirm("logs")} chevron>
          <p className="text-[15px] font-semibold">놀이 기록 모두 지우기</p>
        </ListRow>
        <ListRow onClick={() => setConfirm("withdraw")}>
          <p className="text-[15px] font-semibold text-danger">동의 철회하고 모두 지우기</p>
        </ListRow>
      </ListGroup>

      <h2 className="mt-7 text-[13px] font-semibold text-sub">서비스</h2>
      <ListGroup className="mt-2">
        <ListRow onClick={() => setSheet("about")} chevron>
          <p className="text-[15px] font-semibold">놀이다리 안내</p>
        </ListRow>
        <ListRow onClick={() => toast("문의 창구는 준비 중이에요")} chevron>
          <p className="text-[15px] font-semibold">문의하기</p>
        </ListRow>
      </ListGroup>

      {/* 아이 바꾸기 */}
      <BottomSheet open={sheet === "child"} title="아이 선택" onClose={() => setSheet(null)}>
        <ul className="overflow-hidden rounded-[18px] border border-line">
          {data.children.map((k) => (
            <li key={k.id} className="border-b border-line-soft last:border-b-0">
              <button
                type="button"
                onClick={() => {
                  switchChild(k.id);
                  setSheet(null);
                  toast(`${k.nickname}(으)로 바꿨어요`);
                }}
                className="pressable flex min-h-[56px] w-full items-center gap-3 px-4 text-left"
              >
                <span className="flex size-9 items-center justify-center rounded-full bg-sage-light text-[14px] font-extrabold text-sage-dark">
                  {k.nickname.slice(0, 1)}
                </span>
                <span className="flex-1 text-[15px] font-semibold">
                  {k.nickname} <span className="text-[13px] font-medium text-sub">· {ageInMonths(k.birthDate)}개월</span>
                </span>
                {k.id === data.currentChildId && <Icon icon={Check} size={18} className="text-sage" />}
              </button>
            </li>
          ))}
        </ul>
        <Link href="/onboarding" className="pressable mt-3 flex min-h-12 items-center justify-center gap-1.5 rounded-[13px] bg-neutral-chip text-[15px] font-bold text-sub">
          <Icon icon={Plus} size={18} />
          아이 추가
        </Link>
      </BottomSheet>

      {/* 센터·상담일 */}
      <BottomSheet open={sheet === "center"} title="센터·상담일" onClose={() => setSheet(null)}>
        <div className="flex flex-col gap-3">
          <label className="flex flex-col gap-2">
            <span className="text-[13px] font-semibold text-sub">센터 이름 (나만 보여요)</span>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="예: 새싹발달센터" className={INPUT} />
          </label>
          <label className="flex flex-col gap-2">
            <span className="text-[13px] font-semibold text-sub">대기 신청한 날</span>
            <input type="date" value={waitStart} onChange={(e) => setWaitStart(e.target.value)} className={INPUT} />
          </label>
          <label className="flex flex-col gap-2">
            <span className="text-[13px] font-semibold text-sub">첫 상담 예정일</span>
            <input type="date" value={consultDate} onChange={(e) => setConsultDate(e.target.value)} className={INPUT} />
          </label>
          <div className="mt-2 flex gap-2">
            <Button
              className="flex-1"
              disabled={!centerOk}
              onClick={() => {
                saveCenter({ name: name.trim(), waitStart, consultDate });
                setSheet(null);
                toast("상담일을 저장했어요");
              }}
            >
              저장
            </Button>
            {c && (
              <Button
                variant="secondary"
                className="w-[92px] shrink-0 px-0"
                onClick={() => {
                  saveCenter(null);
                  setSheet(null);
                  toast("센터 정보를 지웠어요");
                }}
              >
                지우기
              </Button>
            )}
          </div>
        </div>
      </BottomSheet>

      {/* 서비스 안내 */}
      <BottomSheet open={sheet === "about"} title="놀이다리 안내" onClose={() => setSheet(null)}>
        <div className="flex flex-col gap-3 pb-2 text-[14px] font-medium leading-[1.6]">
          <p>놀이다리는 의료 서비스가 아니에요. 발달지연이나 발달장애를 진단하지 않고, 놀이 추천은 전문 평가와 치료를 대신하지 않아요.</p>
          <p className="text-sub">걱정되는 모습이 있으면 기다리는 센터나 가까운 소아청소년과에 상담을 문의해 주세요.</p>
          <p className="text-sub">아이 정보와 기록은 지금 이 기기에만 저장되고, 아이 기록을 외부 AI 서비스로 보내지 않아요.</p>
        </div>
      </BottomSheet>

      {/* 데이터 삭제 확인 */}
      {confirm && (
        <BottomSheet open title={CONFIRM[confirm].title} onClose={() => setConfirm(null)}>
          <p className="text-[14px] font-medium leading-[1.55] text-sub">{CONFIRM[confirm].body}</p>
          <div className="mt-5 flex gap-2">
            <Button variant="secondary" onClick={() => setConfirm(null)} className="flex-1">
              그대로 둘게요
            </Button>
            <button
              type="button"
              onClick={() => {
                CONFIRM[confirm].run();
                toast(CONFIRM[confirm].done);
                setConfirm(null);
              }}
              className="pressable h-12 flex-1 rounded-[13px] border-[1.5px] border-danger bg-card px-2 text-[15px] font-bold text-danger"
            >
              {CONFIRM[confirm].action}
            </button>
          </div>
        </BottomSheet>
      )}
    </main>
  );
}

function Switch({ on }: { on: boolean }) {
  return (
    <span aria-hidden className={`relative h-7 w-12 shrink-0 rounded-full transition-colors ${on ? "bg-sage" : "bg-neutral-chip"}`}>
      <span className={`absolute top-1 size-5 rounded-full bg-card transition-[left] ${on ? "left-6" : "left-1"}`} />
    </span>
  );
}
