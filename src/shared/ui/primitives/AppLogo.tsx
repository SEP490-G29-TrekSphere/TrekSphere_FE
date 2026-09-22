import type * as React from 'react';
import { Link } from 'react-router-dom';
import {
  TrekSphereLogo,
  type TrekSphereLogoProps,
  type TrekSphereLogoTone,
  type TrekSphereLogoVariant,
} from './TrekSphereLogo';

export interface AppLogoProps extends Omit<TrekSphereLogoProps, 'variant' | 'tone' | 'height'> {
  /** Display mode: full (icon + wordmark) or mark (icon only). */
  variant?: TrekSphereLogoVariant;
  /** Color tone: dark (default) or light (for dark backgrounds). */
  tone?: TrekSphereLogoTone;
  /** Height in pixels. Default is 48. */
  height?: number;
  /** Target link destination. Default is `/`. */
  to?: string;
  /** Whether to wrap the logo in a React Router <Link>. Default is `true`. */
  linkable?: boolean;
  /** Optional wrapper className. */
  wrapperClassName?: string;
  /** Accessibility aria-label for the link. */
  ariaLabel?: string;
}

/**
 * Standardized application logo wrapper component.
 *
 * @example
 *   // Light background header
 *   <AppLogo height={48} />
 *
 *   // Dark hero background
 *   <AppLogo height={56} tone="light" />
 *
 *   // Icon-only mode
 *   <AppLogo variant="mark" height={32} />
 */
export const AppLogo: React.FC<AppLogoProps> = ({
  variant = 'full',
  tone = 'dark',
  height = 48,
  to = '/',
  linkable = true,
  wrapperClassName = 'inline-flex items-center shrink-0',
  ariaLabel = 'TrekSphere — Home',
  ...logoProps
}) => {
  const logo = <TrekSphereLogo variant={variant} tone={tone} height={height} {...logoProps} />;

  if (!linkable) {
    return <span className={wrapperClassName}>{logo}</span>;
  }

  return (
    <Link
      to={to}
      className={`${wrapperClassName} focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-md`}
      aria-label={ariaLabel}
    >
      {logo}
    </Link>
  );
};

AppLogo.displayName = 'AppLogo';

export { TrekSphereLogo } from './TrekSphereLogo';
export type { TrekSphereLogoProps, TrekSphereLogoTone, TrekSphereLogoVariant };
