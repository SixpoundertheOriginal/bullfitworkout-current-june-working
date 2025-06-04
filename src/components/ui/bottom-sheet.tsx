
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, PanInfo } from 'framer-motion';
import { cn } from '@/lib/utils';

interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  snapPoints?: number[];
  className?: string;
  enableGestures?: boolean;
}

export const BottomSheet: React.FC<BottomSheetProps> = ({
  isOpen,
  onClose,
  children,
  snapPoints = [0.3, 0.6, 0.9],
  className,
  enableGestures = true
}) => {
  const [currentSnap, setCurrentSnap] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const constraintsRef = useRef<HTMLDivElement>(null);

  // Haptic feedback simulation
  const triggerHaptic = (type: 'light' | 'medium' | 'heavy' = 'light') => {
    if ('vibrate' in navigator) {
      const patterns = {
        light: [10],
        medium: [20],
        heavy: [50]
      };
      navigator.vibrate(patterns[type]);
    }
  };

  useEffect(() => {
    if (isOpen) {
      setCurrentSnap(0);
      triggerHaptic('light');
    }
  }, [isOpen]);

  const handleDragEnd = (event: any, info: PanInfo) => {
    setIsDragging(false);
    const velocity = info.velocity.y;
    const offset = info.offset.y;
    
    // Determine if we should close or snap to next position
    if (velocity > 500 || offset > 100) {
      if (currentSnap === snapPoints.length - 1) {
        onClose();
        triggerHaptic('medium');
      } else {
        setCurrentSnap(prev => Math.min(prev + 1, snapPoints.length - 1));
        triggerHaptic('light');
      }
    } else if (velocity < -500 || offset < -100) {
      setCurrentSnap(prev => Math.max(prev - 1, 0));
      triggerHaptic('light');
    }
  };

  const backdropVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { duration: 0.3, ease: "easeOut" }
    }
  };

  const sheetVariants = {
    hidden: { 
      y: "100%",
      transition: { 
        type: "spring",
        damping: 30,
        stiffness: 300
      }
    },
    visible: { 
      y: `${(1 - snapPoints[currentSnap]) * 100}%`,
      transition: { 
        type: "spring",
        damping: 25,
        stiffness: 400,
        mass: 0.8
      }
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop with blur effect */}
          <motion.div
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-md"
            variants={backdropVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            onClick={onClose}
          />
          
          {/* Bottom Sheet */}
          <div ref={constraintsRef} className="fixed inset-0 z-50 pointer-events-none">
            <motion.div
              className={cn(
                "absolute bottom-0 left-0 right-0 bg-white dark:bg-gray-900 rounded-t-3xl shadow-2xl pointer-events-auto",
                "border-t border-gray-200 dark:border-gray-700",
                "min-h-[30vh] max-h-[90vh]",
                className
              )}
              variants={sheetVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
              drag={enableGestures ? "y" : false}
              dragConstraints={constraintsRef}
              dragElastic={0.1}
              onDragStart={() => setIsDragging(true)}
              onDragEnd={handleDragEnd}
              style={{
                touchAction: 'pan-y'
              }}
            >
              {/* Drag Handle */}
              <div className="flex justify-center py-3">
                <div 
                  className={cn(
                    "w-12 h-1.5 bg-gray-300 dark:bg-gray-600 rounded-full transition-all duration-200",
                    isDragging && "bg-gray-400 dark:bg-gray-500 w-16"
                  )}
                />
              </div>
              
              {/* Content */}
              <div className="px-6 pb-safe-bottom overflow-y-auto max-h-[calc(90vh-60px)]">
                {children}
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};
