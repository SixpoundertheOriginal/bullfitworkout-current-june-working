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
      <div className="mt-6 p-4 bg-gray-900/50 rounded-xl border border-gray-800">
        <h3 className="text-sm font-medium text-gray-300 mb-4">Exercise Volume Distribution</h3>
        <div className="h-64 flex items-center justify-center text-gray-400">
          No exercise volume data available yet.
          Complete sets with weight and reps to see your distribution.
        </div>
      </div>
    );
  }

  return (
    <div className="mt-6 p-4 bg-gray-900/50 rounded-xl border border-gray-800">
      <h3 className="text-sm font-medium text-gray-300 mb-4">Exercise Volume Distribution</h3>
      <div className="h-64">
        <ChartContainer config={config}>
          <BarChart 
            data={data} 
            margin={{ top: 10, right: 10, left: 10, bottom: 30 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
            <XAxis
              dataKey="name"
              angle={-45}
              textAnchor="end"
              height={60}
              stroke="#666"
              fontSize={12}
              tickFormatter={(value) => value.length > 15 ? `${value.substring(0, 15)}...` : value}
            />
            <YAxis
              stroke="#666"
              fontSize={12}
              tickFormatter={(value) => `${value} ${weightUnit}`}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="bg-white/90 rounded-md p-3 shadow-lg border border-gray-200 text-gray-900">
                      <div className="font-semibold mb-1">{payload[0].name}</div>
                      <div className="text-sm">
                        Volume: {payload[0].value.toFixed(1)} {weightUnit}
                      </div>
                    </div>
                  );
                }
                return null;
              }}
              cursor={{ fill: 'rgba(0, 0, 0, 0.1)' }}
            />
            <Bar
              dataKey="volume"
              fill="url(#gradient)"
              radius={[4, 4, 0, 0]}
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
