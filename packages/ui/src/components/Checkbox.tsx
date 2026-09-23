import * as CheckboxPrimitive from '@radix-ui/react-checkbox';
import * as React from 'react';
import { cn } from './cn.js';

/** Checkbox with the reference's yellow checked/indeterminate fill + three-state support. */
export interface CheckboxProps extends Omit<React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root>, 'asChild'> {
  label?: string;
}

function CheckMarkIcon() {
  return (
    <svg viewBox="0 0 12 12" width="12" height="12" fill="none" aria-hidden="true">
      <path d="M2.5 6.4 5 8.6 9.5 3.6" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  );
}

function MinusMarkIcon() {
  return (
    <svg viewBox="0 0 12 12" width="12" height="12" fill="currentColor" aria-hidden="true">
      <rect x="2" y="5" width="8" height="2" rx="1" />
    </svg>
  );
}

export const Checkbox = React.forwardRef<React.ElementRef<typeof CheckboxPrimitive.Root>, CheckboxProps>(
  function Checkbox({ className, label, id, ...props }, ref) {
    const indeterminate = props.checked === 'indeterminate';
    const content = (
      <CheckboxPrimitive.Root ref={ref} className={cn('ti-checkbox', className)} id={id} {...props}>
        <CheckboxPrimitive.Indicator className="ti-checkbox__indicator">
          {indeterminate ? <MinusMarkIcon /> : <CheckMarkIcon />}
        </CheckboxPrimitive.Indicator>
      </CheckboxPrimitive.Root>
    );
    if (!label) return content;
    return (
      <span className="ti-checkbox-wrap" style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
        {content}
        <label htmlFor={id} style={{ fontSize: 14, color: 'var(--foreground)', cursor: 'pointer' }}>
          {label}
        </label>
      </span>
    );
  }
);