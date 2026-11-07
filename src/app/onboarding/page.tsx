"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button, TextButton } from "@/components/Button";
import { Illustration } from "@/components/Illustration";
import { H1, PageHeader } from "@/components/PageHeader";
import { ageInMonths, formatMonths } from "@/lib/age";
import { callName } from "@/lib/copy";
import { daysBetween, ymd } from "@/lib/dates";
import { saveCenter, saveChild } from "@/lib/local-store";

const INPUT =
  "h-[52px] w-full rounded-[12px] border border-line bg-card px-4 text-[15px] font-medium outline-none placeholder:text-mute focus:border-sage focus:ring-[0.5px] focus:ring-sage";

function Field({ label, hint, children }: { label: string; hint?: React.ReactNode; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-2">
      <span className="text-[13px] font-semibold text-sub">{label}</span>
      {children}
      {hint}
    </label>
  );
}

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [nickname, setNickname] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [consent, setConsent] = useState(false);
  const [center, setCenter] = useState("");
  const [waitStart, setWaitStart] = useState("");
  const [consultDate, setConsultDate] = useState("");

  const months = birthDate ? ageInMonths(birthDate) : null;
  const monthsOk = months !== null && months >= 0 && months <= 83;
  const name = nickname.trim();
  const childOk = name !== "" && monthsOk && consent;
  const centerOk = center.trim() !== "" && !!waitStart && !!consultDate && consultDate >= waitStart;
  const who = name ? callName(name) : "아이";

  const STEPS = [
    {
      title: "아이를 어떻게\n부르면 될까요?",
      body: "질문과 놀이를 월령에 맞추는 데만 써요. 실명 대신 집에서 부르는 이름이면 충분해요.",
    },
    {
      title: "기다리는 센터가\n있나요?",
      body: "첫 상담까지 남은 날과 그동안 쌓인 기록을 홈에서 보여 드려요. 아직 신청 전이면 나중에 해도 괜찮아요.",
    },
    {
      title: `${who}의 요즘 모습을\n질문 9개로 살펴봐요`,
      body: "집에서 본 모습 그대로 고르면 돼요. 진단이 아니라 첫 놀이를 고르기 위한 참고 정보예요. 중간에 멈춰도 이어서 할 수 있어요.",
    },
  ];
  const last = step === STEPS.length - 1;

  function next(skipCenter = false) {
    if (step === 0) {
      if (!childOk) return;
      saveChild({ nickname: name, birthDate });
    }
    if (step === 1 && !skipCenter) {
      if (!centerOk) return;
      saveCenter({ name: center.trim(), waitStart, consultDate });
    }
    if (last) return router.push("/survey");
    setStep(step + 1);
  }

  const leftDays = consultDate ? daysBetween(ymd(new Date()), consultDate) : null;

  return (
    <main className="flex flex-1 flex-col pb-[calc(24px+env(safe-area-inset-bottom))]">
      <div className="relative">
        <Illustration height={220} seed={step} />
        {step > 0 && (
          <div className="absolute left-5 top-0">
            <PageHeader back />
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col px-5 pt-7">
        <H1>{STEPS[step].title}</H1>
        <p className="mt-2 text-[13.5px] font-medium leading-[1.55] text-sub">{STEPS[step].body}</p>

        {step === 0 && (
          <div className="mt-6 flex flex-col gap-5">
            <Field label="애칭">
              <input value={nickname} onChange={(e) => setNickname(e.target.value)} placeholder="예: 하린" maxLength={20} className={INPUT} />
            </Field>
            <Field
              label="생년월일"
              hint={
                months !== null && (
                  <span className={`text-[13px] font-medium ${monthsOk ? "text-sage-dark" : "text-danger"}`}>
                    {monthsOk ? `지금 ${formatMonths(months)}이에요` : "만 0~6세(0~83개월) 아이만 이용할 수 있어요"}
                  </span>
                )
              }
            >
              <input type="date" value={birthDate} onChange={(e) => setBirthDate(e.target.value)} className={INPUT} />
            </Field>
            <label className="flex min-h-11 items-start gap-3">
              <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} className="mt-0.5 size-5 shrink-0 accent-sage" />
              <span className="text-[13.5px] font-medium leading-[1.55]">
                아이 정보와 놀이 기록을 놀이 추천에 쓰는 데 동의해요 (필수)
                <span className="mt-0.5 block text-[12px] text-sub">이 기기에만 저장되고, MY에서 언제든 지우거나 동의를 철회할 수 있어요.</span>
              </span>
            </label>
          </div>
        )}

        {step === 1 && (
          <div className="mt-6 flex flex-col gap-5">
            <Field label="센터 이름 (나만 보여요)">
              <input value={center} onChange={(e) => setCenter(e.target.value)} placeholder="예: 새싹발달센터" className={INPUT} />
            </Field>
            <Field label="대기 신청한 날">
              <input type="date" value={waitStart} onChange={(e) => setWaitStart(e.target.value)} className={INPUT} />
            </Field>
            <Field
              label="첫 상담 예정일"
              hint={
                leftDays !== null &&
                leftDays > 0 && <span className="text-[13px] font-medium text-sage-dark">{leftDays}일 남았어요</span>
              }
            >
              <input type="date" value={consultDate} onChange={(e) => setConsultDate(e.target.value)} className={INPUT} />
            </Field>
          </div>
        )}

        <div className="mt-auto flex flex-col items-center gap-3 pt-8">
          <Dots count={STEPS.length} active={step} />
          <Button full onClick={() => next()} disabled={(step === 0 && !childOk) || (step === 1 && !centerOk)}>
            {step === 0 ? "다음" : step === 1 ? "상담일 저장" : "질문 시작"}
          </Button>
          {step === 1 && <TextButton onClick={() => next(true)}>나중에 할게요</TextButton>}
        </div>
      </div>
    </main>
  );
}

function Dots({ count, active }: { count: number; active: number }) {
  return (
    <div className="flex items-center gap-1.5" role="img" aria-label={`${count}단계 중 ${active + 1}단계`}>
      {Array.from({ length: count }, (_, i) => (
        <span key={i} className={`h-1.5 rounded-full transition-[width] ${i === active ? "w-[18px] bg-sage" : "w-1.5 bg-line"}`} />
      ))}
    </div>
  );
}
