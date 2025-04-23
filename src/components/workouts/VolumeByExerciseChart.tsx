
import React from "react";
import { ChartContainer } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts";
import { Card, CardContent } from "@/components/ui/card";

const VolumeByExerciseChart = ({
  workoutData,
  weightUnit
}: {
  workoutData: any;
  weightUnit: string;
}) => {
  const getVolumeChartData = () => {
    if (!workoutData) return [];
    return Object.keys(workoutData.exercises).map(exercise => {
      const totalExerciseVolume = workoutData.exercises[exercise].reduce((total: number, set: any) => {
        if (set.completed) {
          // Assuming weight is already converted before
          return total + (set.weight * (set.reps || 0));
        }
        return total;
      }, 0);
      return {
        name: exercise,
        volume: Math.round(totalExerciseVolume * 10) / 10
      };
    });
  };
  const data = getVolumeChartData();
  const chartConfig = {
    volume: { theme: { dark: '#9b87f5', light: '#9b87f5' } }
  };
  return (
    <div className="mt-6">
      <h3 className="text-label text-gray-400 mb-2">
        Volume by Exercise <span className="text-xs">({weightUnit})</span>
      </h3>
      <div className="bg-gray-800 p-3 rounded-lg h-40">
        <ChartContainer 
          className="h-full w-full [&_.recharts-cartesian-axis-tick-value]:fill-gray-400 [&_.recharts-cartesian-axis-tick-value]:text-xs [&_.recharts-cartesian-axis-tick-value]:font-mono"
          config={chartConfig}
        >
          <BarChart data={data} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
            <XAxis dataKey="name" tick={{ fontSize: 10 }} />
            <YAxis tick={{ fontSize: 10 }} />
            <Tooltip 
              formatter={(value: number) => [`${value} ${weightUnit}`, 'Volume']}
              labelFormatter={(label: string) => `Exercise: ${label}`}
            />
            <Bar dataKey="volume" name="Volume" fill="var(--color-volume)" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ChartContainer>
      </div>
    </div>
  );
};
export default VolumeByExerciseChart;
