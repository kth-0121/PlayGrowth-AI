"use client";

import { currentChild, useLocalData } from "@/lib/local-store";

/** 이 놀이를 왜 추천했는지 (가장 최근 추천 기준) */
export default function RecommendReason({ playId }: { playId: string }) {
  const data = useLocalData();
  if (!data) return null;
  const child = currentChild(data);
  const rec = data.recommendations
    .filter((r) => r.playId === playId && r.childId === child?.id)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0];
  if (!child || !rec?.reason) return null;
  return (
    <p className="text-sm text-muted">
      {child.nickname}에게 추천한 이유: {rec.reason}
    </p>
  );
}
