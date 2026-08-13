import React from 'react';

interface ChartCardProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

/**
 * Consistent card shell for dashboard charts — title + subtitle header with an
 * optional right-aligned action slot, matching the admin panel's card language
 * (white / navy-800 surface, rounded-2xl, theme shadow).
 */
export const ChartCard: React.FC<ChartCardProps> = ({
  title,
  subtitle,
  action,
  children,
  className = '',
}) => {
  return (
    <div
      className={`rounded-2xl border border-gray-100 bg-white p-5 shadow-theme-xs dark:border-navy-700 dark:bg-navy-800 sm:p-6 ${className}`}
    >
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <h3 className="text-base font-semibold text-gray-900 dark:text-white">{title}</h3>
          {subtitle && <p className="mt-1 text-sm text-gray-500 dark:text-navy-300">{subtitle}</p>}
        </div>
        {action}
      </div>
      {children}
    </div>
  );
};
