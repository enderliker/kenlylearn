import * as React from 'react';
import { cn } from '@/lib/utils';

export interface LogoProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
}

/**
 * Kenly Symbol Glyph (Geometric 'K' with vertical stem and indigo branches)
 */
export function KenlySymbol({ size = 24, className, ...props }: LogoProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 48 48"
      width={size}
      height={size}
      role="img"
      aria-label="Kenly"
      className={cn('shrink-0', className)}
      {...props}
    >
      <rect x="3" y="3" width="11" height="42" rx="2.5" fill="#f4f4f5" />
      <path
        d="M41 6 L26 24 L41 42"
        fill="none"
        stroke="#6366f1"
        strokeWidth="9"
        strokeLinecap="butt"
        strokeLinejoin="miter"
      />
    </svg>
  );
}

/**
 * Full Kenly Horizontal Logo (Symbol + Wordmark)
 */
export function KenlyFullLogo({ className, ...props }: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 205 48"
      height="28"
      role="img"
      aria-label="Kenly"
      className={cn('shrink-0', className)}
      {...props}
    >
      {/* Symbol */}
      <rect x="3" y="3" width="11" height="42" rx="2.5" fill="#f4f4f5" />
      <path
        d="M41 6 L26 24 L41 42"
        fill="none"
        stroke="#6366f1"
        strokeWidth="9"
        strokeLinecap="butt"
        strokeLinejoin="miter"
      />
      {/* Wordmark (shifted to align cleanly at y=0) */}
      <g transform="translate(-35, -28)">
        <path
          d="M115.87 67.47 103.15 52.15V67.47H97.17V36.53H103.15V50.53L115.52 36.53H123.00L109.66 51.23L123.48 67.47Z M136.11 67.91Q132.76 67.91 130.17 66.48Q127.57 65.05 126.05 62.54Q124.54 60.03 124.54 56.82Q124.54 53.65 126.01 51.16Q127.48 48.68 130.04 47.20Q132.59 45.73 135.71 45.73Q138.79 45.73 141.15 47.12Q143.50 48.50 144.84 50.90Q146.18 53.30 146.18 56.33Q146.18 56.91 146.12 57.50Q146.05 58.09 145.88 58.84L130.34 58.89Q130.52 59.55 130.83 60.07Q131.53 61.53 132.90 62.30Q134.26 63.07 136.06 63.07Q137.69 63.07 139.01 62.52Q140.33 61.97 141.30 60.87L144.69 64.25Q143.15 66.06 140.93 66.98Q138.70 67.91 136.11 67.91ZM130.34 54.57 140.64 54.53Q140.46 53.78 140.20 53.17Q139.58 51.89 138.46 51.21Q137.34 50.53 135.71 50.53Q134.00 50.53 132.72 51.30Q131.44 52.07 130.78 53.43Q130.52 53.96 130.34 54.57Z M163.17 67.47V55.28Q163.17 53.39 161.98 52.20Q160.79 51.01 158.90 51.01Q157.67 51.01 156.70 51.54Q155.73 52.07 155.18 53.03Q154.63 54.00 154.63 55.28V67.47H148.87V46.21H154.63V48.19Q155.42 47.40 156.48 46.83Q158.37 45.77 160.79 45.77Q163.12 45.77 164.97 46.94Q166.82 48.11 167.88 49.98Q168.93 51.85 168.93 54.00V67.47Z M172.72 67.47V35.65H178.48V67.47Z M183.50 76.35 188.56 65.62 180.50 46.21H186.75L191.59 59.72L196.65 46.21H202.94L193.48 67.64L189.61 76.35Z"
          fill="#f4f4f5"
        />
      </g>
    </svg>
  );
}
