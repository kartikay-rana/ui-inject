import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { cn } from './cn.js';

export type ButtonVariant = 'raised' | 'primary' | 'ghost';
export type ButtonSize = 'sm' | 'md';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** when set, renders a spinner in place of the leading icon */
  loading?: boolean;
  leadingIcon?: ReactNode;
  trailingIcon?: ReactNode;
}

export function Button({
  variant = 'raised',
  size = 'md',
  loading = false,
  leadingIcon,
  trailingIcon,
  className,
  children,
  disabled,
  type = 'button',
  ...rest
}: ButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={cn('ti-btn', `ti-btn--${variant}`, `ti-btn--${size}`, className)}
      {...rest}
    >
      {loading ? <span className="ti-btn__spinner" aria-label="loading" /> : leadingIcon}
      {children != null && <span>{children}</span>}
      {!loading ? trailingIcon : null}
    </button>
  );
}