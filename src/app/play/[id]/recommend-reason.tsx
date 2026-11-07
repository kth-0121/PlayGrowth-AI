"use client";

import { callName } from "@/lib/copy";
import { currentChild, useLocalData } from "@/lib/local-store";

/** 이 놀이를 고른 이유 (가장 최근 추천 기준) */
export default function RecommendReason({ playId }: { playId: string }) {
  const data = useLocalData();
  if (!data) return null;
  const child = currentChild(data);
  const rec = data.recommendations
    .filter((r) => r.playId === playId && r.childId === child?.id)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0];
  if (!child || !rec?.reason) return null;
  return (
    <p className="mt-2 text-[13.5px] font-medium leading-[1.55] text-sub">
      {callName(child.nickname)}에게 고른 이유 · {rec.reason}
    </p>
  );
}
