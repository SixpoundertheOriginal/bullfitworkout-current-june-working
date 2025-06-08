
import { ComponentDoc } from '@/types/documentation';

export const componentDocs: Record<string, ComponentDoc[]> = {
  navigation: [
    {
      name: 'PageHeader',
      description: 'Main page header with navigation and actions',
      category: 'navigation',
      usage: {
        basic: '<PageHeader title="Page Title" showBackButton />',
        advanced: [
          'Theme switching support',
          'Responsive scroll behavior',
          'Custom action buttons'
        ],
        examples: []
      },
      props: [
        {
          name: 'title',
          type: 'string',
          required: true,
          description: 'The title text to display'
        },
        {
          name: 'showBackButton',
          type: 'boolean',
          required: false,
          defaultValue: false,
          description: 'Whether to show the back navigation button'
        },
        {
          name: 'onBack',
          type: 'function',
          required: false,
          description: 'Callback function when back button is clicked'
        }
      ],
      variants: [
        {
          name: 'default',
          description: 'Standard page header',
          example: '<PageHeader title="Workout Session" />'
        },
        {
          name: 'with-back',
          description: 'Header with back button',
          example: '<PageHeader title="Exercise Details" showBackButton />'
        }
      ],
      defaultProps: {
        title: 'Page Title',
        showBackButton: false
      },
      accessibility: {
        keyboardSupport: true,
        screenReaderSupport: true,
        ariaSupport: true
      },
      performance: {
        renderTime: 8,
        bundleSize: 2.1
      },
      themes: ['default', 'dark', 'corporate-blue', 'fitness-red']
    },
    {
      name: 'BottomNav',
      description: 'Bottom navigation for mobile-first design',
      category: 'navigation',
      usage: {
        basic: '<BottomNav />',
        advanced: [
          'Active state management',
          'Badge indicators',
          'Responsive hiding'
        ],
        examples: []
      },
      props: [],
      variants: [
        {
          name: 'default',
          description: 'Standard bottom navigation',
          example: '<BottomNav />'
        }
      ],
      defaultProps: {},
      accessibility: {
        keyboardSupport: true,
        screenReaderSupport: true,
        ariaSupport: true
      },
      performance: {
        renderTime: 5,
        bundleSize: 1.8
      },
      themes: ['default', 'dark', 'corporate-blue', 'fitness-red']
    }
  ],

  layout: [
    {
      name: 'MainLayout',
      description: 'Primary application layout wrapper',
      category: 'layout',
      usage: {
        basic: '<MainLayout>Content</MainLayout>',
        advanced: [
          'Safe area handling',
          'Responsive design',
          'Header and footer management'
        ],
        examples: []
      },
      props: [
        {
          name: 'children',
          type: 'ReactNode',
          required: true,
          description: 'Content to render within the layout'
        },
        {
          name: 'noHeader',
          type: 'boolean',
          required: false,
          defaultValue: false,
          description: 'Hide the header component'
        },
        {
          name: 'noFooter',
          type: 'boolean',
          required: false,
          defaultValue: false,
          description: 'Hide the footer component'
        }
      ],
      variants: [
        {
          name: 'default',
          description: 'Full layout with header and footer',
          example: '<MainLayout>Page content</MainLayout>'
        },
        {
          name: 'no-header',
          description: 'Layout without header',
          example: '<MainLayout noHeader>Content</MainLayout>'
        }
      ],
      defaultProps: {
        noHeader: false,
        noFooter: false
      },
      accessibility: {
        keyboardSupport: true,
        screenReaderSupport: true,
        ariaSupport: true
      },
      performance: {
        renderTime: 12,
        bundleSize: 3.4
      },
      themes: ['default', 'dark', 'corporate-blue', 'fitness-red']
    }
  ],

  forms: [
    {
      name: 'Button',
      description: 'Versatile button component with multiple variants',
      category: 'forms',
      usage: {
        basic: '<Button>Click me</Button>',
        advanced: [
          'Icon integration',
          'Loading states',
          'Size variants'
        ],
        examples: []
      },
      props: [
        {
          name: 'variant',
          type: 'string',
          required: false,
          defaultValue: 'default',
          options: ['default', 'destructive', 'outline', 'secondary', 'ghost', 'link'],
          description: 'Visual variant of the button'
        },
        {
          name: 'size',
          type: 'string',
          required: false,
          defaultValue: 'default',
          options: ['default', 'sm', 'lg', 'icon'],
          description: 'Size of the button'
        },
        {
          name: 'disabled',
          type: 'boolean',
          required: false,
          defaultValue: false,
          description: 'Whether the button is disabled'
        }
      ],
      variants: [
        {
          name: 'default',
          description: 'Primary button style',
          example: '<Button>Primary Action</Button>'
        },
        {
          name: 'outline',
          description: 'Outlined button style',
          example: '<Button variant="outline">Secondary Action</Button>'
        },
        {
          name: 'ghost',
          description: 'Ghost button style',
          example: '<Button variant="ghost">Subtle Action</Button>'
        }
      ],
      defaultProps: {
        variant: 'default',
        size: 'default',
        disabled: false
      },
      accessibility: {
        keyboardSupport: true,
        screenReaderSupport: true,
        ariaSupport: true
      },
      performance: {
        renderTime: 3,
        bundleSize: 1.2
      },
      themes: ['default', 'dark', 'corporate-blue', 'fitness-red']
    }
  ],

  data: [],
  feedback: [],
  charts: []
};
