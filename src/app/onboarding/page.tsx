"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button, TextButton } from "@/components/Button";
import { Illustration } from "@/components/Illustration";
import { H1 } from "@/components/PageHeader";
import { ageInMonths, formatMonths } from "@/lib/age";
import { callName } from "@/lib/copy";
import { ymd } from "@/lib/dates";
import { saveChild } from "@/lib/local-store";

const INPUT =
  "h-[52px] rounded-[12px] border border-line bg-card px-4 text-[15px] font-medium outline-none placeholder:text-mute focus:border-sage focus:ring-[0.5px] focus:ring-sage";

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [nickname, setNickname] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [consent, setConsent] = useState(false);

  // 고를 수 있는 생년월일: 만 0~6세(0~83개월) → 84개월 전 다음 날 ~ 오늘
  const today = new Date();
  const oldest = new Date(today.getFullYear(), today.getMonth() - 84, today.getDate() + 1);
  const birthMin = ymd(oldest);
  const birthMax = ymd(today);
  const validDate = /^\d{4}-\d{2}-\d{2}$/.test(birthDate);

  const months = validDate ? ageInMonths(birthDate) : null;
  const monthsOk = months !== null && months >= 0 && months <= 83;
  const name = nickname.trim();
  const formOk = name !== "" && monthsOk && consent;
  const who = name ? callName(name) : "아이";

  const STEPS = [
    {
      title: "아이를 어떻게\n부르면 될까요?",
      body: "질문과 놀이를 월령에 맞추는 데만 써요. 실명 대신 집에서 부르는 이름이면 충분해요.",
    },
    {
      title: `${who}의 평소 모습을\n5가지 질문으로 살펴봐요`,
      body: "이름을 부르면 돌아보는지, 블록을 쌓는지처럼 집에서 본 모습에 답하면 돼요. 진단이 아니에요.",
    },
    {
      title: "집에 있는 냄비 뚜껑,\n빨래집게로 15분 놀아요",
      body: "언어·인지·사회성·대근육·소근육 중 더 함께하면 좋은 영역부터 쉬운 단계로 골라요.",
    },
    {
      title: "놀이 기록이 쌓이면\n상담 때 보여줄 수 있어요",
      body: "즐거워한 놀이는 다음 단계로, 어려워한 놀이는 쉬운 방법으로 바꿔요. 기간별 리포트는 원할 때만 센터와 공유해요.",
    },
  ];
  const last = step === STEPS.length - 1;

  function next() {
    if (step === 0) {
      if (!formOk) return;
      saveChild({ nickname: name, birthDate });
    }
    if (last) return router.push("/survey");
    setStep(step + 1);
  }

  return (
    <main className="flex flex-1 flex-col pb-[calc(24px+env(safe-area-inset-bottom))]">
      <Illustration height={220} seed={step} />

      <div className="flex flex-1 flex-col px-5 pt-7">
        <H1>{STEPS[step].title}</H1>
        <p className="mt-2 text-[13.5px] font-medium leading-[1.55] text-sub">{STEPS[step].body}</p>

        {step === 0 && (
          <div className="mt-6 flex flex-col gap-5">
            <label className="flex flex-col gap-2">
              <span className="text-[13px] font-semibold text-sub">애칭</span>
              <input
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                placeholder="예: 하린"
                maxLength={20}
                className={INPUT}
              />
            </label>
            <label className="flex flex-col gap-2">
              <span className="text-[13px] font-semibold text-sub">생년월일</span>
              {/* min·max가 있어야 연도 칸이 4자리로 제한됨 (없으면 브라우저가 6자리까지 받음) */}
              <input
                type="date"
                value={birthDate}
                min={birthMin}
                max={birthMax}
                onChange={(e) => setBirthDate(e.target.value)}
                className={INPUT}
                suppressHydrationWarning
              />
              {birthDate !== "" && !validDate && (
                <span className="text-[13px] font-medium text-danger">연도는 4자리로 입력해 주세요 (예: 2024)</span>
              )}
              {months !== null && (
                <span className={`text-[13px] font-medium ${monthsOk ? "text-sage-dark" : "text-danger"}`}>
                  {monthsOk ? `지금 ${formatMonths(months)}이에요` : "만 0~6세(0~83개월) 아이만 이용할 수 있어요"}
                </span>
              )}
            </label>
            <label className="flex min-h-11 items-start gap-3">
              <input
                type="checkbox"
                checked={consent}
                onChange={(e) => setConsent(e.target.checked)}
                className="mt-0.5 size-5 shrink-0 accent-sage"
              />
              <span className="text-[13.5px] font-medium leading-[1.55]">
                아이 정보와 놀이 기록을 놀이 추천에 쓰는 데 동의해요 (필수)
                <span className="mt-0.5 block text-[12px] text-sub">언제든 MY에서 지울 수 있어요.</span>
              </span>
            </label>
          </div>
        )}

        <div className="mt-auto flex flex-col items-center gap-4 pt-8">
          <Dots count={STEPS.length} active={step} />
          <Button full onClick={next} disabled={step === 0 && !formOk}>
            {step === 0 ? "다음" : last ? "질문 시작" : "다음"}
          </Button>
          {step > 1 && <TextButton onClick={() => setStep(step - 1)}>이전</TextButton>}
        </div>
      </div>
    </main>
  );
}

function Dots({ count, active }: { count: number; active: number }) {
  return (
    <div className="flex items-center gap-1.5" aria-label={`${count}단계 중 ${active + 1}단계`}>
      {Array.from({ length: count }, (_, i) => (
        <span
          key={i}
          className={`h-1.5 rounded-full transition-[width] ${i === active ? "w-[18px] bg-sage" : "w-1.5 bg-line"}`}
        />
      ))}
    </div>
  );
}
