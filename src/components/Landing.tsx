"use client";

import { ButtonLink } from "./Button";
import { PlayArt } from "./PlayArt";

/** 비로그인·첫 방문 화면: 할 일은 "아이 정보 입력" 하나. 위에서부터 쌓고 남는 공간은 여백으로 둠 */
export function Landing() {
  return (
    <main className="flex flex-1 flex-col px-5 pb-[calc(74px+env(safe-area-inset-bottom)+16px)]">
      <h1 className="mt-12 text-[27px] font-extrabold leading-[1.3] tracking-[-0.035em] text-ink">
        집에서 하루 <span className="text-sage">15분</span>,
        <br />
        아이와 놀이해요
      </h1>
      <p className="mt-2 text-[14px] font-medium leading-[1.5] text-sub">요즘 아이 모습에 맞는 놀이를 골라 드려요.</p>

      <section className="mt-6 overflow-hidden rounded-[22px] bg-card">
        <PlayArt play={{ id: "lang-sound-1", area: "lang", title: "냄비 뚜껑으로 소리 따라 하기" }} height={150} />
        <div className="px-[18px] pb-[18px] pt-4">
          <p className="text-[12px] font-semibold text-sage-dark">처음 할 일 · 3분</p>
          <h2 className="mt-1 text-[18px] font-bold leading-[1.3] tracking-[-0.03em]">아이 정보와 질문 9개</h2>
          <p className="mt-1 text-[13.5px] font-medium leading-[1.55] text-sub">
            애칭과 생년월일, 요즘 모습에 대한 질문에 답하면 첫 놀이가 정해져요.
          </p>
          <ButtonLink href="/onboarding" full className="mt-4">
            아이 정보 입력
          </ButtonLink>
        </div>
      </section>
    </main>
  );
}
