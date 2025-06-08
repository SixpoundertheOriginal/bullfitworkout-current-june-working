
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ComponentProp } from '@/types/documentation';

interface PropsEditorProps {
  props: ComponentProp[];
  values: Record<string, any>;
  onChange: (values: Record<string, any>) => void;
}

export function PropsEditor({ props, values, onChange }: PropsEditorProps) {
  const updateProp = (name: string, value: any) => {
    onChange({ ...values, [name]: value });
  };

  const renderPropEditor = (prop: ComponentProp) => {
    const currentValue = values[prop.name] ?? prop.defaultValue;

    switch (prop.type) {
      case 'boolean':
        return (
          <div className="flex items-center space-x-2">
            <Switch
              checked={currentValue}
              onCheckedChange={(checked) => updateProp(prop.name, checked)}
            />
            <Label>{prop.name}</Label>
          </div>
        );

      case 'string':
        if (prop.options) {
          return (
            <div className="space-y-2">
              <Label>{prop.name}</Label>
              <Select value={currentValue} onValueChange={(value) => updateProp(prop.name, value)}>
                <SelectTrigger>
                  <SelectValue placeholder={`Select ${prop.name}`} />
                </SelectTrigger>
                <SelectContent>
                  {prop.options.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          );
        }
        return (
          <div className="space-y-2">
            <Label>{prop.name}</Label>
            <Input
              value={currentValue || ''}
              onChange={(e) => updateProp(prop.name, e.target.value)}
              placeholder={`Enter ${prop.name}`}
            />
          </div>
        );

      case 'number':
        return (
          <div className="space-y-2">
            <Label>{prop.name}</Label>
            <Input
              type="number"
              value={currentValue || ''}
              onChange={(e) => updateProp(prop.name, parseInt(e.target.value) || 0)}
              placeholder={`Enter ${prop.name}`}
            />
          </div>
        );

      default:
        return (
          <div className="space-y-2">
            <Label>{prop.name}</Label>
            <Input
              value={currentValue || ''}
              onChange={(e) => updateProp(prop.name, e.target.value)}
              placeholder={`Enter ${prop.name}`}
            />
          </div>
        );
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Props Configuration</CardTitle>
        <p className="text-sm text-muted-foreground">
          Adjust component props to see how they affect the rendered output
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {props.map((prop) => (
            <div key={prop.name} className="space-y-3 p-4 border rounded-lg">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{prop.name}</span>
                    {prop.required && <Badge variant="destructive" className="text-xs">Required</Badge>}
                    <Badge variant="outline" className="text-xs">{prop.type}</Badge>
                  </div>
                  {prop.description && (
                    <p className="text-sm text-muted-foreground">{prop.description}</p>
                  )}
                  {prop.defaultValue !== undefined && (
                    <p className="text-xs text-muted-foreground">
                      Default: <code className="bg-muted px-1 rounded">{String(prop.defaultValue)}</code>
                    </p>
                  )}
                </div>
              </div>
              
              <div className="pt-2">
                {renderPropEditor(prop)}
              </div>
            </div>
          ))}
          
          {props.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              This component doesn't have configurable props
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
