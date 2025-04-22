
import React from 'react';
import { motion } from 'framer-motion';
import { Zap } from 'lucide-react';
import { cn } from '@/lib/utils';
import { typography } from '@/lib/typography';

interface StartTrainingButtonProps {
  onClick: () => void;
  isVisible: boolean;
  workoutType?: string;
  duration?: number;
  isLoading?: boolean;
}

export const StartTrainingButton = ({ 
  onClick, 
  isVisible, 
  workoutType = "Strength",
  duration = 45,
  isLoading = false
}: StartTrainingButtonProps) => {
  return (
    <motion.button
      onClick={onClick}
      disabled={isLoading}
      animate={{
        opacity: isVisible ? 1 : 0,
        scale: isVisible ? 1 : 0.8,
        y: isVisible ? 0 : 20,
      }}
      transition={{
        type: "spring",
        stiffness: 300,
        damping: 30
      }}
      whileHover={{ scale: isLoading ? 1 : 1.05 }}
      whileTap={{ scale: isLoading ? 1 : 0.95 }}
      className={cn(
        "relative flex flex-col items-center justify-center",
        "bg-gradient-to-r from-purple-600 to-pink-500",
        "shadow-xl hover:shadow-purple-500/30",
        "rounded-full border border-purple-500/30",
        "h-36 w-36",
        "group",
        !isVisible && "pointer-events-none",
        isLoading && "opacity-90 cursor-not-allowed"
      )}
    >
      <div className="absolute inset-0 bg-white/10 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-md"></div>
      
      {/* Inner pulse animation */}
      <div className="absolute inset-0 flex items-center justify-center">
        <motion.div
          className="absolute w-16 h-16 rounded-full bg-purple-500/20"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.1, 0.3],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            repeatType: "loop"
          }}
        />
      </div>
      
      {/* Loading spinner animation */}
      {isLoading && (
        <motion.div
          className="absolute inset-0 rounded-full"
          animate={{ rotate: 360 }}
          transition={{ 
            duration: 1, 
            repeat: Infinity, 
            ease: "linear"
          }}
        >
          <div className="absolute top-0 right-[43%] w-4 h-4 bg-white rounded-full opacity-80" />
        </motion.div>
      )}
      
      {/* Outer subtle rotating gradient */}
      <motion.div
        className="absolute inset-0 rounded-full opacity-30 overflow-hidden"
        style={{ 
          background: 'conic-gradient(from 0deg, rgba(168, 85, 247, 0.4), rgba(236, 72, 153, 0.4), rgba(168, 85, 247, 0.4))'
        }}
        animate={{ rotate: 360 }}
        transition={{ 
          duration: 20, 
          repeat: Infinity, 
          ease: "linear"
        }}
      />
      
      {/* Content */}
      <Zap size={28} className="relative z-10 mb-1 text-white" />
      <span className={cn(typography.text.primary, "relative z-10 text-2xl font-bold")}>Start</span>
      <span className={cn(typography.text.secondary, "relative z-10 text-xs mt-1")}>
        {`${workoutType} · ${Math.round(duration)} min`}
      </span>
    </motion.button>
  );
};
