import React from 'react';

interface ChartCardProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  isLoading?: boolean;
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
  isLoading = false,
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
      {isLoading ? (
        <div className="h-64 w-full bg-gray-100 dark:bg-navy-750/50 rounded-xl animate-pulse flex items-end p-4 gap-3">
          <div className="h-1/3 flex-1 bg-gray-200 dark:bg-navy-700 rounded-md" />
          <div className="h-2/3 flex-1 bg-gray-200 dark:bg-navy-700 rounded-md" />
          <div className="h-1/2 flex-1 bg-gray-200 dark:bg-navy-700 rounded-md" />
          <div className="h-4/5 flex-1 bg-gray-200 dark:bg-navy-700 rounded-md" />
          <div className="h-3/5 flex-1 bg-gray-200 dark:bg-navy-700 rounded-md" />
        </div>
      ) : (
        children
      )}
    </div>
  );
};
