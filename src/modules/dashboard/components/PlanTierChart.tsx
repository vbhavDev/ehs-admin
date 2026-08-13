'use client';
import React from 'react';
import { ApexOptions } from 'apexcharts';
import dynamic from 'next/dynamic';
import { ChartCard } from './ChartCard';
import { EmptyState } from './OrgStatusChart';
import type { BreakdownSlice } from '../hooks/useDashboardStats';

const ReactApexChart = dynamic(() => import('react-apexcharts'), { ssr: false });

interface PlanTierChartProps {
  data: BreakdownSlice[];
  className?: string;
}

/** Organizations per subscription plan tier — horizontal bar chart. */
export const PlanTierChart: React.FC<PlanTierChartProps> = ({
  data,
  className = 'col-span-12 md:col-span-6 xl:col-span-4',
}) => {
  const hasData = data.some((d) => d.value > 0);

  const options: ApexOptions = {
    colors: ['#E31E24'],
    chart: { fontFamily: 'Roboto, sans-serif', type: 'bar', height: 310, toolbar: { show: false } },
    plotOptions: {
      bar: {
        horizontal: true,
        barHeight: '55%',
        borderRadius: 5,
        borderRadiusApplication: 'end',
      },
    },
    dataLabels: { enabled: true, formatter: (val: number) => `${val}` },
    xaxis: {
      categories: data.map((d) => d.label),
      min: 0,
      labels: { formatter: (val: string) => `${Math.round(Number(val))}` },
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    yaxis: { labels: { maxWidth: 140 } },
    legend: { show: false },
    grid: { xaxis: { lines: { show: true } }, yaxis: { lines: { show: false } } },
    tooltip: { y: { formatter: (val: number) => `${val} org${val === 1 ? '' : 's'}` } },
  };

  return (
    <ChartCard
      title="Organizations by Plan"
      subtitle="Tenant distribution across subscription tiers"
      className={className}
    >
      {hasData ? (
        <ReactApexChart
          options={options}
          series={[{ name: 'Organizations', data: data.map((d) => d.value) }]}
          type="bar"
          height={310}
        />
      ) : (
        <EmptyState message="No plan assignments yet" />
      )}
    </ChartCard>
  );
};
