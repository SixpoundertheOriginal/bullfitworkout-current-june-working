
import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Card } from '@/components/ui/card';
import { SectionHeader } from '@/components/profile/SectionHeader';

interface WorkoutType {
  type: string;
  count: number;
  totalDuration: number;
  percentage: number;
  timeOfDay: {
    morning: number;
    afternoon: number;
    evening: number;
    night: number;
  };
  averageDuration: number;
}

export interface WorkoutTypeChartProps {
  workoutTypes: WorkoutType[];
  height?: number;
}

export const WorkoutTypeChart: React.FC<WorkoutTypeChartProps> = ({ 
  workoutTypes = [], 
  height = 250 
}) => {
  // Generate a color for each workout type
  const COLORS = ['#8b5cf6', '#ec4899', '#f97316', '#f59e0b', '#84cc16', '#10b981', '#0ea5e9'];
  
  // If no data is available
  if (!workoutTypes || workoutTypes.length === 0) {
    return (
      <Card className="bg-gray-900 border-gray-800 p-6">
        <SectionHeader title="Workout Types" />
        <div className="h-60 flex items-center justify-center text-gray-400">
          No workout data available
        </div>
      </Card>
    );
  }
  
  // Transform data for the pie chart
  const chartData = workoutTypes.map((item, index) => ({
    name: item.type.charAt(0).toUpperCase() + item.type.slice(1),
    value: item.count,
    color: COLORS[index % COLORS.length]
  }));
  
  return (
    <Card className="bg-gray-900 border-gray-800 p-6">
      <SectionHeader title="Workout Types" />
      <div className="h-60">
        <ResponsiveContainer width="100%" height={height}>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={40}
              outerRadius={80}
              fill="#8884d8"
              paddingAngle={2}
              dataKey="value"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value) => [`${value} workouts`, 'Count']}
              contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', color: '#f9fafb' }}
            />
            <Legend 
              layout="horizontal" 
              verticalAlign="bottom" 
              align="center"
              formatter={(value) => (
                <span style={{ color: '#f9fafb' }}>{value}</span>
              )}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};
