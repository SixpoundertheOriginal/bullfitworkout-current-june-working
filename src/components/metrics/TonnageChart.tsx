
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { format } from 'date-fns';
import { Weight } from 'lucide-react';
import { useWeightUnit } from '@/context/WeightUnitContext';
import { convertWeight } from '@/utils/unitConversion';

interface TonnageChartProps {
  data: Array<{
    date: string;
    tonnage: number;
  }>;
}

export const TonnageChart = ({ data }: TonnageChartProps) => {
  const { weightUnit } = useWeightUnit();
  
  const formattedData = data.map(item => ({
    date: format(new Date(item.date), 'MMM d'),
    tonnage: convertWeight(item.tonnage, 'kg', weightUnit),
    originalDate: item.date
  }));

  return (
    <Card className="bg-gray-900 border-gray-800 hover:border-purple-500/50 transition-all">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm">
          <div className="flex items-center">
            <Weight className="h-4 w-4 mr-2 text-purple-400" />
            Total Volume per Session
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[200px] mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={formattedData}>
              <XAxis
                dataKey="date"
                tick={{ fill: '#888888', fontSize: 12 }}
                axisLine={{ stroke: '#333333' }}
              />
              <YAxis
                tick={{ fill: '#888888', fontSize: 12 }}
                axisLine={{ stroke: '#333333' }}
                label={{ 
                  value: `Volume (${weightUnit})`,
                  angle: -90,
                  position: 'insideLeft',
                  fill: '#888888'
                }}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="bg-gray-800 border border-gray-700 p-2 rounded-lg shadow-lg">
                        <p className="text-gray-300">{format(new Date(payload[0].payload.originalDate), 'MMM d, yyyy')}</p>
                        <p className="text-purple-400 font-semibold">
                          {`${payload[0].value?.toLocaleString()} ${weightUnit}`}
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar
                dataKey="tonnage"
                fill="url(#tonnageGradient)"
                radius={[4, 4, 0, 0]}
              />
              <defs>
                <linearGradient id="tonnageGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#9B87F5" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#D946EF" stopOpacity={0.6}/>
                </linearGradient>
              </defs>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};
