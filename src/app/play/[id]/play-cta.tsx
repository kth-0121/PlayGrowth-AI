"use client";

import { ButtonLink } from "@/components/Button";
import { useLocalData } from "@/lib/local-store";

/** 탭바 바로 위에 고정된 dark CTA → 놀이 진행 모드 */
export default function PlayCta({ playId }: { playId: string }) {
  const data = useLocalData();
  const resume = data?.progress[playId] !== undefined;
  return (
    <div className="fixed bottom-[calc(74px+env(safe-area-inset-bottom)+12px)] left-1/2 z-20 w-full max-w-[480px] -translate-x-1/2 px-5">
      <ButtonLink href={`/play/${playId}/go`} variant="dark" full>
        {resume ? "하던 곳부터 이어서 놀기" : "놀이 시작하기"}
      </ButtonLink>
    </div>
  );
}
