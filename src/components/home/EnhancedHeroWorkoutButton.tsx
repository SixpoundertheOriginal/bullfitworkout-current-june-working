
import React, { useState, useRef } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { Play, Zap, Star, Target } from 'lucide-react';
import { cn } from '@/lib/utils';

interface EnhancedHeroWorkoutButtonProps {
  onPress: () => void;
  isLoading?: boolean;
  className?: string;
  dailyGoalProgress?: number; // 0-100
  weeklyGoalProgress?: number; // 0-100
}

export const EnhancedHeroWorkoutButton: React.FC<EnhancedHeroWorkoutButtonProps> = ({
  onPress,
  isLoading = false,
  className,
  dailyGoalProgress = 0,
  weeklyGoalProgress = 0
}) => {
  const [isPressed, setIsPressed] = useState(false);
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number }>>([]);
  const buttonRef = useRef<HTMLButtonElement>(null);
  
  // Enhanced physics-based animations
  const scale = useMotionValue(1);
  const springScale = useSpring(scale, { damping: 25, stiffness: 400 });
  const rotate = useTransform(springScale, [0.95, 1.05], [-1, 1]);
  const shadowScale = useTransform(springScale, [0.95, 1], [0.8, 1]);

  // Haptic feedback simulation
  const triggerHaptic = (type: 'light' | 'medium' | 'heavy' = 'medium') => {
    if ('vibrate' in navigator) {
      const patterns = {
        light: [5],
        medium: [10],
        heavy: [15]
      };
      navigator.vibrate(patterns[type]);
    }
  };

  // Enhanced particle effect
  const createParticles = (event: React.TouchEvent | React.MouseEvent) => {
    const rect = buttonRef.current?.getBoundingClientRect();
    if (!rect) return;

    const clientX = 'touches' in event ? event.touches[0].clientX : event.clientX;
    const clientY = 'touches' in event ? event.touches[0].clientY : event.clientY;

    const relativeX = clientX - rect.left;
    const relativeY = clientY - rect.top;

    const newParticles = Array.from({ length: 15 }, (_, i) => ({
      id: Date.now() + i,
      x: relativeX,
      y: relativeY
    }));

    setParticles(prev => [...prev, ...newParticles]);

    setTimeout(() => {
      setParticles(prev => prev.filter(p => !newParticles.find(np => np.id === p.id)));
    }, 1200);
  };

  const handlePress = (event: React.TouchEvent | React.MouseEvent) => {
    setIsPressed(true);
    scale.set(0.96);
    triggerHaptic('medium');
    createParticles(event);
    
    setTimeout(() => {
      setIsPressed(false);
      scale.set(1);
      onPress();
    }, 120);
  };

  return (
    <div className={cn("relative", className)}>
      {/* Enhanced particle effects */}
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute pointer-events-none z-10"
          initial={{
            x: particle.x,
            y: particle.y,
            scale: 0,
            opacity: 1
          }}
          animate={{
            x: particle.x + (Math.random() - 0.5) * 120,
            y: particle.y + (Math.random() - 0.5) * 120,
            scale: [0, 1.2, 0],
            opacity: [1, 0.8, 0]
          }}
          transition={{
            duration: 1,
            ease: "easeOut"
          }}
        >
          {Math.random() > 0.6 ? (
            <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
          ) : Math.random() > 0.3 ? (
            <Zap className="h-3 w-3 text-purple-400" />
          ) : (
            <Target className="h-3 w-3 text-pink-400" />
          )}
        </motion.div>
      ))}

      {/* Progress rings */}
      <motion.div
        className="absolute inset-0 rounded-2xl"
        style={{ scale: shadowScale }}
      >
        {/* Daily progress ring */}
        <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 100 100">
          <circle
            cx="50"
            cy="50"
            r="48"
            fill="none"
            stroke="rgba(168, 85, 247, 0.1)"
            strokeWidth="2"
          />
          <motion.circle
            cx="50"
            cy="50"
            r="48"
            fill="none"
            stroke="rgba(168, 85, 247, 0.6)"
            strokeWidth="2"
            strokeDasharray={`${2 * Math.PI * 48}`}
            strokeDashoffset={`${2 * Math.PI * 48 * (1 - dailyGoalProgress / 100)}`}
            initial={{ strokeDashoffset: 2 * Math.PI * 48 }}
            animate={{ strokeDashoffset: 2 * Math.PI * 48 * (1 - dailyGoalProgress / 100) }}
            transition={{ duration: 1.5, ease: "easeOut" }}
          />
        </svg>

        {/* Weekly progress ring */}
        <svg className="absolute inset-1 w-[calc(100%-8px)] h-[calc(100%-8px)] -rotate-90" viewBox="0 0 100 100">
          <circle
            cx="50"
            cy="50"
            r="46"
            fill="none"
            stroke="rgba(236, 72, 153, 0.1)"
            strokeWidth="1.5"
          />
          <motion.circle
            cx="50"
            cy="50"
            r="46"
            fill="none"
            stroke="rgba(236, 72, 153, 0.6)"
            strokeWidth="1.5"
            strokeDasharray={`${2 * Math.PI * 46}`}
            strokeDashoffset={`${2 * Math.PI * 46 * (1 - weeklyGoalProgress / 100)}`}
            initial={{ strokeDashoffset: 2 * Math.PI * 46 }}
            animate={{ strokeDashoffset: 2 * Math.PI * 46 * (1 - weeklyGoalProgress / 100) }}
            transition={{ duration: 2, ease: "easeOut", delay: 0.5 }}
          />
        </svg>
      </motion.div>

      {/* Main button */}
      <motion.button
        ref={buttonRef}
        className={cn(
          "relative overflow-hidden z-20",
          "w-full h-20 rounded-2xl",
          "bg-gradient-to-r from-purple-600 via-pink-600 to-purple-700",
          "shadow-2xl shadow-purple-500/30",
          "touch-manipulation select-none",
          "min-h-[44px]",
          isPressed && "shadow-xl shadow-purple-500/50"
        )}
        style={{
          scale: springScale,
          rotate
        }}
        onTouchStart={handlePress}
        onMouseDown={handlePress}
        disabled={isLoading}
        whileTap={{ scale: 0.98 }}
      >
        {/* Dynamic gradient overlay */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500"
          animate={{
            x: isPressed ? 0 : "-100%",
          }}
          transition={{
            duration: 0.6,
            ease: "easeInOut"
          }}
        />

        {/* Enhanced shimmer effect */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
          animate={{
            x: ["-100%", "100%"],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            repeatDelay: 4,
            ease: "easeInOut"
          }}
        />

        {/* Button content */}
        <div className="relative z-10 flex items-center justify-center h-full space-x-4">
          {isLoading ? (
            <motion.div
              className="w-8 h-8 border-3 border-white border-t-transparent rounded-full"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            />
          ) : (
            <>
              <motion.div
                animate={isPressed ? { scale: 1.3, rotate: 180 } : { scale: 1, rotate: 0 }}
                transition={{ duration: 0.2 }}
                className="relative"
              >
                <Play className="h-8 w-8 text-white fill-white" />
                {/* Glow effect */}
                <motion.div
                  className="absolute inset-0 bg-white rounded-full blur-lg opacity-50"
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.5, 0.8, 0.5]
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                />
              </motion.div>
              
              <div className="text-center">
                <motion.span
                  className="block text-xl font-bold text-white tracking-wide"
                  animate={isPressed ? { scale: 1.05 } : { scale: 1 }}
                  transition={{ duration: 0.2 }}
                >
                  Start Training
                </motion.span>
                {(dailyGoalProgress > 0 || weeklyGoalProgress > 0) && (
                  <motion.span
                    className="block text-xs text-white/80 mt-1"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1 }}
                  >
                    {dailyGoalProgress}% daily • {weeklyGoalProgress}% weekly
                  </motion.span>
                )}
              </div>
            </>
          )}
        </div>

        {/* Enhanced pulse ring effect */}
        <motion.div
          className="absolute inset-0 rounded-2xl border-2 border-white/40"
          animate={{
            scale: [1, 1.08, 1],
            opacity: [0.4, 0, 0.4]
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />

        {/* Secondary pulse */}
        <motion.div
          className="absolute inset-0 rounded-2xl border border-white/20"
          animate={{
            scale: [1, 1.15, 1],
            opacity: [0.2, 0, 0.2]
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1
          }}
        />
      </motion.button>
    </div>
  );
};
