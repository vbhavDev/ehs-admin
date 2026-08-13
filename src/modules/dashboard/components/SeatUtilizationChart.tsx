'use client';
import React from 'react';
import { ApexOptions } from 'apexcharts';
import dynamic from 'next/dynamic';
import { ChartCard } from './ChartCard';
import { EmptyState } from './OrgStatusChart';

const ReactApexChart = dynamic(() => import('react-apexcharts'), { ssr: false });

interface SeatUtilizationChartProps {
  used: number;
  limit: number;
  percent: number;
  className?: string;
}

/** Platform-wide seat consumption — radial gauge with used/limit figures. */
export const SeatUtilizationChart: React.FC<SeatUtilizationChartProps> = ({
  used,
  limit,
  percent,
  className = 'col-span-12 xl:col-span-4',
}) => {
  const hasData = limit > 0;

  const options: ApexOptions = {
    colors: ['#1570EF'],
    chart: { fontFamily: 'Roboto, sans-serif', type: 'radialBar', height: 310 },
    plotOptions: {
      radialBar: {
        startAngle: -120,
        endAngle: 120,
        hollow: { size: '62%' },
        track: { background: '#E4E7EC', strokeWidth: '100%' },
        dataLabels: {
          name: { show: true, fontSize: '12px', offsetY: 24, fontFamily: 'Roboto' },
          value: {
            show: true,
            fontSize: '34px',
            fontWeight: 700,
            offsetY: -12,
            fontFamily: 'Roboto',
            formatter: (val: number) => `${Math.round(val)}%`,
          },
        },
      },
    },
    fill: {
      type: 'gradient',
      gradient: {
        shade: 'dark',
        type: 'horizontal',
        gradientToColors: ['#E31E24'],
        stops: [0, 100],
      },
    },
    stroke: { lineCap: 'round' },
    labels: ['Seats Used'],
  };

  return (
    <ChartCard
      title="Seat Utilization"
      subtitle="Sold seats in use across all organizations"
      className={className}
    >
      {hasData ? (
        <>
          <ReactApexChart options={options} series={[percent]} type="radialBar" height={260} />
          <div className="mt-1 flex items-center justify-center gap-6 text-center">
            <div>
              <p className="text-lg font-bold text-gray-900 dark:text-white">
                {used.toLocaleString()}
              </p>
              <p className="text-xs font-medium uppercase tracking-wide text-gray-400">Used</p>
            </div>
            <div className="h-8 w-px bg-gray-100 dark:bg-navy-700" />
            <div>
              <p className="text-lg font-bold text-gray-900 dark:text-white">
                {limit.toLocaleString()}
              </p>
              <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                Total Seats
              </p>
            </div>
          </div>
        </>
      ) : (
        <EmptyState message="No seat limits configured yet" />
      )}
    </ChartCard>
  );
};
