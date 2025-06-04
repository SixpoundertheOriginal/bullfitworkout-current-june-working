
import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { PlusCircle } from 'lucide-react';
import { WeightUnit } from '@/utils/unitConversion';

interface VolumeProgress {
  volumeDiff: number;
  volumePercentChange: string;
}

interface ExerciseCardFooterProps {
  currentVolume: number;
  previousVolume: number;
  volumeProgress: VolumeProgress;
  hasSameGroupData: boolean;
  weightUnit: WeightUnit;
  onAddSet: () => void;
}

export const ExerciseCardFooter = React.memo<ExerciseCardFooterProps>(({
  currentVolume,
  previousVolume,
  volumeProgress,
  hasSameGroupData,
  weightUnit,
  onAddSet
}) => {
  const { volumeDiff, volumePercentChange } = volumeProgress;

  return (
    <div className="space-y-4">
      {/* Volume Stats */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="pt-3 border-t border-gray-800 space-y-2"
      >
        <div className="flex justify-between text-sm">
          <span className="text-gray-400 font-medium">Current Volume</span>
          <span className="font-mono text-purple-300 font-semibold">
            {currentVolume.toFixed(1)} {weightUnit}
          </span>
        </div>
        
        {hasSameGroupData && (
          <>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">vs Previous Session</span>
              <span className={`font-mono font-semibold ${volumeDiff >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                {volumeDiff > 0 ? "+" : ""}{volumeDiff.toFixed(1)} {weightUnit} ({volumePercentChange}%)
              </span>
            </div>

            <Progress 
              value={currentVolume > 0 ? Math.min((currentVolume / Math.max(previousVolume, 1)) * 100, 200) : 0} 
              className={`h-1.5 mt-2 bg-gray-800 transition-all duration-500 ${
                currentVolume >= previousVolume 
                  ? "[&>div]:bg-gradient-to-r [&>div]:from-emerald-500 [&>div]:to-green-500" 
                  : "[&>div]:bg-gradient-to-r [&>div]:from-red-500 [&>div]:to-orange-500"
              }`}
            />
          </>
        )}
      </motion.div>

      {/* Add Set Button */}
      <motion.div
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        transition={{ duration: 0.1 }}
      >
        <Button
          onClick={onAddSet}
          className="
            w-full bg-muted/40 text-foreground py-2.5 px-4 rounded-xl
            hover:bg-muted/60 transition-all duration-300 ease-out 
            active:scale-95 transition-transform
            flex items-center justify-center gap-3 mt-4
            font-medium group
          "
        >
          <motion.div
            whileHover={{ rotate: 90 }}
            transition={{ duration: 0.2 }}
          >
            <PlusCircle size={20} />
          </motion.div>
          <span>Add Set</span>
        </Button>
      </motion.div>
    </div>
  );
});

ExerciseCardFooter.displayName = 'ExerciseCardFooter';
