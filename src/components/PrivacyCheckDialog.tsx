"use client";

import { useEffect, useRef } from "react";
import { PRIVACY_CHECK_MESSAGE } from "@/lib/privacy";
import { Button } from "./Button";

/** 등록 직전 실명·기관명 확인 팝업. terms가 있으면 열림 */
export function PrivacyCheckDialog({
  terms,
  onEdit,
  onConfirm,
}: {
  terms: string[];
  onEdit: () => void; // 다시 확인할게요 (닫고 입력칸으로)
  onConfirm: () => void; // 그대로 올리기
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const open = terms.length > 0;

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      aria-labelledby="privacy-title"
      onCancel={(e) => {
        e.preventDefault();
        onEdit();
      }}
      className="m-auto w-[calc(100%-40px)] max-w-[400px] rounded-[22px] bg-card p-0 text-ink backdrop:bg-ink/40"
    >
      <div className="flex flex-col gap-4 px-5 pb-5 pt-6">
        <h2 id="privacy-title" className="text-[17px] font-extrabold leading-[1.45] tracking-[-0.02em]">
          잠깐, 한 번 더 확인해 주세요
        </h2>
        <p className="text-[14.5px] font-medium leading-[1.6] text-memo">{PRIVACY_CHECK_MESSAGE}</p>
        {open && (
          <ul aria-label="확인이 필요한 표현" className="flex flex-wrap gap-1.5">
            {terms.map((t) => (
              <li key={t} className="rounded-[8px] bg-warm px-2.5 py-1.5 text-[13px] font-bold leading-none">
                {t}
              </li>
            ))}
          </ul>
        )}
        <div className="mt-1 grid grid-cols-2 gap-2">
          <Button variant="secondary" onClick={onConfirm}>
            그대로 올리기
          </Button>
          <Button autoFocus onClick={onEdit}>
            다시 확인할게요
          </Button>
        </div>
      </div>
    </dialog>
  );
}
