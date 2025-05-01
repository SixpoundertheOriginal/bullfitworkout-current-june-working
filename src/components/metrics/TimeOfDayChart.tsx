
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";

interface TimeOfDayChartProps {
  durationByTimeOfDay: {
    morning: number;
    afternoon: number;
    evening: number;
    night: number;
  };
}

export const TimeOfDayChart: React.FC<TimeOfDayChartProps> = ({ durationByTimeOfDay }) => {
  const chartData = [
    { name: 'Morning', value: durationByTimeOfDay.morning, color: '#84cc16' },
    { name: 'Afternoon', value: durationByTimeOfDay.afternoon, color: '#f59e0b' },
    { name: 'Evening', value: durationByTimeOfDay.evening, color: '#8b5cf6' },
    { name: 'Night', value: durationByTimeOfDay.night, color: '#0ea5e9' }
  ];
  
  return (
    <div className="h-60">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <XAxis 
            dataKey="name" 
            tick={{ fill: '#f9fafb', fontSize: 12 }} 
            axisLine={{ stroke: '#374151' }}
          />
          <YAxis 
            tick={{ fill: '#f9fafb', fontSize: 12 }} 
            axisLine={{ stroke: '#374151' }}
            tickFormatter={(value: number) => `${Math.round(value)}m`}
          />
          <Tooltip 
            formatter={(value: number) => [`${Math.round(value)} minutes`, 'Duration']}
            contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', color: '#f9fafb' }}
            cursor={{ fill: 'rgba(99, 102, 241, 0.1)' }}
          />
          <Bar 
            dataKey="value" 
            radius={[4, 4, 0, 0]}
            maxBarSize={50}
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
