"use client";

import { ButtonLink, TextButton } from "./Button";
import { Logo } from "./Icon";
import { Illustration } from "./Illustration";
import { ListGroup, ListRow } from "./ListRow";
import { H1 } from "./PageHeader";
import { seedDemo } from "@/mocks/demo";
import { TAB_SAFE } from "./TabBar";

const NEXT_STEPS = [
  { title: "집에 있는 물건으로 10~20분 놀이", desc: "냄비 뚜껑, 빨래집게, 이불처럼 지금 있는 것으로" },
  { title: "사진 한 장, 메모 한 줄로 기록", desc: "반응을 남기면 다음 놀이가 더 잘 맞아요" },
  { title: "상담 날 보여 줄 기록 정리", desc: "기간을 골라 센터 선생님께 보여 줄 수 있어요" },
];

/** 비로그인·첫 방문 화면 */
export function Landing() {
  return (
    <main className={`flex flex-1 flex-col px-5 ${TAB_SAFE}`}>
      <header className="flex h-14 items-center">
        <Logo />
      </header>

      <H1 className="mt-4">{"센터를 기다리는 동안,\n집에서 하루 15분 놀이해요"}</H1>
      <p className="mt-2 text-[14px] font-medium leading-[1.5] text-sub">
        아이의 요즘 모습에 맞는 놀이를 고르고, 해 본 기록을 상담까지 이어 드려요.
      </p>

      {/* 첫 단계만 크게: 지금 바로 할 일 */}
      <section className="mt-6 overflow-hidden rounded-[22px] bg-card">
        <Illustration height={150} seed={0} />
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

      <h2 className="mt-7 text-[13px] font-semibold text-sub">그다음에는</h2>
      <ListGroup className="mt-2">
        {NEXT_STEPS.map((s, i) => (
          <ListRow key={s.title}>
            <div className="flex gap-3">
              <span className="w-5 shrink-0 text-[13px] font-extrabold text-sage-dark">{String(i + 2).padStart(2, "0")}</span>
              <div>
                <p className="text-[15px] font-bold leading-[1.4]">{s.title}</p>
                <p className="mt-0.5 text-[13px] font-medium text-sub">{s.desc}</p>
              </div>
            </div>
          </ListRow>
        ))}
      </ListGroup>

      <TextButton onClick={seedDemo} className="mt-4 self-start">
        예시 데이터로 먼저 둘러보기
      </TextButton>

      <p className="mt-auto pt-8 text-[12px] font-medium leading-[1.6] text-sub">
        놀이다리는 의료 서비스가 아니에요. 진단이나 치료를 대신하지 않고, 집에서 함께 놀 거리를 고르는 걸 도와요. 걱정되는
        모습이 있으면 전문기관 상담을 안내해 드려요.
      </p>
    </main>
  );
}
