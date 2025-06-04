
import React, { useState, useRef } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { Play, Zap, Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface HeroWorkoutButtonProps {
  onPress: () => void;
  isLoading?: boolean;
  className?: string;
}

export const HeroWorkoutButton: React.FC<HeroWorkoutButtonProps> = ({
  onPress,
  isLoading = false,
  className
}) => {
  const [isPressed, setIsPressed] = useState(false);
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number }>>([]);
  const buttonRef = useRef<HTMLButtonElement>(null);
  
  // Physics-based animations
  const scale = useMotionValue(1);
  const springScale = useSpring(scale, { damping: 20, stiffness: 300 });
  const rotate = useTransform(springScale, [0.95, 1.05], [-2, 2]);

  // Haptic feedback simulation
  const triggerHaptic = (type: 'light' | 'medium' | 'heavy' = 'medium') => {
    if ('vibrate' in navigator) {
      const patterns = {
        light: [10],
        medium: [50],
        heavy: [100]
      };
      navigator.vibrate(patterns[type]);
    }
  };

  // Particle effect
  const createParticles = (event: React.TouchEvent | React.MouseEvent) => {
    const rect = buttonRef.current?.getBoundingClientRect();
    if (!rect) return;

    const clientX = 'touches' in event ? event.touches[0].clientX : event.clientX;
    const clientY = 'touches' in event ? event.touches[0].clientY : event.clientY;

    const relativeX = clientX - rect.left;
    const relativeY = clientY - rect.top;

    const newParticles = Array.from({ length: 12 }, (_, i) => ({
      id: Date.now() + i,
      x: relativeX,
      y: relativeY
    }));

    setParticles(prev => [...prev, ...newParticles]);

    // Remove particles after animation
    setTimeout(() => {
      setParticles(prev => prev.filter(p => !newParticles.find(np => np.id === p.id)));
    }, 1000);
  };

  const handlePress = (event: React.TouchEvent | React.MouseEvent) => {
    setIsPressed(true);
    scale.set(0.95);
    triggerHaptic('medium');
    createParticles(event);
    
    setTimeout(() => {
      setIsPressed(false);
      scale.set(1);
      onPress();
    }, 150);
  };

  return (
    <div className={cn("relative", className)}>
      {/* Particle effects */}
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute pointer-events-none"
          initial={{
            x: particle.x,
            y: particle.y,
            scale: 0,
            opacity: 1
          }}
          animate={{
            x: particle.x + (Math.random() - 0.5) * 100,
            y: particle.y + (Math.random() - 0.5) * 100,
            scale: [0, 1, 0],
            opacity: [1, 1, 0]
          }}
          transition={{
            duration: 0.8,
            ease: "easeOut"
          }}
        >
          {Math.random() > 0.5 ? (
            <Star className="h-3 w-3 text-yellow-400" />
          ) : (
            <Zap className="h-3 w-3 text-purple-400" />
          )}
        </motion.div>
      ))}

      {/* Main button */}
      <motion.button
        ref={buttonRef}
        className={cn(
          "relative overflow-hidden",
          "w-full h-20 rounded-2xl",
          "bg-gradient-to-r from-purple-600 via-pink-600 to-purple-700",
          "shadow-2xl shadow-purple-500/25",
          "touch-manipulation select-none",
          "min-h-[44px]", // Touch-optimized hit target
          isPressed && "shadow-lg shadow-purple-500/40"
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
        {/* Animated gradient overlay */}
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

        {/* Shimmer effect */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
          animate={{
            x: ["-100%", "100%"],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            repeatDelay: 3,
            ease: "easeInOut"
          }}
        />

        {/* Button content */}
        <div className="relative z-10 flex items-center justify-center h-full space-x-3">
          {isLoading ? (
            <motion.div
              className="w-6 h-6 border-2 border-white border-t-transparent rounded-full"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            />
          ) : (
            <>
              <motion.div
                animate={isPressed ? { scale: 1.2, rotate: 180 } : { scale: 1, rotate: 0 }}
                transition={{ duration: 0.2 }}
              >
                <Play className="h-8 w-8 text-white fill-white" />
              </motion.div>
              <motion.span
                className="text-xl font-bold text-white tracking-wide"
                animate={isPressed ? { scale: 1.05 } : { scale: 1 }}
                transition={{ duration: 0.2 }}
              >
                Start Training
              </motion.span>
            </>
          )}
        </div>

        {/* Pulse ring effect */}
        <motion.div
          className="absolute inset-0 rounded-2xl border-2 border-white/30"
          animate={{
            scale: [1, 1.05, 1],
            opacity: [0.5, 0, 0.5]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </motion.button>
    </div>
  );
};
