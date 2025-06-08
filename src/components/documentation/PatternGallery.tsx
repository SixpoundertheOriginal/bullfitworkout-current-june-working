
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function PatternGallery() {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold mb-2">Pattern Gallery</h2>
        <p className="text-muted-foreground">
          Common UI patterns and layouts used throughout BullFit.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Data Entry Form</CardTitle>
            <p className="text-sm text-muted-foreground">
              Standard form layout with validation
            </p>
          </CardHeader>
          <CardContent>
            <div className="text-sm">Pattern implementation coming soon...</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Dashboard Layout</CardTitle>
            <p className="text-sm text-muted-foreground">
              Responsive dashboard with metrics
            </p>
          </CardHeader>
          <CardContent>
            <div className="text-sm">Pattern implementation coming soon...</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
