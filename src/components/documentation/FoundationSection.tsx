
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Copy, Check, Palette, Type, Ruler, Grid3X3 } from 'lucide-react';
import { useTheme } from '@/hooks/useTheme';

export function FoundationSection() {
  const { currentTheme } = useTheme();
  const [copiedToken, setCopiedToken] = useState<string | null>(null);

  const copyToClipboard = (text: string, tokenName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedToken(tokenName);
    setTimeout(() => setCopiedToken(null), 2000);
  };

  const colorTokens = [
    { name: 'Primary', value: currentTheme.colors.primary, token: 'var(--primary)' },
    { name: 'Secondary', value: currentTheme.colors.secondary, token: 'var(--secondary)' },
    { name: 'Accent', value: currentTheme.colors.accent, token: 'var(--accent)' },
    { name: 'Background', value: currentTheme.colors.background, token: 'var(--background)' },
    { name: 'Foreground', value: currentTheme.colors.foreground, token: 'var(--foreground)' },
    { name: 'Card', value: currentTheme.colors.card, token: 'var(--card)' },
    { name: 'Border', value: currentTheme.colors.border, token: 'var(--border)' },
    { name: 'Muted', value: currentTheme.colors.muted, token: 'var(--muted)' }
  ];

  const spacingTokens = [
    { name: 'XS', value: '4px', token: 'var(--space-xs)', class: 'space-xs' },
    { name: 'SM', value: '8px', token: 'var(--space-sm)', class: 'space-sm' },
    { name: 'MD', value: '16px', token: 'var(--space-md)', class: 'space-md' },
    { name: 'LG', value: '24px', token: 'var(--space-lg)', class: 'space-lg' },
    { name: 'XL', value: '40px', token: 'var(--space-xl)', class: 'space-xl' },
    { name: '2XL', value: '64px', token: 'var(--space-2xl)', class: 'space-2xl' }
  ];

  const typographyTokens = [
    { name: 'XS', value: '12px', token: 'var(--text-xs)', class: 'text-xs' },
    { name: 'SM', value: '14px', token: 'var(--text-sm)', class: 'text-sm' },
    { name: 'Base', value: '16px', token: 'var(--text-base)', class: 'text-base' },
    { name: 'LG', value: '18px', token: 'var(--text-lg)', class: 'text-lg' },
    { name: 'XL', value: '20px', token: 'var(--text-xl)', class: 'text-xl' },
    { name: '2XL', value: '24px', token: 'var(--text-2xl)', class: 'text-2xl' },
    { name: '3XL', value: '30px', token: 'var(--text-3xl)', class: 'text-3xl' }
  ];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold mb-2">Foundation</h2>
        <p className="text-muted-foreground">
          Design tokens are the building blocks of our design system. These values ensure consistency across all components and themes.
        </p>
      </div>

      <Tabs defaultValue="colors" className="space-y-6">
        <TabsList className="grid grid-cols-4 w-fit">
          <TabsTrigger value="colors" className="flex items-center gap-2">
            <Palette className="h-4 w-4" />
            Colors
          </TabsTrigger>
          <TabsTrigger value="typography" className="flex items-center gap-2">
            <Type className="h-4 w-4" />
            Typography
          </TabsTrigger>
          <TabsTrigger value="spacing" className="flex items-center gap-2">
            <Ruler className="h-4 w-4" />
            Spacing
          </TabsTrigger>
          <TabsTrigger value="layout" className="flex items-center gap-2">
            <Grid3X3 className="h-4 w-4" />
            Layout
          </TabsTrigger>
        </TabsList>

        <TabsContent value="colors" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Color Tokens</CardTitle>
              <p className="text-sm text-muted-foreground">
                Semantic color tokens that adapt to the current theme
              </p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {colorTokens.map((color) => (
                  <div key={color.name} className="space-y-2">
                    <div 
                      className="w-full h-16 rounded-lg border shadow-sm"
                      style={{ backgroundColor: `hsl(${color.value})` }}
                    />
                    <div>
                      <div className="font-medium text-sm">{color.name}</div>
                      <div className="text-xs text-muted-foreground font-mono">
                        hsl({color.value})
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 px-2 text-xs mt-1"
                        onClick={() => copyToClipboard(color.token, color.name)}
                      >
                        {copiedToken === color.name ? (
                          <Check className="h-3 w-3 mr-1" />
                        ) : (
                          <Copy className="h-3 w-3 mr-1" />
                        )}
                        {color.token}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="typography" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Typography Scale</CardTitle>
              <p className="text-sm text-muted-foreground">
                Fluid typography that scales responsively across devices
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {typographyTokens.map((type) => (
                  <div key={type.name} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <Badge variant="outline">{type.name}</Badge>
                      <span className={type.class}>Sample text in {type.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground font-mono">{type.value}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 px-2"
                        onClick={() => copyToClipboard(type.token, type.name)}
                      >
                        {copiedToken === type.name ? (
                          <Check className="h-3 w-3" />
                        ) : (
                          <Copy className="h-3 w-3" />
                        )}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="spacing" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Spacing System</CardTitle>
              <p className="text-sm text-muted-foreground">
                Consistent spacing scale for layouts and components
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {spacingTokens.map((space) => (
                  <div key={space.name} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <Badge variant="outline">{space.name}</Badge>
                      <div className="flex items-center gap-2">
                        <div 
                          className="bg-primary/20 border-l-2 border-primary"
                          style={{ height: '20px', width: space.value }}
                        />
                        <span className="text-sm font-mono">{space.value}</span>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 px-2"
                      onClick={() => copyToClipboard(space.token, space.name)}
                    >
                      {copiedToken === space.name ? (
                        <Check className="h-3 w-3 mr-1" />
                      ) : (
                        <Copy className="h-3 w-3 mr-1" />
                      )}
                      {space.token}
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="layout" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Layout System</CardTitle>
              <p className="text-sm text-muted-foreground">
                Responsive layout utilities and container systems
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h4 className="font-medium mb-3">Container Classes</h4>
                  <div className="space-y-2">
                    <div className="p-3 bg-muted/50 rounded border font-mono text-sm">
                      .container-app - Main application container with responsive padding
                    </div>
                    <div className="p-3 bg-muted/50 rounded border font-mono text-sm">
                      .container-narrow - Narrow container for text content
                    </div>
                    <div className="p-3 bg-muted/50 rounded border font-mono text-sm">
                      .container-wide - Wide container for dashboard layouts
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium mb-3">Layout Utilities</h4>
                  <div className="space-y-2">
                    <div className="p-3 bg-muted/50 rounded border font-mono text-sm">
                      .page-container - Full page layout with safe areas
                    </div>
                    <div className="p-3 bg-muted/50 rounded border font-mono text-sm">
                      .content-grid - Responsive content grid
                    </div>
                    <div className="p-3 bg-muted/50 rounded border font-mono text-sm">
                      .content-stack - Vertical content stacking
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
