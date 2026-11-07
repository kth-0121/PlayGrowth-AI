import Link from "next/link";

const STEPS = [
  { icon: "👶", title: "아이 정보", desc: "애칭과 생년월일만 있으면 돼요" },
  { icon: "📝", title: "발달 상태 확인", desc: "평소 모습을 떠올리며 답해 주세요" },
  { icon: "🧸", title: "맞춤 놀이", desc: "집에 있는 물건으로 10~20분" },
  { icon: "📷", title: "기록하기", desc: "기록이 쌓이면 다음 놀이가 더 잘 맞아요" },
];

export default function Home() {
  return (
    <div className="flex flex-col gap-8">
      <section className="rounded-3xl bg-brand-soft px-6 py-10">
        <p className="text-sm font-medium text-brand">센터를 기다리는 동안</p>
        <h1 className="mt-2 text-3xl font-bold leading-tight">집에서 함께하는 맞춤 놀이</h1>
        <p className="mt-3 text-muted">무엇을 해야 할지 막막할 때, 우리 아이에게 맞는 놀이를 알려 드려요.</p>
        <Link
          href="/child"
          className="mt-6 inline-flex h-12 items-center rounded-full bg-brand px-6 font-bold text-white dark:text-black"
        >
          시작하기
        </Link>
      </section>

      <ol className="grid gap-3">
        {STEPS.map((s) => (
          <li key={s.title} className="flex items-center gap-4 rounded-2xl border border-line bg-card px-5 py-4">
            <span className="text-2xl">{s.icon}</span>
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
