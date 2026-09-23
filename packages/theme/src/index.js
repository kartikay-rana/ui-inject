'use strict';

/**
 * Machine-readable copy of the reference tokens (mirrors theme.css).
 * Used by tests (token parity check) and by anything that needs a colour in JS.
 */
const tokens = {
  color: {
    background: '#161616',
    foreground: '#f9fbff',
    card: '#1b1d20',
    popover: '#161616',
    primary: '#4124fb',
    primaryHover: '#4b30ff',
    secondary: '#1e1e1e',
    secondaryHover: '#333333',
    muted: '#2a2a2a',
    mutedForeground: '#7f7f7f',
    accent: '#2a2a2a',
    border: '#232323',
    input: '#393939',
    ring: '#676767',
    lineStrong: '#393939',
    subtle: '#676767',
    faint: '#454545',
    soft: '#a4a4a4',
    chip: '#cfcfcf',
    icon: '#d0d4dd',
    destructive: '#f97373',
    success: '#22c55e',
    warning: '#fbbf24',
    trend: '#00b562',
    trendMuted: '#395e4d',
    track: '#3a3a3a',
    status: '#16c89e',
    sidebar: '#171717',
    sidebarPrimary: '#2a2a2a',
    sidebarBorder: '#232323',
    checkFill: '#ffdb4b',
    avatarFallback: '#f2f2f2',
  },
  radius: { base: '0.5rem', md: 'calc(0.5rem - 2px)', xl: 'calc(0.5rem + 4px)' },
  sidebar: { width: '254px' },
};

module.exports = { tokens };