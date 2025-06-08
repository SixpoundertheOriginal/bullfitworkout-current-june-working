
import React from 'react';
import { BullFitTheme } from '@/data/themes';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Palette, Code, Zap } from 'lucide-react';

interface DocumentationHeaderProps {
  currentTheme: BullFitTheme;
  availableThemes: BullFitTheme[];
  onThemeChange: (themeId: string) => void;
}

export function DocumentationHeader({ 
  currentTheme, 
  availableThemes, 
  onThemeChange 
}: DocumentationHeaderProps) {
  return (
    <header className="border-b border-border bg-card">
      <div className="flex items-center justify-between p-6">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Zap className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-2xl font-bold text-foreground">BullFit Design System</h1>
              <p className="text-sm text-muted-foreground">Enterprise-grade component library and design tokens</p>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Palette className="h-4 w-4 text-muted-foreground" />
            <Select value={currentTheme.id} onValueChange={onThemeChange}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {availableThemes.map((theme) => (
                  <SelectItem key={theme.id} value={theme.id}>
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full border" 
                        style={{ backgroundColor: theme.colors.primary }}
                      />
                      {theme.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <Button variant="outline" size="sm">
            <Code className="h-4 w-4 mr-2" />
            View Source
          </Button>
        </div>
      </div>
    </header>
  );
}
