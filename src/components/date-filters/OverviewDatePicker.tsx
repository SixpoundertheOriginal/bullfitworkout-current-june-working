
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Switch } from "@/components/ui/switch";
import { DateRange } from "react-day-picker";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { CalendarIcon, ChevronDown, TrendingUp } from "lucide-react";
import { useDateRange } from '@/context/DateRangeContext';

interface OverviewDatePickerProps {
  className?: string;
  showComparison?: boolean;
}

export function OverviewDatePicker({ className, showComparison = true }: OverviewDatePickerProps) {
  const { 
    dateRange, 
    setDateRange, 
    comparisonRange,
    enableComparison,
    setEnableComparison,
    presetRanges,
    applyPreset
  } = useDateRange();
  
  const [isOpen, setIsOpen] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState('This Week');

  const handlePresetSelect = (preset: any) => {
    applyPreset(preset);
    setSelectedPreset(preset.label);
    setIsOpen(false);
  };
  
  const handleCalendarSelect = (range: DateRange | undefined) => {
    if (range?.from && range?.to) {
      setDateRange(range);
      setSelectedPreset('Custom Range');
    }
  };

  const formatDateRange = (range?: DateRange) => {
    if (!range?.from || !range?.to) return 'Select range';
    
    if (range.from.getTime() === range.to.getTime()) {
      return format(range.from, "MMM d, yyyy");
    }
    
    return `${format(range.from, "MMM d")} - ${format(range.to, "MMM d, yyyy")}`;
  };

  return (
    <div className={cn("flex items-center space-x-3", className)}>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "w-auto justify-between text-sm bg-gray-800 border-gray-700 hover:bg-gray-700 hover:border-gray-600",
              !dateRange && "text-gray-400"
            )}
          >
            <div className="flex items-center gap-2">
              <CalendarIcon className="h-4 w-4 text-purple-400" />
              <span>{formatDateRange(dateRange)}</span>
            </div>
            <ChevronDown className="ml-2 h-4 w-4 text-gray-400" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0 bg-gray-800 border-gray-700" align="end">
          <div className="grid gap-4 p-4">
            {/* Preset Options */}
            <div className="flex flex-col space-y-1">
              <h4 className="text-sm font-medium text-gray-200 mb-2">Quick Select</h4>
              {presetRanges.map((preset) => (
                <Button
                  key={preset.label}
                  variant={selectedPreset === preset.label ? "default" : "ghost"}
                  size="sm"
                  onClick={() => handlePresetSelect(preset)}
                  className="justify-start font-normal hover:bg-gray-700 text-left"
                >
                  {preset.label}
                </Button>
              ))}
            </div>
            
            {/* Comparison Toggle */}
            {showComparison && (
              <div className="flex items-center justify-between pt-2 border-t border-gray-700">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-purple-400" />
                  <span className="text-sm text-gray-300">Compare periods</span>
                </div>
                <Switch
                  checked={enableComparison}
                  onCheckedChange={setEnableComparison}
                />
              </div>
            )}
            
            {/* Custom Calendar */}
            <div className="border-t border-gray-700 pt-3">
              <h4 className="text-sm font-medium text-gray-200 mb-2">Custom Range</h4>
              <Calendar
                initialFocus
                mode="range"
                defaultMonth={dateRange?.from}
                selected={dateRange}
                onSelect={handleCalendarSelect}
                numberOfMonths={1}
                className="bg-gray-800 pointer-events-auto"
              />
            </div>
          </div>
        </PopoverContent>
      </Popover>
      
      {/* Comparison Range Display */}
      {enableComparison && comparisonRange && (
        <div className="text-xs text-gray-400 flex items-center gap-1">
          <span>vs</span>
          <span>{formatDateRange(comparisonRange)}</span>
        </div>
      )}
    </div>
  );
}
