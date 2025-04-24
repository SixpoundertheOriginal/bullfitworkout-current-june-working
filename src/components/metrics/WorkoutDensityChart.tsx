
import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LabelList
} from 'recharts';
import { WeightUnit } from '@/utils/unitConversion';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';

interface WorkoutDensityChartProps {
  totalTime: number;
  activeTime: number;
  restTime: number;
  totalVolume: number;
  weightUnit: WeightUnit;
}

export const WorkoutDensityChart: React.FC<WorkoutDensityChartProps> = ({
  totalTime,
  activeTime,
  restTime,
  totalVolume,
  weightUnit
}) => {
  // Calculate densities
  const overallDensity = totalTime > 0 ? totalVolume / totalTime : 0;
  const activeDensity = activeTime > 0 ? totalVolume / activeTime : 0;
  
  const data = [
    {
      name: 'Overall',
      density: overallDensity,
      tooltip: `${overallDensity.toFixed(1)} ${weightUnit}/min`,
      fill: '#8884d8'
    },
    {
      name: 'Active Only',
      density: activeDensity,
      tooltip: `${activeDensity.toFixed(1)} ${weightUnit}/min`,
      fill: '#82ca9d'
    }
  ];
  
  // For time allocation
  const timeData = [
    {
      name: 'Active',
      time: activeTime,
      percentage: (activeTime / totalTime) * 100,
      fill: '#82ca9d'
    },
    {
      name: 'Rest',
      time: restTime,
      percentage: (restTime / totalTime) * 100,
      fill: '#8884d8'
    }
  ];

  const config = {
    primary: {
      label: 'Volume',
      color: '#8884d8'
    },
    secondary: {
      label: 'Time Distribution',
      color: '#82ca9d'
    }
  };
  
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 h-full">
      <div className="bg-gray-800/30 rounded p-2 h-full">
        <div className="text-xs text-center mb-1">Workout Density</div>
        <ChartContainer className="h-full w-full" config={config}>
          <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
            <XAxis 
              dataKey="name" 
              tick={{ fill: '#9ca3af', fontSize: 10 }}
              axisLine={{ stroke: '#374151' }}
            />
            <YAxis 
              tick={{ fill: '#9ca3af', fontSize: 10 }}
              axisLine={{ stroke: '#374151' }} 
              tickFormatter={(value) => `${value.toFixed(0)}`}
              label={{ 
                value: `${weightUnit}/min`, 
                angle: -90, 
                position: 'insideLeft',
                style: { fill: '#9ca3af', fontSize: 10 }
              }}
            />
            <ChartTooltip
              content={<ChartTooltipContent />}
            />
            <Bar dataKey="density" fill="#8884d8">
              <LabelList dataKey="tooltip" position="top" fill="#fff" fontSize={10} />
            </Bar>
          </BarChart>
        </ChartContainer>
      </div>
      
      <div className="bg-gray-800/30 rounded p-2 h-full">
        <div className="text-xs text-center mb-1">Time Distribution</div>
        <ChartContainer className="h-full w-full" config={config}>
          <BarChart data={timeData} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
            <XAxis 
              dataKey="name" 
              tick={{ fill: '#9ca3af', fontSize: 10 }}
              axisLine={{ stroke: '#374151' }}
            />
            <YAxis 
              tick={{ fill: '#9ca3af', fontSize: 10 }}
              axisLine={{ stroke: '#374151' }}
              tickFormatter={(value) => `${value}min`}
            />
            <ChartTooltip
              content={<ChartTooltipContent />}
            />
            <Bar dataKey="time" fill="#82ca9d">
              <LabelList dataKey="percentage" position="top" fill="#fff" fontSize={10} formatter={(value: number) => `${value.toFixed(0)}%`} />
            </Bar>
          </BarChart>
        </ChartContainer>
      </div>
    </div>
  );
};
