"use client";

import { AREA_LABEL } from "@/types";
import { TimeChip } from "@/components/Chip";
import { ListGroup, ListRow } from "@/components/ListRow";
import { H1, PageHeader } from "@/components/PageHeader";
import { TAB_SAFE } from "@/components/TabBar";
import { ageInMonths } from "@/lib/age";
import { callName } from "@/lib/copy";
import { currentChild, useLocalData } from "@/lib/local-store";
import { PLAYS, playsForMonths } from "@/lib/recommend";

const STEP_LABEL = { 1: "1단계", 2: "2단계", 3: "3단계" } as const;

export default function PlayListPage() {
  const data = useLocalData();
  const child = data ? currentChild(data) : null;
  const plays = child ? playsForMonths(ageInMonths(child.birthDate)) : PLAYS;

  return (
    <main className={`flex flex-1 flex-col px-5 ${TAB_SAFE}`}>
      <PageHeader logo />
      <div className="mt-2 flex items-baseline justify-between gap-3">
        <H1>놀이 모음</H1>
        <span className="text-[13px] font-medium text-sub">{plays.length}개</span>
      </div>
      <p className="mt-1 text-[13.5px] font-medium text-sub">
        {child ? `${callName(child.nickname)} 월령에 맞는 놀이만 모았어요.` : "집에 있는 물건으로 하는 10~20분 놀이예요."}
      </p>

      <ListGroup className="mt-5">
        {plays.map((p) => (
          <ListRow key={p.id} href={`/play/${p.id}`} chevron trailing={<TimeChip minutes={p.minutes} />}>
            <p className="truncate text-[15px] font-bold">{p.title}</p>
            <p className="mt-0.5 text-[12.5px] font-medium text-sub">
              {AREA_LABEL[p.area]} · {STEP_LABEL[p.step]} · {p.materials[0]}
            </p>
          </ListRow>
        ))}
      </ListGroup>
    </main>
  );
}
