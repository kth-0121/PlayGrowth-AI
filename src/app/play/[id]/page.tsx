import Link from "next/link";
import { notFound } from "next/navigation";
import { AREA_LABEL } from "@/types";
import { Box, PrimaryLink } from "@/components/ui";
import { getPlay, PLAYS } from "@/lib/recommend";
import RecommendReason from "./recommend-reason";

// 놀이는 data/plays.json에 고정 → 빌드할 때 카드 페이지를 미리 만들어 둠
export function generateStaticParams() {
  return PLAYS.map((p) => ({ id: p.id }));
}

const STEP_LABEL = { 1: "쉬운 단계", 2: "중간 단계", 3: "도전 단계" } as const;

export default async function PlayCardPage({ params }: PageProps<"/play/[id]">) {
  const { id } = await params;
  const play = getPlay(id);
  if (!play) notFound();

  return (
    <article className="flex flex-col gap-5">
      <header className="flex flex-col gap-2">
        <p className="text-xs font-medium text-brand">3 / 4 · 오늘의 놀이</p>
        <h1 className="text-2xl font-bold">{play.title}</h1>
        <div className="flex flex-wrap gap-2 text-xs">
          <Tag strong>🎯 {AREA_LABEL[play.area]}</Tag>
          <Tag>⏱ {play.minutes}분</Tag>
          <Tag>{STEP_LABEL[play.step]}</Tag>
        </div>
        <RecommendReason playId={play.id} />
      </header>

      <Box title="준비물">
        <ul className="flex flex-wrap gap-2">
          {play.materials.map((m) => (
            <li key={m} className="rounded-full bg-brand-soft px-3 py-1.5 text-sm">
              {m}
            </li>
          ))}
        </ul>
        <p className="mt-3 text-xs text-muted">집에 있는 다른 물건으로 바꿔도 괜찮아요.</p>
      </Box>

      <Box title="이렇게 해 봐요">
        <ol className="flex flex-col gap-3">
          {play.steps.map((s, i) => (
            <li key={i} className="flex gap-3">
              <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-calm text-sm font-bold text-white dark:text-black">
                {i + 1}
              </span>
              <span className="pt-0.5 text-sm leading-relaxed">{s}</span>
            </li>
          ))}
        </ol>
      </Box>

      <Box title="아이가 어려워하면">
        <ul className="flex flex-col gap-2">
          {play.tips.map((t) => (
            <li key={t} className="rounded-xl bg-calm-soft px-4 py-2.5 text-sm leading-relaxed">
              💡 {t}
            </li>
          ))}
        </ul>
      </Box>

      <p className="text-center text-xs text-muted">치료나 훈련이 아니에요. 아이와 함께 즐기는 게 가장 중요해요.</p>

      <div className="flex flex-col gap-3">
        <PrimaryLink href={`/play/${play.id}/log`}>놀이 해 보고 기록하기</PrimaryLink>
        {/* 커뮤니티 글쓰기(기록·리포트·커뮤니티 담당)로 연결. 경로는 해당 화면과 맞출 것 */}
        <Link
          href={`/community/write?board=review&playId=${play.id}`}
          className="flex h-12 items-center justify-center rounded-full border border-line bg-card font-bold"
        >
          ✏️ 후기 쓰기
        </Link>
      </div>
    </article>
  );
}

function Tag({ children, strong }: { children: React.ReactNode; strong?: boolean }) {
  return (
    <span className={`rounded-full px-3 py-1 ${strong ? "bg-brand text-white dark:text-black" : "bg-card ring-1 ring-line"}`}>
      {children}
    </span>
  );
}
