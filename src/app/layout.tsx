import type { Metadata, Viewport } from "next";
import { Gowun_Batang } from "next/font/google";
import { Suspense } from "react";
import TabBar from "@/components/TabBar";
import "./globals.css";
import AuthGate from "@/components/auth-gate";

// 포인트 폰트: 놀이 상세 제목에만 사용 (font-display 클래스)
const gowunBatang = Gowun_Batang({
  variable: "--font-gowun-batang",
  weight: "700",
  preload: false,
});

export const metadata: Metadata = {
  title: "놀이다리",
  description: "센터를 기다리는 동안, 집에서 아이와 함께하는 하루 놀이",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ko" className={gowunBatang.variable}>
      <head>
        {/* 기본 폰트: Pretendard */}
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.min.css"
        />
      </head>
      <body className="min-h-dvh">
        {/* 데스크톱에서는 480px 앱 화면처럼 가운데 정렬 */}
        <div className="relative mx-auto flex min-h-dvh w-full max-w-[480px] flex-col bg-bg">
          <AuthGate>{children}</AuthGate>
          <Suspense fallback={null}>
            <TabBar />
          </Suspense>
        </div>
      </body>
    </html>
  );
}
