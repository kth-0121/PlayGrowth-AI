// 화면 공통 UI 조각
import Link from "next/link";

export function PageTitle({ step, title, desc }: { step?: string; title: string; desc?: string }) {
  return (
    <div>
      {step && <p className="text-xs font-medium text-brand">{step}</p>}
      <h1 className="mt-1 text-2xl font-bold">{title}</h1>
      {desc && <p className="mt-1 text-sm text-muted">{desc}</p>}
    </div>
  );
}

export function Notice({ children, tone = "calm" }: { children: React.ReactNode; tone?: "calm" | "brand" }) {
  const cls = tone === "calm" ? "bg-calm-soft" : "bg-brand-soft";
  return <p className={`rounded-2xl px-4 py-3 text-sm leading-relaxed ${cls}`}>{children}</p>;
}

export function Box({ title, children }: { title?: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-line bg-card p-5">
      {title && <h2 className="mb-3 font-bold">{title}</h2>}
      {children}
    </section>
  );
}

const PRIMARY =
  "flex h-13 w-full items-center justify-center rounded-full bg-brand text-lg font-bold text-white disabled:opacity-40 dark:text-black";

export function PrimaryButton(props: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return <button {...props} className={PRIMARY} />;
}

export function PrimaryLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} className={PRIMARY}>
      {children}
    </Link>
  );
}

export function Choice({
  on,
  onClick,
  children,
  className = "",
}: {
  on: boolean;
  onClick: () => void;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={on}
      className={`rounded-xl border text-sm transition-colors ${
        on ? "border-brand bg-brand font-bold text-white dark:text-black" : "border-line bg-card"
      } ${className}`}
    >
      {children}
    </button>
  );
}

/** 이전 단계 데이터가 없을 때 */
export function MissingStep({ text, href, label }: { text: string; href: string; label: string }) {
  return (
    <div className="flex flex-col items-start gap-4">
      <p>{text}</p>
      <Link href={href} className="font-bold text-brand underline">
        {label}
      </Link>
    </div>
  );
}
