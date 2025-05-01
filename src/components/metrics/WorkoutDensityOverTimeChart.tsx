
import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid } from 'recharts';
import { format } from 'date-fns';
import { Activity } from 'lucide-react';
import { useWeightUnit } from '@/context/WeightUnitContext';

interface WorkoutDensityOverTimeChartProps {
  data: Array<{
    date: string;
    overallDensity: number;
    activeOnlyDensity?: number;
  }>;
  className?: string;
  height?: number;
}

export const WorkoutDensityOverTimeChart: React.FC<WorkoutDensityOverTimeChartProps> = React.memo(({ 
  data,
  className = '',
  height = 200
}) => {
  const { weightUnit } = useWeightUnit();
  
  console.log("WorkoutDensityOverTimeChart rendering with data:", data?.length || 0, "items");
  
  // Ensure we have data to display
  const hasData = Array.isArray(data) && data.length > 0 && data.some(item => item.overallDensity > 0);
  
  // Format data for the chart - memoized to prevent re-processing
  const formattedData = useMemo(() => {
    if (!hasData) return [];
    
    return data.map(item => ({
      date: format(new Date(item.date), 'MMM d'),
      overallDensity: Number(item.overallDensity.toFixed(1)),
      activeOnlyDensity: item.activeOnlyDensity ? Number(item.activeOnlyDensity.toFixed(1)) : undefined,
      originalDate: item.date,
    }));
  }, [data, hasData]);
  
  // Calculate average densities - memoized
  const averages = useMemo(() => {
    if (!hasData) return { overall: 0, activeOnly: 0 };
    
    const sumOverall = data.reduce((acc, item) => acc + item.overallDensity, 0);
    const overall = Number((sumOverall / data.length).toFixed(1));
    
    const validActiveItems = data.filter(item => item.activeOnlyDensity !== undefined);
    const activeOnly = validActiveItems.length === 0 
      ? 0 
      : Number((validActiveItems.reduce((acc, item) => acc + (item.activeOnlyDensity || 0), 0) / validActiveItems.length).toFixed(1));
    
    return { overall, activeOnly };
  }, [data, hasData]);

  return (
    <Card className={`bg-gray-900 border-gray-800 hover:border-purple-500/50 transition-all ${className}`}>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Activity className="h-4 w-4 mr-2 text-purple-400" />
              Workout Density Over Time
            </div>
            <div className="text-xs text-gray-400">
              Avg: {averages.overall} {weightUnit}/min
            </div>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div style={{ height: `${height}px`, minHeight: '200px' }} className="w-full overflow-hidden">
          {!hasData ? (
            <div className="flex items-center justify-center h-full text-gray-400">
              No density data available for the selected period
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart 
                data={formattedData} 
                margin={{ top: 5, right: 5, left: 5, bottom: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#333333" vertical={false} />
                <XAxis
                  dataKey="date"
                  tick={{ fill: '#888888', fontSize: 12 }}
                  axisLine={{ stroke: '#333333' }}
                  tickLine={{ stroke: '#333333' }}
                  angle={-45}
                  textAnchor="end"
                  height={50}
                />
                <YAxis
                  tick={{ fill: '#888888', fontSize: 12 }}
                  axisLine={{ stroke: '#333333' }}
                  tickLine={{ stroke: '#333333' }}
                  width={50}
                  label={{ 
                    value: `Density (${weightUnit}/min)`,
                    angle: -90,
                    position: 'insideLeft',
                    fill: '#888888',
                    style: { textAnchor: 'middle' }
                  }}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-gray-800 border border-gray-700 p-2 rounded-lg shadow-lg">
                          <p className="text-gray-300">{format(new Date(payload[0].payload.originalDate), 'MMM d, yyyy')}</p>
                          <p className="text-purple-400 font-semibold">
                            Overall: {payload[0].value} {weightUnit}/min
                          </p>
                          {payload[1] && payload[1].value && (
                            <p className="text-blue-400 font-semibold">
                              Active Only: {payload[1].value} {weightUnit}/min
                            </p>
                          )}
                        </div>
                      );
                    }
                    return null;
                  }}
                  isAnimationActive={false}
                />
                <Line
                  type="monotone"
                  dataKey="overallDensity"
                  stroke="#9B87F5"
                  strokeWidth={2}
                  dot={{ r: 4, fill: "#9B87F5" }}
                  activeDot={{ r: 6 }}
                  isAnimationActive={false}
                />
                <Line
                  type="monotone"
                  dataKey="activeOnlyDensity"
                  stroke="#0EA5E9"
                  strokeWidth={2}
                  dot={{ r: 4, fill: "#0EA5E9" }}
                  activeDot={{ r: 6 }}
                  isAnimationActive={false}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
        
        <div className="mt-3 grid grid-cols-2 gap-4">
          <div className="text-center">
            <p className="text-xs text-gray-400 mb-1">Overall Density</p>
            <p className="text-lg font-semibold text-purple-400">
              {averages.overall} <span className="text-sm text-gray-400">{weightUnit}/min</span>
            </p>
          </div>
          
          <div className="text-center">
            <p className="text-xs text-gray-400 mb-1">Active Density</p>
            <p className="text-lg font-semibold text-blue-400">
              {averages.activeOnly} <span className="text-sm text-gray-400">{weightUnit}/min</span>
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
});

WorkoutDensityOverTimeChart.displayName = 'WorkoutDensityOverTimeChart';
