
import React, { useEffect, useRef, useState } from 'react';

interface FrameRateMonitorProps {
  enabled?: boolean;
  onFrameRateChange?: (fps: number) => void;
}

export const FrameRateMonitor: React.FC<FrameRateMonitorProps> = ({ 
  enabled = false, 
  onFrameRateChange 
}) => {
  const [fps, setFps] = useState(60);
  const frameCountRef = useRef(0);
  const lastTimeRef = useRef(performance.now());
  const animationIdRef = useRef<number>();
  const reportTimeRef = useRef(0);

  useEffect(() => {
    // Only run in development or when explicitly enabled
    if (!enabled || process.env.NODE_ENV === 'production') {
      return;
    }

    const measureFrameRate = () => {
      const now = performance.now();
      frameCountRef.current++;

      // Report every 2 seconds to reduce console spam
      if (now - reportTimeRef.current > 2000) {
        const delta = now - lastTimeRef.current;
        const currentFps = Math.round((frameCountRef.current * 1000) / delta);
        
        setFps(currentFps);
        onFrameRateChange?.(currentFps);
        
        // Only warn if significantly below target
        if (currentFps < 45) {
          console.warn(`⚠️ Frame rate below target: ${currentFps}fps`);
        }
        
        // Reset counters
        frameCountRef.current = 0;
        lastTimeRef.current = now;
        reportTimeRef.current = now;
      }

      animationIdRef.current = requestAnimationFrame(measureFrameRate);
    };

    animationIdRef.current = requestAnimationFrame(measureFrameRate);

    return () => {
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
      }
    };
  }, [enabled, onFrameRateChange]);

  if (!enabled || process.env.NODE_ENV === 'production') {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 bg-black/80 text-white px-2 py-1 rounded text-xs z-50">
      FPS: {fps}
    </div>
  );
};
