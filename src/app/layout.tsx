import type { Metadata } from "next";
import { Noto_Sans_KR } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const notoSansKr = Noto_Sans_KR({
  variable: "--font-noto-kr",
  weight: ["400", "500", "700"],
  preload: false,
});

export const metadata: Metadata = {
  title: "하루놀이",
  description: "센터에서 집까지, 하루 10분 놀이",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ko" className={`${notoSansKr.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <header className="sticky top-0 z-10 border-b border-line bg-background/90 backdrop-blur">
          <div className="mx-auto flex h-14 max-w-xl items-center px-4">
            <Link href="/" className="text-lg font-bold text-brand">
              🌱 하루놀이
            </Link>
          </div>
        </header>
        <main className="mx-auto w-full max-w-xl flex-1 px-4 py-6">{children}</main>
        <footer className="mx-auto w-full max-w-xl px-4 pb-8 text-xs text-muted">
          선별·놀이 참고용이며 진단·치료를 대체하지 않습니다. 기록 공유는 부모 동의 후에만 이루어집니다.
        </footer>
      </body>
    </html>
  );
}
