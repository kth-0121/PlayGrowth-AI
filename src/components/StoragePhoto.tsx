"use client";
// 비공개 사진(Storage 경로)을 잠깐 볼 수 있는 주소로 바꿔 보여줌
import { useEffect, useState } from "react";
import { photoUrl } from "@/lib/supabase";

export function StoragePhoto({ path }: { path: string }) {
  const [url, setUrl] = useState<string | null>(null);
  useEffect(() => {
    photoUrl(path).then(setUrl);
  }, [path]);
  if (!url) return <span className="size-16 rounded-[10px] bg-illu-1" />;
  // eslint-disable-next-line @next/next/no-img-element -- 서명된 Storage 주소
  return <img src={url} alt="기록 사진" className="size-16 rounded-[10px] object-cover" />;
}
