import type { InputHTMLAttributes, ReactNode } from 'react';
import { cn } from './cn.js';

export interface TextInputProps extends InputHTMLAttributes<HTMLInputElement> {
  ref?: React.Ref<HTMLInputElement>;
}

export function TextInput({ ref, className, placeholder, ...rest }: TextInputProps) {
  return <input ref={ref} className={cn('ti-input', className)} placeholder={placeholder} {...rest} />;
}

export interface SearchButtonProps extends React.HTMLAttributes<HTMLButtonElement> {
  hint?: ReactNode;
  children?: ReactNode;
}

/** Pill search affordance with a ⌘K keyboard hint (reference topbar). */
export function SearchButton({ hint = '⌘K', children, className, ...rest }: SearchButtonProps) {
  return (
    <button type="button" className={cn('ti-search', className)} {...rest}>
      <svg viewBox="0 0 14 14" width="14" height="14" fill="none" aria-hidden="true">
        <path
          d="M12.25 12.25 9.713 9.713M6.9 10.733a3.833 3.833 0 1 0 0-7.666 3.833 3.833 0 0 0 0 7.666Z"
          stroke="currentColor"
          strokeWidth={1.4}
          strokeLinecap="round"
        />
      </svg>
      <span>{children}</span>
      <span className="ti-search__kbd">{hint}</span>
    </button>
  );
}