"use client";
// 로그인 확인. 홈(/)은 누구나, 나머지 화면은 로그인한 보호자만.
// 로그인하면 서버의 내 데이터를 불러오고, 로그아웃하면 이 기기의 캐시를 비움.
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import { clearLocal, syncFromServer } from "@/lib/local-store";
import { Button, TextButton } from "@/components/Button";
import { H1, PageHeader } from "@/components/PageHeader";

const INPUT =
  "h-[52px] w-full rounded-[12px] border border-line bg-card px-4 text-[15px] font-medium outline-none placeholder:text-mute focus:border-sage focus:ring-[0.5px] focus:ring-sage";

const PUBLIC = ["/", "/welcome"];

export default function AuthGate({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  const [session, setSession] = useState<Session | null | undefined>(undefined);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let syncedFor: string | null = null;
    const apply = async (s: Session | null) => {
      setSession(s);
      if (!s) {
        syncedFor = null;
        clearLocal();
        setReady(true);
        return;
      }
      if (syncedFor === s.user.id) return;
      syncedFor = s.user.id;
      setReady(false);
      try {
        await syncFromServer(s.user.id);
      } catch (e) {
        console.error("[noridari] 데이터 불러오기 실패", e);
      }
      setReady(true);
    };
    supabase.auth.getSession().then(({ data }) => apply(data.session));
    const { data } = supabase.auth.onAuthStateChange((_e, s) => void apply(s));
    return () => data.subscription.unsubscribe();
  }, []);

  if (PUBLIC.includes(path)) return children;
  if (session === undefined || (session && !ready)) return <main className="flex-1" />;
  if (!session) return <LoginForm />;
  return children;
}

function LoginForm() {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nickname, setNickname] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const { error } =
      mode === "login"
        ? await supabase.auth.signInWithPassword({ email, password })
        : await supabase.auth.signUp({ email, password, options: { data: { nickname: nickname.trim() } } });
    if (error) setError(mode === "login" ? "이메일이나 비밀번호를 다시 확인해 주세요." : error.message);
    setBusy(false);
  }

  return (
    <main className="flex flex-1 flex-col px-5 pb-10">
      <PageHeader logo />
      <form onSubmit={submit} className="mt-2 flex flex-col gap-4">
        <H1>{mode === "login" ? "로그인" : "가입하기"}</H1>
        <p className="text-[14px] font-medium text-sub">기록을 안전하게 저장하려면 로그인이 필요해요.</p>
        {mode === "signup" && (
          <label className="flex flex-col gap-2">
            <span className="text-[13px] font-semibold text-sub">닉네임 (커뮤니티에 보여요, 실명은 쓰지 마세요)</span>
            <input className={INPUT} value={nickname} onChange={(e) => setNickname(e.target.value)} required maxLength={20} />
          </label>
        )}
        <label className="flex flex-col gap-2">
          <span className="text-[13px] font-semibold text-sub">이메일</span>
          <input className={INPUT} type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </label>
        <label className="flex flex-col gap-2">
          <span className="text-[13px] font-semibold text-sub">비밀번호 (6자 이상)</span>
          <input
            className={INPUT}
            type="password"
            autoComplete={mode === "login" ? "current-password" : "new-password"}
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </label>
        {error && <p className="text-[13px] font-semibold text-joy">{error}</p>}
        <Button type="submit" full disabled={busy} className="mt-2">
          {busy ? "잠시만요…" : mode === "login" ? "로그인" : "가입하기"}
        </Button>
        <TextButton onClick={() => setMode(mode === "login" ? "signup" : "login")} className="self-center">
          {mode === "login" ? "처음이신가요? 가입하기" : "이미 가입했어요. 로그인"}
        </TextButton>
      </form>
    </main>
  );
}
