import { notFound } from "next/navigation";
import { getPlay, PLAYS } from "@/lib/recommend";
import LogForm from "./log-form";

export function generateStaticParams() {
  return PLAYS.map((p) => ({ id: p.id }));
}

export default async function PlayLogPage({ params }: PageProps<"/play/[id]/log">) {
  const { id } = await params;
  const play = getPlay(id);
  if (!play) notFound();
  return <LogForm playId={play.id} playTitle={play.title} />;
}
