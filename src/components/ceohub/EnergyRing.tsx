import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { getColorForStatus, getStatusLevel } from '@/constants/ceohub';

interface EnergyRingProps {
  energy: number;
  stress: number;
  size?: 'small' | 'large';
  showLabel?: boolean;
}

export const EnergyRing: React.FC<EnergyRingProps> = ({ energy, stress, size = 'large', showLabel = true }) => {
  const energyStatus = getStatusLevel(energy);
  const energyColor = getColorForStatus(energyStatus);
  const stressColor = '#FF5C5C';

  const energyData = [
    { name: 'Value', value: energy },
    { name: 'Remaining', value: 100 - energy },
  ];

  const stressData = [
    { name: 'Value', value: stress },
    { name: 'Remaining', value: 100 - stress },
  ];

  const outerRadius = size === 'large' ? 120 : 35;
  const innerRadius = size === 'large' ? 116 : 32;
  const stressOuter = size === 'large' ? 100 : 25;
  const stressInner = size === 'large' ? 97 : 23;

  return (
    <div className={`relative flex items-center justify-center ${size === 'large' ? 'h-72 w-full' : 'h-20 w-20'}`}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={energyData}
            cx="50%"
            cy="50%"
            innerRadius={innerRadius}
            outerRadius={outerRadius}
            startAngle={90}
            endAngle={-270}
            dataKey="value"
            stroke="none"
            cornerRadius={size === 'large' ? 4 : 2}
            paddingAngle={3}
            animationDuration={1500}
            animationEasing="ease-out"
          >
            <Cell fill={energyColor} className="filter drop-shadow-[0_0_8px_rgba(61,220,151,0.2)]" />
            <Cell fill="#1F1F25" />
          </Pie>
          <Pie
            data={stressData}
            cx="50%"
            cy="50%"
            innerRadius={stressInner}
            outerRadius={stressOuter}
            startAngle={90}
            endAngle={-270}
            dataKey="value"
            stroke="none"
            cornerRadius={size === 'large' ? 4 : 2}
            paddingAngle={3}
            animationDuration={1500}
            animationEasing="ease-out"
          >
            <Cell fill={stressColor} fillOpacity={0.8} className="filter drop-shadow-[0_0_5px_rgba(255,92,92,0.2)]" />
            <Cell fill="#1F1F25" />
          </Pie>
        </PieChart>
      </ResponsiveContainer>

      {size === 'large' && showLabel && (
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none animate-fade-in">
          <span className="text-7xl font-light tracking-tighter text-white">
            {energy}%
          </span>
          <span
            className="text-[10px] tracking-[0.2em] uppercase mt-3 font-medium opacity-80"
            style={{ color: energyColor }}
          >
            {energyStatus === 'READY' ? 'Ready to Perform' : energyStatus === 'SELECTIVE' ? 'Selective' : 'Recovery Priority'}
          </span>
        </div>
      )}
    </div>
  );
};
