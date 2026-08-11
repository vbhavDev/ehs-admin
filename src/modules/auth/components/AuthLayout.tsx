'use client';

import React from 'react';

interface AuthLayoutProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
}

import Link from 'next/link';
import BrandLogo from '@/components/common/BrandLogo';

export const AuthLayout: React.FC<AuthLayoutProps> = ({ children, title, subtitle }) => {
  return (
    <div className="flex flex-col items-center justify-center w-full max-w-[480px] mx-auto animate-fade-in">
      <div className="w-full bg-white dark:bg-navy-800 rounded-[2.5rem] border border-gray-100 dark:border-navy-700 shadow-[0_20px_50px_rgba(0,0,0,0.04)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.25)] overflow-hidden">
        {/* Card Header with Logo */}
        <div
          className={`pt-12 px-8 flex flex-col items-center relative overflow-hidden ${title ? 'pb-8 border-b border-gray-50 dark:border-navy-700/50' : 'pb-4'}`}
        >
          {/* Subtle Background Glow */}
          {/* <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-32 bg-brand-500/10 rounded-full blur-3xl -translate-y-1/2" /> */}

          <div className={`${title ? 'mb-5' : 'mb-4'} relative z-10`}>
            <Link
              href="/"
              className="block transform hover:scale-105 transition-transform duration-300"
            >
              {/* Platform logo (Platform Settings branding) with static fallback */}
              <BrandLogo
                alt="Platform Logo"
                fallbackLight="/images/logo/logo.png"
                fallbackDark="/images/logo/logo.png"
                width={450}
                height={150}
                imgClassName="h-20 w-auto"
              />
            </Link>
          </div>
          {title && (
            <div className="text-center relative z-10">
              <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight mb-3">
                {title}
              </h1>
              {subtitle && (
                <p className="text-base font-medium text-gray-500 dark:text-gray-400 max-w-[280px] mx-auto leading-relaxed">
                  {subtitle}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Form Body */}
        <div className="p-8 sm:p-12 bg-white dark:bg-navy-800">{children}</div>
      </div>
    </div>
  );
};
