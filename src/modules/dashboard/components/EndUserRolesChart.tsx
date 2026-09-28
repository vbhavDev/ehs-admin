'use client';
import React from 'react';
import { ApexOptions } from 'apexcharts';
import dynamic from 'next/dynamic';
import { ChartCard } from './ChartCard';
import { EmptyState } from './OrgStatusChart';
import type { BreakdownSlice } from '../hooks/useDashboardStats';

const ReactApexChart = dynamic(() => import('react-apexcharts'), { ssr: false });

/** Distinct color per end-user role (legend + labels ensure meaning isn't color-only). */
const ROLE_COLORS: Record<string, string> = {
  'org:owner': '#7A5AF8',
  'org:admin': '#1570EF',
  'org:inspector': '#12B76A',
  'org:viewer': '#F79009',
  individual: '#E31E24',
  unassigned: '#98A2B3',
};

interface EndUserRolesChartProps {
  data: BreakdownSlice[];
  className?: string;
}

/** End-user base split by organization role / individual — donut chart. */
export const EndUserRolesChart: React.FC<EndUserRolesChartProps> = ({
  data,
  className = 'col-span-12 md:col-span-6 xl:col-span-4',
}) => {
  const hasData = data.some((d) => d.value > 0);

  const options: ApexOptions = {
    colors: data.map((d) => ROLE_COLORS[d.key] || ROLE_COLORS.unassigned),
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
              label: 'End Users',
              fontSize: '12px',
              fontFamily: 'Roboto',
              formatter: (w) =>
                `${w.globals.seriesTotals.reduce((a: number, b: number) => a + b, 0)}`,
            },
          },
        },
      },
    },
    tooltip: { y: { formatter: (val: number) => `${val} user${val === 1 ? '' : 's'}` } },
  };

  return (
    <ChartCard
      title="End Users by Role"
      subtitle="Customer base by organization role & individuals"
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
        <EmptyState message="No end users registered yet" />
      )}
    </ChartCard>
  );
};
