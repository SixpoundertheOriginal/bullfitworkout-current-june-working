
import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { UnifiedExerciseCard } from './UnifiedExerciseCard';
import { useExerciseRecommendations } from '@/hooks/useExerciseRecommendations';
import { Exercise } from '@/types/exercise';
import { ExerciseRecommendation } from '@/types/enhanced-exercise';
import { Lightbulb, Target, TrendingUp, Shuffle, BarChart3 } from 'lucide-react';

interface WorkoutRecommendationsProps {
  currentExercises: Exercise[];
  availableExercises: Exercise[];
  onAddExercise: (exercise: Exercise) => void;
  context?: 'library' | 'workout_planning' | 'exercise_selection';
  className?: string;
}

export const WorkoutRecommendations: React.FC<WorkoutRecommendationsProps> = ({
  currentExercises,
  availableExercises,
  onAddExercise,
  context = 'library',
  className = ''
}) => {
  const { 
    recommendations, 
    getRecommendationsByReason, 
    getHighPriorityRecommendations,
    hasRecommendations 
  } = useExerciseRecommendations({
    currentExercises,
    availableExercises,
    context,
    maxRecommendations: 6
  });

  if (!hasRecommendations) {
    return null;
  }

  const getReasonIcon = (reason: ExerciseRecommendation['reason']) => {
    switch (reason) {
      case 'progression':
        return <TrendingUp className="w-4 h-4 text-green-400" />;
      case 'muscle_balance':
        return <BarChart3 className="w-4 h-4 text-blue-400" />;
      case 'preference':
        return <Target className="w-4 h-4 text-purple-400" />;
      case 'variety':
        return <Shuffle className="w-4 h-4 text-orange-400" />;
      default:
        return <Lightbulb className="w-4 h-4 text-yellow-400" />;
    }
  };

  const getReasonLabel = (reason: ExerciseRecommendation['reason']) => {
    switch (reason) {
      case 'progression':
        return 'Ready to Progress';
      case 'muscle_balance':
        return 'Balance Workout';
      case 'preference':
        return 'Based on History';
      case 'variety':
        return 'Try Something New';
      default:
        return 'Recommended';
    }
  };

  const getPriorityColor = (priority: ExerciseRecommendation['priority']) => {
    switch (priority) {
      case 'high':
        return 'border-green-500/30 bg-green-900/20';
      case 'medium':
        return 'border-yellow-500/30 bg-yellow-900/20';
      case 'low':
        return 'border-gray-500/30 bg-gray-900/20';
    }
  };

  // Group recommendations by reason for better organization
  const groupedRecommendations = recommendations.reduce((groups, rec) => {
    if (!groups[rec.reason]) groups[rec.reason] = [];
    groups[rec.reason].push(rec);
    return groups;
  }, {} as Record<string, ExerciseRecommendation[]>);

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center gap-2">
        <Lightbulb className="w-5 h-5 text-yellow-400" />
        <h3 className="font-semibold text-white">Smart Recommendations</h3>
        <Badge variant="outline" className="bg-purple-900/30 border-purple-500/30 text-purple-300">
          {recommendations.length}
        </Badge>
      </div>

      <div className="space-y-4">
        {Object.entries(groupedRecommendations).map(([reason, recs]) => (
          <div key={reason} className="space-y-2">
            <div className="flex items-center gap-2">
              {getReasonIcon(reason as ExerciseRecommendation['reason'])}
              <span className="text-sm font-medium text-gray-300">
                {getReasonLabel(reason as ExerciseRecommendation['reason'])}
              </span>
              <Badge variant="outline" className="text-xs bg-gray-800/50 border-gray-600 text-gray-300">
                {recs.length}
              </Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {recs.slice(0, 3).map((recommendation) => (
                <Card 
                  key={recommendation.exercise.id}
                  className={`relative p-3 border transition-all duration-200 hover:border-opacity-70 ${getPriorityColor(recommendation.priority)}`}
                >
                  {/* Priority indicator */}
                  {recommendation.priority === 'high' && (
                    <Badge 
                      variant="outline" 
                      className="absolute top-2 right-2 text-xs bg-green-900/30 border-green-500/30 text-green-300"
                    >
                      High Priority
                    </Badge>
                  )}

                  {/* Exercise info */}
                  <div className="space-y-2">
                    <div className="font-medium text-white text-sm">
                      {recommendation.exercise.name}
                    </div>
                    
                    <div className="text-xs text-gray-300">
                      {recommendation.exercise.primary_muscle_groups?.join(', ')}
                    </div>

                    {/* Confidence score */}
                    <div className="flex items-center justify-between">
                      <div className="text-xs text-gray-400">
                        Confidence: {Math.round(recommendation.confidence * 100)}%
                      </div>
                      <Button
                        size="sm"
                        onClick={() => onAddExercise(recommendation.exercise)}
                        className="h-7 px-3 text-xs bg-purple-600 hover:bg-purple-700"
                      >
                        Add
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Show all recommendations button if there are more */}
      {recommendations.length > 6 && (
        <Button
          variant="outline"
          size="sm"
          className="w-full text-gray-300 border-gray-600 hover:bg-gray-700/50"
        >
          View All {recommendations.length} Recommendations
        </Button>
      )}
    </div>
  );
};
