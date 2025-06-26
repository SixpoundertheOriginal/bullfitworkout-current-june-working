
import React from "react";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

interface CardContainerProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
  showBackButton?: boolean;
  onBack?: () => void;
  className?: string;
  progress?: {
    current: number;
    total: number;
  };
}

export const CardContainer = ({
  children,
  title,
  subtitle,
  showBackButton = true,
  onBack,
  className,
  progress
}: CardContainerProps) => {
  const navigate = useNavigate();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate(-1);
    }
  };

  return (
    <motion.div
      initial={{ x: "100%", opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: "-100%", opacity: 0 }}
      transition={{
        type: "spring",
        stiffness: 300,
        damping: 30,
        mass: 0.8
      }}
      className={cn(
        "min-h-screen bg-gradient-to-br from-gray-900 via-gray-900/98 to-gray-900/95",
        "flex flex-col",
        className
      )}
    >
      {/* Header with proper safe area and back button */}
      <div className="pt-safe-top px-4 sm:px-6 pb-2 flex-shrink-0">
        <div className="flex items-center justify-between mb-4 pt-4">
          {showBackButton && (
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={handleBack}
              className="p-2 -ml-2 rounded-full hover:bg-white/5 transition-colors touch-target"
            >
              <ArrowLeft className="h-6 w-6 text-white" />
            </motion.button>
          )}
          
          {progress && (
            <div className="flex items-center gap-2">
              {Array.from({ length: progress.total }, (_, i) => (
                <div
                  key={i}
                  className={cn(
                    "h-1 rounded-full transition-all duration-300",
                    i < progress.current 
                      ? "w-8 bg-gradient-to-r from-purple-500 to-pink-500" 
                      : "w-4 bg-white/20"
                  )}
                />
              ))}
            </div>
          )}
        </div>

        {/* Title section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6"
        >
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2 tracking-tight">
            {title}
          </h1>
          {subtitle && (
            <p className="text-base sm:text-lg text-white/70 font-medium">
              {subtitle}
            </p>
          )}
        </motion.div>
      </div>

      {/* Content area with proper mobile scrolling */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="flex-1 px-4 sm:px-6 pb-safe-bottom overflow-y-auto"
      >
        <div className="bg-white/5 backdrop-blur-xl rounded-2xl sm:rounded-3xl border border-white/10 shadow-2xl p-4 sm:p-6 mb-4">
          {children}
        </div>
      </motion.div>
    </motion.div>
  );
};
