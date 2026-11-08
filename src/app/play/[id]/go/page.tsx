import { notFound } from "next/navigation";
import { Suspense } from "react";
import { PageSkeleton } from "@/components/Skeleton";
import { getPlay, PLAYS } from "@/lib/recommend";
import PlayGo from "./play-go";

export function generateStaticParams() {
  return PLAYS.map((p) => ({ id: p.id }));
}

export default function PlayGoPage({ params }: PageProps<"/play/[id]/go">) {
  return (
    <Suspense fallback={<PageSkeleton withTab={false} />}>
      {params.then(({ id }) => {
        const play = getPlay(id);
        if (!play) notFound();
        return <PlayGo play={play} />;
      })}
    </Suspense>
  );
}
