
import { useRef, useState, useEffect, RefObject } from 'react';

interface UseElementVisibilityOptions {
  /**
   * The threshold value between 0 and 1 indicating the percentage that should be 
   * visible before triggering. Default: 0
   */
  threshold?: number;
  
  /**
   * Margin around the root. Units are similar to CSS margin. Default: '0px'
   * Can be used to trigger visibility before element comes into view.
   */
  rootMargin?: string;
}

/**
 * A hook for detecting when an element enters or leaves the viewport.
 * 
 * IMPORTANT: This hook should primarily be used for:
 * - Triggering animations
 * - Lazy loading images/content
 * - Applying visual effects
 * 
 * DO NOT USE for:
 * - Hiding critical UI elements like primary action buttons
 * - Controlling core application functionality
 * - Managing essential navigation elements
 * 
 * @example
 * ```tsx
 * // Good: Using for animations
 * const { ref, isVisible } = useElementVisibility();
 * return (
 *   <div ref={ref} className={`transition-all ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
 *     Content
 *   </div>
 * );
 * 
 * // Bad: Don't use for critical UI
 * return isVisible ? <PrimaryActionButton /> : null;
 * ```
 */
export const useElementVisibility = (options: UseElementVisibilityOptions = {}) => {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      {
        threshold: options.threshold || 0,
        rootMargin: options.rootMargin || '0px'
      }
    );
    
    observer.observe(element);
    
    return () => {
      observer.disconnect();
    };
  }, [options.threshold, options.rootMargin]);
  
  return { ref, isVisible };
};
