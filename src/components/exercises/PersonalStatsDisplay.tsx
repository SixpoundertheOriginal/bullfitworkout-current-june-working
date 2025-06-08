
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { PersonalStats } from '@/types/personal-analytics';
import { TrendingUp, TrendingDown, Activity, Clock, Target, Trophy } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface PersonalStatsDisplayProps {
  stats: PersonalStats;
  variant?: 'compact' | 'detailed';
  className?: string;
}

export const PersonalStatsDisplay: React.FC<PersonalStatsDisplayProps> = ({
  stats,
  variant = 'compact',
  className = ''
}) => {
  if (!stats || stats.totalSessions === 0) {
    return (
      <div className={`text-xs text-gray-500 ${className}`}>
        New exercise
      </div>
    );
  }

  const getTrendIcon = () => {
    switch (stats.trend) {
      case 'increasing':
        return <TrendingUp className="w-3 h-3 text-green-400" />;
      case 'decreasing':
        return <TrendingDown className="w-3 h-3 text-red-400" />;
      default:
        return <Activity className="w-3 h-3 text-gray-400" />;
    }
  };

  const getTrendColor = () => {
    switch (stats.trend) {
      case 'increasing':
        return 'text-green-400';
      case 'decreasing':
        return 'text-red-400';
      default:
        return 'text-gray-400';
    }
  };

  if (variant === 'compact') {
    return (
      <div className={`flex items-center gap-2 text-xs ${className}`}>
        {/* Trend indicator */}
        <div className="flex items-center gap-1">
          {getTrendIcon()}
          <span className={getTrendColor()}>
            {stats.progressPercentage > 0 ? '+' : ''}{stats.progressPercentage}%
          </span>
        </div>

        {/* Sessions count */}
        <Badge variant="outline" className="text-xs bg-gray-800/50 border-gray-600 text-gray-300">
          {stats.totalSessions} sessions
        </Badge>

        {/* Last performed */}
        {stats.lastPerformed && (
          <div className="flex items-center gap-1 text-gray-400">
            <Clock className="w-3 h-3" />
            <span>
              {stats.daysSinceLastPerformed === 0 
                ? 'Today' 
                : stats.daysSinceLastPerformed === 1 
                ? 'Yesterday'
                : `${stats.daysSinceLastPerformed}d ago`
              }
            </span>
          </div>
        )}

        {/* Ready to progress indicator */}
        {stats.isReadyToProgress && (
          <Badge variant="outline" className="text-xs bg-purple-900/30 border-purple-500/30 text-purple-300">
            <Target className="w-3 h-3 mr-1" />
            Ready to progress
          </Badge>
        )}
      </div>
    );
  }

  // Detailed variant
  return (
    <div className={`space-y-3 p-3 bg-gray-800/30 rounded-lg border border-gray-700/50 ${className}`}>
      {/* Header with trend */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {getTrendIcon()}
          <span className={`font-medium ${getTrendColor()}`}>
            {stats.trend === 'increasing' ? 'Improving' : 
             stats.trend === 'decreasing' ? 'Declining' : 
             stats.trend === 'stable' ? 'Stable' : 'New'}
          </span>
          {stats.progressPercentage !== 0 && (
            <span className={`text-sm ${getTrendColor()}`}>
              ({stats.progressPercentage > 0 ? '+' : ''}{stats.progressPercentage}%)
            </span>
          )}
        </div>
        
        {stats.isReadyToProgress && (
          <Badge variant="outline" className="bg-purple-900/30 border-purple-500/30 text-purple-300">
            <Target className="w-3 h-3 mr-1" />
            Ready to progress
          </Badge>
        )}
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-3 text-sm">
        <div>
          <div className="text-gray-400">Sessions</div>
          <div className="font-medium text-white">{stats.totalSessions}</div>
        </div>
        
        <div>
          <div className="text-gray-400">Total Volume</div>
          <div className="font-medium text-white">
            {(stats.totalVolume / 1000).toFixed(1)}k
          </div>
        </div>
        
        {stats.personalBest && (
          <div>
            <div className="text-gray-400 flex items-center gap-1">
              <Trophy className="w-3 h-3" />
              Personal Best
            </div>
            <div className="font-medium text-yellow-400">
              {stats.personalBest.weight}kg × {stats.personalBest.reps}
            </div>
          </div>
        )}
        
        {stats.lastPerformed && (
          <div>
            <div className="text-gray-400 flex items-center gap-1">
              <Clock className="w-3 h-3" />
              Last Performed
            </div>
            <div className="font-medium text-white">
              {formatDistanceToNow(new Date(stats.lastPerformed), { addSuffix: true })}
            </div>
          </div>
        )}
      </div>

      {/* Recent milestones */}
      {stats.milestones.length > 0 && (
        <div>
          <div className="text-gray-400 text-xs mb-1">Recent Achievement</div>
          <div className="text-xs text-purple-300">
            {stats.milestones[stats.milestones.length - 1].description}
          </div>
        </div>
      )}
    </div>
  );
};
