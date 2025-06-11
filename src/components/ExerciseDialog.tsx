
import React, { useState } from "react";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useExerciseForm } from "@/hooks/useExerciseForm";
import { ExerciseBasicTab } from "@/components/exercises/ExerciseBasicTab";
import { ExerciseAdvancedTab } from "@/components/exercises/ExerciseAdvancedTab";
import { ExerciseMetricsTab } from "@/components/exercises/ExerciseMetricsTab";
import { ExerciseInstructionsTab } from "@/components/exercises/ExerciseInstructionsTab";

interface ExerciseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "add" | "edit";
  onSubmit: (exercise: any) => void;
  initialExercise?: any;
  loading?: boolean;
}

export function ExerciseDialog({
  open,
  onOpenChange,
  mode = "add",
  onSubmit,
  initialExercise,
  loading = false,
}: ExerciseDialogProps) {
  const [activeTab, setActiveTab] = useState("basic");
  
  const {
    exercise,
    updateExercise,
    newTip,
    setNewTip,
    newVariation,
    setNewVariation,
    formError,
    validationErrors,
    addTip,
    removeTip,
    addVariation,
    removeVariation,
    validateAndPrepareSubmission,
  } = useExerciseForm({ initialExercise, open });

  const handleSubmit = () => {
    const preparedData = validateAndPrepareSubmission();
    if (preparedData) {
      console.log("Submitting transformed exercise data:", preparedData);
      onSubmit(preparedData);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-xl">
            {mode === "add" ? "Add Exercise" : "Edit Exercise"}
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 overflow-hidden flex flex-col">
          <TabsList className="grid grid-cols-4">
            <TabsTrigger value="basic">Basic</TabsTrigger>
            <TabsTrigger value="advanced">Advanced</TabsTrigger>
            <TabsTrigger value="metrics">Metrics</TabsTrigger>
            <TabsTrigger value="instructions">Instructions</TabsTrigger>
          </TabsList>

          <ScrollArea className="flex-1 overflow-auto">
            <TabsContent value="basic" className="space-y-4 mt-2">
              <ExerciseBasicTab
                exercise={exercise}
                onUpdate={updateExercise}
              />
            </TabsContent>

            <TabsContent value="advanced" className="space-y-4 mt-2">
              <ExerciseAdvancedTab
                exercise={exercise}
                onUpdate={updateExercise}
                newTip={newTip}
                setNewTip={setNewTip}
                newVariation={newVariation}
                setNewVariation={setNewVariation}
                onAddTip={addTip}
                onRemoveTip={removeTip}
                onAddVariation={addVariation}
                onRemoveVariation={removeVariation}
              />
            </TabsContent>

            <TabsContent value="metrics" className="space-y-4 mt-2">
              <ExerciseMetricsTab
                exercise={exercise}
                onUpdate={updateExercise}
              />
            </TabsContent>

            <TabsContent value="instructions" className="space-y-4 mt-2">
              <ExerciseInstructionsTab
                exercise={exercise}
                onUpdate={updateExercise}
              />
            </TabsContent>
          </ScrollArea>
        </Tabs>

        {/* Enhanced error display */}
        {formError && (
          <div className="text-red-500 text-sm p-2 bg-red-50 rounded border border-red-200">
            {formError}
          </div>
        )}
        
        {validationErrors.length > 0 && (
          <div className="text-amber-600 text-xs">
            <div className="font-medium">Validation:</div>
            {validationErrors.map((error, index) => (
              <div key={index} className="ml-2">• {error}</div>
            ))}
          </div>
        )}

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={loading || validationErrors.length > 0}
            className="min-w-[100px]"
          >
            {loading ? (
              <div className="flex items-center space-x-2">
                <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
                <span>Saving...</span>
              </div>
            ) : (
              mode === "add" ? "Add Exercise" : "Update Exercise"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
