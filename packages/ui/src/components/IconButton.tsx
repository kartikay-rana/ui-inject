import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { cn } from './cn.js';

export interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** accessible name for the icon-only control */
  label: string;
  variant?: 'raised' | 'ghost';
  icon: ReactNode;
}

export function IconButton({ label, variant = 'raised', icon, className, type = 'button', ...rest }: IconButtonProps) {
  return (
    <button type={type} aria-label={label} title={label} className={cn('ti-icon-btn', variant === 'ghost' && 'ti-icon-btn--ghost', className)} {...rest}>
      {icon}
    </button>
  );
}