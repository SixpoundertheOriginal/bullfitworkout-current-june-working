
import React, { useState, useEffect } from "react";
import { useExercises } from "@/hooks/useExercises";
import { Button } from "@/components/ui/button";
import { Plus, Search, Filter, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ExerciseDialog } from "@/components/ExerciseDialog";
import { MuscleGroup, EquipmentType, MovementPattern, Difficulty, Exercise } from "@/types/exercise";
import { Accordion } from "@/components/ui/accordion";
import ExerciseAccordionCard from "@/components/exercises/ExerciseAccordionCard";
import { PageHeader } from "@/components/navigation/PageHeader";
import { Input } from "@/components/ui/input";
import { 
  Select, 
  SelectContent, 
  SelectGroup, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useIsMobile } from "@/hooks/use-mobile";
import { 
  Pagination, 
  PaginationContent, 
  PaginationItem, 
  PaginationLink, 
  PaginationNext, 
  PaginationPrevious 
} from "@/components/ui/pagination";
import { COMMON_MUSCLE_GROUPS, COMMON_EQUIPMENT, MOVEMENT_PATTERNS, DIFFICULTY_LEVELS } from "@/types/exercise";
import { Card } from "@/components/ui/card";
import { ExerciseFAB } from "@/components/ExerciseFAB";
import { Skeleton } from "@/components/ui/skeleton";

interface AllExercisesPageProps {
  onSelectExercise?: (exercise: string | Exercise) => void;
}

export default function AllExercisesPage({ onSelectExercise }: AllExercisesPageProps = {}) {
  const { exercises, isLoading, isError, createExercise, isPending } = useExercises();
  const { toast } = useToast();
  const [showDialog, setShowDialog] = useState(false);
  const [activeAccordion, setActiveAccordion] = useState<string | null>(null);
  const isMobile = useIsMobile();

  // Search and filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedMuscleGroup, setSelectedMuscleGroup] = useState<MuscleGroup | "all">("all");
  const [selectedEquipment, setSelectedEquipment] = useState<EquipmentType | "all">("all");
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty | "all">("all");
  const [selectedMovement, setSelectedMovement] = useState<MovementPattern | "all">("all");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const exercisesPerPage = 8;

  // For add/edit
  const [dialogMode, setDialogMode] = useState<"add" | "edit">("add");
  const [exerciseToEdit, setExerciseToEdit] = useState<any | null>(null);

  // Filter exercises based on search query and filters
  const filteredExercises = exercises.filter(exercise => {
    // Search filter
    const matchesSearch = searchQuery === "" || 
      exercise.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      exercise.description.toLowerCase().includes(searchQuery.toLowerCase());

    // Muscle group filter
    const matchesMuscleGroup = selectedMuscleGroup === "all" || 
      exercise.primary_muscle_groups.includes(selectedMuscleGroup as MuscleGroup) ||
      exercise.secondary_muscle_groups.includes(selectedMuscleGroup as MuscleGroup);

    // Equipment filter
    const matchesEquipment = selectedEquipment === "all" || 
      exercise.equipment_type.includes(selectedEquipment as EquipmentType);

    // Difficulty filter
    const matchesDifficulty = selectedDifficulty === "all" || 
      exercise.difficulty === selectedDifficulty;

    // Movement pattern filter
    const matchesMovement = selectedMovement === "all" || 
      exercise.movement_pattern === selectedMovement;

    return matchesSearch && matchesMuscleGroup && matchesEquipment && 
           matchesDifficulty && matchesMovement;
  });

  // Pagination logic
  const indexOfLastExercise = currentPage * exercisesPerPage;
  const indexOfFirstExercise = indexOfLastExercise - exercisesPerPage;
  const currentExercises = filteredExercises.slice(indexOfFirstExercise, indexOfLastExercise);
  const totalPages = Math.ceil(filteredExercises.length / exercisesPerPage);

  const paginate = (pageNumber: number) => {
    if (pageNumber > 0 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedMuscleGroup, selectedEquipment, selectedDifficulty, selectedMovement]);

  const handleEdit = (exerciseId: string) => {
    const found = exercises.find(e => e.id === exerciseId);
    if (found) {
      setExerciseToEdit({
        name: found.name,
        description: found.description,
        primary_muscle_groups: found.primary_muscle_groups,
        secondary_muscle_groups: found.secondary_muscle_groups,
        equipment_type: found.equipment_type,
        movement_pattern: found.movement_pattern,
        difficulty: found.difficulty,
        instructions: found.instructions,
        is_compound: found.is_compound,
        tips: found.tips,
        variations: found.variations,
        metadata: found.metadata,
      });
      setDialogMode("edit");
      setShowDialog(true);
    } else {
      toast({ title: "Exercise not found", variant: "destructive" });
    }
  };

  const handleDelete = (exerciseId: string) => {
    toast({
      title: "Delete Exercise",
      description: `Deleting exercise with ID: ${exerciseId}`,
      variant: "destructive",
    });
  };

  const handleAdd = () => {
    setExerciseToEdit(null);
    setDialogMode("add");
    setShowDialog(true);
  };

  const handleAccordionSelect = (value: string) => {
    setActiveAccordion(prev => (prev === value ? null : value));
  };

  const handleSelectExercise = (exercise: Exercise) => {
    if (onSelectExercise) {
      onSelectExercise(exercise);
    } else {
      handleAccordionSelect(exercise.id);
    }
  };

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedMuscleGroup("all");
    setSelectedEquipment("all");
    setSelectedDifficulty("all");
    setSelectedMovement("all");
  };

  // Add/Edit handler
  const handleDialogSubmit = async (exercise: {
    name: string;
    description: string;
    primary_muscle_groups: MuscleGroup[];
    secondary_muscle_groups: MuscleGroup[];
    equipment_type: EquipmentType[];
    movement_pattern: MovementPattern;
    difficulty: Difficulty;
    instructions?: Record<string, any>;
    is_compound?: boolean;
    tips?: string[];
    variations?: string[];
    metadata?: Record<string, any>;
  }) => {
    if (dialogMode === "add") {
      await new Promise(resolve => setTimeout(resolve, 350));
      await new Promise<void>((resolve, reject) => {
        createExercise(
          {
            ...exercise,
            user_id: "",
          },
          {
            onSuccess: () => resolve(),
            onError: err => reject(err),
          }
        );
      });
    } else {
      // For now, just toast in edit mode (update functionality to be added)
      toast({ title: "Edit not implemented", description: "Update exercise functionality will be implemented soon!" });
    }
  };

  return (
    <>
      <PageHeader title="All Exercises" />
      
      {/* Main content container */}
      <div className="max-w-4xl mx-auto py-6 px-4 space-y-6 pt-20 pb-24">
        <ExerciseDialog
          open={showDialog}
          onOpenChange={setShowDialog}
          onSubmit={handleDialogSubmit}
          initialExercise={exerciseToEdit!}
          loading={isPending}
          mode={dialogMode}
        />
        
        {/* Header section with search and filter */}
        <div className="flex flex-col gap-4 mb-8">
          <div className="flex flex-col md:flex-row justify-between gap-4">
            <h1 className="text-2xl font-bold text-white">Exercise Library</h1>
            
            <div className="flex gap-2">
              <Button 
                variant="outline"
                size="sm" 
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center ${showFilters ? 'bg-purple-900/50 border-purple-500' : ''}`}
              >
                <Filter className="w-4 h-4 mr-2" />
                Filters
                {(selectedMuscleGroup !== "all" || selectedEquipment !== "all" || 
                  selectedDifficulty !== "all" || selectedMovement !== "all") && (
                  <Badge variant="secondary" className="ml-2 bg-purple-600 text-xs">
                    {[
                      selectedMuscleGroup !== "all" ? 1 : 0,
                      selectedEquipment !== "all" ? 1 : 0,
                      selectedDifficulty !== "all" ? 1 : 0,
                      selectedMovement !== "all" ? 1 : 0
                    ].reduce((a, b) => a + b, 0)}
                  </Badge>
                )}
              </Button>
              
              {!isMobile && (
                <Button onClick={handleAdd} variant="gradient" size="sm" className="flex items-center">
                  <Plus className="w-4 h-4 mr-1" />
                  Add Exercise
                </Button>
              )}
            </div>
          </div>
          
          {/* Search box */}
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search exercises by name or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-gray-800 border-gray-700"
            />
            {searchQuery && (
              <Button 
                variant="ghost" 
                size="sm" 
                className="absolute right-2 top-1.5 h-7 w-7 p-0"
                onClick={() => setSearchQuery("")}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
          
          {/* Filter section */}
          {showFilters && (
            <Card className="p-4 bg-gray-800/50 border-gray-700">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                <div>
                  <label className="text-sm text-gray-300 mb-1 block">Muscle Group</label>
                  <Select 
                    value={selectedMuscleGroup} 
                    onValueChange={(value) => setSelectedMuscleGroup(value as any)}
                  >
                    <SelectTrigger className="bg-gray-900 border-gray-700">
                      <SelectValue placeholder="Select muscle group" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-900 border-gray-700">
                      <SelectGroup>
                        <SelectItem value="all">All Muscle Groups</SelectItem>
                        {COMMON_MUSCLE_GROUPS.map((muscle) => (
                          <SelectItem key={muscle} value={muscle}>{muscle}</SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label className="text-sm text-gray-300 mb-1 block">Equipment</label>
                  <Select 
                    value={selectedEquipment} 
                    onValueChange={(value) => setSelectedEquipment(value as any)}
                  >
                    <SelectTrigger className="bg-gray-900 border-gray-700">
                      <SelectValue placeholder="Select equipment" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-900 border-gray-700">
                      <SelectGroup>
                        <SelectItem value="all">All Equipment</SelectItem>
                        {COMMON_EQUIPMENT.map((equipment) => (
                          <SelectItem key={equipment} value={equipment}>{equipment}</SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label className="text-sm text-gray-300 mb-1 block">Difficulty</label>
                  <Select 
                    value={selectedDifficulty} 
                    onValueChange={(value) => setSelectedDifficulty(value as any)}
                  >
                    <SelectTrigger className="bg-gray-900 border-gray-700">
                      <SelectValue placeholder="Select difficulty" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-900 border-gray-700">
                      <SelectGroup>
                        <SelectItem value="all">All Difficulties</SelectItem>
                        {DIFFICULTY_LEVELS.map((difficulty) => (
                          <SelectItem key={difficulty} value={difficulty}>{difficulty}</SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label className="text-sm text-gray-300 mb-1 block">Movement Pattern</label>
                  <Select 
                    value={selectedMovement} 
                    onValueChange={(value) => setSelectedMovement(value as any)}
                  >
                    <SelectTrigger className="bg-gray-900 border-gray-700">
                      <SelectValue placeholder="Select pattern" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-900 border-gray-700">
                      <SelectGroup>
                        <SelectItem value="all">All Patterns</SelectItem>
                        {MOVEMENT_PATTERNS.map((pattern) => (
                          <SelectItem key={pattern} value={pattern}>{pattern}</SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="flex justify-between">
                <div className="text-sm text-gray-400">
                  {filteredExercises.length} exercise{filteredExercises.length !== 1 ? 's' : ''} found
                </div>
                
                <Button
                  variant="link"
                  size="sm"
                  onClick={clearFilters}
                  className="text-purple-400 hover:text-purple-300"
                >
                  Clear all filters
                </Button>
              </div>
            </Card>
          )}
        </div>
        
        {/* Loading state */}
        {isLoading && (
          <div className="space-y-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <Card key={index} className="bg-gray-900 border-gray-700 p-4">
                <div className="flex flex-col gap-2">
                  <Skeleton className="h-6 w-3/4 bg-gray-800" />
                  <Skeleton className="h-4 w-5/6 bg-gray-800" />
                </div>
              </Card>
            ))}
          </div>
        )}
        
        {/* Error state */}
        {isError && (
          <div className="text-red-500 text-center py-8">
            Error loading exercises. Please try again later.
          </div>
        )}
        
        {/* Empty state */}
        {!isLoading && !isError && filteredExercises.length === 0 && (
          <div className="text-center py-12">
            <div className="bg-gray-800/50 rounded-lg py-10 px-6 max-w-md mx-auto">
              {searchQuery || selectedMuscleGroup !== "all" || selectedEquipment !== "all" || 
               selectedDifficulty !== "all" || selectedMovement !== "all" ? (
                <>
                  <h3 className="text-xl font-medium mb-2">No matching exercises</h3>
                  <p className="text-gray-400 mb-6">Try adjusting your filters or search query</p>
                  <Button variant="outline" onClick={clearFilters}>Clear filters</Button>
                </>
              ) : (
                <>
                  <h3 className="text-xl font-medium mb-2">No exercises found</h3>
                  <p className="text-gray-400 mb-6">Create your first exercise to get started</p>
                  <Button variant="gradient" onClick={handleAdd}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Your First Exercise
                  </Button>
                </>
              )}
            </div>
          </div>
        )}
        
        {/* Exercise list */}
        {!isLoading && !isError && currentExercises.length > 0 && (
          <div className="space-y-4">
            <Accordion
              type="single"
              collapsible
              value={activeAccordion ? activeAccordion : ""}
              onValueChange={val => setActiveAccordion(val as string)}
            >
              {currentExercises.map((exercise) => (
                <ExerciseAccordionCard
                  key={exercise.id}
                  exercise={exercise}
                  expanded={activeAccordion === exercise.id}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onSelect={handleSelectExercise}
                />
              ))}
            </Accordion>
            
            {/* Pagination */}
            {totalPages > 1 && (
              <Pagination className="mt-8">
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious 
                      onClick={() => paginate(currentPage - 1)}
                      className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                    />
                  </PaginationItem>
                  
                  {/* First page */}
                  {currentPage > 2 && (
                    <PaginationItem>
                      <PaginationLink onClick={() => paginate(1)}>1</PaginationLink>
                    </PaginationItem>
                  )}
                  
                  {/* Ellipsis */}
                  {currentPage > 3 && (
                    <PaginationItem>
                      <span className="px-2">...</span>
                    </PaginationItem>
                  )}
                  
                  {/* Previous page */}
                  {currentPage > 1 && (
                    <PaginationItem>
                      <PaginationLink onClick={() => paginate(currentPage - 1)}>
                        {currentPage - 1}
                      </PaginationLink>
                    </PaginationItem>
                  )}
                  
                  {/* Current page */}
                  <PaginationItem>
                    <PaginationLink isActive>{currentPage}</PaginationLink>
                  </PaginationItem>
                  
                  {/* Next page */}
                  {currentPage < totalPages && (
                    <PaginationItem>
                      <PaginationLink onClick={() => paginate(currentPage + 1)}>
                        {currentPage + 1}
                      </PaginationLink>
                    </PaginationItem>
                  )}
                  
                  {/* Ellipsis */}
                  {currentPage < totalPages - 2 && (
                    <PaginationItem>
                      <span className="px-2">...</span>
                    </PaginationItem>
                  )}
                  
                  {/* Last page */}
                  {currentPage < totalPages - 1 && (
                    <PaginationItem>
                      <PaginationLink onClick={() => paginate(totalPages)}>
                        {totalPages}
                      </PaginationLink>
                    </PaginationItem>
                  )}
                  
                  <PaginationItem>
                    <PaginationNext 
                      onClick={() => paginate(currentPage + 1)}
                      className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            )}
          </div>
        )}
      </div>
      
      {/* Mobile Add Button */}
      {isMobile && (
        <ExerciseFAB onClick={handleAdd} />
      )}
    </>
  );
}
