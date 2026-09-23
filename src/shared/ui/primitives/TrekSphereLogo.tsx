import * as React from 'react';

import FullDark from '@/assets/logos/treksphere-logo-dark.svg?react';
import FullLight from '@/assets/logos/treksphere-logo-light.svg?react';
import MarkDark from '@/assets/logos/treksphere-mark-dark.svg?react';
import MarkLight from '@/assets/logos/treksphere-mark-light.svg?react';

export type TrekSphereLogoVariant = 'mark' | 'full';
export type TrekSphereLogoTone = 'dark' | 'light';

export interface TrekSphereLogoProps
  extends Omit<React.HTMLAttributes<HTMLSpanElement>, 'children'> {
  variant?: TrekSphereLogoVariant;

  tone?: TrekSphereLogoTone;

  height?: number;

  hideTextOnMobile?: boolean;
}

const FULL_ASPECT = 320 / 64;

const LOGO_MAP = {
  'mark-dark': MarkDark,
  'mark-light': MarkLight,
  'full-dark': FullDark,
  'full-light': FullLight,
} as const;

export const TrekSphereLogo = React.forwardRef<HTMLSpanElement, TrekSphereLogoProps>(
  (
    {
      variant = 'full',
      tone = 'dark',
      height = 32,
      className = '',
      hideTextOnMobile: _hideTextOnMobile,
      ...props
    },
    ref
  ) => {
    const key = `${variant}-${tone}` as keyof typeof LOGO_MAP;
    const Component = LOGO_MAP[key] as React.FC<React.SVGProps<SVGSVGElement>>;

    const width = variant === 'full' ? Math.round(height * FULL_ASPECT) : height;

    return (
      <span
        ref={ref}
        role="img"
        aria-label="TrekSphere"
        className={`inline-flex items-center ${className}`.trim()}
        {...props}
      >
        <Component
          width={width}
          height={height}
          aria-hidden="true"
          focusable="false"
          className="shrink-0 block"
        />
      </span>
    );
  }
);

TrekSphereLogo.displayName = 'TrekSphereLogo';

export default TrekSphereLogo;
