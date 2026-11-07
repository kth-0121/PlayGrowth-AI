import { Suspense } from "react";
import CardView from "./card-view";

export default function CardPage() {
  return (
    <Suspense fallback={<p className="text-muted">놀이 카드를 불러오는 중…</p>}>
      <CardView />
    </Suspense>
  );
}
