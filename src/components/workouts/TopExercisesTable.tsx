
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dumbbell } from "lucide-react";
import { TopExerciseStats } from "@/hooks/useWorkoutStats";
import { useWeightUnit } from "@/context/WeightUnitContext";
import { convertWeight } from "@/utils/unitConversion";

interface TopExercisesTableProps {
  exercises: TopExerciseStats[];
  className?: string;
}

export const TopExercisesTable = ({ exercises, className = "" }: TopExercisesTableProps) => {
  const { weightUnit } = useWeightUnit();
  
  if (exercises.length === 0) {
    return (
      <Card className={`bg-gray-900 border-gray-800 ${className}`}>
        <CardHeader className="pb-2">
          <CardTitle className="text-md">Top Exercises</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-6 text-gray-500">
            <Dumbbell size={32} className="mb-2 text-gray-700" />
            <p>No exercise data available</p>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className={`bg-gray-900 border-gray-800 ${className}`}>
      <CardHeader className="pb-2">
        <CardTitle className="text-md">Top Exercises</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow className="border-gray-800 hover:bg-transparent">
              <TableHead className="text-gray-400">Exercise</TableHead>
              <TableHead className="text-gray-400 text-right">Sets</TableHead>
              <TableHead className="text-gray-400 text-right">Avg Weight</TableHead>
              <TableHead className="text-gray-400 text-right">Volume</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {exercises.map((exercise) => {
              // Convert weights to user's preferred unit
              const avgWeight = convertWeight(exercise.averageWeight, "lb", weightUnit);
              const volume = convertWeight(exercise.totalVolume, "lb", weightUnit);
              
              return (
                <TableRow key={exercise.exerciseName} className="border-gray-800 hover:bg-gray-800/50">
                  <TableCell className="font-medium">{exercise.exerciseName}</TableCell>
                  <TableCell className="text-right">{exercise.totalSets}</TableCell>
                  <TableCell className="text-right">
                    {Math.round(avgWeight * 10) / 10} {weightUnit}
                  </TableCell>
                  <TableCell className="text-right">
                    {Math.round(volume)} {weightUnit}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};
