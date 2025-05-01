
import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { WorkoutTypeStats } from "@/types/workout-metrics";

interface WorkoutTypeChartProps {
  workoutTypes: WorkoutTypeStats[];
}

export const WorkoutTypeChart: React.FC<WorkoutTypeChartProps> = ({ workoutTypes }) => {
  const COLORS = ['#8B5CF6', '#EC4899', '#3B82F6', '#10B981', '#F59E0B', '#EF4444'];
  
  const chartData = workoutTypes.map((item, index) => ({
    name: item.type,
    value: item.count,
    color: COLORS[index % COLORS.length]
  }));
  
  const renderCustomizedLabel = ({ 
    cx, 
    cy, 
    midAngle, 
    innerRadius, 
    outerRadius, 
    percent 
  }: any) => {
    if (percent < 0.05) return null;
    
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
    
    return (
      <text 
        x={x} 
        y={y} 
        fill="white" 
        textAnchor="middle" 
        dominantBaseline="central"
        fontSize={12}
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };
  
  if (chartData.length === 0) {
    return <div className="flex items-center justify-center h-full text-gray-400">No data available</div>;
  }
  
  return (
    <div className="h-60">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={renderCustomizedLabel}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
            stroke="#1A1F2C"
            strokeWidth={2}
          >
            {chartData.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={entry.color} 
                opacity={0.8}
              />
            ))}
          </Pie>
          <Tooltip 
            formatter={(value, name) => [`${value} workouts`, name]}
            contentStyle={{ 
              backgroundColor: '#1A1F2C', 
              border: '1px solid #333',
              borderRadius: '4px',
              color: 'white'
            }}
            itemStyle={{ color: 'white' }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};
