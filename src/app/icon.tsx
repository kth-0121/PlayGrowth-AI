// 앱 아이콘 (탭·홈 화면·설치 아이콘). 놀이다리 로고의 다리 모양을 sage 배경에 그림
import { ImageResponse } from "next/og";

export const contentType = "image/png";

export function generateImageMetadata() {
  return [
    { id: "192", size: { width: 192, height: 192 }, contentType },
    { id: "512", size: { width: 512, height: 512 }, contentType },
  ];
}

export default async function Icon({ id }: { id: Promise<string> }) {
  const px = Number(await id);
  return new ImageResponse(<BridgeMark px={px} />, { width: px, height: px });
}

export function BridgeMark({ px }: { px: number }) {
  return (
    <div style={{ width: px, height: px, display: "flex", alignItems: "center", justifyContent: "center", background: "#3f8f6e" }}>
      <svg width={px * 0.6} height={px * 0.6 * (12 / 22)} viewBox="1 8 22 12" fill="none" stroke="#ffffff" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 18h20" />
        <path d="M3 18C6 9 18 9 21 18" />
        <path d="M8 18v-6.2M12 18v-7.5M16 18v-6.2" />
      </svg>
    </div>
  );
}
