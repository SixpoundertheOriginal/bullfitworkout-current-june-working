
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dumbbell } from 'lucide-react';

interface MuscleFocusChartProps {
  muscleGroups: Record<string, number>;
  className?: string;
}

export const MuscleFocusChart = ({ muscleGroups, className = '' }: MuscleFocusChartProps) => {
  // Calculate total for percentages
  const total = Object.values(muscleGroups).reduce((sum, count) => sum + count, 0);
  
  // Sort muscle groups by count (descending)
  const sortedGroups = Object.entries(muscleGroups)
    .filter(([_, count]) => count > 0)
    .sort(([_, countA], [_, countB]) => countB - countA);
  
  // Generate colors for different muscle groups
  const getGroupColor = (group: string) => {
    switch (group) {
      case 'chest': return 'from-red-500/30 to-red-700/30 border-red-500/30';
      case 'back': return 'from-blue-500/30 to-blue-700/30 border-blue-500/30';
      case 'shoulders': return 'from-yellow-500/30 to-yellow-700/30 border-yellow-500/30';
      case 'arms': return 'from-green-500/30 to-green-700/30 border-green-500/30';
      case 'legs': return 'from-purple-500/30 to-purple-700/30 border-purple-500/30';
      case 'core': return 'from-orange-500/30 to-orange-700/30 border-orange-500/30';
      default: return 'from-gray-500/30 to-gray-700/30 border-gray-500/30';
    }
  };
  
  // Get nice names for muscle groups
  const getGroupName = (group: string) => {
    return group.charAt(0).toUpperCase() + group.slice(1);
  };

  return (
    <Card className={`bg-gray-900/90 border-gray-800 hover:border-purple-500/50 transition-all ${className}`}>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center">
          <Dumbbell className="h-4 w-4 mr-2 text-purple-400" />
          Muscle Focus
        </CardTitle>
      </CardHeader>
      <CardContent>
        {total > 0 ? (
          <div className="space-y-3">
            {sortedGroups.map(([group, count]) => {
              const percentage = Math.round((count / total) * 100);
              return (
                <div key={group} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="font-medium">{getGroupName(group)}</span>
                    <span className="text-gray-400">{count} {count === 1 ? 'set' : 'sets'} ({percentage}%)</span>
                  </div>
                  <div className="h-2 w-full bg-gray-800 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full bg-gradient-to-r ${getGroupColor(group)}`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-4 text-gray-400 text-sm">
            No muscle group data available
          </div>
        )}
      </CardContent>
    </Card>
  );
};
