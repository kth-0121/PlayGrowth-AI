/** 흰 카드. 그림자 없이 배경 대비로만 구분 */
export function Card({
  children,
  large = false,
  className = "",
}: {
  children: React.ReactNode;
  large?: boolean;
  className?: string;
}) {
  return (
    <section className={`bg-card ${large ? "rounded-[22px]" : "rounded-[18px] px-[18px] py-4"} ${className}`}>
      {children}
    </section>
  );
}
