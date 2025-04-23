
import React from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, BarChart3, Dumbbell, Edit, Trash2, Loader2, SquareCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { theme } from "@/lib/theme";
import { typography } from "@/lib/typography";
import { WorkoutMetricsBadge } from "@/components/metrics/WorkoutMetricsBadge";
import { getExerciseGroup } from "@/utils/exerciseUtils";

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
  isDeleting?: boolean;
  selectionMode?: boolean;
  isSelected?: boolean;
  onToggleSelection?: () => void;
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
  onDelete,
  isDeleting = false,
  selectionMode = false,
  isSelected = false,
  onToggleSelection
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

  const getPrimaryMuscleGroups = (exerciseCount: number) => {
    if (exerciseCount === 0) return 'No exercises';
    const groups = new Set(['chest', 'back', 'legs', 'shoulders'].slice(0, Math.min(2, exerciseCount)));
    return Array.from(groups).join(', ');
  };

  const getMockVolume = () => {
    return Math.floor(Math.random() * 5000 + 1000);
  };

  const getMockIntensity = () => {
    return Math.floor(Math.random() * 3 + 7);
  };
  
  const handleClick = (e: React.MouseEvent) => {
    if (selectionMode && onToggleSelection) {
      onToggleSelection();
      e.stopPropagation();
      return;
    }
    
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
        isSelected && "border-purple-500 border-2",
        className
      )}
      onClick={handleClick}
    >
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-3">
          <div className="flex items-center gap-3">
            {selectionMode && (
              <Button
                variant={isSelected ? "default" : "outline"}
                size="icon"
                className={cn(
                  "h-8 w-8",
                  isSelected 
                    ? "bg-purple-600 text-white hover:bg-purple-700" 
                    : "text-gray-400 hover:text-purple-400 hover:bg-gray-700"
                )}
                onClick={(e) => {
                  e.stopPropagation();
                  if (onToggleSelection) onToggleSelection();
                }}
              >
                <SquareCheck size={16} />
              </Button>
            )}
            <div>
              <h3 className={cn(typography.text.primary, "text-lg")}>{name}</h3>
              <div className={cn(typography.text.secondary, "flex items-center gap-2 text-sm mt-1")}>
                <Calendar size={14} className={theme.colors.accent.purple} />
                <span>{formattedDate}</span>
                <Clock size={14} className={theme.colors.accent.purple} />
                <span className="font-mono">{formatTime(duration)}</span>
              </div>
            </div>
          </div>
          <div className="flex flex-col items-end gap-2">
            <Badge className="bg-purple-600/80 text-white">
              {type}
            </Badge>
            {!selectionMode && (
              <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                {onEdit && (
                  <Button
                    variant="ghost"
                    size="icon"
                    data-action="edit"
                    onClick={onEdit}
                    className="h-8 w-8 text-gray-400 hover:text-purple-400 hover:bg-gray-700"
                    disabled={isDeleting}
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
                    disabled={isDeleting}
                  >
                    {isDeleting ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <Trash2 size={16} />
                    )}
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
        
        <div className="space-y-3">
          <div className={cn(typography.text.secondary, "flex items-center gap-2 text-sm")}>
            <Calendar size={14} className={theme.colors.accent.purple} />
            <span>{formattedDate}</span>
            <Clock size={14} className={theme.colors.accent.purple} />
            <span className="font-mono">{formatTime(duration)}</span>
          </div>

          <div className="flex flex-wrap gap-2">
            <WorkoutMetricsBadge
              icon="volume"
              label="Volume"
              value={`${getMockVolume().toLocaleString()}kg`}
            />
            <WorkoutMetricsBadge
              icon="intensity"
              label="RPE"
              value={getMockIntensity()}
            />
            <WorkoutMetricsBadge
              icon="muscle"
              label="Focus"
              value={getPrimaryMuscleGroups(exerciseCount)}
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className={cn(typography.text.secondary, "flex items-center gap-2 text-sm")}>
              <BarChart3 size={16} className={theme.colors.accent.purple} />
              <span>{setCount} sets</span>
            </div>
            <div className={cn(typography.text.secondary, "flex items-center gap-2 text-sm")}>
              <Dumbbell size={16} className={theme.colors.accent.purple} />
              <span>{exerciseCount} exercises</span>
            </div>
          </div>

          {!selectionMode && onEdit && onDelete && (
            <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button
                variant="ghost"
                size="icon"
                data-action="edit"
                onClick={onEdit}
                className="h-8 w-8 text-gray-400 hover:text-purple-400 hover:bg-gray-700"
                disabled={isDeleting}
              >
                <Edit size={16} />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                data-action="delete"
                onClick={onDelete}
                className="h-8 w-8 text-gray-400 hover:text-red-400 hover:bg-gray-700"
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Trash2 size={16} />
                )}
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
