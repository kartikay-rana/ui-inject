import * as DropdownPrimitive from '@radix-ui/react-dropdown-menu';
import * as React from 'react';
import { cn } from './cn.js';
import { Icon, type IconName } from './Icons.js';
import type { ButtonHTMLAttributes } from 'react';

export const DropdownMenu = DropdownPrimitive.Root;
export const DropdownMenuTrigger = DropdownPrimitive.Trigger;

export const DropdownMenuContent = React.forwardRef<
  React.ElementRef<typeof DropdownPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DropdownPrimitive.Content>
>(function DropdownMenuContent({ className, sideOffset = 6, ...props }, ref) {
  return <DropdownPrimitive.Portal><DropdownPrimitive.Content ref={ref} sideOffset={sideOffset} className={cn('ti-dropdown-content', className)} {...props} /></DropdownPrimitive.Portal>;
});

export const DropdownMenuItem = React.forwardRef<
  React.ElementRef<typeof DropdownPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof DropdownPrimitive.Item>
>(function DropdownMenuItem({ className, ...props }, ref) {
  return <DropdownPrimitive.Item ref={ref} className={cn('ti-dropdown-item', className)} {...props} />;
});

export const DropdownMenuSeparator = React.forwardRef<
  React.ElementRef<typeof DropdownPrimitive.Separator>,
  React.ComponentPropsWithoutRef<typeof DropdownPrimitive.Separator>
>(function DropdownMenuSeparator({ className, ...props }, ref) {
  return <DropdownPrimitive.Separator ref={ref} className={cn('ti-dropdown-separator', className)} {...props} />;
});

export interface SplitTriggerProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** leading label shown before the divider */
  label?: string;
  icon?: IconName;
}

/**
 * Split dropdown pill: label | divider | chevron (rotates 180° when open),
 * matching the reference Sort-by / Filter-by toolbar controls.
 */
export function SplitTrigger({ label, icon, className, children, ...rest }: SplitTriggerProps) {
  return (
    <DropdownPrimitive.Trigger asChild>
      <button type="button" className={cn('ti-split', className)} {...rest}>
        {icon ? <Icon name={icon} size={13} /> : null}
        {label}
        <span className="ti-split__divider" />
        <Icon name="chevronDown" size={10} className="ti-split__chevron" />
      </button>
    </DropdownPrimitive.Trigger>
  );
}