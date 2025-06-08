
import React from 'react';
import { cn } from '@/lib/utils';
import { 
  Palette, 
  Component, 
  Layout, 
  BookOpen,
  ChevronRight 
} from 'lucide-react';

interface Section {
  id: string;
  label: string;
  description: string;
}

interface NavigationSidebarProps {
  sections: Section[];
  activeSection: string;
  onSectionChange: (sectionId: string) => void;
}

const sectionIcons = {
  foundation: Palette,
  components: Component,
  patterns: Layout,
  resources: BookOpen
};

export function NavigationSidebar({ 
  sections, 
  activeSection, 
  onSectionChange 
}: NavigationSidebarProps) {
  return (
    <nav className="w-64 border-r border-border bg-card p-4">
      <div className="space-y-2">
        {sections.map((section) => {
          const Icon = sectionIcons[section.id as keyof typeof sectionIcons] || Component;
          const isActive = activeSection === section.id;
          
          return (
            <button
              key={section.id}
              onClick={() => onSectionChange(section.id)}
              className={cn(
                "w-full flex items-center gap-3 p-3 rounded-lg text-left transition-colors",
                "hover:bg-muted",
                isActive ? "bg-primary/10 text-primary border border-primary/20" : "text-muted-foreground"
              )}
            >
              <Icon className="h-5 w-5 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm">{section.label}</div>
                <div className="text-xs opacity-80 truncate">{section.description}</div>
              </div>
              {isActive && <ChevronRight className="h-4 w-4" />}
            </button>
          );
        })}
      </div>
      
      <div className="mt-8 p-4 bg-muted/50 rounded-lg">
        <h3 className="font-medium text-sm mb-2">Quick Links</h3>
        <div className="space-y-1 text-xs">
          <a href="#tokens" className="text-muted-foreground hover:text-foreground block">Design Tokens</a>
          <a href="#components" className="text-muted-foreground hover:text-foreground block">Component API</a>
          <a href="#guidelines" className="text-muted-foreground hover:text-foreground block">Usage Guidelines</a>
          <a href="#playground" className="text-muted-foreground hover:text-foreground block">Interactive Playground</a>
        </div>
      </div>
    </nav>
  );
}
