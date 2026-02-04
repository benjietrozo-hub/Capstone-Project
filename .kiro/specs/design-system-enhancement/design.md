# Design Document: Design System Enhancement

## Overview

This design document specifies the comprehensive enhancement of the OlineIMS design system, transforming it from a mixed-state application with inconsistent styling into a unified, modern, accessible, and maintainable system. The design establishes a blue gradient theme as the visual foundation, migrates all components to TypeScript and shadcn/ui, and implements a robust design token system that ensures consistency across all pages and user roles.

### Design Goals

1. **Visual Consistency**: Establish a unified blue gradient theme (#4F9CF9 to #0EA5E9) across all components and pages
2. **Type Safety**: Convert all JSX components to TypeScript for improved developer experience and fewer runtime errors
3. **Modern Component Library**: Standardize on shadcn/ui components built with Radix UI and Tailwind CSS
4. **Accessibility**: Achieve WCAG 2.1 AA compliance with proper ARIA labels, keyboard navigation, and color contrast
5. **Performance**: Optimize bundle size, implement code splitting, and achieve sub-2-second page loads
6. **Responsive Design**: Ensure seamless experience across mobile (320px+), tablet (768px+), and desktop (1024px+)
7. **Dark Mode**: Provide full dark mode support with smooth transitions
8. **Developer Experience**: Create comprehensive documentation and reusable patterns

### Technology Stack

- **Frontend Framework**: React 18+ with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS 3.x with CSS custom properties
- **Component Library**: shadcn/ui (Radix UI + Tailwind)
- **Icons**: Lucide React
- **Charts**: Chart.js with react-chartjs-2
- **Routing**: React Router v6
- **State Management**: React Context API + Local Storage

## Architecture

### Component Hierarchy

```
App (Root)
├── AuthContext (Authentication State)
├── ThemeProvider (Dark Mode State)
└── Routes
    ├── Public Routes
    │   ├── LoginPage
    │   └── RegisterPage
    └── Protected Routes
        ├── Layout (Authenticated)
        │   ├── AppSidebar
        │   ├── NavHeader
        │   │   └── NotificationProfile
        │   └── Main Content Area
        │       ├── Admin Routes
        │       │   ├── Dashboard
        │       │   ├── InventoryPage
        │       │   ├── RequestsPage
        │       │   ├── ReportsPage
        │       │   └── TeachersPage
        │       └── Teacher Routes
        │           ├── Dashboard
        │           ├── BrowseInventoryPage
        │           └── MyRequestsPage
        └── ErrorPages (404, 500)
```

### Design Token Architecture

Design tokens are organized in a three-tier hierarchy:

1. **Primitive Tokens**: Base values (colors, spacing units, font sizes)
2. **Semantic Tokens**: Purpose-driven tokens (primary, secondary, destructive)
3. **Component Tokens**: Component-specific tokens (button-height, card-padding)


## Components and Interfaces

### 1. Design Token System

#### Color Tokens

**Light Mode Colors:**
```typescript
interface ColorTokens {
  // Base Colors (HSL format for easy manipulation)
  background: 'hsl(210, 40%, 98%)',      // Off-white background
  foreground: 'hsl(222.2, 47.4%, 11.2%)', // Dark text
  
  // Primary Colors (Blue Gradient Theme)
  primary: 'hsl(217, 91%, 60%)',          // #4F9CF9 - Main blue
  primaryForeground: 'hsl(0, 0%, 100%)',  // White text on primary
  
  // Accent Colors
  accent: 'hsl(199, 89%, 48%)',           // #0EA5E9 - Cyan accent
  accentForeground: 'hsl(0, 0%, 100%)',   // White text on accent
  
  // Semantic Colors
  secondary: 'hsl(210, 40%, 96.1%)',      // Light gray
  secondaryForeground: 'hsl(222.2, 47.4%, 11.2%)',
  
  muted: 'hsl(210, 40%, 96.1%)',          // Muted backgrounds
  mutedForeground: 'hsl(215.4, 16.3%, 46.9%)', // Muted text
  
  destructive: 'hsl(0, 84.2%, 60.2%)',    // Red for errors/delete
  destructiveForeground: 'hsl(0, 0%, 100%)',
  
  // UI Element Colors
  card: 'hsl(0, 0%, 100%)',               // White cards
  cardForeground: 'hsl(222.2, 47.4%, 11.2%)',
  
  border: 'hsl(214.3, 31.8%, 91.4%)',     // Light borders
  input: 'hsl(214.3, 31.8%, 91.4%)',      // Input borders
  ring: 'hsl(217, 91%, 60%)',             // Focus ring (primary)
  
  // Sidebar Colors
  sidebarBackground: 'hsl(222.2, 47.4%, 11.2%)', // Dark sidebar
  sidebarForeground: 'hsl(210, 40%, 98%)',
  sidebarPrimary: 'hsl(217, 91%, 60%)',
  sidebarAccent: 'hsl(217.2, 32.6%, 17.5%)',
  sidebarBorder: 'hsl(217.2, 32.6%, 17.5%)',
}
```

**Dark Mode Colors:**
```typescript
interface DarkColorTokens {
  background: 'hsl(222.2, 47.4%, 11.2%)',  // Dark background
  foreground: 'hsl(210, 40%, 98%)',        // Light text
  
  primary: 'hsl(217, 91%, 60%)',           // Same blue (works in dark)
  accent: 'hsl(199, 89%, 48%)',            // Same cyan
  
  card: 'hsl(217.2, 32.6%, 17.5%)',        // Dark cards
  border: 'hsl(217.2, 32.6%, 17.5%)',      // Dark borders
  
  // Other tokens adjusted for dark mode...
}
```

#### Typography Tokens

```typescript
interface TypographyTokens {
  // Font Families
  fontFamily: {
    sans: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    mono: 'ui-monospace, SFMono-Regular, "SF Mono", Consolas, monospace',
  },
  
  // Font Sizes (rem units)
  fontSize: {
    xs: '0.75rem',    // 12px
    sm: '0.875rem',   // 14px
    base: '1rem',     // 16px
    lg: '1.125rem',   // 18px
    xl: '1.25rem',    // 20px
    '2xl': '1.5rem',  // 24px
    '3xl': '1.875rem', // 30px
    '4xl': '2.25rem', // 36px
  },
  
  // Font Weights
  fontWeight: {
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },
  
  // Line Heights
  lineHeight: {
    tight: 1.25,
    normal: 1.5,
    relaxed: 1.75,
  },
}
```


#### Spacing Tokens

```typescript
interface SpacingTokens {
  // 8px base scale
  spacing: {
    0: '0',
    1: '0.25rem',   // 4px
    2: '0.5rem',    // 8px
    3: '0.75rem',   // 12px
    4: '1rem',      // 16px
    5: '1.25rem',   // 20px
    6: '1.5rem',    // 24px
    8: '2rem',      // 32px
    10: '2.5rem',   // 40px
    12: '3rem',     // 48px
    16: '4rem',     // 64px
    20: '5rem',     // 80px
    24: '6rem',     // 96px
    32: '8rem',     // 128px
  },
}
```

#### Border Radius Tokens

```typescript
interface BorderRadiusTokens {
  radius: {
    sm: '0.25rem',   // 4px
    md: '0.375rem',  // 6px
    lg: '0.5rem',    // 8px
    xl: '0.75rem',   // 12px
    '2xl': '1rem',   // 16px
    full: '9999px',  // Fully rounded
  },
}
```

#### Shadow Tokens

```typescript
interface ShadowTokens {
  shadow: {
    sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
    xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
    
    // Custom shadows for blue theme
    cardPrimary: '0 4px 6px -1px hsl(217 91% 60% / 0.1), 0 2px 4px -1px hsl(217 91% 60% / 0.06)',
    cardPrimaryHover: '0 10px 15px -3px hsl(217 91% 60% / 0.3), 0 4px 6px -2px hsl(217 91% 60% / 0.2)',
  },
}
```

#### Animation Tokens

```typescript
interface AnimationTokens {
  // Durations
  duration: {
    fast: '150ms',
    normal: '300ms',
    slow: '500ms',
  },
  
  // Easing Functions
  easing: {
    easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
    easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
    easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
  },
}
```

### 2. Core Component Specifications

#### Button Component

**Interface:**
```typescript
interface ButtonProps {
  variant?: 'default' | 'outline' | 'ghost' | 'destructive' | 'link';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  children: React.ReactNode;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  className?: string;
}
```

**Variants:**
- `default`: Blue gradient background, white text
- `outline`: Transparent background, blue border, blue text
- `ghost`: Transparent background, blue text on hover
- `destructive`: Red background, white text
- `link`: No background, blue text, underline on hover

**Sizes:**
- `sm`: 32px height, 12px padding, 14px font
- `md`: 40px height, 16px padding, 16px font (default)
- `lg`: 48px height, 20px padding, 18px font

**States:**
- Hover: Darken background by 10%, elevate with shadow
- Active: Scale down to 98%
- Disabled: 50% opacity, no pointer events
- Loading: Show spinner, disable interaction


#### Card Component

**Interface:**
```typescript
interface CardProps {
  children: React.ReactNode;
  className?: string;
  interactive?: boolean;  // Adds hover effects
  gradient?: boolean;     // Adds gradient border
}

interface CardHeaderProps {
  children: React.ReactNode;
  className?: string;
}

interface CardContentProps {
  children: React.ReactNode;
  className?: string;
}
```

**Styling:**
- Background: White (light mode), Dark gray (dark mode)
- Border: 1px solid border color
- Border Radius: 0.5rem (8px)
- Padding: 20px (desktop), 16px (mobile)
- Shadow: shadow-sm default, shadow-lg on hover (if interactive)

**Interactive Behavior:**
- Hover: Transform translateY(-2px), shadow-lg, transition 300ms
- Click: Scale 98%, transition 150ms

#### InventoryCard Component (Enhanced)

**Interface:**
```typescript
interface InventoryItem {
  id: string;
  item_name: string;
  description?: string;
  category: 'Tool' | 'Equipment' | 'Material';
  condition_status: 'Excellent' | 'Good' | 'Fair' | 'Poor' | 'Damaged';
  quantity_available: number;
  quantity_borrowed: number;
  quantity_total: number;
  location: string;
  unit_price?: number;
}

interface InventoryCardProps {
  item: InventoryItem;
  onEdit?: (item: InventoryItem) => void;
  onDelete?: (item: InventoryItem) => void;
  onView?: (item: InventoryItem) => void;
  compact?: boolean;  // Smaller version for lists
}
```

**Layout:**
```
┌─────────────────────────────────────┐
│ [Item Name]           [Category]    │
│ Description text...                 │
│                                     │
│ Condition: [Badge]  Available: 10   │
│ Borrowed: 5         Total: 15       │
│                                     │
│ Location: Lab 1     Price: ₱500     │
│                                     │
│ [Edit Button]  [Delete Button]      │
└─────────────────────────────────────┘
```

**Styling:**
- Uses shadcn/ui Card as base
- Category badge: Blue for Tool, Cyan for Equipment, Green for Material
- Condition badge: Green (Excellent/Good), Yellow (Fair/Poor), Red (Damaged)
- Available count: Green if > 0, Red if 0
- Hover: Elevate with shadow-lg, translateY(-2px)

#### StatsCard Component (Enhanced)

**Interface:**
```typescript
interface StatsCardProps {
  icon: React.ReactNode;
  number: number | string;
  label: string;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;  // e.g., "+12%"
  chartType?: 'doughnut' | 'line' | 'bar';
  chartData?: ChartData;
  gradient?: string;  // Tailwind gradient class
}
```

**Layout:**
```
┌─────────────────────────────────────┐
│ [Icon]                              │
│                                     │
│ 1,234                               │
│ Total Items                         │
│                                     │
│ [Mini Chart]                        │
└─────────────────────────────────────┘
```

**Styling:**
- Icon: 60px circle with gradient background
- Number: 2rem font, bold, primary color
- Label: 0.875rem font, muted color
- Chart: 60px height, subtle colors
- Border-left: 4px solid primary color
- Hover: Elevate with shadow-lg


#### Table Component

**Interface:**
```typescript
interface Column<T> {
  key: keyof T;
  header: string;
  render?: (value: any, row: T) => React.ReactNode;
  sortable?: boolean;
  width?: string;
}

interface TableProps<T> {
  data: T[];
  columns: Column<T>[];
  onRowClick?: (row: T) => void;
  loading?: boolean;
  emptyMessage?: string;
  stickyHeader?: boolean;
}
```

**Styling:**
- Uses shadcn/ui Table component
- Header: Bold, uppercase, muted color, sticky on scroll
- Rows: Alternating background (white/gray-50)
- Hover: Light blue background
- Borders: Subtle gray borders between rows
- Mobile: Horizontal scroll or convert to card view

#### Form Components

**Input Component:**
```typescript
interface InputProps {
  type?: 'text' | 'email' | 'password' | 'number' | 'tel';
  label?: string;
  placeholder?: string;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  value: string;
  onChange: (value: string) => void;
}
```

**Styling:**
- Height: 40px
- Border: 1px solid input color
- Border Radius: 0.5rem
- Focus: Blue ring, blue border
- Error: Red border, red text below
- Disabled: Gray background, no interaction

**Select Component:**
```typescript
interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps {
  options: SelectOption[];
  value: string;
  onChange: (value: string) => void;
  label?: string;
  error?: string;
  placeholder?: string;
}
```

**Textarea Component:**
```typescript
interface TextareaProps {
  label?: string;
  placeholder?: string;
  error?: string;
  rows?: number;
  value: string;
  onChange: (value: string) => void;
}
```

### 3. Layout Components

#### AppSidebar Component

**Interface:**
```typescript
interface MenuItem {
  title: string;
  url: string;
  icon: React.ComponentType;
  badge?: string | number;
}

interface AppSidebarProps {
  userRole: 'admin' | 'teacher';
  currentPath: string;
}
```

**Behavior:**
- Desktop (≥1024px): Always visible, 280px width
- Tablet (768-1023px): Collapsible, overlay mode
- Mobile (<768px): Hidden, toggle with menu button
- Active item: Blue background, white text
- Hover: Light background overlay

**Menu Structure:**
- Admin: Dashboard, Inventory, Requests, Reports, Teachers
- Teacher: Dashboard, Browse Inventory, My Requests

#### NavHeader Component

**Interface:**
```typescript
interface NavHeaderProps {
  title: string;
  subtitle?: string;
  showBackButton?: boolean;
  showMenuButton?: boolean;
  children?: React.ReactNode;  // For NotificationProfile
}
```

**Styling:**
- Background: Blue gradient (primary to accent)
- Height: 64px
- Text: White
- Shadow: shadow-lg
- Sticky: top-0, z-50

#### NotificationProfile Component

**Interface:**
```typescript
interface Notification {
  id: string;
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  type: 'info' | 'success' | 'warning' | 'error';
}

interface NotificationProfileProps {
  notifications: Notification[];
  unreadCount: number;
  currentUser: User;
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
}
```

**Features:**
- Bell icon with badge showing unread count
- Dropdown menu with notification list
- User avatar with dropdown menu (profile, settings, logout)
- Responsive: Compact on mobile


### 4. Page Layouts

#### Dashboard Layout (Admin & Teacher)

**Structure:**
```
┌─────────────────────────────────────────────────┐
│ NavHeader (Blue Gradient)                       │
├──────────┬──────────────────────────────────────┤
│          │ Welcome Card                         │
│ Sidebar  │ ┌──────────────────────────────────┐ │
│          │ │ [Icon] Dashboard Title           │ │
│ (Dark)   │ │ Welcome message                  │ │
│          │ └──────────────────────────────────┘ │
│          │                                      │
│          │ Module Cards Grid                    │
│          │ ┌────────┐ ┌────────┐ ┌────────┐   │
│          │ │[Icon]  │ │[Icon]  │ │[Icon]  │   │
│          │ │Title   │ │Title   │ │Title   │   │
│          │ │Desc    │ │Desc    │ │Desc    │   │
│          │ └────────┘ └────────┘ └────────┘   │
└──────────┴──────────────────────────────────────┘
```

**Responsive Behavior:**
- Desktop: 3 columns grid
- Tablet: 2 columns grid
- Mobile: 1 column, sidebar hidden

#### Inventory Page Layout

**Structure:**
```
┌─────────────────────────────────────────────────┐
│ NavHeader                                       │
├──────────┬──────────────────────────────────────┤
│          │ Stats Cards Row                      │
│ Sidebar  │ [Total] [Available] [Borrowed]       │
│          │                                      │
│          │ Filters & Search Bar                 │
│          │ [Search] [Category] [Condition]      │
│          │                                      │
│          │ Inventory Cards Grid                 │
│          │ ┌────────┐ ┌────────┐ ┌────────┐   │
│          │ │Item    │ │Item    │ │Item    │   │
│          │ │Details │ │Details │ │Details │   │
│          │ └────────┘ └────────┘ └────────┘   │
└──────────┴──────────────────────────────────────┘
```

#### Requests Page Layout

**Structure:**
```
┌─────────────────────────────────────────────────┐
│ NavHeader                                       │
├──────────┬──────────────────────────────────────┤
│          │ Tabs: [Pending] [Approved] [All]     │
│ Sidebar  │                                      │
│          │ Requests Table                       │
│          │ ┌────────────────────────────────┐  │
│          │ │ ID | Teacher | Item | Status   │  │
│          │ │ 1  | John    | Tool | Pending  │  │
│          │ │ 2  | Jane    | Equip| Approved │  │
│          │ └────────────────────────────────┘  │
└──────────┴──────────────────────────────────────┘
```

#### Authentication Page Layout

**Structure:**
```
┌─────────────────────────────────────────────────┐
│                                                 │
│         [Blue Gradient Background]              │
│                                                 │
│              ┌─────────────────┐                │
│              │  [Logo]         │                │
│              │  OlineIMS       │                │
│              │                 │                │
│              │  [Login Form]   │                │
│              │  Email          │                │
│              │  Password       │                │
│              │  [Login Button] │                │
│              │                 │                │
│              │  Register Link  │                │
│              └─────────────────┘                │
│                                                 │
└─────────────────────────────────────────────────┘
```

## Data Models

### User Model

```typescript
interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'teacher';
  avatar?: string;
  createdAt: Date;
  lastLogin?: Date;
}
```

### InventoryItem Model

```typescript
interface InventoryItem {
  id: string;
  item_name: string;
  description?: string;
  category: 'Tool' | 'Equipment' | 'Material';
  condition_status: 'Excellent' | 'Good' | 'Fair' | 'Poor' | 'Damaged';
  quantity_available: number;
  quantity_borrowed: number;
  quantity_total: number;
  location: string;
  unit_price?: number;
  image_url?: string;
  createdAt: Date;
  updatedAt: Date;
}
```

### BorrowRequest Model

```typescript
interface BorrowRequest {
  id: string;
  teacher_id: string;
  teacher_name: string;
  item_id: string;
  item_name: string;
  quantity: number;
  purpose: string;
  borrow_date: Date;
  return_date: Date;
  status: 'pending' | 'approved' | 'rejected' | 'returned';
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}
```

### Theme Model

```typescript
interface Theme {
  mode: 'light' | 'dark';
  colors: ColorTokens;
  typography: TypographyTokens;
  spacing: SpacingTokens;
  borderRadius: BorderRadiusTokens;
  shadows: ShadowTokens;
  animations: AnimationTokens;
}
```


## Correctness Properties

A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.

### Property 1: Color Variable Usage

*For any* component file in the codebase, all color references should use CSS custom properties (var(--color-name)) or Tailwind utility classes, and should not contain hardcoded hex color values (especially old green theme colors #2d7a3e or #1e5a2e).

**Validates: Requirements 1.2, 1.3, 2.10, 3.6**

### Property 2: WCAG Contrast Compliance

*For any* foreground and background color combination used in the design system, the contrast ratio should meet or exceed WCAG 2.1 AA requirements (4.5:1 for normal text, 3:1 for large text and UI components).

**Validates: Requirements 1.7, 6.5**

### Property 3: TypeScript Component Migration

*For any* component file in the src/components directory, the file extension should be .tsx (TypeScript) and not .jsx (JavaScript), ensuring type safety across the component library.

**Validates: Requirements 2.1**

### Property 4: Tailwind Styling Consistency

*For any* component file, styling should primarily use Tailwind CSS utility classes rather than inline style objects, with inline styles used only for dynamic values that cannot be expressed in Tailwind.

**Validates: Requirements 2.9**

### Property 5: Layout Component Integration

*For any* authenticated page component, the file should import and use AppSidebar, NavHeader, and NotificationProfile components to ensure consistent layout structure.

**Validates: Requirements 3.3, 3.4, 3.5, 11.1, 11.2, 11.3**

### Property 6: Design Token Spacing

*For any* page component, spacing values (margins, paddings, gaps) should use Tailwind spacing utilities (p-4, m-6, gap-8) that correspond to the 8px-based design token scale, rather than arbitrary values.

**Validates: Requirements 3.8**

### Property 7: Touch Target Accessibility

*For any* interactive element (button, link, input, clickable card), the rendered element should have a minimum touch target size of 44x44 pixels to ensure mobile accessibility.

**Validates: Requirements 5.5**

### Property 8: ARIA Label Completeness

*For any* interactive element that does not have visible text content (icon buttons, image links), the element should have an aria-label or aria-labelledby attribute to ensure screen reader accessibility.

**Validates: Requirements 6.1**

### Property 9: Form Label Association

*For any* form input element (input, select, textarea), the element should have an associated label element with a matching for/id relationship or be wrapped in a label element.

**Validates: Requirements 6.3**

### Property 10: Image Alt Text

*For any* img element in the codebase, the element should have an alt attribute with descriptive text, or an empty alt="" if the image is purely decorative.

**Validates: Requirements 6.4**


## Error Handling

### Component Error Boundaries

All major page components should be wrapped in React Error Boundaries to gracefully handle runtime errors:

```typescript
interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends React.Component<Props, ErrorBoundaryState> {
  // Catches errors in child components
  // Displays fallback UI
  // Logs errors for debugging
}
```

### Form Validation Errors

Form components should display validation errors inline:

- **Field-level errors**: Display below the input in red text
- **Form-level errors**: Display at the top of the form in an alert
- **API errors**: Display in a toast notification

### API Error Handling

API calls should handle errors consistently:

```typescript
try {
  const response = await api.get('/inventory');
  return response.data;
} catch (error) {
  if (error.response?.status === 401) {
    // Redirect to login
    navigate('/login');
  } else if (error.response?.status === 404) {
    // Show not found message
    toast.error('Resource not found');
  } else {
    // Show generic error
    toast.error('An error occurred. Please try again.');
  }
  throw error;
}
```

### Loading States

Components should display loading states during async operations:

- **Page loading**: Full-page skeleton or spinner
- **Component loading**: Skeleton matching the component layout
- **Button loading**: Spinner inside button, button disabled
- **Table loading**: Skeleton rows

### Empty States

Components should display helpful empty states when no data is available:

- **Empty inventory**: "No items found. Add your first item."
- **Empty requests**: "No requests yet. Browse inventory to get started."
- **Empty search**: "No results found. Try different search terms."

## Testing Strategy

### Dual Testing Approach

The design system will be validated using both unit tests and property-based tests:

**Unit Tests:**
- Test specific component examples and edge cases
- Test error conditions and boundary values
- Test integration between components
- Focus on concrete scenarios

**Property-Based Tests:**
- Test universal properties across all inputs
- Generate random component props and verify properties hold
- Test color contrast ratios across all color combinations
- Test accessibility properties across all components
- Minimum 100 iterations per property test

### Testing Tools

- **Unit Testing**: Vitest + React Testing Library
- **Property-Based Testing**: fast-check (JavaScript property testing library)
- **Accessibility Testing**: axe-core + jest-axe
- **Visual Regression**: Chromatic or Percy (optional)
- **E2E Testing**: Playwright (for critical user flows)

### Property Test Configuration

Each property test should:
1. Run minimum 100 iterations with randomized inputs
2. Reference the design document property number
3. Use tag format: `Feature: design-system-enhancement, Property {number}: {property_text}`

Example:
```typescript
// Feature: design-system-enhancement, Property 1: Color Variable Usage
test('components should not use hardcoded hex colors', () => {
  fc.assert(
    fc.property(
      fc.constantFrom(...componentFiles),
      (filePath) => {
        const content = readFileSync(filePath, 'utf-8');
        const hexColorRegex = /#[0-9A-Fa-f]{6}/g;
        const matches = content.match(hexColorRegex) || [];
        // Filter out comments and imports
        const actualColors = matches.filter(isNotInComment);
        return actualColors.length === 0;
      }
    ),
    { numRuns: 100 }
  );
});
```

### Test Coverage Goals

- **Unit Test Coverage**: 80% code coverage minimum
- **Property Test Coverage**: All 10 correctness properties implemented
- **Accessibility Tests**: All WCAG 2.1 AA criteria tested
- **Visual Regression**: All component variants captured

### Testing Workflow

1. **Development**: Write unit tests alongside component development
2. **Property Tests**: Implement after component completion
3. **Accessibility**: Run axe-core on all pages
4. **Visual**: Capture screenshots for baseline
5. **E2E**: Test critical user flows (login, borrow request, inventory management)

### Continuous Integration

All tests should run on every pull request:
- Unit tests must pass (no failures)
- Property tests must pass (all properties hold)
- Accessibility tests must pass (no violations)
- Build must succeed (no TypeScript errors)
- Bundle size must be under 500KB gzipped

