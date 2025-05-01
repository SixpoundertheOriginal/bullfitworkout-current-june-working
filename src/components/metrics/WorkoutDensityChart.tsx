
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

export const WorkoutDensityChart: React.FC<WorkoutDensityChartProps> = React.memo(({
  totalTime = 0,
  activeTime = 0,
  restTime = 0,
  totalVolume = 0,
  weightUnit = 'kg',
  overallDensity: propOverallDensity,
  activeOnlyDensity: propActiveOnlyDensity
}) => {
  // Add more debug logging
  console.log("WorkoutDensityChart rendering with props:", { 
    totalTime, activeTime, restTime, totalVolume, weightUnit,
    overallDensity: propOverallDensity, 
    activeOnlyDensity: propActiveOnlyDensity 
  });
  
  // Calculate density metrics if not provided or if they're zero
  const overallDensity = propOverallDensity ?? (totalTime > 0 ? totalVolume / totalTime : 0);
  const activeOnlyDensity = propActiveOnlyDensity ?? (activeTime > 0 ? totalVolume / activeTime : 0);
  
  const formatDensity = (value: number) => {
    if (isNaN(value) || value === undefined || value === null) return "0.0";
    return value < 10 ? value.toFixed(1) : Math.round(value).toString();
  };
  
  const densityData = React.useMemo(() => [
    {
      name: 'Overall',
      density: overallDensity || 0,
      color: '#8b5cf6',
      displayValue: `${formatDensity(overallDensity)} ${weightUnit}/min`
    },
    {
      name: 'Active Only',
      density: activeOnlyDensity || 0,
      color: '#4ade80',
      displayValue: `${formatDensity(activeOnlyDensity)} ${weightUnit}/min`
    }
  ], [overallDensity, activeOnlyDensity, weightUnit]);
  
  // Use fallback values for time data to avoid NaN
  const timeData = React.useMemo(() => {
    const safeActiveTime = activeTime || 0;
    const safeRestTime = restTime || 0;
    const safeTotalTime = totalTime || 1; // Avoid division by zero
    
    return [
      {
        name: 'Time',
        activeTime: safeActiveTime,
        restTime: safeRestTime,
        percentage: Math.round((safeActiveTime / safeTotalTime) * 100) || 0
      }
    ];
  }, [activeTime, restTime, totalTime]);
  
  return (
    <div className="space-y-4">
      <div className="h-28 min-h-[112px] overflow-hidden">
        <h3 className="text-xs text-center mb-1">Workout Density</h3>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={densityData}
            margin={{ top: 5, right: 20, left: 20, bottom: 5 }}
            layout="vertical"
            barGap={0}
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
              isAnimationActive={false}
            />
            <Bar 
              dataKey="density" 
              radius={[0, 4, 4, 0]} 
              isAnimationActive={false}
            >
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
            Active: {Math.round(timeData[0].activeTime)}m
          </span>
          <span className="text-xs text-gray-400">
            {timeData[0].percentage}%
          </span>
          <span className="text-xs text-gray-400">
            Rest: {Math.round(timeData[0].restTime)}m
          </span>
        </div>
      </div>
    </div>
  );
});

WorkoutDensityChart.displayName = 'WorkoutDensityChart';
