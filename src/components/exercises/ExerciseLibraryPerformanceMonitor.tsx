
import React, { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Zap, Clock, Activity } from 'lucide-react';

interface PerformanceMetrics {
  searchTime: number;
  renderTime: number;
  totalExercises: number;
  isOptimized: boolean;
}

interface ExerciseLibraryPerformanceMonitorProps {
  exercises: any[];
  isLoading: boolean;
  searchTerm: string;
}

export const ExerciseLibraryPerformanceMonitor: React.FC<ExerciseLibraryPerformanceMonitorProps> = ({
  exercises,
  isLoading,
  searchTerm
}) => {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    searchTime: 0,
    renderTime: 0,
    totalExercises: 0,
    isOptimized: true
  });

  useEffect(() => {
    const startTime = performance.now();
    
    // Measure search/filter time
    const searchStartTime = performance.now();
    const filteredExercises = exercises; // Assuming filtering is already done
    const searchEndTime = performance.now();
    
    // Measure render time using requestAnimationFrame
    requestAnimationFrame(() => {
      const renderEndTime = performance.now();
      
      const newMetrics = {
        searchTime: searchEndTime - searchStartTime,
        renderTime: renderEndTime - startTime,
        totalExercises: exercises.length,
        isOptimized: (renderEndTime - startTime) < 100 // Target: <100ms
      };
      
      setMetrics(newMetrics);
    });
  }, [exercises, searchTerm]);

  if (process.env.NODE_ENV === 'production') {
    return null; // Hide in production
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 bg-gray-900/90 backdrop-blur-sm border border-gray-700 rounded-lg p-3 shadow-xl">
      <div className="flex items-center gap-2 mb-2">
        <Activity className="w-4 h-4 text-purple-400" />
        <span className="text-xs font-medium text-white">Performance Monitor</span>
      </div>
      
      <div className="space-y-1">
        <div className="flex items-center justify-between gap-3 text-xs">
          <span className="text-gray-400 flex items-center gap-1">
            <Clock className="w-3 h-3" />
            Render Time:
          </span>
          <Badge 
            variant="outline" 
            className={`text-xs ${
              metrics.renderTime < 100 
                ? 'bg-emerald-900/30 text-emerald-400 border-emerald-500/30' 
                : 'bg-red-900/30 text-red-400 border-red-500/30'
            }`}
          >
            {metrics.renderTime.toFixed(1)}ms
          </Badge>
        </div>
        
        <div className="flex items-center justify-between gap-3 text-xs">
          <span className="text-gray-400 flex items-center gap-1">
            <Zap className="w-3 h-3" />
            Search Time:
          </span>
          <Badge 
            variant="outline" 
            className={`text-xs ${
              metrics.searchTime < 50 
                ? 'bg-emerald-900/30 text-emerald-400 border-emerald-500/30' 
                : 'bg-amber-900/30 text-amber-400 border-amber-500/30'
            }`}
          >
            {metrics.searchTime.toFixed(1)}ms
          </Badge>
        </div>
        
        <div className="flex items-center justify-between gap-3 text-xs">
          <span className="text-gray-400">Exercises:</span>
          <Badge variant="outline" className="text-xs bg-gray-800 text-gray-300">
            {metrics.totalExercises}
          </Badge>
        </div>
        
        <div className="flex items-center justify-between gap-3 text-xs">
          <span className="text-gray-400">Status:</span>
          <Badge 
            variant="outline" 
            className={`text-xs ${
              metrics.isOptimized 
                ? 'bg-emerald-900/30 text-emerald-400 border-emerald-500/30' 
                : 'bg-red-900/30 text-red-400 border-red-500/30'
            }`}
          >
            {metrics.isOptimized ? 'Optimized' : 'Needs Optimization'}
          </Badge>
        </div>
        
        {isLoading && (
          <div className="flex items-center gap-2 text-xs text-amber-400">
            <div className="w-3 h-3 border border-amber-400 border-t-transparent rounded-full animate-spin" />
            <span>Loading...</span>
          </div>
        )}
      </div>
    </div>
  );
};
