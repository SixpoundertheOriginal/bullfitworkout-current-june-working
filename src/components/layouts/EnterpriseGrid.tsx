
import React from 'react';
import { cn } from '@/lib/utils';

interface EnterpriseGridProps {
  children: React.ReactNode;
  className?: string;
  columns?: 1 | 2 | 3 | 4 | 6 | 12;
  gap?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  minRowHeight?: string;
  autoFlow?: 'row' | 'column' | 'dense';
}

interface GridSectionProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  span?: 1 | 2 | 3 | 4 | 6 | 12;
  rowSpan?: 1 | 2 | 3 | 4;
  order?: number;
  minHeight?: string;
  maxHeight?: string;
  overflow?: 'visible' | 'hidden' | 'scroll' | 'auto';
}

const gapClasses = {
  xs: 'gap-2',
  sm: 'gap-4',
  md: 'gap-6',
  lg: 'gap-8',
  xl: 'gap-12'
};

const columnClasses = {
  1: 'grid-cols-1',
  2: 'grid-cols-1 md:grid-cols-2',
  3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
  4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
  6: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6',
  12: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-12'
};

const spanClasses = {
  1: 'col-span-1',
  2: 'col-span-1 md:col-span-2',
  3: 'col-span-1 md:col-span-2 lg:col-span-3',
  4: 'col-span-1 md:col-span-2 lg:col-span-3 xl:col-span-4',
  6: 'col-span-1 md:col-span-2 lg:col-span-3 xl:col-span-6',
  12: 'col-span-1 md:col-span-2 lg:col-span-4 xl:col-span-12'
};

const rowSpanClasses = {
  1: 'row-span-1',
  2: 'row-span-2',
  3: 'row-span-3',
  4: 'row-span-4'
};

export const EnterpriseGrid: React.FC<EnterpriseGridProps> = ({
  children,
  className,
  columns = 12,
  gap = 'md',
  minRowHeight = '200px',
  autoFlow = 'row'
}) => {
  return (
    <div 
      className={cn(
        'enterprise-grid',
        'grid',
        columnClasses[columns],
        gapClasses[gap],
        'auto-rows-min',
        'w-full',
        className
      )}
      style={{
        gridAutoRows: `minmax(${minRowHeight}, auto)`,
        gridAutoFlow: autoFlow
      }}
    >
      {children}
    </div>
  );
};

export const GridSection: React.FC<GridSectionProps> = ({
  children,
  className,
  title,
  span = 1,
  rowSpan = 1,
  order,
  minHeight = '200px',
  maxHeight = 'none',
  overflow = 'visible'
}) => {
  return (
    <div 
      className={cn(
        'grid-section',
        'relative',
        'flex',
        'flex-col',
        spanClasses[span],
        rowSpanClasses[rowSpan],
        'transition-all',
        'duration-300',
        'ease-out',
        className
      )}
      style={{
        order,
        minHeight,
        maxHeight,
        overflow
      }}
    >
      {title && (
        <div className="section-header mb-4 flex-shrink-0">
          <h3 className="text-lg font-semibold text-gray-200 truncate">
            {title}
          </h3>
        </div>
      )}
      <div className="section-content flex-1 min-h-0">
        {children}
      </div>
    </div>
  );
};
