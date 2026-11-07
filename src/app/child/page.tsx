"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Notice, PageTitle, PrimaryButton } from "@/components/ui";
import { ageInMonths, formatMonths } from "@/lib/age";
import { saveChild } from "@/lib/local-store";

export default function ChildPage() {
  const router = useRouter();
  const [nickname, setNickname] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [consent, setConsent] = useState(false);

  const months = birthDate ? ageInMonths(birthDate) : null;
  const monthsOk = months !== null && months >= 0 && months <= 83;
  const canSubmit = nickname.trim() !== "" && monthsOk && consent;

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    saveChild({ nickname: nickname.trim(), birthDate });
    router.push("/survey");
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-6">
      <PageTitle step="1 / 4" title="아이 정보" desc="우리 아이에게 맞는 질문과 놀이를 고르는 데 쓰여요." />

      <label className="flex flex-col gap-1.5 text-sm font-medium">
        아이 애칭
        <input
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          placeholder="예: 콩이"
          maxLength={20}
          className="h-12 rounded-xl border border-line bg-card px-4 text-base font-normal"
        />
        <span className="text-xs font-normal text-muted">실명 대신 집에서 부르는 이름을 적어 주세요.</span>
      </label>

      <label className="flex flex-col gap-1.5 text-sm font-medium">
        생년월일
        <input
          type="date"
          value={birthDate}
          onChange={(e) => setBirthDate(e.target.value)}
          className="h-12 rounded-xl border border-line bg-card px-4 text-base font-normal"
        />
        {months !== null &&
          (monthsOk ? (
            <span className="text-sm font-normal text-calm">지금 {formatMonths(months)}이에요</span>
          ) : (
            <span className="text-sm font-normal text-brand">놀이다리는 만 0~6세(0~83개월) 아이를 위한 서비스예요.</span>
          ))}
      </label>

      <label className="flex items-start gap-3 rounded-2xl border border-line bg-card p-4 text-sm">
        <input
          type="checkbox"
          checked={consent}
          onChange={(e) => setConsent(e.target.checked)}
          className="mt-0.5 size-5 shrink-0 accent-[var(--brand)]"
        />
        <span className="leading-relaxed">
          <b>[필수]</b> 아이 정보와 놀이 기록을 놀이 추천에 쓰는 데 동의해요.
          <span className="mt-1 block text-xs text-muted">
            보호자가 동의한 경우에만 보관하고, 언제든 삭제할 수 있어요. 센터 공유는 보호자가 직접 켤 때만 이루어져요.
          </span>
        </span>
      </label>

      <Notice>진단을 위한 정보가 아니에요. 놀이를 고르는 데만 사용해요.</Notice>

      <PrimaryButton type="submit" disabled={!canSubmit}>
        다음
      </PrimaryButton>
    </form>
  );
}
