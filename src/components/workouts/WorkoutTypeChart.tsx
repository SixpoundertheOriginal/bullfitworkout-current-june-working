
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { ChartContainer } from "@/components/ui/chart";
import { WorkoutTypeStats } from "@/hooks/useWorkoutStats";

interface WorkoutTypeChartProps {
  data: WorkoutTypeStats[];
  className?: string;
}

export const WorkoutTypeChart = ({ data, className = "" }: WorkoutTypeChartProps) => {
  const COLORS = ['#8B5CF6', '#EC4899', '#3B82F6', '#10B981', '#F59E0B', '#EF4444'];
  
  const chartData = data.map((item, index) => ({
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
  
  return (
    <Card className={`bg-gray-900 border-gray-800 ${className}`}>
      <CardHeader className="pb-2">
        <CardTitle className="text-md">Workout Type Distribution</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-60">
          <ChartContainer>
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
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value, name) => [`${value} workouts`, name]}
                  contentStyle={{ 
                    backgroundColor: '#1A1F2C', 
                    border: '1px solid #333',
                    borderRadius: '4px'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </ChartContainer>
        </div>
        
        <div className="grid grid-cols-2 gap-2 mt-2">
          {chartData.slice(0, 6).map((entry, index) => (
            <div key={`legend-${index}`} className="flex items-center space-x-2">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: entry.color }}
              ></div>
              <span className="text-xs truncate">{entry.name}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
