import Link from "next/link";
import { Plus } from "lucide-react";
import { Icon } from "./Icon";

type Variant = "primary" | "secondary" | "dark";

const BASE = "pressable inline-flex items-center justify-center gap-1.5 whitespace-nowrap font-bold disabled:pointer-events-none disabled:opacity-40";
const VARIANT: Record<Variant, string> = {
  primary: "h-12 rounded-[13px] bg-sage px-5 text-[15px] text-white active:bg-sage-dark hover:bg-sage-dark",
  secondary: "h-12 rounded-[13px] bg-neutral-chip px-5 text-[15px] text-sub",
  dark: "h-[52px] rounded-[14px] bg-ink px-5 text-[15px] text-white",
};

export function buttonClass(variant: Variant = "primary", full = false, extra = "") {
  return `${BASE} ${VARIANT[variant]} ${full ? "w-full" : ""} ${extra}`;
}

type Common = { variant?: Variant; full?: boolean; className?: string };

export function Button({
  variant = "primary",
  full,
  className = "",
  ...rest
}: Common & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return <button type="button" {...rest} className={buttonClass(variant, full, className)} />;
}

export function ButtonLink({
  href,
  variant = "primary",
  full,
  className = "",
  children,
}: Common & { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} className={buttonClass(variant, full, className)}>
      {children}
    </Link>
  );
}

/** 텍스트만 있는 보조 동작 (이전으로 등) */
export function TextButton({ className = "", ...rest }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      {...rest}
      className={`pressable min-h-11 px-2 text-[14px] font-semibold text-sub disabled:opacity-40 ${className}`}
    />
  );
}

/** 탭바 위에 떠 있는 버튼 (기록 화면·커뮤니티) */
export function Fab({ href, label }: { href: string; label: string }) {
  return (
    <div className="pointer-events-none fixed bottom-[calc(74px+env(safe-area-inset-bottom)+16px)] left-1/2 z-20 flex w-full max-w-[480px] -translate-x-1/2 justify-end px-5">
      <Link
        href={href}
        className="pressable pointer-events-auto inline-flex items-center gap-1 rounded-full bg-sage px-[18px] py-[14px] text-[14.5px] font-bold text-white shadow-fab"
      >
        <Icon icon={Plus} size={18} />
        {label}
      </Link>
    </div>
  );
}
