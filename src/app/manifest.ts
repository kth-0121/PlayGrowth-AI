// 홈 화면에 추가하면 주소창 없이 앱처럼 열림
import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "놀이다리",
    short_name: "놀이다리",
    description: "센터를 기다리는 동안, 집에서 아이와 함께하는 하루 놀이",
    start_url: "/",
    display: "standalone",
    background_color: "#f3f5f4",
    theme_color: "#3f8f6e",
    lang: "ko",
    icons: [
      { src: "/icon/192", sizes: "192x192", type: "image/png" },
      { src: "/icon/512", sizes: "512x512", type: "image/png" },
      { src: "/icon/512", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
