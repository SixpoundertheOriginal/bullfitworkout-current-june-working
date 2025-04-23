
import React from 'react';
import { Button } from "@/components/ui/button";
import { Edit, Calendar, Clock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface WorkoutDetailsHeaderProps {
  workoutDetails: {
    name: string;
    training_type: string;
    start_time: string;
    duration: number;
  };
  onEditClick: () => void;
}

export const WorkoutDetailsHeader: React.FC<WorkoutDetailsHeaderProps> = ({
  workoutDetails,
  onEditClick,
}) => {
  return (
    <Card className="bg-gray-900 border-gray-800">
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="text-xl font-semibold mb-1">{workoutDetails.name}</h2>
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <Calendar size={14} />
              <span>
                {new Date(workoutDetails.start_time).toLocaleDateString(undefined, {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric'
                })}
              </span>
              <Clock size={14} />
              <span className="font-mono">{workoutDetails.duration} min</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="text-purple-400 border-purple-400/30">
              {workoutDetails.training_type}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={onEditClick}
              className="text-gray-400 hover:text-white hover:bg-gray-800"
            >
              <Edit size={18} />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
