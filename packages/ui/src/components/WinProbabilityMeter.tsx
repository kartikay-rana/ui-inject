import { cn } from './cn.js';

export interface WinProbabilityMeterProps {
  /** 0..100 — probability shown as lit segments out of 17 */
  value: number;
  className?: string;
}

export const METER_SEGMENTS = 17;

/** 17-segment LED probability meter: low=red, mid=amber, high=green, rest=track. */
export function WinProbabilityMeter({ value, className }: WinProbabilityMeterProps) {
  const prob = Math.max(0, Math.min(100, value ?? 0));
  const lit = Math.round((METER_SEGMENTS * prob) / 100);
  const bucket = (i: number): 'high' | 'mid' | 'low' | 'off' => {
    if (i >= lit) return 'off';
    if (prob >= 67) return 'high';
    if (prob >= 34) return 'mid';
    return 'low';
  };
  return (
    <span
      role="meter"
      aria-valuenow={Math.round(prob)}
      aria-valuemin={0}
      aria-valuemax={100}
      className={cn('ti-meter', className)}
      aria-label="win probability"
    >
      {Array.from({ length: METER_SEGMENTS }, (_, i) => (
        <span key={i} className={cn('ti-meter__seg', `ti-meter__seg--${bucket(i)}`)} />
      ))}
    </span>
  );
}