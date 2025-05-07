
import React, { memo } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, X } from "lucide-react";
import { useExerciseFilters } from "@/context/ExerciseFilterContext";

interface ExerciseSearchBarProps {
  className?: string;
}

const ExerciseSearchBar: React.FC<ExerciseSearchBarProps> = ({ className }) => {
  const { searchQuery, setSearchQuery } = useExerciseFilters();

  return (
    <div className={`relative ${className || ''}`}>
      <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
      <Input
        placeholder="Search exercises..."
        className="pl-9 bg-gray-800 border-gray-700"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
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
  );
};

export default memo(ExerciseSearchBar);
