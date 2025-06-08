
import React, { useState } from 'react';
import { MainLayout } from '@/components/layouts/MainLayout';
import { DocumentationHeader } from '@/components/documentation/DocumentationHeader';
import { NavigationSidebar } from '@/components/documentation/NavigationSidebar';
import { FoundationSection } from '@/components/documentation/FoundationSection';
import { ComponentLibrary } from '@/components/documentation/ComponentLibrary';
import { PatternGallery } from '@/components/documentation/PatternGallery';
import { ResourceCenter } from '@/components/documentation/ResourceCenter';
import { useTheme } from '@/hooks/useTheme';

export default function DesignSystemPage() {
  const [activeSection, setActiveSection] = useState('foundation');
  const { currentTheme, availableThemes, setTheme } = useTheme();

  const sections = [
    { id: 'foundation', label: 'Foundation', description: 'Design tokens, colors, typography' },
    { id: 'components', label: 'Components', description: 'Reusable UI components' },
    { id: 'patterns', label: 'Patterns', description: 'Common UI patterns and layouts' },
    { id: 'resources', label: 'Resources', description: 'Guidelines and best practices' }
  ];

  const renderActiveSection = () => {
    switch (activeSection) {
      case 'foundation':
        return <FoundationSection />;
      case 'components':
        return <ComponentLibrary />;
      case 'patterns':
        return <PatternGallery />;
      case 'resources':
        return <ResourceCenter />;
      default:
        return <FoundationSection />;
    }
  };

  return (
    <MainLayout>
      <div className="design-system-container min-h-screen bg-background">
        <DocumentationHeader 
          currentTheme={currentTheme}
          availableThemes={availableThemes}
          onThemeChange={setTheme}
        />
        
        <div className="flex">
          <NavigationSidebar 
            sections={sections}
            activeSection={activeSection}
            onSectionChange={setActiveSection}
          />
          
          <main className="flex-1 p-6 overflow-y-auto">
            <div className="max-w-6xl mx-auto">
              {renderActiveSection()}
            </div>
          </main>
        </div>
      </div>
    </MainLayout>
  );
}
