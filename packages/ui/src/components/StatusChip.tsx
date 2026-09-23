import type { HTMLAttributes } from 'react';
import { cn } from './cn.js';

export interface StatusChipProps extends HTMLAttributes<HTMLSpanElement> {
  state?: 'active' | 'danger';
}

export function StatusChip({ state = 'active', className, children, ...rest }: StatusChipProps) {
  return (
    <span className={cn('ti-status-chip', state === 'danger' && 'ti-status-chip--danger', className)} {...rest}>
      <span className="ti-status-chip__dot" />
      {children}
    </span>
  );
}