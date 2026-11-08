import { notFound } from "next/navigation";
import { Suspense } from "react";
import { PageSkeleton } from "@/components/Skeleton";
import { getPlay, PLAYS } from "@/lib/recommend";
import LogForm from "./log-form";

export function generateStaticParams() {
  return PLAYS.map((p) => ({ id: p.id }));
}

export default function PlayLogPage({ params }: PageProps<"/play/[id]/log">) {
  return (
    <Suspense fallback={<PageSkeleton withTab={false} />}>
      {params.then(({ id }) => {
        const play = getPlay(id);
        if (!play) notFound();
        return <LogForm playId={play.id} playTitle={play.title} area={play.area} />;
      })}
    </Suspense>
  );
}
