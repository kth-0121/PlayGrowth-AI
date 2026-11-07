"use client";
// MY > 관심 놀이·영역 바꾸기. 저장하면 바꾼 관심으로 오늘의 놀이를 다시 골라 홈으로 감
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { ChildPrefs } from "@/types";
import { Button } from "@/components/Button";
import { EmptyState } from "@/components/EmptyState";
import { H1, PageHeader } from "@/components/PageHeader";
import { PrefsPicker } from "@/components/PrefsPicker";
import { ageInMonths } from "@/lib/age";
import { callName } from "@/lib/copy";
import {
  childPrefs,
  currentChild,
  latestSurvey,
  saveChildPrefs,
  saveRecommendation,
  useLocalData,
} from "@/lib/local-store";
import { firstRecommendation } from "@/lib/recommend";

export default function PrefsPage() {
  const data = useLocalData();
  if (!data) return <main className="flex-1" />;
  const child = currentChild(data);
  if (!child) {
    return (
      <main className="flex flex-1 flex-col gap-6 px-5 pb-10">
        <PageHeader back />
        <EmptyState text="아이 정보를 먼저 입력해 주세요." action="아이 정보 입력" href="/onboarding" />
      </main>
    );
  }
  // 아이가 바뀌면 처음 값부터 다시 (key)
  return <PrefsForm key={child.id} data={data} />;
}

function PrefsForm({ data }: { data: NonNullable<ReturnType<typeof useLocalData>> }) {
  const router = useRouter();
  const child = currentChild(data)!;
  const [prefs, setPrefs] = useState<ChildPrefs>(childPrefs(child));

  function save() {
    saveChildPrefs(child.id, prefs);
    const survey = latestSurvey(data, child.id);
    const pick = firstRecommendation(survey?.result ?? null, ageInMonths(child.birthDate), undefined, prefs);
    if (pick) saveRecommendation({ childId: child.id, playId: pick.play.id, reason: `바꾼 관심을 반영했어요 · ${pick.reason}` });
    router.push("/");
  }

  return (
    <main className="flex flex-1 flex-col px-5 pb-[calc(32px+env(safe-area-inset-bottom))]">
      <PageHeader back title="관심 놀이·영역" />
      <H1 className="mt-2">{`${callName(child.nickname)}에 대해\n조금 더 알려 주세요`}</H1>
      <p className="mt-2 text-[13.5px] font-medium leading-[1.55] text-sub">
        저장하면 오늘의 놀이를 다시 골라요. 지난 기록은 그대로 남아요.
      </p>
      <div className="mt-6">
        <PrefsPicker value={prefs} onChange={setPrefs} />
      </div>
      <div className="mt-auto pt-8">
        <Button full onClick={save}>
          저장
        </Button>
      </div>
    </main>
  );
}
