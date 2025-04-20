
import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
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

  const config = {
    volume: {
      theme: {
        dark: '#9b87f5',
      },
    },
  };

  return (
    <div className="mt-6 p-4 bg-gray-900/50 rounded-xl border border-gray-800">
      <h3 className="text-sm font-medium text-gray-300 mb-4">Exercise Volume Distribution</h3>
      <div className="h-64">
        <ChartContainer config={config}>
          <BarChart data={data} margin={{ top: 10, right: 10, left: 10, bottom: 20 }}>
            <XAxis
              dataKey="name"
              angle={-45}
              textAnchor="end"
              height={60}
              stroke="#666"
              fontSize={12}
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
                    <ChartTooltipContent
                      active={active}
                      payload={payload}
                      formatter={(value) => `${value} ${weightUnit}`}
                    />
                  );
                }
                return null;
              }}
            />
            <Bar
              dataKey="volume"
              fill="url(#gradient)"
              radius={[4, 4, 0, 0]}
            />
            <defs>
              <linearGradient id="gradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#9b87f5" />
                <stop offset="100%" stopColor="#7E69AB" />
              </linearGradient>
            </defs>
          </BarChart>
        </ChartContainer>
      </div>
    </div>
  );
};
