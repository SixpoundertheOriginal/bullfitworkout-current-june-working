import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { MultiSelect } from "@/components/MultiSelect";
import { useTrainingState } from "@/hooks/useTrainingState";
import { Training } from "@/types/training";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCustomTrainingTypes } from "@/hooks/useCustomTrainingTypes";
import { ChevronDown, Plus, X } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { useIsMobile } from "@/hooks/use-mobile";
import { AddCustomTrainingType } from "@/components/training/AddCustomTrainingType";
import { MuscleGroup } from "@/constants/exerciseMetadata";
import { getMuscleGroupOptions } from "@/constants/exerciseMetadata";

interface ConfigureTrainingDialogProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  training?: Training;
}

export function ConfigureTrainingDialog({ open, setOpen, training }: ConfigureTrainingDialogProps) {
  const {
    name,
    bodyFocus,
    trainingType,
    movementPattern,
    sets,
    addBodyFocus,
    removeBodyFocus,
    setName,
    setTrainingType,
    addMovementPattern,
    removeMovementPattern,
    reset,
    isCustom,
    setIsCustom
  } = useTrainingState();
  
  const { customTrainingTypes } = useCustomTrainingTypes();
  const isMobile = useIsMobile();
  const muscleGroupOptions = getMuscleGroupOptions();
  const [newTrainingType, setNewTrainingType] = useState("");

  const handleClose = () => {
    reset();
    setOpen(false);
  };

  const handleSave = () => {
    if (!name) {
      toast({
        title: "Error",
        description: "Please enter a name for your training.",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Success",
      description: "Training configured successfully!",
    });
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Configure Training</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="details" className="mt-4">
          <TabsList>
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="focus">Focus Areas</TabsTrigger>
          </TabsList>

          <TabsContent value="details">
            <div className="grid gap-4 py-4">
              <div>
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  placeholder="Training name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div>
                <Label>Training Type</Label>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="w-full justify-between">
                      {trainingType || "Select Training Type"}
                      <ChevronDown className="h-4 w-4 opacity-50" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56">
                    {customTrainingTypes?.map((type) => (
                      <DropdownMenuItem
                        key={type.id}
                        onSelect={() => setTrainingType(type.name)}
                      >
                        {type.name}
                      </DropdownMenuItem>
                    ))}
                    <DropdownMenuItem
                      onSelect={() => {
                        if (newTrainingType && newTrainingType.trim() !== "") {
                          setTrainingType(newTrainingType);
                        }
                      }}
                    >
                      <div className="flex items-center">
                        <Input
                          placeholder="New Type"
                          value={newTrainingType}
                          onChange={(e) => setNewTrainingType(e.target.value)}
                          className="mr-2"
                        />
                        <Plus className="h-4 w-4" />
                      </div>
                    </DropdownMenuItem>
                    <AddCustomTrainingType />
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="isCustom"
                  checked={isCustom}
                  onCheckedChange={(checked) => setIsCustom(!!checked)}
                />
                <Label htmlFor="isCustom">Custom Training</Label>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="focus">
            <div className="grid gap-4 py-4">
              <div>
                <Label>Body Focus</Label>
                <MultiSelect
                  options={muscleGroupOptions}
                  selected={bodyFocus}
                  onChange={(values) => {
                    // Clear existing body focus
                    while (bodyFocus.length > 0) {
                      removeBodyFocus(bodyFocus[0]);
                    }
                    // Add new body focus areas
                    values.forEach((value) => addBodyFocus(value));
                  }}
                  placeholder="Select muscle groups"
                />
              </div>

              <div>
                <Label>Movement Pattern</Label>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="w-full justify-between">
                      {movementPattern.length > 0
                        ? movementPattern.join(", ")
                        : "Select Movement Pattern"}
                      <ChevronDown className="h-4 w-4 opacity-50" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56">
                    {muscleGroupOptions.map((muscle) => (
                      <DropdownMenuItem
                        key={muscle.value}
                        onSelect={() => {
                          if (!movementPattern.includes(muscle.value)) {
                            addMovementPattern(muscle.value);
                          } else {
                            removeMovementPattern(muscle.value);
                          }
                        }}
                      >
                        <div className="flex items-center justify-between">
                          {muscle.label}
                          {movementPattern.includes(muscle.value) && (
                            <Badge variant="secondary">
                              <X className="h-3 w-3" />
                            </Badge>
                          )}
                        </div>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button type="submit" onClick={handleSave}>
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
