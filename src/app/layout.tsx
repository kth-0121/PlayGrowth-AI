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
  title: "놀이다리",
  description: "센터를 기다리는 동안, 집에서 함께하는 맞춤 놀이",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ko" className={`${notoSansKr.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <header className="sticky top-0 z-10 border-b border-line bg-background/90 backdrop-blur">
          <div className="mx-auto flex h-14 max-w-xl items-center px-4">
            <Link href="/" className="text-lg font-bold text-brand">
              🌉 놀이다리
            </Link>
          </div>
        </header>
        <main className="mx-auto w-full max-w-xl flex-1 px-4 py-6">{children}</main>
        <footer className="mx-auto w-full max-w-xl px-4 pb-8 text-xs leading-relaxed text-muted">
          놀이다리는 의료 서비스가 아니며 발달지연이나 발달장애를 진단하지 않아요. 놀이 추천은 전문 평가와 치료를 대신하지
          않아요.
        </footer>
      </body>
    </html>
  );
}
