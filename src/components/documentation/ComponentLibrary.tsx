
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ComponentPlayground } from './ComponentPlayground';
import { componentDocs } from '@/data/componentDocs';
import { ComponentDoc } from '@/types/documentation';
import { 
  Navigation, 
  Square, 
  MousePointer, 
  Database,
  MessageCircle,
  BarChart3
} from 'lucide-react';

const categoryIcons = {
  navigation: Navigation,
  layout: Square,
  forms: MousePointer,
  data: Database,
  feedback: MessageCircle,
  charts: BarChart3
};

export function ComponentLibrary() {
  const [selectedComponent, setSelectedComponent] = useState<ComponentDoc | null>(null);
  const [activeCategory, setActiveCategory] = useState('navigation');

  const categories = Object.keys(componentDocs);
  const components = componentDocs[activeCategory as keyof typeof componentDocs] || [];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold mb-2">Component Library</h2>
        <p className="text-muted-foreground">
          Interactive showcase of all BullFit components with live examples and usage guidelines.
        </p>
      </div>

      {selectedComponent ? (
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <Button 
              variant="outline" 
              onClick={() => setSelectedComponent(null)}
            >
              ← Back to Components
            </Button>
            <h3 className="text-2xl font-bold">{selectedComponent.name}</h3>
            <Badge variant="outline">{selectedComponent.category}</Badge>
          </div>
          
          <ComponentPlayground component={selectedComponent} />
        </div>
      ) : (
        <Tabs value={activeCategory} onValueChange={setActiveCategory}>
          <TabsList className="grid grid-cols-6 w-fit">
            {categories.map((category) => {
              const Icon = categoryIcons[category as keyof typeof categoryIcons] || Square;
              return (
                <TabsTrigger key={category} value={category} className="flex items-center gap-2">
                  <Icon className="h-4 w-4" />
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </TabsTrigger>
              );
            })}
          </TabsList>

          {categories.map((category) => (
            <TabsContent key={category} value={category} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {components.map((component) => (
                  <Card key={component.name} className="cursor-pointer hover:shadow-md transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-lg">{component.name}</CardTitle>
                          <p className="text-sm text-muted-foreground mt-1">
                            {component.description}
                          </p>
                        </div>
                        <Badge variant="secondary">{component.variants.length} variants</Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="p-4 bg-muted/50 rounded-lg">
                          <div className="text-xs text-muted-foreground mb-2">Preview</div>
                          <div dangerouslySetInnerHTML={{ __html: component.usage.basic }} />
                        </div>
                        
                        <div className="flex flex-wrap gap-2">
                          {component.variants.slice(0, 3).map((variant) => (
                            <Badge key={variant.name} variant="outline" className="text-xs">
                              {variant.name}
                            </Badge>
                          ))}
                          {component.variants.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{component.variants.length - 3} more
                            </Badge>
                          )}
                        </div>
                        
                        <Button 
                          className="w-full" 
                          variant="outline"
                          onClick={() => setSelectedComponent(component)}
                        >
                          View Documentation
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      )}
    </div>
  );
}
