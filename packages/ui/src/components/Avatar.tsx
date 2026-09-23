import type { HTMLAttributes } from 'react';
import { cn } from './cn.js';

export interface AvatarProps extends HTMLAttributes<HTMLSpanElement> {
  name?: string;
  src?: string;
  /** render the teal live-status dot */
  status?: boolean;
  size?: 'sm' | 'lg';
  initials?: boolean;
}

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  return parts.length >= 2 ? `${parts[0][0]}${parts[1][0]}`.toUpperCase() : name.slice(0, 2).toUpperCase();
}

export function Avatar({ name, src, status = false, size = 'sm', initials: showInitials = true, className, ...rest }: AvatarProps) {
  const fallback = name ? initials(name) : '?';
  return (
    <span className={cn('ti-avatar', size === 'lg' && 'ti-avatar--lg', className)} {...rest}>
      {src ? <img src={src} alt={name ?? ''} loading="lazy" /> : showInitials ? <span style={{ lineHeight: 1 }}>{fallback}</span> : null}
      {status ? <span className="ti-avatar__dot" /> : null}
    </span>
  );
}