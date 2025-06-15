
import React from 'react';
import { motion } from 'framer-motion';
import { Brain, TrendingUp, Clock, Sun, Target, Zap } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface Insight {
  id: string;
  type: 'recommendation' | 'pattern' | 'achievement' | 'tip';
  title: string;
  description: string;
  action?: string;
  priority: 'high' | 'medium' | 'low';
  icon: 'brain' | 'trending' | 'clock' | 'sun' | 'target' | 'zap';
}

interface SmartInsightsPanelProps {
  insights: Insight[];
  className?: string;
}

const iconMap = {
  brain: Brain,
  trending: TrendingUp,
  clock: Clock,
  sun: Sun,
  target: Target,
  zap: Zap,
};

const priorityColors = {
  high: 'from-red-500 to-orange-500',
  medium: 'from-yellow-500 to-orange-500',
  low: 'from-blue-500 to-purple-500',
};

export const SmartInsightsPanel = React.memo(({ insights, className = '' }: SmartInsightsPanelProps) => {
  const topInsights = insights.slice(0, 3);

  return (
    <Card className={`bg-gray-900/50 border-gray-800 ${className}`}>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold text-white flex items-center gap-2">
          <Brain className="h-5 w-5 text-blue-400" />
          Smart Insights
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-3">
        {topInsights.map((insight, index) => {
          const IconComponent = iconMap[insight.icon];
          
          return (
            <motion.div
              key={insight.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="p-3 rounded-lg bg-gray-800/50 border border-gray-700 hover:border-gray-600 transition-colors"
            >
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-full bg-gradient-to-r ${priorityColors[insight.priority]}`}>
                  <IconComponent className="h-4 w-4 text-white" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="text-sm font-medium text-white truncate">
                      {insight.title}
                    </h4>
                    <Badge 
                      variant={insight.priority === 'high' ? 'destructive' : 'secondary'}
                      className="text-xs"
                    >
                      {insight.priority}
                    </Badge>
                  </div>
                  
                  <p className="text-xs text-gray-400 mb-2 leading-relaxed">
                    {insight.description}
                  </p>
                  
                  {insight.action && (
                    <button className="text-xs text-blue-400 hover:text-blue-300 font-medium transition-colors">
                      {insight.action} →
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}

        {insights.length === 0 && (
          <div className="text-center py-6 text-gray-400">
            <Brain className="h-8 w-8 mx-auto mb-2 text-gray-600" />
            <p className="text-sm">Keep training to unlock personalized insights!</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
});

SmartInsightsPanel.displayName = 'SmartInsightsPanel';
