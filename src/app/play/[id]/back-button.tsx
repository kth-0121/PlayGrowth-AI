"use client";

import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { Icon } from "@/components/Icon";

export default function BackButton() {
  const router = useRouter();
  return (
    <button
      type="button"
      onClick={() => (history.length > 1 ? router.back() : router.push("/"))}
      aria-label="뒤로"
      className="pressable -ml-2.5 flex size-11 items-center justify-center text-ink"
    >
      <Icon icon={ChevronLeft} size={22} />
    </button>
  );
}
