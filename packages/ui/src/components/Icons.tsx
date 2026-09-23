import type { ReactNode, SVGProps } from 'react';

/**
 * Stroke icon set matching the reference (viewport 12–16, stroke 1.2–1.4,
 * fill none / stroke currentColor). Hand-rolled to keep the library dependency-free.
 */

interface IconSpec {
  viewBox: string;
  children: ReactNode;
  strokeWidth?: number;
}

export type IconName =
  | 'chevronDown'
  | 'plus'
  | 'sliders'
  | 'magnifier'
  | 'bell'
  | 'calendar'
  | 'ellipsis'
  | 'export'
  | 'target'
  | 'users'
  | 'person'
  | 'file'
  | 'copy'
  | 'mail'
  | 'warning'
  | 'columns'
  | 'list'
  | 'barChart'
  | 'userPlus'
  | 'help'
  | 'externalLink'
  | 'hamburger';

const PATHS: Record<IconName, IconSpec> = {
  chevronDown: {
    viewBox: '0 0 10 12',
    children: <path d="m3 4.5 3 3 3-3" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" />,
    strokeWidth: 1.4,
  },
  plus: {
    viewBox: '0 0 12 12',
    children: <path d="M6 2.5v7M2.5 6h7" fill="none" stroke="currentColor" strokeLinecap="round" />,
    strokeWidth: 1.2,
  },
  sliders: {
    viewBox: '0 0 12 12',
    children: <path d="M3.5 7h7M1.75 3.5h10.5M5.5 9.5h5" fill="none" stroke="currentColor" strokeLinecap="round" />,
    strokeWidth: 1.4,
  },
  magnifier: {
    viewBox: '0 0 14 14',
    children: (
      <path
        d="M12.25 12.25 9.713 9.713M6.9 10.733a3.833 3.833 0 1 0 0-7.666 3.833 3.833 0 0 0 0 7.666Z"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
      />
    ),
    strokeWidth: 1.4,
  },
  bell: {
    viewBox: '0 0 14 14',
    children: (
      <path
        d="M10.5 4.667a3.5 3.5 0 1 0-7 0c0 4.083-2.333 5.25-2.333 5.25h11.666S10.5 8.75 10.5 4.667ZM7 13.417a1.167 1.167 0 0 0 1.167-1.167H5.833A1.167 1.167 0 0 0 7 13.417Z"
        fill="none"
        stroke="currentColor"
        strokeLinejoin="round"
      />
    ),
    strokeWidth: 1.333,
  },
  calendar: {
    viewBox: '0 0 14 14',
    children: (
      <path
        d="M12.25 5.833H1.75m7.583-4.666v2.333M4.667 1.167v2.333M2.917 2.333h8.166A1.167 1.167 0 0 1 12.25 3.5v8.167a1.167 1.167 0 0 1-1.167 1.166H2.917A1.167 1.167 0 0 1 1.75 11.667V3.5a1.167 1.167 0 0 1 1.167-1.167Z"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    ),
    strokeWidth: 1.4,
  },
  ellipsis: {
    viewBox: '0 0 12 12',
    children: (
      <>
        <circle cx="2.5" cy="6.5" r=".5" fill="currentColor" />
        <circle cx="6" cy="6.5" r=".5" fill="currentColor" />
        <circle cx="9.5" cy="6.5" r=".5" fill="currentColor" />
      </>
    ),
  },
  export: {
    viewBox: '0 0 12 12',
    children: (
      <path
        d="M10.5 6v2.1c0 .79-.64 1.433-1.433 1.433H2.933A1.433 1.433 0 0 1 1.5 8.1V6M6 1.5v6M3.75 3.25 6 1l2.25 2.25"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    ),
    strokeWidth: 1.4,
  },
  target: {
    viewBox: '0 0 14 14',
    children: (
      <path
        d="M12.833 7H10.5M11.667 7a4.667 4.667 0 1 1-1.367-3.3M10.5 7a3.5 3.5 0 1 1-1.025-2.475"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
      />
    ),
    strokeWidth: 1.4,
  },
  users: {
    viewBox: '0 0 14 14',
    children: (
      <path
        d="M10.5 9.238c.85.427 1.613 1.09 2.147 1.929M7 7.5a2.917 2.917 0 1 0 0-5.833A2.917 2.917 0 0 0 7 7.5Zm-5.25 3.667a4.667 4.667 0 0 1 8.194-3.3M9.333 11.667H1.75"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
      />
    ),
    strokeWidth: 1.4,
  },
  person: {
    viewBox: '0 0 14 14',
    children: (
      <path
        d="M7 12.833a5.833 5.833 0 1 0 0-11.666 5.833 5.833 0 0 0 0 11.666Zm-4.667-1.4c.583-1.95 2.15-2.916 4.667-2.916s4.084.966 4.667 2.916"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
      />
    ),
    strokeWidth: 1.4,
  },
  file: {
    viewBox: '0 0 14 14',
    children: (
      <path
        d="M5.25 4.083H2.683A1.167 1.167 0 0 0 1.517 5.25v6.533a1.167 1.167 0 0 0 1.167 1.167h7a1.167 1.167 0 0 0 1.166-1.167V5.25a1.167 1.167 0 0 0-1.166-1.167H8.167M5.25 5.833H3.5m.583-4.083h4.084a1.167 1.167 0 0 1 1.166 1.167v1.166M5.833 8.75h3.5"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
      />
    ),
    strokeWidth: 1.4,
  },
  copy: {
    viewBox: '0 0 14 14',
    children: (
      <path
        d="M9.333 2.333c.543.217.935.737.935 1.341l.012 7.126a1.35 1.35 0 0 1-1.35 1.341c-.372 0-.71-.137-.973-.362M4.667 2.333h4.666M4.667 2.333h4.666"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
      />
    ),
    strokeWidth: 1.4,
  },
  mail: {
    viewBox: '0 0 12 12',
    children: <path d="m1.167 4.083 3.03 2.02a2.917 2.917 0 0 0 3.606 0l3.03-2.02" fill="none" stroke="currentColor" strokeLinecap="round" />,
    strokeWidth: 1.333,
  },
  warning: {
    viewBox: '0 0 12 12',
    children: <path d="M7 5.25v2.333m0 2.334h.006" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth={2} />,
  },
  columns: {
    viewBox: '0 0 12 12',
    children: (
      <path
        d="M6.417 6.417h-2.8M2.917 1.75h6.166A1.167 1.167 0 0 1 10.25 2.917v6.166A1.167 1.167 0 0 1 9.083 10.25H2.917A1.167 1.167 0 0 1 1.75 9.083V2.917A1.167 1.167 0 0 1 2.917 1.75Z"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
      />
    ),
    strokeWidth: 1.4,
  },
  list: {
    viewBox: '0 0 12 12',
    children: (
      <path
        d="M12.25 7h-7m7-3.5h-7m7 7h-7M2.917 7A.583.583 0 1 1 1.75 7a.583.583 0 0 1 1.167 0Zm0-3.5A.583.583 0 1 1 1.75 3.5a.583.583 0 0 1 1.167 0Zm0 7A.583.583 0 1 1 1.75 10.5a.583.583 0 0 1 1.167 0Z"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
      />
    ),
    strokeWidth: 1.4,
  },
  barChart: {
    viewBox: '0 0 12 12',
    children: <path d="M1.75 6.417v5.833m7-9.917V12.25m-3.5-1.5.233-9.417M9.917 12.25h2.333" fill="none" stroke="currentColor" strokeLinecap="round" />,
    strokeWidth: 1.4,
  },
  userPlus: {
    viewBox: '0 0 14 14',
    children: (
      <path
        d="M11.083 5.833v3.5m-1.75-1.75h3.5M9.333 11.667H1.75m2.917-2.63a4.667 4.667 0 0 1 3.792 2.63M6.417 6.417a1.75 1.75 0 1 0 0-3.5 1.75 1.75 0 0 0 0 3.5Z"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
      />
    ),
    strokeWidth: 1.4,
  },
  help: {
    viewBox: '0 0 12 12',
    children: (
      <path
        d="M6.125 5.251a1.312 1.312 0 1 1 2.602.468c-.286.854-1.44 1.156-1.44 1.156M6.682 9.583h.006M10.25 6A4.25 4.25 0 1 1 1.75 6a4.25 4.25 0 0 1 8.5 0Z"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
      />
    ),
    strokeWidth: 1.4,
  },
  externalLink: {
    viewBox: '0 0 12 12',
    children: (
      <path
        d="M9.625 8.167h.006M1.75 2.917v8.166a1.167 1.167 0 0 0 1.167 1.167h8.166M2.583 6.5V1.75H8.75M5.25 6.75l4.083-4.083M10.25 1.75V4.9M10.25 1.75H7.1"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    ),
    strokeWidth: 1.4,
  },
  hamburger: {
    viewBox: '0 0 14 14',
    children: <path d="M2.333 5.25h9.334M2.333 8.75h9.334" fill="none" stroke="currentColor" strokeLinecap="round" />,
    strokeWidth: 1.333,
  },
};

export interface IconProps extends Omit<SVGProps<SVGSVGElement>, 'name'> {
  name: IconName;
  size?: number;
}

export function Icon({ name, size = 16, strokeWidth, ...rest }: IconProps) {
  const spec = PATHS[name];
  return (
    <svg
      viewBox={spec.viewBox}
      width={size}
      height={size}
      fill="none"
      role="img"
      aria-hidden="true"
      strokeWidth={strokeWidth ?? spec.strokeWidth ?? 1.4}
      {...rest}
    >
      {spec.children}
    </svg>
  );
}