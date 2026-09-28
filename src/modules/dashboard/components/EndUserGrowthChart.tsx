'use client';
import React from 'react';
import { ApexOptions } from 'apexcharts';
import dynamic from 'next/dynamic';
import { ChartCard } from './ChartCard';
import type { GrowthPoint } from '../hooks/useDashboardStats';

// Dynamically import the ReactApexChart component (matches existing chart pattern)
const ReactApexChart = dynamic(() => import('react-apexcharts'), { ssr: false });

interface EndUserGrowthChartProps {
  data: GrowthPoint[];
  showOrganizations: boolean;
  showEndUsers: boolean;
  className?: string;
}

/** Monthly sign-up growth (organizations + end users) — area chart. */
export const EndUserGrowthChart: React.FC<EndUserGrowthChartProps> = ({
  data,
  showOrganizations,
  showEndUsers,
  className = 'col-span-12 xl:col-span-8',
}) => {
  const series: ApexAxisChartSeries = [];
  if (showEndUsers) {
    series.push({ name: 'End Users', data: data.map((d) => d.endUsers) });
  }
  if (showOrganizations) {
    series.push({ name: 'Organizations', data: data.map((d) => d.organizations) });
  }

  const options: ApexOptions = {
    colors: ['#1570EF', '#E31E24'],
    chart: {
      fontFamily: 'Roboto, sans-serif',
      type: 'area',
      height: 310,
      toolbar: { show: false },
    },
    stroke: { curve: 'smooth', width: 2.5 },
    fill: {
      type: 'gradient',
      gradient: { opacityFrom: 0.35, opacityTo: 0.02, stops: [0, 90, 100] },
    },
    dataLabels: { enabled: false },
    markers: { size: 0, hover: { size: 5 } },
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
    legend: { show: true, position: 'top', horizontalAlign: 'left', fontFamily: 'Roboto' },
    grid: {
      yaxis: { lines: { show: true } },
      xaxis: { lines: { show: false } },
    },
    tooltip: { x: { show: true }, y: { formatter: (val: number) => `${val} new` } },
  };

  return (
    <ChartCard
      title="Platform Growth"
      subtitle="New sign-ups over the last 6 months"
      className={className}
    >
      <div className="max-w-full overflow-x-auto custom-scrollbar">
        <div className="min-w-[560px]">
          <ReactApexChart options={options} series={series} type="area" height={310} />
        </div>
      </div>
    </ChartCard>
  );
};
