import type { HTMLAttributes } from 'react';
import { cn } from './cn.js';

export type TagColor =
  | 'neutral'
  | 'green'
  | 'blue'
  | 'purple'
  | 'moss'
  | 'red'
  | 'orange'
  | 'amber'
  | 'teal'
  | 'yellow';

export interface TagProps extends HTMLAttributes<HTMLSpanElement> {
  color?: TagColor;
  /** smaller companion pill (e.g. the "+2" overflow tag) */
  pill?: boolean;
}

export function Tag({ color = 'neutral', pill = false, className, children, ...rest }: TagProps) {
  return (
    <span className={cn('ti-tag', `ti-tag--${color}`, pill && 'ti-tag--pill', className)} {...rest}>
      {children}
    </span>
  );
}