import React from 'react';
import Link from 'next/link';

export interface KpiCardProps {
  title: string;
  value: string | number;
  /** Small supporting line under the value, e.g. "12 active". */
  subtitle?: string;
  icon: React.ReactNode;
  bgIllustration?: React.ReactNode;
  iconBgColor: string;
  iconTextColor: string;
  /** Optional destination — renders the whole card as a link. */
  href?: string;
  isLoading?: boolean;
}

/**
 * Dashboard KPI card — extends the visual language of the legacy
 * `SummaryCard` (watermark icon, rounded icon tile) with a subtitle line and
 * link affordance. Whole card is keyboard-accessible when `href` is set.
 */
export const KpiCard: React.FC<KpiCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  bgIllustration,
  iconBgColor,
  iconTextColor,
  href,
  isLoading = false,
}) => {
  if (isLoading) {
    return (
      <div className="relative overflow-hidden flex items-center p-5 bg-white border border-gray-100 rounded-xl shadow-theme-xs dark:bg-navy-800 dark:border-navy-700 animate-pulse">
        <div className="relative z-10 flex shrink-0 items-center justify-center w-14 h-14 rounded-2xl mr-4 bg-gray-200 dark:bg-navy-700" />
        <div className="relative z-10 min-w-0 flex-1 space-y-2">
          <div className="h-3 w-20 bg-gray-200 dark:bg-navy-700 rounded-md" />
          <div className="h-7 w-16 bg-gray-200 dark:bg-navy-700 rounded-md" />
          <div className="h-3 w-28 bg-gray-100 dark:bg-navy-750 rounded-md" />
        </div>
      </div>
    );
  }
  const body = (
    <>
      {bgIllustration && (
        <div
          aria-hidden="true"
          className={`absolute -right-4 -bottom-4 opacity-[0.07] dark:opacity-[0.05] pointer-events-none transform -rotate-12 ${iconTextColor}`}
        >
          {bgIllustration}
        </div>
      )}

      <div
        className={`relative z-10 flex shrink-0 items-center justify-center w-14 h-14 rounded-2xl mr-4 ${iconBgColor} ${iconTextColor}`}
      >
        {icon}
      </div>
      <div className="relative z-10 min-w-0">
        <h3 className="text-[11px] font-bold text-gray-500 uppercase dark:text-gray-400 mb-1.5 tracking-wider">
          {title}
        </h3>
        <p className="text-[26px] leading-none font-bold text-gray-900 dark:text-white">{value}</p>
        {subtitle && (
          <p className="mt-1.5 text-xs font-medium text-gray-400 dark:text-navy-300 truncate">
            {subtitle}
          </p>
        )}
      </div>
    </>
  );

  const className = `relative overflow-hidden flex items-center p-5 bg-white border border-gray-100 rounded-xl shadow-theme-xs transition-all duration-300 dark:bg-navy-800 dark:border-navy-700 ${
    href
      ? 'cursor-pointer hover:shadow-theme-md hover:-translate-y-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500'
      : ''
  }`;

  if (href) {
    return (
      <Link href={href} className={className} aria-label={`${title}: ${value}`}>
        {body}
      </Link>
    );
  }

  return <div className={className}>{body}</div>;
};
