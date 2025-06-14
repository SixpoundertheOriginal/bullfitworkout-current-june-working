
import React from 'react';
import { PerformanceOptimizedExerciseLibrary } from '@/components/exercises/PerformanceOptimizedExerciseLibrary';

const ExerciseLibraryPage: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Exercise Library</h1>
        <p className="text-muted-foreground">
          Browse and manage your exercise database
        </p>
      </div>
      
      <PerformanceOptimizedExerciseLibrary 
        showCreateButton={true}
        onCreateExercise={() => {
          console.log('Create exercise clicked');
        }}
      />
    </div>
  );
};

export default ExerciseLibraryPage;
