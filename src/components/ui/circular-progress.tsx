
import * as React from "react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface CircularProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value: number;
  size?: number;
  strokeWidth?: number;
  showValue?: boolean;
  valueClassName?: string;
  valuePrefix?: string;
  valueSuffix?: string;
  animated?: boolean;
}

export const CircularProgress = React.forwardRef<HTMLDivElement, CircularProgressProps>(
  ({ 
    value, 
    size = 64, 
    strokeWidth = 4, 
    showValue = false,
    valueClassName,
    valuePrefix = "",
    valueSuffix = "%",
    animated = false,
    className, 
    ...props 
  }, ref) => {
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const offset = circumference - (value / 100) * circumference;
    
    return (
      <div 
        ref={ref} 
        className={cn("relative", className)} 
        style={{ width: size, height: size }}
        {...props}
      >
        <svg className="transform -rotate-90" width={size} height={size}>
          {/* Background circle */}
          <circle
            className="text-gray-700"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            fill="none"
            r={radius}
            cx={size / 2}
            cy={size / 2}
          />
          {/* Progress circle */}
          {animated ? (
            <motion.circle
              className="text-purple-500 transition-all duration-200"
              stroke="currentColor"
              strokeWidth={strokeWidth}
              strokeDasharray={`${circumference} ${circumference}`}
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset: offset }}
              transition={{ duration: 1, ease: "easeInOut" }}
              strokeLinecap="round"
              fill="none"
              r={radius}
              cx={size / 2}
              cy={size / 2}
            />
          ) : (
            <circle
              className="text-purple-500 transition-all duration-200"
              stroke="currentColor"
              strokeWidth={strokeWidth}
              strokeDasharray={`${circumference} ${circumference}`}
              strokeDashoffset={offset}
              strokeLinecap="round"
              fill="none"
              r={radius}
              cx={size / 2}
              cy={size / 2}
            />
          )}
        </svg>
        
        {showValue && (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className={cn("text-sm font-medium", valueClassName)}>
              {valuePrefix}{Math.round(value)}{valueSuffix}
            </span>
          </div>
        )}
      </div>
    );
  }
);

CircularProgress.displayName = "CircularProgress";
