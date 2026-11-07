"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import type { CardStatus } from "@/types";
import { DEV_LABEL, REACTION_LABEL } from "@/lib/questions";
import { getPlay } from "@/lib/recommend";
import { selectCard, useDB } from "@/lib/store";
import { LOW_RECOVERY_TIP, TEMPERAMENT_TIPS } from "@/lib/temperament-tips";

const STATUS: Record<CardStatus, { label: string; cls: string }> = {
  draft: { label: "센터 확인 전 · 미리보기", cls: "bg-accent/20" },
  confirmed: { label: "센터 확인 완료", cls: "bg-brand-soft text-brand" },
  sent: { label: "센터에서 보낸 카드", cls: "bg-brand text-white dark:text-black" },
};

export default function CardView() {
  const { id } = useParams<{ id: string }>();
  const db = useDB();
  if (!db) return <p className="text-muted">놀이 카드를 불러오는 중…</p>;

  const data = selectCard(db, id);
  const play = data && getPlay(data.card.play_id);
  if (!data || !play) {
    return (
      <div className="flex flex-col items-start gap-4">
        <p>카드를 찾을 수 없어요.</p>
        <Link href="/check" className="text-brand underline">
          간편 체크 다시 하기
        </Link>
      </div>
    );
  }

  const { card, child, check, logs } = data;
  const status = STATUS[card.status];
  const temp = check ? TEMPERAMENT_TIPS[check.temperament] : null;
  const totalMin = play.steps.reduce((s, x) => s + x.minutes, 0);

  return (
    <article className="flex flex-col gap-6">
      <header className="flex flex-col gap-2">
        <span className={`self-start rounded-full px-3 py-1 text-xs font-medium ${status.cls}`}>{status.label}</span>
        <p className="text-sm text-muted">{child?.nickname ?? "우리 아이"}를 위한 오늘의 놀이</p>
        <h1 className="text-2xl font-bold">{play.title}</h1>
        <div className="flex flex-wrap gap-2 text-xs">
          <Tag>{DEV_LABEL[play.area]}</Tag>
          <Tag>누리과정 · {play.nuri}</Tag>
          <Tag>{play.level}</Tag>
          <Tag>약 {totalMin}분</Tag>
        </div>
      </header>

      {card.center_note && (
        <Box title="센터 선생님 메모">
          <p className="text-sm">{card.center_note}</p>
        </Box>
      )}

      <Box title="준비물">
        <ul className="flex flex-wrap gap-2">
          {play.materials.map((m) => (
            <li key={m} className="rounded-full border border-line px-3 py-1 text-sm">
              {m}
            </li>
          ))}
        </ul>
      </Box>

      <Box title="놀이 순서">
        <ol className="flex flex-col gap-3">
          {play.steps.map((s, i) => (
            <li key={i} className="flex gap-3">
              <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-brand-soft text-sm font-bold text-brand">
                {i + 1}
              </span>
              <div className="flex-1 text-sm">
                {s.text}
                <span className="ml-2 text-xs text-muted">{s.minutes}분</span>
              </div>
            </li>
          ))}
        </ol>
      </Box>

      <Box title="이렇게 말을 건네 보세요">
        <ul className="flex flex-col gap-2">
          {play.questions.map((q) => (
            <li key={q} className="rounded-xl bg-brand-soft px-4 py-2 text-sm">
              “{q}”
            </li>
          ))}
        </ul>
      </Box>

      <Box title="발달 포인트">
        <ul className="list-disc pl-5 text-sm">
          {play.points.map((p) => (
            <li key={p}>{p}</li>
          ))}
        </ul>
      </Box>

      {temp && check && (
        <Box title={`${check.temperament} 아이를 위한 팁`}>
          <p className="mb-2 text-xs text-muted">{temp.summary}</p>
          <ul className="list-disc pl-5 text-sm">
            {temp.tips.map((t) => (
              <li key={t}>{t}</li>
            ))}
            {check.answers.recovery === 1 && <li>{LOW_RECOVERY_TIP}</li>}
          </ul>
        </Box>
      )}

      <Box title="잘 되면 다음 단계">
        <p className="text-sm">{play.next}</p>
      </Box>

      {logs.length > 0 && (
        <Box title="우리 집 기록">
          <ul className="flex flex-col gap-2 text-sm">
            {logs.map((l) => (
              <li key={l.id} className="flex flex-col">
                <span className="font-bold">
                  {REACTION_LABEL[l.reaction]}{" "}
                  <span className="font-normal text-xs text-muted">{new Date(l.created_at).toLocaleString("ko-KR")}</span>
                </span>
                {l.memo && <span className="text-muted">{l.memo}</span>}
              </li>
            ))}
          </ul>
        </Box>
      )}

      <Link
        href={`/card/${card.id}/log`}
        className="flex h-13 items-center justify-center rounded-full bg-brand text-lg font-bold text-white dark:text-black"
      >
        놀이 해 보고 기록하기
      </Link>
    </article>
  );
}

function Tag({ children }: { children: React.ReactNode }) {
  return <span className="rounded-full bg-card px-2.5 py-1 ring-1 ring-line">{children}</span>;
}

function Box({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-line bg-card p-5">
      <h2 className="mb-3 font-bold">{title}</h2>
      {children}
    </section>
  );
}
