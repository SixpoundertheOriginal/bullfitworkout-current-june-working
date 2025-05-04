
import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";

interface MuscleGroupChartProps {
  muscleFocus: Record<string, number>;
  height?: number;
}

export const MuscleGroupChart: React.FC<MuscleGroupChartProps> = ({ muscleFocus, height = 250 }) => {
  const COLORS = {
    chest: '#f97316',
    back: '#0ea5e9',
    legs: '#84cc16',
    shoulders: '#8b5cf6',
    arms: '#ec4899',
    core: '#f59e0b',
    other: '#6b7280'
  };
  
  const chartData = Object.entries(muscleFocus).map(([muscle, count]) => ({
    name: muscle.charAt(0).toUpperCase() + muscle.slice(1),
    value: count,
    color: COLORS[muscle as keyof typeof COLORS] || COLORS.other
  }));
  
  if (chartData.length === 0) {
    return <div className="flex items-center justify-center h-full text-gray-400">No muscle data available</div>;
  }
  
  return (
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
            formatter={(value) => [`${value} sets`, 'Count']}
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
  );
};
