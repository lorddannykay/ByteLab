# Course Template Generators

This folder contains TypeScript template generator functions for creating dynamic microlearning course HTML from course data.

## Structure

```
to share/
├── types.ts                    # TypeScript type definitions (CourseData, CourseConfig, etc.)
├── helpers.ts                  # Helper functions (escapeHtml, generateInteractiveElement)
├── generators/
│   ├── baseTemplate.ts        # Shared base utilities for all templates
│   ├── ecoLumeTemplate.ts     # EcoLume template generator
│   ├── aquaNovaTemplate.ts    # Aqua Nova template generator
│   ├── neuralPortfolioTemplate.ts  # Neural Portfolio template generator
│   ├── innerPeaceTemplate.ts  # Inner Peace template generator
│   ├── registry.ts            # Template registry (maps template IDs to generators)
│   └── index.ts               # Main export file
└── README.md                   # This file
```

## Usage

### Basic Example

```typescript
import { generateEcoLumeTemplate } from './generators/ecoLumeTemplate';
import { CourseData, CourseConfig } from './types';

const courseData: CourseData = {
  course: {
    title: 'Introduction to Bio-Inspired Technology',
    description: 'Learn how nature\'s evolution can guide innovative design.',
    stages: [
      {
        id: 1,
        title: 'What is Bio-Inspired Design?',
        objective: 'Understand the fundamental principles of biomimicry',
        content: {
          introduction: 'Bio-inspired design is the practice of learning from nature.',
          sections: [
            {
              type: 'text',
              heading: 'The Foundation',
              content: 'Nature has been solving complex problems for billions of years.',
            },
            {
              type: 'list',
              heading: 'Key Principles',
              items: [
                'Learn from nature\'s patterns',
                'Emulate nature\'s forms',
                'Create sustainable solutions',
              ],
            },
          ],
          summary: 'Bio-inspired design offers powerful frameworks for innovation.',
        },
      },
    ],
  },
};

const config: Partial<CourseConfig> = {
  includeVideo: true,
  includePodcast: false,
  colors: {
    primary: '#00ff88',
    secondary: '#2d5a27',
    accent: '#00d4ff',
  },
};

const html = generateEcoLumeTemplate(courseData, config);
// Returns complete HTML string ready to use
```

### Using the Registry

```typescript
import { generateCourseWithTemplate } from './generators/registry';
import { CourseData } from './types';

const courseData: CourseData = { /* ... */ };

// Generate using template ID
const html = generateCourseWithTemplate('2145_eco_lume', courseData, {
  includeVideo: true,
});
```

## Available Templates

Currently implemented:
- **2145_eco_lume** - Bio-inspired green theme with organic shapes and particles
- **2138_aqua_nova** - Ocean-themed with underwater animations (bubbles, particles)
- **2139_neural_portfolio** - Cyberpunk/neural network theme with animated canvas
- **2143_inner_peace** - Mindfulness theme with geometric patterns

## Template Structure

All templates follow the birb pattern:
1. **Course Overview Section** - Welcome message with stage links
2. **Video Overview Section** (optional) - Video lesson access
3. **Podcast Overview Section** (optional) - Podcast access
4. **Course Navigation** - Previous/Next buttons, progress bar, stage indicator
5. **Course Stages** - Dynamic content based on CourseData

## Features

- ✅ **Dynamic Content Generation** - Loops through stages, sections, interactive elements
- ✅ **Conditional Rendering** - Handles optional content gracefully
- ✅ **Adaptive Layout** - Full-width when no sideCard, two-column when present
- ✅ **Interactive Elements** - Quiz, matching, expandable, code-demo support
- ✅ **XSS Protection** - All text content is escaped with `escapeHtml()`
- ✅ **Color Customization** - Configurable via `CourseConfig.colors`
- ✅ **No Footer/About/Contact** - Learning-focused only (as per requirements)
- ✅ **Visual Design Preserved** - Original animations, particles, effects maintained

## Type Definitions

### CourseData
```typescript
interface CourseData {
  course: {
    title: string;
    description: string;
    stages: Stage[];
  };
}
```

### CourseConfig
```typescript
interface CourseConfig {
  colors?: {
    primary?: string;
    secondary?: string;
    accent?: string;
    background?: string;
    text?: string;
  };
  includeVideo?: boolean;
  includePodcast?: boolean;
  showFooter?: boolean; // Default: false
}
```

## Notes

- All templates are **learning-focused** - no About Us, Careers, Contact sections
- Visual design elements (particles, animations) are preserved from original templates
- Templates use shared base utilities for consistency
- Generated HTML includes embedded CSS and JavaScript
- jQuery is required (loaded from CDN in generated HTML)

