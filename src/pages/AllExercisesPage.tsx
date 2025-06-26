
import React from 'react';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { useExercises } from '@/hooks/useExercises';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const AllExercisesPage: React.FC = () => {
  const { exercises, isLoading, error } = useExercises();

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-6 bg-gray-900 min-h-screen">
        <div className="mb-6">
          <Skeleton className="h-9 w-48 mb-2 bg-gray-700" />
          <Skeleton className="h-5 w-64 bg-gray-700" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-32 bg-gray-700" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-6 bg-gray-900 min-h-screen">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-white">Exercise Library</h1>
          <p className="text-gray-400">Browse and manage your exercise database</p>
        </div>
        <div className="bg-red-900/20 border border-red-500/30 text-red-300 p-4 rounded-lg">
          <h3 className="font-semibold text-lg mb-2">Error Loading Exercises</h3>
          <p>We're having trouble loading the exercise library. Please refresh the page.</p>
          <p className="text-sm mt-2 opacity-70">Error: {error.message}</p>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="container mx-auto px-4 py-6 bg-gray-900 min-h-screen text-white">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-white">Exercise Library</h1>
          <p className="text-gray-400">
            Browse and manage your exercise database ({exercises.length} exercises)
          </p>
        </div>
        
        {exercises.length === 0 ? (
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">No Exercises Found</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-400">
                No exercises available. Try seeding the database or creating new exercises.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {exercises.slice(0, 20).map((exercise) => (
              <Card key={exercise.id} className="bg-gray-800 border-gray-700 hover:border-purple-500 transition-colors">
                <CardHeader>
                  <CardTitle className="text-white text-lg">{exercise.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {exercise.primary_muscle_groups && exercise.primary_muscle_groups.length > 0 && (
                      <p className="text-sm text-gray-400">
                        <span className="font-medium">Muscles:</span> {exercise.primary_muscle_groups.join(', ')}
                      </p>
                    )}
                    {exercise.equipment_type && exercise.equipment_type.length > 0 && (
                      <p className="text-sm text-gray-400">
                        <span className="font-medium">Equipment:</span> {exercise.equipment_type.join(', ')}
                      </p>
                    )}
                    {exercise.difficulty && (
                      <p className="text-sm text-gray-400">
                        <span className="font-medium">Difficulty:</span> {exercise.difficulty}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
            {exercises.length > 20 && (
              <Card className="bg-gray-800 border-gray-700">
                <CardContent className="flex items-center justify-center h-32">
                  <p className="text-gray-400">+ {exercises.length - 20} more exercises</p>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </ErrorBoundary>
  );
};

export default AllExercisesPage;
