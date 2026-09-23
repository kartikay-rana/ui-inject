import { cn } from './cn.js';

export interface ActivityTrendProps {
  /** 14 relative activity values (1..6 buckets); inline px keeps the
   *  component self-contained for consumer installs without Tailwind. */
  values: number[];
  className?: string;
}

/** Micro bar-chart of activity (reference trend column). */
export function ActivityTrend({ values, className }: ActivityTrendProps) {
  const bars = values.slice(0, 14);
  const heightPx = (v: number): number => Math.max(4, Math.min(14, Math.round(v) * 2.3));
  const isMuted = (v: number): boolean => v > 0 && v % 2 === 1;
  return (
    <span className={cn('ti-trend', className)} role="img" aria-label="activity trend">
      {bars.map((v, i) => (
        <span
          key={i}
          className={cn('ti-trend__bar', isMuted(v) && 'ti-trend__bar--muted')}
          style={{ height: `${heightPx(v)}px` }}
        />
      ))}
    </span>
  );
}