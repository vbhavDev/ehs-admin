'use client';
import React from 'react';
import { ApexOptions } from 'apexcharts';
import dynamic from 'next/dynamic';
import { ChartCard } from './ChartCard';
import { EmptyState } from './OrgStatusChart';
import type { BreakdownSlice } from '../hooks/useDashboardStats';

const ReactApexChart = dynamic(() => import('react-apexcharts'), { ssr: false });

interface SystemUsersRoleChartProps {
  data: BreakdownSlice[];
  className?: string;
}

/** Internal team composition — system users per role, vertical bar chart. */
export const SystemUsersRoleChart: React.FC<SystemUsersRoleChartProps> = ({
  data,
  className = 'col-span-12 md:col-span-6 xl:col-span-4',
}) => {
  const hasData = data.some((d) => d.value > 0);

  const options: ApexOptions = {
    colors: ['#7A5AF8'],
    chart: { fontFamily: 'Roboto, sans-serif', type: 'bar', height: 310, toolbar: { show: false } },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: '42%',
        borderRadius: 5,
        borderRadiusApplication: 'end',
      },
    },
    dataLabels: { enabled: false },
    stroke: { show: true, width: 4, colors: ['transparent'] },
    xaxis: {
      categories: data.map((d) => d.label),
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    yaxis: {
      min: 0,
      forceNiceScale: true,
      labels: { formatter: (val: number) => `${Math.round(val)}` },
    },
    legend: { show: false },
    grid: { yaxis: { lines: { show: true } } },
    tooltip: { y: { formatter: (val: number) => `${val} member${val === 1 ? '' : 's'}` } },
  };

  return (
    <ChartCard
      title="Team by Role"
      subtitle="Internal system users per assigned role"
      className={className}
    >
      {hasData ? (
        <ReactApexChart
          options={options}
          series={[{ name: 'System Users', data: data.map((d) => d.value) }]}
          type="bar"
          height={310}
        />
      ) : (
        <EmptyState message="No system users found" />
      )}
    </ChartCard>
  );
};
