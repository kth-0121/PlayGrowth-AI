import { ButtonLink } from "@/components/Button";
import { Logo } from "@/components/Icon";
import { Illustration } from "@/components/Illustration";
import { H1 } from "@/components/PageHeader";

export default function NotFound() {
  return (
    <main className="flex flex-1 flex-col px-5 pb-10">
      <header className="flex h-14 items-center">
        <Logo />
      </header>
      <div className="mt-4 overflow-hidden rounded-[22px] bg-card">
        <Illustration height={140} seed={2} />
        <div className="px-[18px] pb-[18px] pt-4">
          <H1>찾는 화면이 없어요</H1>
          <p className="mt-1.5 text-[13.5px] font-medium leading-[1.55] text-sub">주소가 바뀌었거나 지워진 화면이에요.</p>
          <ButtonLink href="/" full className="mt-4">
            홈으로
          </ButtonLink>
        </div>
      </div>
    </main>
  );
}
