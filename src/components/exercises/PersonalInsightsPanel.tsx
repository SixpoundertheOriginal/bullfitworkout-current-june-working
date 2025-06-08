
import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { PersonalInsight } from '@/types/personal-analytics';
import { 
  Trophy, 
  Target, 
  AlertTriangle, 
  Lightbulb,
  TrendingUp,
  Clock,
  X
} from 'lucide-react';

interface PersonalInsightsPanelProps {
  insights: PersonalInsight[];
  onInsightAction?: (insight: PersonalInsight) => void;
  onDismiss?: (insight: PersonalInsight) => void;
  className?: string;
}

export const PersonalInsightsPanel: React.FC<PersonalInsightsPanelProps> = ({
  insights,
  onInsightAction,
  onDismiss,
  className = ''
}) => {
  if (insights.length === 0) {
    return null;
  }

  const getInsightIcon = (type: PersonalInsight['type']) => {
    switch (type) {
      case 'achievement':
        return <Trophy className="w-4 h-4 text-yellow-400" />;
      case 'milestone':
        return <Target className="w-4 h-4 text-purple-400" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-red-400" />;
      case 'suggestion':
        return <Lightbulb className="w-4 h-4 text-blue-400" />;
      default:
        return <TrendingUp className="w-4 h-4 text-green-400" />;
    }
  };

  const getPriorityColor = (priority: PersonalInsight['priority']) => {
    switch (priority) {
      case 'high':
        return 'border-red-500/30 bg-red-900/20';
      case 'medium':
        return 'border-yellow-500/30 bg-yellow-900/20';
      case 'low':
        return 'border-gray-500/30 bg-gray-900/20';
    }
  };

  return (
    <div className={`space-y-3 ${className}`}>
      <div className="flex items-center gap-2 mb-4">
        <TrendingUp className="w-5 h-5 text-purple-400" />
        <h3 className="font-semibold text-white">Personal Insights</h3>
        <Badge variant="outline" className="bg-purple-900/30 border-purple-500/30 text-purple-300">
          {insights.length}
        </Badge>
      </div>

      <div className="space-y-2">
        {insights.map((insight, index) => (
          <Card 
            key={index}
            className={`p-3 border ${getPriorityColor(insight.priority)} transition-all duration-200 hover:border-opacity-50`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3 flex-1">
                <div className="mt-0.5">
                  {getInsightIcon(insight.type)}
                </div>
                
                <div className="flex-1">
                  <div className="font-medium text-white text-sm mb-1">
                    {insight.title}
                  </div>
                  <div className="text-xs text-gray-300 leading-relaxed">
                    {insight.description}
                  </div>
                  
                  {insight.actionable && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onInsightAction?.(insight)}
                      className="mt-2 h-6 px-2 text-xs text-purple-300 hover:text-purple-200 hover:bg-purple-900/30"
                    >
                      Take Action
                    </Button>
                  )}
                </div>
              </div>
              
              {onDismiss && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onDismiss(insight)}
                  className="h-6 w-6 p-0 text-gray-500 hover:text-gray-300"
                >
                  <X className="w-3 h-3" />
                </Button>
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
