"use client";

import { useState } from "react";
import { Button, ButtonLink } from "@/components/Button";

/** 탭바 바로 위에 고정된 dark CTA. 시작 → 마치면 기록 입력으로 */
export default function PlayCta({ playId }: { playId: string }) {
  const [started, setStarted] = useState(false);
  return (
    <div className="fixed bottom-[calc(74px+env(safe-area-inset-bottom)+12px)] left-1/2 z-20 w-full max-w-[480px] -translate-x-1/2 px-5">
      {started ? (
        <ButtonLink href={`/play/${playId}/log`} variant="dark" full>
          놀이 마치고 기록하기
        </ButtonLink>
      ) : (
        <Button variant="dark" full onClick={() => setStarted(true)}>
          놀이 시작하기
        </Button>
      )}
    </div>
  );
}
