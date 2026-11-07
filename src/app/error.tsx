"use client";

import { ButtonLink } from "@/components/Button";
import { H1 } from "@/components/PageHeader";
import { ErrorState } from "@/components/StatusViews";

/** 화면을 그리다 오류가 났을 때 (기록은 이 기기에 그대로 있음) */
export default function Error({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="flex flex-1 flex-col gap-4 px-5 pb-10">
      <div className="h-8" aria-hidden />
      <H1>잠깐 문제가 생겼어요</H1>
      <ErrorState text="화면을 불러오지 못했어요. 남겨 둔 기록은 그대로 있어요." onRetry={reset} />
      <ButtonLink href="/" variant="secondary" full>
        홈으로
      </ButtonLink>
    </main>
  );
}
