# OlineIMS React Frontend - Design System

## Color Palette

### Primary Colors
- **Primary**: `#667eea` (Purple/Blue) - Main brand color
- **Secondary**: `#764ba2` (Dark Purple) - Accent color
- **Gradient**: `linear-gradient(135deg, #667eea 0%, #764ba2 100%)`

### Semantic Colors
- **Success**: `#51cf66` (Green)
- **Warning**: `#ffd43b` (Yellow)
- **Danger**: `#ff6b6b` (Red)
- **Info**: `#74c0fc` (Light Blue)

### Neutral Colors
- **Light**: `#f8f9fa`
- **Background**: `#f5f6fa`
- **Dark**: `#343a40`
- **Text**: `#333333`
- **Border**: `#e9ecef`

## Typography

### Font Family
```
'Segoe UI', Tahoma, Geneva, Verdana, sans-serif
```

### Font Sizes
- **Heading 1**: `2rem` (32px) - Page titles
- **Heading 2**: `1.5rem` (24px) - Section titles
- **Heading 3**: `1.25rem` (20px) - Subsection titles
- **Body**: `1rem` (16px) - Normal text
- **Small**: `0.875rem` (14px) - Helper text
- **Tiny**: `0.75rem` (12px) - Metadata

### Font Weights
- **Regular**: `400`
- **Medium**: `500`
- **Semibold**: `600`
- **Bold**: `700`

## Spacing

### Standard Spacing Scale
```
4px   (0.25rem)
8px   (0.5rem)
12px  (0.75rem)
16px  (1rem)  - Default
20px  (1.25rem)
24px  (1.5rem)
32px  (2rem)
40px  (2.5rem)
```

### Common Spacings
- **Component padding**: `15px` to `20px`
- **Card padding**: `20px` to `25px`
- **Section margin**: `20px`
- **Element gap**: `10px` to `20px`

## Border Radius

```css
--border-radius: 10px
```

### Usage
- **Cards**: `10px`
- **Buttons**: `10px`
- **Form inputs**: `10px`
- **Badges**: `20px` (rounded)
- **Circles**: `50%`

## Shadows

### Standard Shadow
```css
--box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1)
```

### Hover Shadow
```css
0 5px 20px rgba(0, 0, 0, 0.15)
```

### Modal Shadow
```css
0 10px 30px rgba(0, 0, 0, 0.3)
```

## Component Styles

### Buttons

#### Primary Button
```javascript
{
  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  color: 'white',
  border: 'none',
  borderRadius: '10px',
  padding: '10px 20px',
  fontWeight: '600',
  cursor: 'pointer',
  transition: 'all 0.3s ease'
}
```

#### Button Hover
```javascript
{
  transform: 'translateY(-2px)',
  boxShadow: '0 5px 15px rgba(102, 126, 234, 0.4)'
}
```

### Cards

#### Standard Card
```javascript
{
  border: 'none',
  borderRadius: '10px',
  boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
  transition: 'all 0.3s ease',
  marginBottom: '20px'
}
```

#### Card Header
```javascript
{
  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  color: 'white',
  borderRadius: '10px 10px 0 0',
  padding: '15px 20px',
  border: 'none'
}
```

### Form Elements

#### Input Field
```javascript
{
  borderRadius: '10px',
  border: '2px solid #e9ecef',
  padding: '12px 15px',
  transition: 'all 0.3s ease'
}
```

#### Input Focus
```javascript
{
  borderColor: '#667eea',
  boxShadow: '0 0 0 0.2rem rgba(102, 126, 234, 0.25)'
}
```

### Tables

#### Table Header
```javascript
{
  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  color: 'white',
  fontWeight: '600',
  padding: '15px'
}
```

#### Table Row Hover
```javascript
{
  backgroundColor: '#f8f9fa'
}
```

## Badges

### Status Badges

| Status | Color | Style |
|--------|-------|-------|
| Pending | Yellow | `linear-gradient(135deg, #ffd43b, #fab005)` |
| Approved | Green | `linear-gradient(135deg, #51cf66, #40c057)` |
| Borrowed | Blue | `linear-gradient(135deg, #74c0fc, #339af0)` |
| Returned | Gray | `linear-gradient(135deg, #6c757d, #495057)` |
| Rejected | Red | `linear-gradient(135deg, #ff6b6b, #ee5a52)` |
| Resolved | Green | `linear-gradient(135deg, #51cf66, #40c057)` |

### Badge Styling
```javascript
{
  padding: '8px 12px',
  borderRadius: '20px',
  fontWeight: '500',
  display: 'inline-block'
}
```

## Sidebar

### Sidebar Style
```javascript
{
  background: 'linear-gradient(180deg, #667eea 0%, #764ba2 100%)',
  minHeight: '100vh',
  boxShadow: '2px 0 10px rgba(0, 0, 0, 0.1)'
}
```

### Navigation Link
- **Default**: `rgba(255, 255, 255, 0.8)`
- **Hover**: `white` with `rgba(255, 255, 255, 0.1)` background
- **Active**: `white` with `rgba(255, 255, 255, 0.2)` background and white left border

## Alerts

### Alert Colors
```javascript
{
  success: {
    background: 'linear-gradient(135deg, #51cf66, #40c057)',
    color: 'white'
  },
  danger: {
    background: 'linear-gradient(135deg, #ff6b6b, #ee5a52)',
    color: 'white'
  },
  warning: {
    background: 'linear-gradient(135deg, #ffd43b, #fab005)',
    color: '#000'
  },
  info: {
    background: 'linear-gradient(135deg, #74c0fc, #339af0)',
    color: 'white'
  }
}
```

## Animations

### Fade In
```css
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}
```

### Slide Up
```css
@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
```

### Slide In
```css
@keyframes slideIn {
  from { transform: translateX(-100%); }
  to { transform: translateX(0); }
}
```

### Pulse (Notification Badge)
```css
@keyframes pulse {
  0% {
    transform: scale(1);
    box-shadow: 0 0 0 0 rgba(220, 53, 69, 0.7);
  }
  70% {
    transform: scale(1.1);
    box-shadow: 0 0 0 10px rgba(220, 53, 69, 0);
  }
  100% {
    transform: scale(1);
    box-shadow: 0 0 0 0 rgba(220, 53, 69, 0);
  }
}
```

## Responsive Breakpoints

### Mobile First
```css
/* Extra Small: < 576px */
/* Small: >= 576px */
@media (max-width: 768px) {
  /* Tablet and below */
  .sidebar { position: fixed; left: -250px; }
  .main-content { padding: 15px; }
}

/* Large: >= 992px */
/* Extra Large: >= 1200px */
```

## Transitions

### Standard Transition
```css
--transition: all 0.3s ease
```

## Custom Scrollbar

```css
::-webkit-scrollbar {
  width: 8px;
}

::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb {
  background: #667eea;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: #764ba2;
}
```

## Usage Guidelines

### Color Usage
- Use **Primary Color** for main CTAs and important elements
- Use **Secondary Color** for accents and highlights
- Use **Success/Danger/Warning/Info** for status indicators
- Maintain sufficient contrast for accessibility

### Spacing
- Always use the spacing scale
- Be consistent with component padding
- Use larger gaps for section separation
- Use smaller gaps for element grouping

### Typography
- Use semibold (600) for labels and section titles
- Use regular (400) for body text
- Use bold (700) only for important headings
- Maintain line-height of 1.6 for readability

### Component Consistency
- Always use the standard border radius
- Apply shadows for depth and hierarchy
- Use gradients for buttons and important sections
- Animate interactive elements on hover

## Dark Mode (Future)

This design system is currently light mode only. Dark mode support will be added in future versions.

## Accessibility

- All text meets WCAG AA contrast requirements
- Interactive elements have minimum touch target of 44x44px
- Focus states are clearly visible
- Color is not the only indicator of status
