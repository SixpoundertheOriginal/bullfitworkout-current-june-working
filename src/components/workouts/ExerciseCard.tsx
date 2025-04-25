
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Exercise } from '@/types/exercise';

interface ExerciseCardProps {
  exercise: Exercise;
}

export const ExerciseCard: React.FC<ExerciseCardProps> = ({ exercise }) => {
  return (
    <Card className="bg-gray-900 border-gray-800">
      <CardContent className="p-4">
        <div className="flex flex-col gap-2">
          <div className="flex justify-between items-start">
            <h3 className="font-medium text-lg">{exercise.name}</h3>
            {exercise.category && (
              <Badge variant="outline" className="bg-gray-800">
                {exercise.category}
              </Badge>
            )}
          </div>
          
          {exercise.muscle_groups && exercise.muscle_groups.length > 0 && (
            <div className="flex gap-1.5 flex-wrap">
              {exercise.muscle_groups.map((muscle) => (
                <Badge key={muscle} variant="secondary" className="text-xs">
                  {muscle}
                </Badge>
              ))}
            </div>
          )}
          
          {exercise.equipment && (
            <div className="text-sm text-gray-400">
              Equipment: {exercise.equipment}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
