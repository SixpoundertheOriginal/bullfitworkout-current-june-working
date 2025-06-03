import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Calendar, TrendingUp } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useWorkoutStatsContext } from '@/context/WorkoutStatsProvider';

interface WeeklyTrainingPatternsProps {
  className?: string;
}

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#a4de6c', '#d0ed57'];

export const WeeklyTrainingPatterns = React.memo(({ className }: WeeklyTrainingPatternsProps) => {
  const { stats } = useWorkoutStatsContext();

  const weeklyData = useMemo(() => {
    if (!stats || !stats.timePatterns || !stats.timePatterns.daysFrequency) {
      return [];
    }

    const daysFrequency = stats.timePatterns.daysFrequency;
    return Object.entries(daysFrequency)
      .map(([day, count]) => ({ day, count }))
      .sort((a, b) => b.count - a.count);
  }, [stats]);

  const totalWorkouts = weeklyData.reduce((sum, day) => sum + day.count, 0);

  return (
    <Card className={`bg-gray-900 border-gray-800 ${className}`}>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium flex items-center">
          <Calendar className="h-4 w-4 mr-2 text-yellow-400" />
          Weekly Training Patterns
        </CardTitle>
      </CardHeader>
      <CardContent>
        {totalWorkouts > 0 ? (
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                <XAxis dataKey="day" stroke="#888" />
                <YAxis stroke="#888" />
                <Tooltip contentStyle={{ backgroundColor: '#333', color: '#fff', border: 'none' }} />
                <Bar dataKey="count" fill="#8884d8">
                  {weeklyData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="text-center text-gray-500 py-4">No workout data available for weekly patterns.</div>
        )}
        <div className="mt-4 flex flex-wrap gap-2">
          {weeklyData.map((day, index) => (
            <Badge key={day.day} variant="secondary">
              {day.day.charAt(0).toUpperCase() + day.day.slice(1)} ({day.count})
            </Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  );
});

WeeklyTrainingPatterns.displayName = 'WeeklyTrainingPatterns';
