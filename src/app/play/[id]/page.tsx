import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { PageSkeleton } from "@/components/Skeleton";
import { Logo } from "@/components/Icon";
import { AreaChip, MetaChip, TimeChip } from "@/components/Chip";
import { Illustration } from "@/components/Illustration";
import { getPlay, PLAYS } from "@/lib/recommend";
import PlayCta from "./play-cta";
import SaveButton from "./save-button";
import RecommendReason from "./recommend-reason";

// 놀이는 data/plays.json에 고정 → 빌드할 때 카드 페이지를 미리 만들어 둠
export function generateStaticParams() {
  return PLAYS.map((p) => ({ id: p.id }));
}

// params는 Suspense 안에서 읽어야 화면 이동이 바로 됨 (cacheComponents)
export default function PlayDetailPage({ params }: PageProps<"/play/[id]">) {
  return (
    <Suspense fallback={<PageSkeleton withTab={false} />}>
      {params.then(({ id }) => (
        <PlayDetail id={id} />
      ))}
    </Suspense>
  );
}

function PlayDetail({ id }: { id: string }) {
  const play = getPlay(id);
  if (!play) notFound();
  const no = PLAYS.findIndex((p) => p.id === play.id) + 1;

  return (
    // 하단: 탭바 74 + CTA 52 + 여백
    <main className="flex-1 bg-paper px-5 pb-[calc(170px+env(safe-area-inset-bottom))]">
      <header className="flex h-14 items-center justify-between">
        <Link href="/" aria-label="홈으로">
          <Logo />
        </Link>
        <div className="flex items-center gap-1">
          <span className="text-[12px] font-semibold tracking-[0.04em] text-mute">TODAY · No.{no}</span>
          <SaveButton playId={play.id} />
        </div>
      </header>

      <div className="mt-3 flex flex-wrap gap-1.5">
        <AreaChip area={play.area} />
        <TimeChip minutes={play.minutes} />
        <MetaChip>{play.months[0]}개월 이상</MetaChip>
      </div>

      <h1 className="mt-3.5 text-balance font-display text-[30px] font-bold leading-[1.35] tracking-[-0.04em]">
        {play.title}
      </h1>
      <RecommendReason playId={play.id} />

      <Illustration height={170} variant="sage" seed={no} className="-mx-5 mt-6" />

      <section className="flex gap-3 border-b border-line py-[18px]">
        <h2 className="w-[52px] shrink-0 text-[13.5px] font-semibold text-sub">준비물</h2>
        <p className="text-[13.5px] font-medium leading-[1.55]">{play.materials.join(", ")}</p>
      </section>

      <section className="mt-6">
        <h2 className="text-[13px] font-semibold text-sub">이렇게 놀아요</h2>
        <ol className="mt-1">
          {play.steps.map((s, i) => (
            <li key={i} className="flex gap-3 border-b border-line py-3 text-[14.5px] font-medium leading-[1.5]">
              <span className="w-5 shrink-0 pt-px text-[13px] font-extrabold text-sage">
                {String(i + 1).padStart(2, "0")}
              </span>
              <span>{s}</span>
            </li>
          ))}
        </ol>
      </section>

      <section className="mt-3.5 flex flex-col gap-2.5">
        <h2 className="sr-only">아이가 어려워하면</h2>
        {play.tips.map((t) => (
          <p key={t} className="border-l-[3px] border-warm pl-3 text-[13px] font-medium leading-[1.55] text-sub">
            {t}
          </p>
        ))}
      </section>

      <p className="mt-8 text-[13px] font-medium text-sub">
        해 본 적 있나요?{" "}
        <Link href={`/community/write?board=review&playId=${play.id}`} className="font-semibold text-ink underline underline-offset-4">
          다른 부모에게 후기 남기기
        </Link>
      </p>

      <PlayCta playId={play.id} />
    </main>
  );
}
