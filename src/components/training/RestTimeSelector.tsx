
import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Clock, Minus, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RestTimeSelectorProps {
  value: number; // in seconds
  onChange: (seconds: number) => void;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const PRESET_TIMES = [60, 90, 120, 180, 240, 300]; // 1-5 minutes

export const RestTimeSelector: React.FC<RestTimeSelectorProps> = ({
  value,
  onChange,
  className,
  size = 'md'
}) => {
  const [isCustomMode, setIsCustomMode] = useState(false);
  const [customValue, setCustomValue] = useState(value.toString());

  const formatTime = useCallback((seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (mins === 0) return `${secs}s`;
    if (secs === 0) return `${mins}m`;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }, []);

  const handlePresetSelect = useCallback((seconds: number) => {
    onChange(seconds);
    setIsCustomMode(false);
  }, [onChange]);

  const handleCustomSubmit = useCallback(() => {
    const seconds = parseInt(customValue, 10);
    if (!isNaN(seconds) && seconds > 0) {
      onChange(seconds);
      setIsCustomMode(false);
    }
  }, [customValue, onChange]);

  const handleIncrement = useCallback((delta: number) => {
    const newValue = Math.max(0, value + delta);
    onChange(newValue);
  }, [value, onChange]);

  const sizeClasses = {
    sm: 'text-xs px-2 py-1 h-6',
    md: 'text-sm px-3 py-1.5 h-8',
    lg: 'text-base px-4 py-2 h-10'
  };

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <Clock className="w-4 h-4 text-purple-400" />
      
      {isCustomMode ? (
        <div className="flex items-center gap-1">
          <Input
            type="number"
            value={customValue}
            onChange={(e) => setCustomValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleCustomSubmit();
              if (e.key === 'Escape') setIsCustomMode(false);
            }}
            className={cn('w-16', sizeClasses[size])}
            placeholder="90"
            autoFocus
          />
          <Button
            size="sm"
            onClick={handleCustomSubmit}
            className="h-6 px-2"
          >
            ✓
          </Button>
        </div>
      ) : (
        <>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleIncrement(-15)}
            className="h-6 w-6 p-0 text-gray-400 hover:text-white"
          >
            <Minus className="w-3 h-3" />
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsCustomMode(true)}
            className={cn(
              'font-mono bg-gray-800 border-gray-600 hover:bg-gray-700',
              sizeClasses[size]
            )}
          >
            {formatTime(value)}
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleIncrement(15)}
            className="h-6 w-6 p-0 text-gray-400 hover:text-white"
          >
            <Plus className="w-3 h-3" />
          </Button>
        </>
      )}
      
      {/* Quick preset buttons */}
      <div className="flex gap-1 ml-2">
        {PRESET_TIMES.slice(0, 3).map((seconds) => (
          <Button
            key={seconds}
            variant={value === seconds ? "default" : "ghost"}
            size="sm"
            onClick={() => handlePresetSelect(seconds)}
            className={cn(
              'h-6 px-2 text-xs',
              value === seconds 
                ? 'bg-purple-600 text-white' 
                : 'text-gray-400 hover:text-white'
            )}
          >
            {formatTime(seconds)}
          </Button>
        ))}
      </div>
    </div>
  );
};
