"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { CheckAnswers, DevArea, Nuri, Score, TempItem } from "@/types";
import { DEV_QUESTIONS, LIKED_AREAS, NURI_AREAS, SCORE_LABELS, TEMP_QUESTIONS } from "@/lib/questions";
import { ageInYears, lowestArea, pickPlay, temperament } from "@/lib/recommend";
import { createCard, saveCheck, saveChild } from "@/lib/store";

const SCORES: Score[] = [1, 2, 3];
const TOTAL_ITEMS = DEV_QUESTIONS.length + TEMP_QUESTIONS.length;

export default function CheckPage() {
  const router = useRouter();
  const [nickname, setNickname] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [gender, setGender] = useState<"남" | "여" | null>(null);
  const [liked, setLiked] = useState<string[]>([]);
  const [concern, setConcern] = useState<Nuri | "모름" | null>(null);
  const [answers, setAnswers] = useState<Partial<CheckAnswers>>({});
  const [consent, setConsent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const answered = Object.keys(answers).length;

  function toggleLiked(a: string) {
    setLiked((prev) => (prev.includes(a) ? prev.filter((x) => x !== a) : [...prev, a]));
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!nickname.trim() || !birthDate) return setError("아이 애칭과 생년월일을 입력해 주세요.");
    if (answered < TOTAL_ITEMS) return setError(`체크 문항 ${TOTAL_ITEMS - answered}개가 남았어요.`);

    const full = answers as CheckAnswers;
    const concernNuri = concern === "모름" ? null : concern;
    const area = lowestArea(full, concernNuri);
    const play = pickPlay(area, ageInYears(birthDate));
    if (!play) return setError("지금은 추천할 수 있는 감수된 놀이가 없어요. 센터에 문의해 주세요.");

    const child = saveChild({
      nickname: nickname.trim(),
      birth_date: birthDate,
      gender,
      concern_nuri: concernNuri,
      liked_areas: liked,
      share_consent: consent,
    });
    saveCheck({ child_id: child.id, answers: full, temperament: temperament(full) });
    const card = createCard(child.id, play.id);
    router.push(`/card/${card.id}`);
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-bold">간편 체크</h1>
        <p className="mt-1 text-sm text-muted">평소 모습에 가장 가까운 것을 골라 주세요. 정답은 없어요.</p>
      </div>

      <Section title="아이 정보">
        <label className="flex flex-col gap-1 text-sm">
          애칭 <span className="text-xs text-muted">실명 대신 집에서 부르는 이름</span>
          <input
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            placeholder="예: 콩이"
            maxLength={20}
            className="h-11 rounded-xl border border-line bg-card px-3 text-base"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          생년월일
          <input
            type="date"
            value={birthDate}
            onChange={(e) => setBirthDate(e.target.value)}
            className="h-11 rounded-xl border border-line bg-card px-3 text-base"
          />
        </label>
        <div className="flex flex-col gap-1 text-sm">
          성별
          <div className="flex gap-2">
            {(["남", "여"] as const).map((g) => (
              <Chip key={g} on={gender === g} onClick={() => setGender(gender === g ? null : g)}>
                {g}아
              </Chip>
            ))}
          </div>
        </div>
      </Section>

      <Section title="좋아하는 놀이" desc="여러 개 골라도 돼요">
        <div className="flex flex-wrap gap-2">
          {LIKED_AREAS.map((a) => (
            <Chip key={a} on={liked.includes(a)} onClick={() => toggleLiked(a)}>
              {a}
            </Chip>
          ))}
        </div>
      </Section>

      <Section title="가장 걱정되는 영역" desc="누리과정 5영역 중 하나">
        <div className="flex flex-wrap gap-2">
          {[...NURI_AREAS, "모름" as const].map((n) => (
            <Chip key={n} on={concern === n} onClick={() => setConcern(n)}>
              {n === "모름" ? "잘 모르겠어요" : n}
            </Chip>
          ))}
        </div>
      </Section>

      <Section title="발달 체크" desc={`${answered} / ${TOTAL_ITEMS} 문항`}>
        {DEV_QUESTIONS.map((q, i) => (
          <ScoreItem
            key={q.key}
            no={i + 1}
            tag={q.label}
            text={q.text}
            value={answers[q.key]}
            onChange={(s) => setAnswers((a) => ({ ...a, [q.key as DevArea]: s }))}
          />
        ))}
      </Section>

      <Section title="기질 체크">
        {TEMP_QUESTIONS.map((q, i) => (
          <ScoreItem
            key={q.key}
            no={DEV_QUESTIONS.length + i + 1}
            text={q.text}
            value={answers[q.key]}
            onChange={(s) => setAnswers((a) => ({ ...a, [q.key as TempItem]: s }))}
          />
        ))}
      </Section>

      <label className="flex items-start gap-3 rounded-2xl border border-line bg-card p-4 text-sm">
        <input
          type="checkbox"
          checked={consent}
          onChange={(e) => setConsent(e.target.checked)}
          className="mt-0.5 size-5 accent-[var(--brand)]"
        />
        <span>
          다니는 센터와 체크 결과·놀이 기록을 공유하는 데 동의해요.
          <span className="block text-xs text-muted">동의하지 않으면 센터 확인 없이 부모님만 볼 수 있어요. 언제든 바꿀 수 있어요.</span>
        </span>
      </label>

      {error && <p className="rounded-xl bg-accent/15 px-4 py-3 text-sm">{error}</p>}

      <button type="submit" className="h-13 rounded-full bg-brand text-lg font-bold text-white dark:text-black">
        놀이 추천받기
      </button>
    </form>
  );
}

function Section({ title, desc, children }: { title: string; desc?: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-3">
      <div className="flex items-baseline justify-between">
        <h2 className="text-lg font-bold">{title}</h2>
        {desc && <span className="text-xs text-muted">{desc}</span>}
      </div>
      {children}
    </section>
  );
}

function Chip({ on, onClick, children }: { on: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={on}
      className={`h-10 rounded-full border px-4 text-sm transition-colors ${
        on ? "border-brand bg-brand-soft font-bold text-brand" : "border-line bg-card"
      }`}
    >
      {children}
    </button>
  );
}

function ScoreItem(props: {
  no: number;
  tag?: string;
  text: string;
  value: Score | undefined;
  onChange: (s: Score) => void;
}) {
  return (
    <fieldset className="rounded-2xl border border-line bg-card p-4">
      <legend className="sr-only">{props.text}</legend>
      <p className="text-sm">
        <span className="mr-2 font-bold text-brand">{props.no}</span>
        {props.tag && <span className="mr-2 rounded bg-brand-soft px-1.5 py-0.5 text-xs text-brand">{props.tag}</span>}
        {props.text}
      </p>
      <div className="mt-3 grid grid-cols-3 gap-2">
        {SCORES.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => props.onChange(s)}
            aria-pressed={props.value === s}
            className={`h-10 rounded-xl border text-xs ${
              props.value === s ? "border-brand bg-brand font-bold text-white dark:text-black" : "border-line"
            }`}
          >
            {SCORE_LABELS[s]}
          </button>
        ))}
      </div>
    </fieldset>
  );
}
