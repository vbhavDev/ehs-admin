import React from 'react';

/**
 * Modern Page Layout Skeleton that matches the standard admin dashboard layout:
 * Header with breadcrumbs/title placeholders, stats cards row, and a content table/grid.
 */
export default function PageSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Page Header Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-100 dark:border-navy-800">
        <div className="space-y-2">
          <div className="h-7 w-48 bg-gray-200 dark:bg-navy-800 rounded-lg" />
          <div className="h-4 w-72 bg-gray-200 dark:bg-navy-800 rounded-md" />
        </div>
        <div className="flex items-center gap-3">
          <div className="h-10 w-28 bg-gray-200 dark:bg-navy-800 rounded-xl" />
          <div className="h-10 w-32 bg-gray-200 dark:bg-navy-800 rounded-xl" />
        </div>
      </div>

      {/* Stats Cards Skeleton Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="p-5 bg-white dark:bg-navy-900 rounded-2xl border border-gray-100 dark:border-navy-800 space-y-3"
          >
            <div className="flex justify-between items-center">
              <div className="h-4 w-24 bg-gray-200 dark:bg-navy-800 rounded-md" />
              <div className="h-8 w-8 bg-gray-200 dark:bg-navy-800 rounded-lg" />
            </div>
            <div className="h-8 w-20 bg-gray-200 dark:bg-navy-800 rounded-lg" />
            <div className="h-3 w-32 bg-gray-200 dark:bg-navy-800 rounded-md" />
          </div>
        ))}
      </div>

      {/* Main Table / Content Skeleton */}
      <div className="bg-white dark:bg-navy-900 rounded-2xl border border-gray-100 dark:border-navy-800 p-6 space-y-4">
        {/* Table Controls Skeleton */}
        <div className="flex flex-col sm:flex-row justify-between gap-4 pb-4 border-b border-gray-100 dark:border-navy-800">
          <div className="h-10 w-64 bg-gray-200 dark:bg-navy-800 rounded-xl" />
          <div className="flex items-center gap-2">
            <div className="h-10 w-24 bg-gray-200 dark:bg-navy-800 rounded-xl" />
            <div className="h-10 w-24 bg-gray-200 dark:bg-navy-800 rounded-xl" />
          </div>
        </div>

        {/* Table Rows Skeleton */}
        <div className="space-y-3 pt-2">
          {[1, 2, 3, 4, 5].map((row) => (
            <div
              key={row}
              className="flex items-center justify-between py-3 border-b border-gray-50 dark:border-navy-800/50 last:border-b-0"
            >
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 bg-gray-200 dark:bg-navy-800 rounded-xl shrink-0" />
                <div className="space-y-1.5">
                  <div className="h-4 w-36 bg-gray-200 dark:bg-navy-800 rounded-md" />
                  <div className="h-3 w-24 bg-gray-200 dark:bg-navy-800 rounded-md" />
                </div>
              </div>
              <div className="h-4 w-28 bg-gray-200 dark:bg-navy-800 rounded-md hidden sm:block" />
              <div className="h-6 w-16 bg-gray-200 dark:bg-navy-800 rounded-full" />
              <div className="h-8 w-20 bg-gray-200 dark:bg-navy-800 rounded-lg" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
