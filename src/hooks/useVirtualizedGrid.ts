
import { useState, useEffect, useRef, useMemo, useCallback } from 'react';

export interface GridConfig {
  itemWidth: number;
  itemHeight: number;
  gap: number;
  virtualizationThreshold: number;
  fallbackWidth: number;
  fallbackHeight: number;
}

export interface GridDimensions {
  columnCount: number;
  rowCount: number;
  shouldUseVirtualization: boolean;
  containerSize: { width: number; height: number };
}

export interface UseVirtualizedGridOptions<T> {
  items: T[];
  config?: Partial<GridConfig>;
  className?: string;
}

const DEFAULT_CONFIG: GridConfig = {
  itemWidth: 340,
  itemHeight: 220,
  gap: 20,
  virtualizationThreshold: 12,
  fallbackWidth: 1200,
  fallbackHeight: 600,
};

export const useVirtualizedGrid = <T extends { id: string }>({
  items,
  config = {},
  className = ""
}: UseVirtualizedGridOptions<T>) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
  
  const gridConfig = useMemo(() => ({
    ...DEFAULT_CONFIG,
    ...config
  }), [config]);

  // Set initial dimensions
  useEffect(() => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        setContainerSize({ width: rect.width, height: rect.height });
      } else {
        const fallbackWidth = Math.min(window.innerWidth - 64, gridConfig.fallbackWidth);
        const fallbackHeight = Math.max(gridConfig.fallbackHeight, window.innerHeight - 200);
        setContainerSize({ width: fallbackWidth, height: fallbackHeight });
      }
    }
  }, [gridConfig.fallbackWidth, gridConfig.fallbackHeight]);

  // Resize observer
  useEffect(() => {
    if (!containerRef.current) return;

    const resizeObserver = new ResizeObserver(entries => {
      try {
        const { width, height } = entries[0].contentRect;
        if (width > 0 && height > 0) {
          setContainerSize({ width, height });
        }
      } catch (error) {
        console.error('ResizeObserver error:', error);
      }
    });

    resizeObserver.observe(containerRef.current);
    return () => resizeObserver.disconnect();
  }, []);

  // Calculate grid dimensions
  const gridDimensions: GridDimensions = useMemo(() => {
    if (!items?.length) {
      return { 
        columnCount: 1, 
        rowCount: 0, 
        shouldUseVirtualization: false,
        containerSize
      };
    }
    
    const width = Math.max(containerSize.width, gridConfig.itemWidth);
    const height = Math.max(containerSize.height, 400);
    
    const availableWidth = width - gridConfig.gap;
    const columns = Math.max(1, Math.floor(availableWidth / (gridConfig.itemWidth + gridConfig.gap)));
    const rows = Math.ceil(items.length / columns);
    
    const useVirtualization = items.length > gridConfig.virtualizationThreshold && height > 0 && width > 0;
    
    return { 
      columnCount: columns, 
      rowCount: rows, 
      shouldUseVirtualization: useVirtualization,
      containerSize
    };
  }, [containerSize, items?.length, gridConfig]);

  return {
    containerRef,
    gridDimensions,
    gridConfig,
    className
  };
};
