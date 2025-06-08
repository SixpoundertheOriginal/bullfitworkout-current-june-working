
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CodeGenerator } from './CodeGenerator';
import { PropsEditor } from './PropsEditor';
import { ComponentDoc } from '@/types/documentation';
import { useTheme } from '@/hooks/useTheme';
import { Copy, Eye, Code, Settings } from 'lucide-react';

interface ComponentPlaygroundProps {
  component: ComponentDoc;
}

export function ComponentPlayground({ component }: ComponentPlaygroundProps) {
  const [selectedVariant, setSelectedVariant] = useState(component.variants[0]);
  const [propsConfig, setPropsConfig] = useState(component.defaultProps || {});
  const { currentTheme, availableThemes, setTheme } = useTheme();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-xl">{component.name}</CardTitle>
              <p className="text-muted-foreground mt-1">{component.description}</p>
            </div>
            <div className="flex gap-2">
              <Badge variant="outline">{component.category}</Badge>
              <Badge variant="secondary">{component.variants.length} variants</Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">Variants</h4>
              <div className="flex flex-wrap gap-2">
                {component.variants.map((variant) => (
                  <Button
                    key={variant.name}
                    variant={selectedVariant.name === variant.name ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedVariant(variant)}
                  >
                    {variant.name}
                  </Button>
                ))}
              </div>
            </div>
            
            <div>
              <h4 className="font-medium mb-2">Theme</h4>
              <div className="flex flex-wrap gap-2">
                {availableThemes.map((theme) => (
                  <Button
                    key={theme.id}
                    variant={currentTheme.id === theme.id ? "default" : "outline"}
                    size="sm"
                    onClick={() => setTheme(theme.id)}
                    className="flex items-center gap-2"
                  >
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: `hsl(${theme.colors.primary})` }}
                    />
                    {theme.name}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="preview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="preview" className="flex items-center gap-2">
            <Eye className="h-4 w-4" />
            Preview
          </TabsTrigger>
          <TabsTrigger value="code" className="flex items-center gap-2">
            <Code className="h-4 w-4" />
            Code
          </TabsTrigger>
          <TabsTrigger value="props" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Props
          </TabsTrigger>
        </TabsList>

        <TabsContent value="preview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Live Preview</CardTitle>
              <p className="text-sm text-muted-foreground">
                {selectedVariant.description}
              </p>
            </CardHeader>
            <CardContent>
              <div className="p-8 bg-muted/30 rounded-lg border-2 border-dashed border-muted">
                <div className="flex items-center justify-center min-h-[200px]">
                  <div dangerouslySetInnerHTML={{ __html: selectedVariant.example }} />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="code" className="space-y-4">
          <CodeGenerator 
            component={component}
            variant={selectedVariant}
            props={propsConfig}
          />
        </TabsContent>

        <TabsContent value="props" className="space-y-4">
          <PropsEditor 
            props={component.props}
            values={propsConfig}
            onChange={setPropsConfig}
          />
        </TabsContent>
      </Tabs>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Accessibility</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Badge variant="outline">Keyboard Navigation</Badge>
              <span className="text-sm text-muted-foreground">
                {component.accessibility.keyboardSupport ? '✓ Supported' : '✗ Not supported'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline">Screen Reader</Badge>
              <span className="text-sm text-muted-foreground">
                {component.accessibility.screenReaderSupport ? '✓ Supported' : '✗ Not supported'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline">ARIA Labels</Badge>
              <span className="text-sm text-muted-foreground">
                {component.accessibility.ariaSupport ? '✓ Implemented' : '✗ Missing'}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
