
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";

interface WorkoutDaysChartProps {
  daysFrequency: Record<string, number>;
  height?: number;
}

export const WorkoutDaysChart: React.FC<WorkoutDaysChartProps> = ({ daysFrequency, height = 250 }) => {
  // Order days correctly
  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
  
  const chartData = days.map(day => ({
    name: day.charAt(0).toUpperCase() + day.slice(1, 3),
    value: daysFrequency[day] || 0,
    fullName: day.charAt(0).toUpperCase() + day.slice(1)
  }));
  
  // Determine today for highlighting
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
  
  return (
    <div className="h-60">
      <ResponsiveContainer width="100%" height={height}>
        <BarChart 
          data={chartData} 
          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
        >
          <XAxis 
            dataKey="name" 
            tick={{ fill: '#f9fafb', fontSize: 12 }} 
            axisLine={{ stroke: '#374151' }}
          />
          <YAxis 
            tick={{ fill: '#f9fafb', fontSize: 12 }} 
            axisLine={{ stroke: '#374151' }}
          />
          <Tooltip 
            formatter={(value, name, props) => [`${value} workouts`, props.payload.fullName]}
            contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', color: '#f9fafb' }}
            cursor={{ fill: 'rgba(99, 102, 241, 0.1)' }}
          />
          <Bar 
            dataKey="value" 
            radius={[4, 4, 0, 0]}
            maxBarSize={40}
          >
            {chartData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={entry.fullName.toLowerCase() === today ? '#8b5cf6' : '#4c1d95'}
                opacity={entry.value > 0 ? 1 : 0.5}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
