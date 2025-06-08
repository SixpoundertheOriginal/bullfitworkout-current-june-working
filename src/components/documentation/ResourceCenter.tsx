
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function ResourceCenter() {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold mb-2">Resources</h2>
        <p className="text-muted-foreground">
          Guidelines, best practices, and resources for using the BullFit design system.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Usage Guidelines</CardTitle>
            <p className="text-sm text-muted-foreground">
              Best practices for using components
            </p>
          </CardHeader>
          <CardContent>
            <div className="text-sm">Guidelines coming soon...</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Accessibility</CardTitle>
            <p className="text-sm text-muted-foreground">
              WCAG compliance and accessibility standards
            </p>
          </CardHeader>
          <CardContent>
            <div className="text-sm">Accessibility guide coming soon...</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
