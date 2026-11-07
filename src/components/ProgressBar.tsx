/** 높이 6px, 트랙 track, 채움 sage. value: 0~1 */
export function ProgressBar({ value, label }: { value: number; label?: string }) {
  const pct = Math.round(Math.min(1, Math.max(0, value)) * 100);
  return (
    <div
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={pct}
      aria-label={label}
      className="h-1.5 w-full overflow-hidden rounded-[9px] bg-track"
    >
      <div className="h-full rounded-[9px] bg-sage transition-[width]" style={{ width: `${pct}%` }} />
    </div>
  );
}
