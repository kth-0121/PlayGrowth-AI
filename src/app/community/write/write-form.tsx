"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { ImagePlus } from "lucide-react";
import { BOARD_LABEL, type Board } from "@/types";
import { Button } from "@/components/Button";
import { Icon } from "@/components/Icon";
import { toast } from "@/components/Toast";
import { PageHeader } from "@/components/PageHeader";
import { currentChild, savePost, useLocalData } from "@/lib/local-store";
import { getPlay } from "@/lib/recommend";

const BOARDS: Board[] = ["review", "center", "worry"];
const INPUT =
  "rounded-[12px] border border-line bg-card px-4 text-[15px] font-medium outline-none placeholder:text-mute focus:border-sage focus:ring-[0.5px] focus:ring-sage";

export default function WriteForm() {
  const router = useRouter();
  const params = useSearchParams();
  const data = useLocalData();
  const initial = BOARDS.find((b) => b === params.get("board")) ?? "review";
  const playId = params.get("playId");
  const play = playId ? getPlay(playId) : undefined;

  const [board, setBoard] = useState<Board>(initial);
  const [title, setTitle] = useState(play ? `${play.title} 후기` : "");
  const [body, setBody] = useState("");
  const [photo, setPhoto] = useState(false);

  const ok = title.trim() !== "" && body.trim() !== "";

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!ok) return;
    const child = data ? currentChild(data) : null;
    savePost({
      board,
      nickname: child ? `${child.nickname}네` : "익명",
      title: title.trim(),
      body: body.trim(),
      playId: play?.id ?? null,
      unverified: false,
    });
    toast("글을 올렸어요");
    router.push("/community");
  }

  return (
    <form onSubmit={submit} className="flex flex-1 flex-col px-5 pb-[calc(32px+env(safe-area-inset-bottom))]">
      <PageHeader back title="글쓰기" />

      <div className="mt-2 grid grid-cols-3 gap-2">
        {BOARDS.map((b) => {
          const on = board === b;
          return (
            <button
              key={b}
              type="button"
              aria-pressed={on}
              onClick={() => setBoard(b)}
              className={`pressable min-h-11 rounded-[12px] px-1 text-[13px] font-semibold ${
                on ? "border-[1.5px] border-sage bg-sage-light text-sage-dark" : "border border-line bg-card text-sub"
              }`}
            >
              {BOARD_LABEL[b]}
            </button>
          );
        })}
      </div>

      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="제목"
        maxLength={60}
        className={`${INPUT} mt-5 h-[52px]`}
      />
      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder="놀이하면서 있었던 일, 궁금한 점을 나눠 주세요"
        rows={7}
        maxLength={2000}
        className={`${INPUT} mt-2.5 py-3.5 leading-[1.5]`}
      />
      <p className="mt-2 text-[12px] font-medium text-sub">실명이나 센터 이름은 쓰지 말아 주세요. 닉네임으로만 보여요.</p>

      <div className="mt-6 flex items-center gap-3">
        <label className="pressable flex size-16 shrink-0 cursor-pointer items-center justify-center rounded-[10px] border-[1.5px] border-dashed border-line bg-card text-sub">
          <Icon icon={ImagePlus} size={20} />
          <span className="sr-only">사진 추가</span>
          {/* TODO(DB 연결): 업로드 시 얼굴 흐림 처리 */}
          <input type="file" accept="image/*" className="sr-only" onChange={(e) => setPhoto(!!e.target.files?.length)} />
        </label>
        <span className="text-[13px] font-medium text-sub">{photo ? "사진 1장 선택됨" : "사진 추가 (선택)"}</span>
      </div>
      {photo && (
        <p className="mt-3 rounded-[12px] bg-sage-xlight px-4 py-3 text-[13px] font-medium leading-[1.55]">
          아이 얼굴이 보이는 사진은 흐림 처리를 권장해요.
        </p>
      )}

      <div className="mt-auto pt-8">
        <Button type="submit" full disabled={!ok}>
          글 올리기
        </Button>
      </div>
    </form>
  );
}
