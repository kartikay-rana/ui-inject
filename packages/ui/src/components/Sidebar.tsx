import type { ReactNode } from 'react';
import { cn } from './cn.js';

export interface SidebarGroup {
  id: string;
  eyebrow?: string;
  items: SidebarItem[];
}

export interface SidebarItem {
  id: string;
  label: string;
  icon?: ReactNode;
  /** optional count chip (e.g. Companies 241) */
  count?: string | number;
  /** pipeline colour dot */
  dotColor?: string;
  href?: string;
}

export interface SidebarProps {
  groups: SidebarGroup[];
  activeId?: string;
  onSelect?: (id: string) => void;
  header?: ReactNode;
  footer?: ReactNode;
  className?: string;
}

/** 254px grouped rail with count chips, pipeline dots, active pill + footer actions. */
export function Sidebar({ groups, activeId, onSelect, header, footer, className }: SidebarProps) {
  return (
    <aside className={cn('ti-sidebar', className)}>
      {header}
      <div className="ti-sidebar__body">
        {groups.map((group) => (
          <div className="ti-sidebar__group" key={group.id}>
            {group.eyebrow ? <span className="ti-sidebar__eyebrow">{group.eyebrow}</span> : null}
            {group.items.map((item) => {
              const active = item.id === activeId;
              const content = (
                <>
                  {item.dotColor ? <span className="ti-sidebar__dot" style={{ background: item.dotColor }} /> : null}
                  {item.icon ? <span className="ti-sidebar__icon">{item.icon}</span> : null}
                  <span className="ti-sidebar__label">{item.label}</span>
                  {item.count != null ? <span className="ti-sidebar__count">{item.count}</span> : null}
                </>
              );
              if (item.href) {
                return (
                  <a
                    key={item.id}
                    className={cn('ti-sidebar__item', active && 'ti-sidebar__item--active')}
                    href={item.href}
                    aria-current={active ? 'page' : undefined}
                  >
                    {content}
                  </a>
                );
              }
              return (
                <button
                  key={item.id}
                  type="button"
                  className={cn('ti-sidebar__item', active && 'ti-sidebar__item--active')}
                  onClick={() => onSelect?.(item.id)}
                  aria-current={active ? 'true' : undefined}
                >
                  {content}
                </button>
              );
            })}
          </div>
        ))}
      </div>
      {footer ? <div className="ti-sidebar__footer">{footer}</div> : null}
    </aside>
  );
}