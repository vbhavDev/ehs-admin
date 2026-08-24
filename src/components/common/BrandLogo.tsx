'use client';

import React from 'react';
import Image from 'next/image';
import { usePlatformBranding } from '@/modules/platform-settings/hooks/usePlatformBranding';

interface BrandLogoProps {
  /** 'full' shows the wide logo; 'icon' renders a small square mark. */
  variant?: 'full' | 'icon';
  alt?: string;
  /** Static fallbacks used when no platform logo is configured yet. */
  fallbackLight?: string;
  fallbackDark?: string;
  fallbackIcon?: string;
  imgClassName?: string;
  style?: React.CSSProperties;
  width?: number;
  height?: number;
}

/**
 * Admin brand logo — renders the platform logo configured in Platform
 * Settings (DevOps → Branding) when one exists, otherwise falls back to the
 * bundled static logo. Resolves via the public branding endpoint so it works
 * on the login screen (before authentication) and in the sidebar.
 *
 * Full variant mirrors the classic light/dark pair: light logo in light mode,
 * `logoDark` in dark mode (falls back to the light logo when only one exists).
 */
export function BrandLogo({
  variant = 'full',
  alt = 'Logo',
  fallbackLight = '/images/logo/logo.png',
  fallbackDark = '/images/logo/logo.png',
  fallbackIcon = '/images/logo/logo-icon.png',
  imgClassName = '',
  style,
  width = 250,
  height = 100,
}: BrandLogoProps) {
  const { branding, isLoading } = usePlatformBranding();
  const hasDynamic = Boolean(branding?.logo || branding?.logoDark);

  if (isLoading) {
    if (variant === 'icon') {
      return (
        <div
          className={`animate-pulse bg-gray-200 dark:bg-navy-800 rounded-lg shrink-0 ${imgClassName}`}
          style={{ width: width || 40, height: height || 40, ...style }}
        />
      );
    }
    return (
      <div
        className={`animate-pulse bg-gray-200 dark:bg-navy-800 rounded-lg ${imgClassName}`}
        style={{ width: width || 160, height: height || 40, maxWidth: '100%', ...style }}
      />
    );
  }

  if (variant === 'icon') {
    const src = branding?.logo || branding?.logoDark || fallbackIcon;
    if (hasDynamic) {
      return (
        <img
          src={src!}
          alt={alt}
          className={`object-contain object-center ${imgClassName}`}
          style={style}
          loading="eager"
        />
      );
    }
    return (
      <Image
        src={fallbackIcon}
        alt={alt}
        width={width}
        height={height}
        className={imgClassName}
        style={style}
        priority
      />
    );
  }

  if (hasDynamic) {
    const lightSrc = branding?.logo || branding?.logoDark!;
    const darkSrc = branding?.logoDark || branding?.logo!;
    return (
      <span className="inline-block leading-none">
        <img
          src={lightSrc}
          alt={alt}
          className={`object-contain object-center dark:hidden ${imgClassName}`}
          style={style}
          loading="eager"
        />
        <img
          src={darkSrc}
          alt={alt}
          className={`object-contain object-center hidden dark:block ${imgClassName}`}
          style={style}
          loading="eager"
        />
      </span>
    );
  }

  return (
    <span className="inline-block leading-none">
      <Image
        src={fallbackLight}
        alt={alt}
        width={width}
        height={height}
        className={`dark:hidden ${imgClassName}`}
        style={style}
        priority
      />
      <Image
        src={fallbackDark}
        alt={alt}
        width={width}
        height={height}
        className={`hidden dark:block ${imgClassName}`}
        style={style}
        priority
      />
    </span>
  );
}

export default BrandLogo;
