"use client";

import { useSyncExternalStore } from "react";
import { WifiOff } from "lucide-react";
import { Button } from "./Button";
import { Icon } from "./Icon";
import { Illustration } from "./Illustration";

/** 오류 상태: 무엇이 안 됐는지 + 다시 시도 */
export function ErrorState({ text, onRetry }: { text: string; onRetry?: () => void }) {
  return (
    <div className="overflow-hidden rounded-[22px] bg-card">
      <Illustration height={120} seed={1} />
      <div className="flex flex-col gap-4 px-[18px] pb-[18px] pt-4">
        <p className="text-[14px] font-medium leading-[1.5] text-sub">{text}</p>
        {onRetry && (
          <Button full onClick={onRetry}>
            다시 시도
          </Button>
        )}
      </div>
    </div>
  );
}

/** 결과 없음 (첫 사용과 구분: 그림 없이 한 줄) */
export function NoResult({ text, action }: { text: string; action?: React.ReactNode }) {
  return (
    <div className="rounded-[18px] bg-card px-[18px] py-5">
      <p className="text-[14px] font-medium leading-[1.5] text-sub">{text}</p>
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}

function subscribe(cb: () => void) {
  window.addEventListener("online", cb);
  window.addEventListener("offline", cb);
  return () => {
    window.removeEventListener("online", cb);
    window.removeEventListener("offline", cb);
  };
}

/** 오프라인 안내 (지금은 이 기기에 저장하므로 기록은 계속 가능) */
export function OfflineBanner() {
  const online = useSyncExternalStore(subscribe, () => navigator.onLine, () => true);
  if (online) return null;
  return (
    <p role="status" className="no-print flex items-center gap-2 bg-ink px-5 py-2.5 text-[13px] font-semibold text-white">
      <Icon icon={WifiOff} size={16} />
      인터넷 연결이 끊겼어요. 기록은 이 기기에 저장되고 있어요.
    </p>
  );
}
