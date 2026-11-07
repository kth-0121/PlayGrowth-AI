import { ButtonLink } from "./Button";
import { Illustration } from "./Illustration";

/** 일러스트 + 한 줄 설명 + 버튼 하나 */
export function EmptyState({ text, action, href }: { text: string; action: string; href: string }) {
  return (
    <div className="overflow-hidden rounded-[22px] bg-card">
      <Illustration height={140} seed={2} />
      <div className="flex flex-col gap-4 px-[18px] pb-[18px] pt-4">
        <p className="text-[14px] font-medium leading-[1.5] text-sub">{text}</p>
        <ButtonLink href={href} full>
          {action}
        </ButtonLink>
      </div>
    </div>
  );
}
