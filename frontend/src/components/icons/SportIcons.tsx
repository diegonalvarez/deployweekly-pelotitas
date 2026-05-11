import type { SVGProps } from 'react';

type IconProps = SVGProps<SVGSVGElement> & { size?: number };

const base = (size?: number) => ({
  width: size ?? 24,
  height: size ?? 24,
  viewBox: '0 0 24 24',
  fill: 'none',
  xmlns: 'http://www.w3.org/2000/svg',
});

export function PelotaIcon({ size, ...rest }: IconProps) {
  return (
    <svg {...base(size)} {...rest}>
      <circle cx="12" cy="12" r="9" fill="currentColor" />
      <path
        d="M3.5 9.5c3-1 6 .5 8 3s4 4.5 8 4M3.5 14.5c3 1 6-.5 8-3s4-4.5 8-4"
        stroke="rgba(0,0,0,0.55)"
        strokeWidth="1.6"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}

export function RaquetaIcon({ size, ...rest }: IconProps) {
  return (
    <svg {...base(size)} {...rest}>
      <ellipse
        cx="9.5"
        cy="9.5"
        rx="6.2"
        ry="6.5"
        fill="currentColor"
        stroke="currentColor"
        strokeWidth="1.4"
      />
      <g stroke="rgba(0,0,0,0.5)" strokeWidth="0.9" strokeLinecap="round">
        <line x1="4" y1="9.5" x2="15" y2="9.5" />
        <line x1="9.5" y1="3.5" x2="9.5" y2="15.5" />
        <line x1="5.5" y1="5.5" x2="13.5" y2="13.5" />
        <line x1="13.5" y1="5.5" x2="5.5" y2="13.5" />
      </g>
      <path
        d="M14 14l5.5 5.5"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
      />
      <circle cx="20" cy="20" r="1.4" fill="currentColor" />
    </svg>
  );
}

export function CopaIcon({ size, ...rest }: IconProps) {
  return (
    <svg {...base(size)} {...rest}>
      <path
        d="M7 3h10v5a5 5 0 01-10 0V3z"
        fill="currentColor"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
      <path
        d="M7 5H4.5a2 2 0 002 4M17 5h2.5a2 2 0 01-2 4"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M10 13h4v3h-4zM8 16h8v2H8zM7 18h10v2H7z"
        fill="currentColor"
      />
      <circle cx="12" cy="6" r="1" fill="rgba(0,0,0,0.45)" />
    </svg>
  );
}

export function CanchaIcon({ size, ...rest }: IconProps) {
  return (
    <svg {...base(size)} {...rest}>
      <rect
        x="2.5"
        y="5"
        width="19"
        height="14"
        rx="1.5"
        fill="currentColor"
        opacity="0.18"
      />
      <rect
        x="2.5"
        y="5"
        width="19"
        height="14"
        rx="1.5"
        stroke="currentColor"
        strokeWidth="1.4"
      />
      <line x1="12" y1="5" x2="12" y2="19" stroke="currentColor" strokeWidth="1.4" />
      <line x1="6" y1="9" x2="18" y2="9" stroke="currentColor" strokeWidth="1" opacity="0.6" />
      <line x1="6" y1="15" x2="18" y2="15" stroke="currentColor" strokeWidth="1" opacity="0.6" />
      <circle cx="12" cy="12" r="1.1" fill="currentColor" />
    </svg>
  );
}

export function FuegoIcon({ size, ...rest }: IconProps) {
  return (
    <svg {...base(size)} {...rest}>
      <path
        d="M12 3c1 3 4 4 4 8a4 4 0 11-8 0c0-2 1-3 1-5 1.5 1 2 2 3-3z"
        fill="currentColor"
      />
      <path
        d="M12 11c1 1 2 2 2 4a2 2 0 11-4 0c0-1.5 1-2 2-4z"
        fill="rgba(255,255,255,0.55)"
      />
    </svg>
  );
}

export function MarcadorIcon({ size, ...rest }: IconProps) {
  return (
    <svg {...base(size)} {...rest}>
      <rect
        x="2.5"
        y="6"
        width="19"
        height="12"
        rx="1.5"
        fill="currentColor"
        opacity="0.16"
        stroke="currentColor"
        strokeWidth="1.4"
      />
      <text
        x="7"
        y="15.4"
        fontFamily="JetBrains Mono, ui-monospace, monospace"
        fontSize="7"
        fontWeight="700"
        fill="currentColor"
      >
        4
      </text>
      <text
        x="14"
        y="15.4"
        fontFamily="JetBrains Mono, ui-monospace, monospace"
        fontSize="7"
        fontWeight="700"
        fill="currentColor"
      >
        2
      </text>
      <line x1="12" y1="8" x2="12" y2="16" stroke="currentColor" strokeWidth="1" opacity="0.5" />
    </svg>
  );
}
