import { Suspense } from "react";
import LogForm from "./log-form";

export default function LogPage() {
  return (
    <Suspense fallback={<p className="text-muted">불러오는 중…</p>}>
      <LogForm />
    </Suspense>
  );
}
