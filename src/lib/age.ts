/** 생년월일 → 월령(개월) */
export function ageInMonths(birthDate: string, today = new Date()): number {
  const b = new Date(birthDate);
  let m = (today.getFullYear() - b.getFullYear()) * 12 + (today.getMonth() - b.getMonth());
  if (today.getDate() < b.getDate()) m--;
  return m;
}

/** 30 → "30개월 (만 2세 6개월)" */
export function formatMonths(months: number): string {
  const y = Math.floor(months / 12);
  const r = months % 12;
  return `${months}개월 (만 ${y}세${r ? ` ${r}개월` : ""})`;
}
