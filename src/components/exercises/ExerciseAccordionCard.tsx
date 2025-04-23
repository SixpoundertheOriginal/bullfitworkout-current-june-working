
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, ChevronDown, ChevronUp } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import type { Exercise } from "@/types/exercise";
import { typography } from '@/lib/typography';

const MAX_DESCRIPTION_LENGTH = 80;

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
  const handleCardClick = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest("button")) {
      return;
    }
    onSelect(exercise);
  };

  const truncateDescription = (text: string) => {
    if (text.length <= MAX_DESCRIPTION_LENGTH) return text;
    return `${text.slice(0, MAX_DESCRIPTION_LENGTH)}...`;
  };

  return (
    <AccordionItem value={exercise.id} className="mb-2 border-none">
      <Card 
        tabIndex={0}
        className="bg-gray-900 border-gray-700 hover:bg-gray-800 transition-colors cursor-pointer outline-none ring-0"
        onClick={handleCardClick}
        aria-expanded={expanded}
      >
        <AccordionTrigger className="w-full p-0 !no-underline focus:outline-none select-none">
          <CardContent className="py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div className="flex-1 min-w-0">
              <h3 className={typography.headings.h4 + " truncate"}>{exercise.name}</h3>
              <p className={typography.text.muted + " truncate"}>
                {truncateDescription(exercise.description || '')}
              </p>
            </div>
            <div className="flex gap-2 items-center shrink-0">
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
              {expanded ? 
                <ChevronUp className="w-5 h-5 text-purple-300" /> :
                <ChevronDown className="w-5 h-5 text-gray-400" />
              }
            </div>
          </CardContent>
        </AccordionTrigger>

        <AccordionContent>
          <div className="bg-gray-900/80 p-4 rounded-b-lg border-t border-gray-700 text-gray-200">
            <div className="grid gap-4">
              {/* Description Section */}
              <div className="space-y-2">
                <label className={typography.special.accent + " block font-medium"}>Description</label>
                <p className={typography.text.secondary + " whitespace-pre-wrap"}>
                  {exercise.description}
                </p>
              </div>

              {/* Muscle Groups Grid */}
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className={typography.special.accent + " block font-medium"}>Primary Muscles</label>
                  <div className="flex flex-wrap gap-2">
                    {exercise.primary_muscle_groups.map(muscle => (
                      <span key={muscle} className="px-2 py-1 bg-gray-800 rounded text-sm">
                        {muscle}
                      </span>
                    ))}
                  </div>
                </div>

                {exercise.secondary_muscle_groups?.length > 0 && (
                  <div className="space-y-2">
                    <label className={typography.special.accent + " block font-medium"}>Secondary Muscles</label>
                    <div className="flex flex-wrap gap-2">
                      {exercise.secondary_muscle_groups.map(muscle => (
                        <span key={muscle} className="px-2 py-1 bg-gray-800/50 rounded text-sm">
                          {muscle}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Equipment & Difficulty */}
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className={typography.special.accent + " block font-medium"}>Equipment</label>
                  <div className="flex flex-wrap gap-2">
                    {exercise.equipment_type.map(equipment => (
                      <span key={equipment} className="px-2 py-1 bg-gray-800 rounded text-sm">
                        {equipment}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  <label className={typography.special.accent + " block font-medium"}>Difficulty</label>
                  <span className="px-2 py-1 bg-gray-800 rounded text-sm inline-block">
                    {exercise.difficulty}
                  </span>
                </div>
              </div>

              {/* Instructions & Tips in Grid */}
              <div className="grid sm:grid-cols-2 gap-4">
                {exercise.instructions && (
                  <div className="space-y-2">
                    <label className={typography.special.accent + " block font-medium"}>Instructions</label>
                    <div className={typography.text.secondary + " space-y-2"}>
                      {typeof exercise.instructions === "string" ? (
                        <p>{exercise.instructions}</p>
                      ) : (
                        Object.entries(exercise.instructions).map(([key, value]) => (
                          <p key={key}>{value}</p>
                        ))
                      )}
                    </div>
                  </div>
                )}

                {exercise.tips?.length > 0 && (
                  <div className="space-y-2">
                    <label className={typography.special.accent + " block font-medium"}>Tips</label>
                    <ul className="list-disc ml-4 space-y-1">
                      {exercise.tips.map((tip, i) => (
                        <li key={i} className={typography.text.secondary}>{tip}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Variations */}
              {exercise.variations?.length > 0 && (
                <div className="space-y-2">
                  <label className={typography.special.accent + " block font-medium"}>Variations</label>
                  <div className="flex flex-wrap gap-2">
                    {exercise.variations.map((variation, i) => (
                      <span key={i} className="px-2 py-1 bg-gray-800/50 rounded text-sm">
                        {variation}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </AccordionContent>
      </Card>
    </AccordionItem>
  );
}
