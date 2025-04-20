
import React from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, BarChart3, Dumbbell, Edit, Trash2 } from "lucide-react";
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
  onEdit?: () => void;
  onDelete?: () => void;
}

export const WorkoutCard = ({
  id,
  name,
  type,
  date,
  duration,
  exerciseCount,
  setCount,
  className,
  onEdit,
  onDelete
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
  
  const handleClick = (e: React.MouseEvent) => {
    // Prevent navigation if clicking on action buttons
    if ((e.target as HTMLElement).closest('button[data-action]')) {
      e.stopPropagation();
      return;
    }
    navigate(`/workout-details/${id}`);
  };
  
  return (
    <Card 
      className={cn(
        "bg-gray-900 border-gray-800 cursor-pointer hover:bg-gray-800/70 transition-colors hover:shadow-md active:bg-gray-800 group",
        className
      )}
      onClick={handleClick}
    >
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-3">
          <div>
            <h3 className="font-medium text-lg workout-log-text">{name}</h3>
            <div className="flex items-center gap-2 text-sm workout-log-date mt-1">
              <Calendar size={14} className="text-purple-400" />
              <span>{formattedDate}</span>
              <Clock size={14} className="text-purple-400" />
              <span className="font-mono">{formatTime(duration)}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge className="bg-purple-600/80 workout-log-tag">
              {type}
            </Badge>
            <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
              {onEdit && (
                <Button
                  variant="ghost"
                  size="icon"
                  data-action="edit"
                  onClick={onEdit}
                  className="h-8 w-8 text-gray-400 hover:text-white hover:bg-gray-700"
                >
                  <Edit size={16} />
                </Button>
              )}
              {onDelete && (
                <Button
                  variant="ghost"
                  size="icon"
                  data-action="delete"
                  onClick={onDelete}
                  className="h-8 w-8 text-gray-400 hover:text-red-400 hover:bg-gray-700"
                >
                  <Trash2 size={16} />
                </Button>
              )}
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-2 mt-2">
          <div className="flex items-center gap-2 text-sm workout-log-text">
            <BarChart3 size={16} className="text-purple-400" />
            <span>{setCount} sets</span>
          </div>
          <div className="flex items-center gap-2 text-sm workout-log-text">
            <Dumbbell size={16} className="text-purple-400" />
            <span>{exerciseCount} exercises</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
