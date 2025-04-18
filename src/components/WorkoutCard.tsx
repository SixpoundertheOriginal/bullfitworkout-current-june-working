
import React from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, BarChart3, Dumbbell } from "lucide-react";
import { cn } from "@/lib/utils";

interface WorkoutCardProps {
  id: string;
  name: string;
  type: string;
  date: string;
  duration: number;
  exerciseCount: number;
  setCount: number;
  className?: string;
}

export const WorkoutCard = ({
  id,
  name,
  type,
  date,
  duration,
  exerciseCount,
  setCount,
  className
}: WorkoutCardProps) => {
  const navigate = useNavigate();
  
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  const formattedDate = new Date(date).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric'
  });
  
  const handleClick = () => {
    navigate(`/workout-details/${id}`);
  };
  
  return (
    <Card 
      className={cn(
        "bg-gray-900 border-gray-800 cursor-pointer hover:bg-gray-800/70 transition-colors",
        className
      )}
      onClick={handleClick}
    >
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-3">
          <div>
            <h3 className="font-medium text-lg">{name}</h3>
            <div className="flex items-center gap-2 text-sm text-gray-400 mt-1">
              <Calendar size={14} />
              <span>{formattedDate}</span>
              <Clock size={14} />
              <span className="font-mono">{formatTime(duration)}</span>
            </div>
          </div>
          <Badge className="bg-purple-600/80 text-white">
            {type}
          </Badge>
        </div>
        
        <div className="grid grid-cols-2 gap-2 mt-2">
          <div className="flex items-center gap-2 text-sm text-gray-300">
            <BarChart3 size={16} className="text-purple-400" />
            <span>{setCount} sets</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-300">
            <Dumbbell size={16} className="text-purple-400" />
            <span>{exerciseCount} exercises</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
