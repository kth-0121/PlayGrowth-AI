import { Suspense } from "react";
import WriteForm from "./write-form";

export default function CommunityWritePage() {
  return (
    <Suspense fallback={<main className="flex-1" />}>
      <WriteForm />
    </Suspense>
  );
}
