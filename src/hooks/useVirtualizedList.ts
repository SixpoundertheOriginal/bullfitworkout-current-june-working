
import { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { useCleanup } from '@/hooks/useCleanup';

export interface VirtualizedListOptions {
  itemHeight: number;
  containerHeight: number;
  overscan?: number;
  items: any[];
}

export interface VirtualizedListReturn {
  scrollTop: number;
  visibleItems: any[];
  startIndex: number;
  endIndex: number;
  totalHeight: number;
  containerRef: React.RefObject<HTMLDivElement>;
  handleScroll: (e: React.UIEvent<HTMLDivElement>) => void;
}

export const useVirtualizedList = ({
  itemHeight,
  containerHeight,
  overscan = 5,
  items
}: VirtualizedListOptions): VirtualizedListReturn => {
  const [scrollTop, setScrollTop] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const { registerCleanup } = useCleanup('virtualized-list');

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  }, []);

  const { visibleItems, startIndex, endIndex, totalHeight } = useMemo(() => {
    const totalHeight = items.length * itemHeight;
    const visibleStart = Math.floor(scrollTop / itemHeight);
    const visibleEnd = Math.min(
      visibleStart + Math.ceil(containerHeight / itemHeight),
      items.length
    );

    // Add overscan
    const startIndex = Math.max(0, visibleStart - overscan);
    const endIndex = Math.min(items.length, visibleEnd + overscan);
    const visibleItems = items.slice(startIndex, endIndex);

    return {
      visibleItems,
      startIndex,
      endIndex,
      totalHeight
    };
  }, [items, itemHeight, containerHeight, scrollTop, overscan]);

  // Cleanup on unmount
  useEffect(() => {
    registerCleanup(() => {
      setScrollTop(0);
    });
  }, [registerCleanup]);

  return {
    scrollTop,
    visibleItems,
    startIndex,
    endIndex,
    totalHeight,
    containerRef,
    handleScroll
  };
};
