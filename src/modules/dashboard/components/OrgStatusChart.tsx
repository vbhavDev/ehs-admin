'use client';
import React from 'react';
import { ApexOptions } from 'apexcharts';
import dynamic from 'next/dynamic';
import { ChartCard } from './ChartCard';
import type { BreakdownSlice } from '../hooks/useDashboardStats';

const ReactApexChart = dynamic(() => import('react-apexcharts'), { ssr: false });

/** Semantic color per organization lifecycle status. */
const STATUS_COLORS: Record<string, string> = {
  active: '#12B76A',
  pending_setup: '#F79009',
  suspended: '#F04438',
  expired: '#98A2B3',
  canceled: '#7A5AF8',
  unknown: '#667085',
};

interface OrgStatusChartProps {
  data: BreakdownSlice[];
  className?: string;
}

/** Organization lifecycle status distribution — donut chart. */
export const OrgStatusChart: React.FC<OrgStatusChartProps> = ({
  data,
  className = 'col-span-12 md:col-span-6 xl:col-span-4',
}) => {
  const hasData = data.some((d) => d.value > 0);

  const options: ApexOptions = {
    colors: data.map((d) => STATUS_COLORS[d.key] || STATUS_COLORS.unknown),
    labels: data.map((d) => d.label),
    chart: { fontFamily: 'Roboto, sans-serif', type: 'donut', height: 310 },
    legend: { show: true, position: 'bottom', fontFamily: 'Roboto' },
    dataLabels: { enabled: false },
    stroke: { show: true, width: 2, colors: ['transparent'] },
    plotOptions: {
      pie: {
        donut: {
          size: '72%',
          labels: {
            show: true,
            name: { show: true, fontFamily: 'Roboto' },
            value: { show: true, fontSize: '26px', fontWeight: 700, fontFamily: 'Roboto' },
            total: {
              show: true,
              label: 'Organizations',
              fontSize: '12px',
              fontFamily: 'Roboto',
              formatter: (w) =>
                `${w.globals.seriesTotals.reduce((a: number, b: number) => a + b, 0)}`,
            },
          },
        },
      },
    },
    tooltip: { y: { formatter: (val: number) => `${val} org${val === 1 ? '' : 's'}` } },
  };

  return (
    <ChartCard
      title="Organizations by Status"
      subtitle="Lifecycle state of all tenant organizations"
      className={className}
    >
      {hasData ? (
        <ReactApexChart
          options={options}
          series={data.map((d) => d.value)}
          type="donut"
          height={310}
        />
      ) : (
        <EmptyState message="No organizations onboarded yet" />
      )}
    </ChartCard>
  );
};

export const EmptyState: React.FC<{ message: string }> = ({ message }) => (
  <div className="flex h-[310px] flex-col items-center justify-center gap-2 text-center">
    <p className="text-sm font-medium text-gray-400 dark:text-navy-300">{message}</p>
  </div>
);
