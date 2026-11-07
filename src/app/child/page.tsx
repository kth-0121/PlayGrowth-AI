import { redirect } from "next/navigation";

// 아이 정보 입력은 온보딩 첫 단계로 옮겨졌습니다.
export default function ChildPage() {
  redirect("/onboarding");
}
