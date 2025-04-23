
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, ChevronDown, ChevronUp } from "lucide-react";
import type { Exercise } from "@/types/exercise";

interface ExerciseAccordionCardProps {
  exercise: Exercise;
  expanded: boolean;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onSelect: (exercise: Exercise) => void;
}

export default function ExerciseAccordionCard({
  exercise,
  expanded,
  onEdit,
  onDelete,
  onSelect,
}: ExerciseAccordionCardProps) {
  // Only expand/collapse if NOT clicking buttons
  const handleCardClick = (e: React.MouseEvent) => {
    // If user clicks Edit/Delete, do not expand/collapse
    // e.target will be inside button if button clicked
    if (
      (e.target as HTMLElement).closest("button") // exclude button clicks
    ) {
      return;
    }
    onSelect(exercise);
  };

  return (
    <AccordionItem value={exercise.id} className="mb-2 border-none">
      <Card 
        tabIndex={0}
        className={`bg-gray-900 border-gray-700 hover:bg-gray-800 transition-colors cursor-pointer outline-none ring-0`}
        onClick={handleCardClick}
        aria-expanded={expanded}
      >
        <AccordionTrigger className="w-full p-0 !no-underline focus:outline-none select-none">
          <CardContent className="py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div className="flex gap-2 items-center">
              <div>
                <div className="font-semibold text-white">{exercise.name}</div>
                <div className="text-xs text-gray-400">{exercise.description}</div>
              </div>
            </div>
            <div className="flex gap-2 items-center">
              <Button 
                variant="secondary" 
                size="sm" 
                onClick={(e) => { e.stopPropagation(); onEdit(exercise.id); }}
                className="text-white bg-gray-800 hover:bg-gray-700"
              >
                <Edit className="w-4 h-4 mr-1" />
                Edit
              </Button>
              <Button 
                variant="destructive" 
                size="sm" 
                onClick={(e) => { e.stopPropagation(); onDelete(exercise.id); }}
                className="bg-red-900/50 hover:bg-red-800 text-white"
              >
                <Trash2 className="w-4 h-4 mr-1" />
                Delete
              </Button>
              <span>
                {expanded 
                  ? <ChevronUp className="w-5 h-5 text-purple-300" />
                  : <ChevronDown className="w-5 h-5 text-gray-400" />
                }
              </span>
            </div>
          </CardContent>
        </AccordionTrigger>
        <AccordionContent>
          <div className="bg-gray-900/80 p-4 rounded-b-lg border-t border-gray-700 text-gray-200 space-y-2">
            {exercise.instructions && (
              <div>
                <span className="font-medium text-purple-300">Instructions: </span>
                <span>
                  {typeof exercise.instructions === "string"
                    ? exercise.instructions
                    : JSON.stringify(exercise.instructions)}
                </span>
              </div>
            )}
            <div>
              <span className="font-medium text-purple-300">Primary Muscles:</span>
              <span> {(exercise.primary_muscle_groups || []).join(", ") || "N/A"}</span>
            </div>
            {exercise.secondary_muscle_groups?.length > 0 && (
              <div>
                <span className="font-medium text-purple-300">Secondary Muscles:</span>
                <span> {(exercise.secondary_muscle_groups || []).join(", ")}</span>
              </div>
            )}
            <div>
              <span className="font-medium text-purple-300">Equipment:</span>
              <span> {(exercise.equipment_type || []).join(", ") || "N/A"}</span>
            </div>
            <div>
              <span className="font-medium text-purple-300">Difficulty:</span>
              <span> {exercise.difficulty}</span>
            </div>
            {exercise.tips?.length > 0 && (
              <div>
                <span className="font-medium text-purple-300">Tips:</span>
                <ul className="list-disc ml-6 text-sm">
                  {exercise.tips.map((tip, i) => (
                    <li key={i}>{tip}</li>
                  ))}
                </ul>
              </div>
            )}
            {exercise.variations?.length > 0 && (
              <div>
                <span className="font-medium text-purple-300">Variations:</span>
                <ul className="list-disc ml-6 text-sm">
                  {exercise.variations.map((variation, i) => (
                    <li key={i}>{variation}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </AccordionContent>
      </Card>
    </AccordionItem>
  );
}

