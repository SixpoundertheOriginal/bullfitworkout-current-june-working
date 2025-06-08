
import { useState, useEffect, useRef } from 'react';

interface GestureState {
  isSwipeLeft: boolean;
  isSwipeRight: boolean;
  swipeDistance: number;
  direction: 'left' | 'right' | null;
}

interface UseGestureOptions {
  threshold?: number;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  enabled?: boolean;
}

export const useGesture = (options: UseGestureOptions = {}) => {
  const {
    threshold = 50,
    onSwipeLeft,
    onSwipeRight,
    enabled = true
  } = options;

  const [gestureState, setGestureState] = useState<GestureState>({
    isSwipeLeft: false,
    isSwipeRight: false,
    swipeDistance: 0,
    direction: null,
  });

  const touchStartRef = useRef<{ x: number; y: number } | null>(null);
  const elementRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!enabled || !elementRef.current) return;

    const element = elementRef.current;

    const handleTouchStart = (e: TouchEvent) => {
      touchStartRef.current = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY,
      };
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!touchStartRef.current) return;

      const currentX = e.touches[0].clientX;
      const currentY = e.touches[0].clientY;
      const deltaX = currentX - touchStartRef.current.x;
      const deltaY = currentY - touchStartRef.current.y;

      // Only handle horizontal swipes (prevent vertical scroll interference)
      if (Math.abs(deltaX) > Math.abs(deltaY)) {
        e.preventDefault();
        
        setGestureState({
          isSwipeLeft: deltaX < -threshold,
          isSwipeRight: deltaX > threshold,
          swipeDistance: Math.abs(deltaX),
          direction: deltaX > 0 ? 'right' : 'left',
        });
      }
    };

    const handleTouchEnd = () => {
      if (gestureState.isSwipeLeft && onSwipeLeft) {
        onSwipeLeft();
      }
      if (gestureState.isSwipeRight && onSwipeRight) {
        onSwipeRight();
      }

      // Reset state
      setGestureState({
        isSwipeLeft: false,
        isSwipeRight: false,
        swipeDistance: 0,
        direction: null,
      });
      touchStartRef.current = null;
    };

    element.addEventListener('touchstart', handleTouchStart, { passive: true });
    element.addEventListener('touchmove', handleTouchMove, { passive: false });
    element.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchmove', handleTouchMove);
      element.removeEventListener('touchend', handleTouchEnd);
    };
  }, [enabled, threshold, onSwipeLeft, onSwipeRight, gestureState.isSwipeLeft, gestureState.isSwipeRight]);

  return {
    gestureState,
    elementRef,
  };
};
