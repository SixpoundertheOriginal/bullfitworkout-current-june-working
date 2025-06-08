
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { useFilterPresets } from '@/hooks/useFilterPresets';
import { ScrollArea } from '@/components/ui/scroll-area';

interface SmartFilterPresetsProps {
  onApplyPreset: (filters: any) => void;
  className?: string;
}

export const SmartFilterPresets: React.FC<SmartFilterPresetsProps> = ({
  onApplyPreset,
  className = ''
}) => {
  const { presets, activePreset, applyPreset, clearPreset } = useFilterPresets();

  const handlePresetClick = (presetId: string) => {
    if (activePreset === presetId) {
      clearPreset();
      onApplyPreset({
        selectedMuscleGroup: 'all',
        selectedEquipment: 'all',
        selectedDifficulty: 'all',
        selectedMovement: 'all'
      });
    } else {
      applyPreset(presetId, onApplyPreset);
    }
  };

  return (
    <div className={`space-y-3 ${className}`}>
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-300">Quick Filters</h3>
        {activePreset && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handlePresetClick(activePreset)}
            className="text-xs text-gray-400 hover:text-gray-300"
          >
            Clear
          </Button>
        )}
      </div>

      <ScrollArea className="w-full">
        <div className="flex flex-wrap gap-2 pb-2">
          {presets.map((preset) => (
            <Button
              key={preset.id}
              variant={activePreset === preset.id ? "default" : "outline"}
              size="sm"
              onClick={() => handlePresetClick(preset.id)}
              className={`
                flex items-center gap-2 text-xs whitespace-nowrap
                ${activePreset === preset.id 
                  ? 'bg-purple-600 border-purple-500 text-white' 
                  : 'bg-gray-800/50 border-gray-600 text-gray-300 hover:bg-gray-700/50'
                }
              `}
            >
              <span>{preset.icon}</span>
              <span>{preset.name}</span>
            </Button>
          ))}
        </div>
      </ScrollArea>

      {activePreset && (
        <Card className="p-3 bg-gray-800/30 border-gray-700/50">
          <div className="flex items-start gap-2">
            <span className="text-lg">
              {presets.find(p => p.id === activePreset)?.icon}
            </span>
            <div className="flex-1">
              <div className="font-medium text-white text-sm mb-1">
                {presets.find(p => p.id === activePreset)?.name}
              </div>
              <div className="text-xs text-gray-400 mb-2">
                {presets.find(p => p.id === activePreset)?.description}
              </div>
              <Badge 
                variant="outline" 
                className="text-xs bg-purple-900/30 border-purple-500/30 text-purple-300"
              >
                {presets.find(p => p.id === activePreset)?.targetAudience}
              </Badge>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};
