"use client";

import { Bookmark, BookmarkCheck } from "lucide-react";
import { Icon } from "@/components/Icon";
import { toast } from "@/components/Toast";
import { toggleSaved, useLocalData } from "@/lib/local-store";

/** 놀이 저장(북마크). 놀이 탭의 '저장'에 모임 */
export default function SaveButton({ playId }: { playId: string }) {
  const data = useLocalData();
  const saved = !!data?.savedPlays.includes(playId);
  return (
    <button
      type="button"
      aria-pressed={saved}
      aria-label={saved ? "저장 취소" : "놀이 저장"}
      onClick={() => {
        toggleSaved(playId);
        toast(saved ? "저장을 취소했어요" : "놀이 탭의 '저장'에 담았어요");
      }}
      className={`pressable -mr-2.5 flex size-11 items-center justify-center ${saved ? "text-sage-dark" : "text-sub"}`}
    >
      <Icon icon={saved ? BookmarkCheck : Bookmark} size={20} />
    </button>
  );
}
