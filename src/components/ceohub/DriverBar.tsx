import React from 'react';
import { MetricDriver } from '@/types/ceohub';

interface DriverBarProps {
  driver: MetricDriver;
  showDetail?: boolean;
}

const getColor = (status: MetricDriver['status']) => {
  if (status === 'good') return 'bg-[#3DDC97]';
  if (status === 'poor') return 'bg-[#FF5C5C]';
  return 'bg-[#F5B942]';
};

export const DriverBar: React.FC<DriverBarProps> = ({ driver, showDetail = false }) => {
  return (
    <div className="flex flex-col gap-2 mb-5">
      <div className="flex justify-between items-end text-sm text-zinc-400">
        <span className="font-light tracking-[0.1em] text-white text-xs uppercase opacity-80">
          {driver.name}
        </span>
        {showDetail && (
          <span className={`text-xs font-mono ${driver.status === 'poor' ? 'text-[#FF5C5C]' : 'text-zinc-400'}`}>
            {driver.raw}
          </span>
        )}
      </div>
      <div className="h-[2px] w-full bg-[#1F1F25] overflow-hidden">
        <div
          className={`h-full ${getColor(driver.status)} shadow-[0_0_8px_rgba(255,255,255,0.2)] transition-all duration-1000 ease-out`}
          style={{ width: `${Math.min(driver.value, 100)}%` }}
        />
      </div>
    </div>
  );
};
