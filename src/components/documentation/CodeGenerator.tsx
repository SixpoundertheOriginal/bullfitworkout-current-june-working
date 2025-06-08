
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ComponentDoc, ComponentVariant } from '@/types/documentation';
import { Copy, Check, Download } from 'lucide-react';

interface CodeGeneratorProps {
  component: ComponentDoc;
  variant: ComponentVariant;
  props: Record<string, any>;
}

export function CodeGenerator({ component, variant, props }: CodeGeneratorProps) {
  const [copied, setCopied] = useState(false);

  const generateImportCode = () => {
    return `import { ${component.name} } from '@/components/${component.category}';`;
  };

  const generatePropsString = () => {
    return Object.entries(props)
      .filter(([_, value]) => value !== undefined && value !== '')
      .map(([key, value]) => {
        if (typeof value === 'string') return `${key}="${value}"`;
        if (typeof value === 'boolean') return value ? key : '';
        if (typeof value === 'number') return `${key}={${value}}`;
        return `${key}={${JSON.stringify(value)}}`;
      })
      .filter(Boolean)
      .join(' ');
  };

  const generateComponentCode = () => {
    const propsString = generatePropsString();
    const variantProp = variant.name !== 'default' ? `variant="${variant.name}"` : '';
    const allProps = [variantProp, propsString].filter(Boolean).join(' ');
    
    return `<${component.name}${allProps ? ' ' + allProps : ''}>
  Content here
</${component.name}>`;
  };

  const generateFullExample = () => {
    return `${generateImportCode()}

export function Example() {
  return (
    <div>
      ${generateComponentCode()}
    </div>
  );
}`;
  };

  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Import Statement</CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() => copyToClipboard(generateImportCode())}
            >
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <pre className="bg-muted p-4 rounded-lg text-sm overflow-x-auto">
            <code>{generateImportCode()}</code>
          </pre>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Component Usage</CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() => copyToClipboard(generateComponentCode())}
            >
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <pre className="bg-muted p-4 rounded-lg text-sm overflow-x-auto">
            <code>{generateComponentCode()}</code>
          </pre>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Complete Example</CardTitle>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => copyToClipboard(generateFullExample())}
              >
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                Copy
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const blob = new Blob([generateFullExample()], { type: 'text/plain' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `${component.name}Example.tsx`;
                  a.click();
                  URL.revokeObjectURL(url);
                }}
              >
                <Download className="h-4 w-4" />
                Download
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <pre className="bg-muted p-4 rounded-lg text-sm overflow-x-auto max-h-96">
            <code>{generateFullExample()}</code>
          </pre>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">TypeScript Interface</CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="bg-muted p-4 rounded-lg text-sm overflow-x-auto">
            <code>{`interface ${component.name}Props {
${component.props.map(prop => 
  `  ${prop.name}${prop.required ? '' : '?'}: ${prop.type};${prop.description ? ` // ${prop.description}` : ''}`
).join('\n')}
}`}</code>
          </pre>
        </CardContent>
      </Card>
    </div>
  );
}
