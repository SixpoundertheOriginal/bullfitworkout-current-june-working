
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LabelList } from 'recharts';

interface WorkoutDensityChartProps {
  totalTime: number;
  activeTime: number;
  restTime: number;
  totalVolume: number;
  weightUnit: string;
  overallDensity?: number;
  activeOnlyDensity?: number;
}

export const WorkoutDensityChart: React.FC<WorkoutDensityChartProps> = ({
  totalTime,
  activeTime,
  restTime,
  totalVolume,
  weightUnit,
  overallDensity: propOverallDensity,
  activeOnlyDensity: propActiveOnlyDensity
}) => {
  // Calculate density metrics if not provided
  const overallDensity = propOverallDensity ?? (totalTime > 0 ? totalVolume / totalTime : 0);
  const activeOnlyDensity = propActiveOnlyDensity ?? (activeTime > 0 ? totalVolume / activeTime : 0);
  
  const formatDensity = (value: number) => {
    return value < 10 ? value.toFixed(1) : Math.round(value);
  };
  
  const densityData = [
    {
      name: 'Overall',
      density: overallDensity,
      color: '#8b5cf6',
      displayValue: `${formatDensity(overallDensity)} ${weightUnit}/min`
    },
    {
      name: 'Active Only',
      density: activeOnlyDensity,
      color: '#4ade80',
      displayValue: `${formatDensity(activeOnlyDensity)} ${weightUnit}/min`
    }
  ];
  
  const timeData = [
    {
      name: 'Time',
      activeTime,
      restTime,
      percentage: Math.round((activeTime / totalTime) * 100)
    }
  ];
  
  return (
    <div className="space-y-4">
      <div className="h-28">
        <h3 className="text-xs text-center mb-1">Workout Density</h3>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={densityData}
            margin={{ top: 5, right: 20, left: 20, bottom: 5 }}
            layout="vertical"
          >
            <XAxis type="number" hide={true} />
            <YAxis 
              type="category" 
              dataKey="name" 
              axisLine={false} 
              tickLine={false}
              tick={{ fontSize: 12, fill: '#aaa' }}
            />
            <Tooltip
              formatter={(value) => [`${value} ${weightUnit}/min`, 'Density']}
              contentStyle={{ backgroundColor: '#1e1e2e', border: 'none' }}
            />
            <Bar dataKey="density" radius={[0, 4, 4, 0]}>
              {densityData.map((entry, index) => (
                <LabelList 
                  key={`label-${index}`}
                  dataKey="displayValue" 
                  position="right" 
                  style={{ fill: '#fff', fontSize: '0.8rem', fontWeight: 'bold' }} 
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      
      <div>
        <h3 className="text-xs text-center mb-1">Time Distribution</h3>
        <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-purple-600 to-pink-600"
            style={{ width: `${timeData[0].percentage}%` }}
          />
        </div>
        <div className="flex justify-between mt-1">
          <span className="text-xs text-gray-400">
            Active: {Math.round(activeTime)}m
          </span>
          <span className="text-xs text-gray-400">
            {timeData[0].percentage}%
          </span>
          <span className="text-xs text-gray-400">
            Rest: {Math.round(restTime)}m
          </span>
        </div>
      </div>
    </div>
  );
};
