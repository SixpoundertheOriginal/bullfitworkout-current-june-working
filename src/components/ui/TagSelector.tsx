
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface TagOption {
  label: string;
  value: string;
}

interface TagSelectorProps {
  options: TagOption[];
  selected: string[];
  onChange: (values: string[]) => void;
  placeholder?: string;
  className?: string;
  label?: string;
}

export function TagSelector({
  options,
  selected,
  onChange,
  placeholder = "Select options",
  className,
  label
}: TagSelectorProps) {
  const handleToggle = (value: string) => {
    const isSelected = selected.includes(value);
    if (isSelected) {
      onChange(selected.filter(v => v !== value));
    } else {
      onChange([...selected, value]);
    }
  };

  return (
    <div className={cn("space-y-3", className)}>
      {label && (
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-white/80">{label}</label>
          {selected.length > 0 && (
            <span className="text-xs text-purple-400">{selected.length} selected</span>
          )}
        </div>
      )}
      
      {selected.length === 0 && (
        <p className="text-sm text-white/60 mb-2">{placeholder}</p>
      )}
      
      <div className="flex flex-wrap gap-2">
        {options.map((option) => {
          const isSelected = selected.includes(option.value);
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => handleToggle(option.value)}
              className={cn(
                "px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200",
                "border border-opacity-50 outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-background",
                "min-h-[44px] touch-manipulation", // Mobile-optimized touch targets
                isSelected
                  ? "bg-purple-600 border-purple-500 text-white shadow-lg shadow-purple-500/20 scale-105"
                  : "bg-gray-800/60 border-gray-700 text-gray-300 hover:bg-purple-600/70 hover:text-white hover:border-purple-500/50"
              )}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
