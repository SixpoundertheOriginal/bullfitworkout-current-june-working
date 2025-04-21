
import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Cell,
} from 'recharts';
import { ExerciseSet } from '@/types/exercise';
import { ChartContainer, ChartTooltipContent } from '@/components/ui/chart';

interface ExerciseVolumeChartProps {
  exercises: Record<string, ExerciseSet[]>;
  weightUnit: string;
}

const calculateExerciseVolume = (sets: ExerciseSet[]) => {
  return sets.reduce((total, set) => {
    if (set.completed && set.weight > 0 && set.reps > 0) {
      return total + (set.weight * set.reps);
    }
    return total;
  }, 0);
};

export const ExerciseVolumeChart = ({ exercises, weightUnit }: ExerciseVolumeChartProps) => {
  const data = Object.entries(exercises).map(([name, sets]) => ({
    name: name,
    volume: calculateExerciseVolume(sets),
  }));

  const isEmpty = data.length === 0 || data.every(item => item.volume === 0);

  const config = {
    volume: {
      label: 'Volume',
      theme: {
        light: '#b898fc',
        dark: '#9b87f5'
      }
    }
  };

  if (isEmpty) {
    return (
      <div className="mt-2 p-3 bg-gray-900/70 rounded-lg border border-gray-800">
        <h3 className="text-xs font-medium text-gray-300 mb-2">Exercise Volume Distribution</h3>
        <div className="h-32 flex items-center justify-center text-gray-400 text-xs">
          No exercise volume data available yet.
        </div>
      </div>
    );
  }

  return (
    <div className="mt-2 p-3 bg-gray-900/70 rounded-lg border border-gray-800">
      <h3 className="text-xs font-medium text-gray-300 mb-2">Exercise Volume Distribution</h3>
      <div className="h-44">
        <ChartContainer config={config}>
          <BarChart 
            data={data} 
            margin={{ top: 8, right: 10, left: 10, bottom: 20 }}
            barCategoryGap={20}
            barGap={8}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
            <XAxis
              dataKey="name"
              angle={-40}
              textAnchor="end"
              height={48}
              stroke="#8884d8"
              fontSize={11}
              tickFormatter={(value) => value.length > 12 ? `${value.substring(0, 12)}...` : value}
            />
            <YAxis
              stroke="#aaa"
              fontSize={11}
              width={48}
              tickFormatter={(value) => `${value} ${weightUnit}`}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const exerciseName = payload[0].payload.name;
                  const value = payload[0].value;
                  
                  let formattedValue = value;
                  if (typeof value === 'number') {
                    formattedValue = value.toFixed(1);
                  }
                  
                  return (
                    <div className="bg-white/90 rounded p-2 shadow border border-gray-200 text-gray-900 text-xs">
                      <div className="font-semibold mb-1">{exerciseName}</div>
                      <div className="">{formattedValue} {weightUnit}</div>
                    </div>
                  );
                }
                return null;
              }}
              cursor={{ fill: 'rgba(0,0,0,0.08)' }}
            />
            <Bar
              dataKey="volume"
              fill="url(#gradient)"
              radius={[4, 4, 0, 0]}
              barSize={24}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={`url(#gradient-${index})`} />
              ))}
            </Bar>
            <defs>
              <linearGradient id="gradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#9b87f5" />
                <stop offset="100%" stopColor="#7E69AB" />
              </linearGradient>
              {data.map((entry, index) => (
                <linearGradient key={`gradient-${index}`} id={`gradient-${index}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={`hsl(${260 + index * 20}, 80%, 65%)`} />
                  <stop offset="100%" stopColor={`hsl(${260 + index * 20}, 70%, 40%)`} />
                </linearGradient>
              ))}
            </defs>
          </BarChart>
        </ChartContainer>
      </div>
    </div>
  );
};
