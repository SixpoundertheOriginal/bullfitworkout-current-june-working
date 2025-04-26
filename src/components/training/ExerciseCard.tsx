
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
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
            {exercise.difficulty && (
              <Badge variant="outline" className="bg-gray-800">
                {exercise.difficulty}
              </Badge>
            )}
          </div>
          
          {exercise.primary_muscle_groups && exercise.primary_muscle_groups.length > 0 && (
            <div className="flex gap-1.5 flex-wrap">
              {exercise.primary_muscle_groups.map((muscle) => (
                <Badge key={muscle} variant="secondary" className="text-xs">
                  {muscle}
                </Badge>
              ))}
            </div>
          )}
          
          {exercise.equipment_type && exercise.equipment_type.length > 0 && (
            <div className="text-sm text-gray-400">
              Equipment: {exercise.equipment_type.join(', ')}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ExerciseCard;
