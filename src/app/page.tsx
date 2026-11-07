import Link from "next/link";

const STEPS = [
  { n: "①", title: "간편 체크", desc: "9문항, 3분이면 끝나요" },
  { n: "②", title: "놀이 추천", desc: "아이 수준에 맞는 놀이 카드" },
  { n: "③", title: "센터 확인", desc: "치료사가 검토해서 보내 드려요" },
  { n: "④", title: "집에서 실천·기록", desc: "반응을 남기면 다음 추천에 반영돼요" },
];

export default function Home() {
  return (
    <div className="flex flex-col gap-8">
      <section className="rounded-3xl bg-brand-soft px-6 py-10">
        <p className="text-sm font-medium text-brand">센터에서 집까지</p>
        <h1 className="mt-2 text-3xl font-bold leading-tight">하루 10분 놀이</h1>
        <p className="mt-3 text-muted">
          치료를 기다리는 동안, 집에서 무엇을 하면 좋을지 아이 수준에 맞춰 알려 드려요.
        </p>
        <Link
          href="/check"
          className="mt-6 inline-flex h-12 items-center rounded-full bg-brand px-6 font-bold text-white dark:text-black"
        >
          간편 체크 시작하기
        </Link>
      </section>

      <ol className="grid gap-3">
        {STEPS.map((s) => (
          <li key={s.n} className="flex items-center gap-4 rounded-2xl border border-line bg-card px-5 py-4">
            <span className="text-xl text-brand">{s.n}</span>
            <div>
              <p className="font-bold">{s.title}</p>
              <p className="text-sm text-muted">{s.desc}</p>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
