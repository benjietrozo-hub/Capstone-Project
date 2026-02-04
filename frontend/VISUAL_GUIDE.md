# Design System Visual Guide

## Quick Reference

### Color Palette
```
Primary:    #667eea (Purple-Blue)
Secondary:  #764ba2 (Dark Purple)
Success:    #51cf66 (Green)
Warning:    #ffd43b (Yellow)
Danger:     #ff6b6b (Red)
Info:       #74c0fc (Light Blue)
Light:      #f8f9fa (Off-white)
Dark:       #343a40 (Dark Gray)
```

### Spacing Scale
```
4px    • 8px    • 12px   • 16px   • 20px
24px   • 32px   • 40px
```

### Border Radius
```
Standard: 10px
Rounded:  20px  (badges, pills)
Circle:   50%   (avatars)
```

### Typography
```
H1: 2rem (32px)    - Page titles
H2: 1.5rem (24px)  - Section titles
H3: 1.25rem (20px) - Subsection titles
Body: 1rem (16px)  - Normal text
Small: 0.875rem (14px)
Tiny: 0.75rem (12px)
```

## Component Examples

### Buttons

#### Primary Button
```
Background: linear-gradient(135deg, #667eea, #764ba2)
Color: White
Padding: 10px 20px
Border Radius: 10px
Font Weight: 600
Hover: Transform up + shadow
```

#### Success Button (Green)
```
Background: linear-gradient(135deg, #51cf66, #40c057)
Color: White
```

#### Danger Button (Red)
```
Background: linear-gradient(135deg, #ff6b6b, #ee5a52)
Color: White
```

#### Warning Button (Yellow)
```
Background: linear-gradient(135deg, #ffd43b, #fab005)
Color: Black
```

### Status Badges

```
Pending  → Yellow gradient   (#ffd43b to #fab005)
Approved → Green gradient    (#51cf66 to #40c057)
Borrowed → Blue gradient     (#74c0fc to #339af0)
Returned → Gray gradient     (#6c757d to #495057)
Rejected → Red gradient      (#ff6b6b to #ee5a52)
```

### Cards

```
Background: White
Border: None
Border Radius: 10px
Shadow: 0 2px 10px rgba(0,0,0,0.1)
Hover: translateY(-2px) + 0 5px 20px rgba(0,0,0,0.15)
```

### Form Inputs

```
Border: 2px solid #e9ecef
Border Radius: 10px
Padding: 12px 15px
Focus Border: #667eea
Focus Shadow: rgba(102, 126, 234, 0.25)
```

### Tables

```
Header Background: linear-gradient(135deg, #667eea, #764ba2)
Header Color: White
Header Padding: 15px
Row Hover: #f8f9fa
```

### Sidebar

```
Background: linear-gradient(180deg, #667eea, #764ba2)
Text Color: white / rgba(255,255,255,0.8)
Link Hover: rgba(255,255,255,0.1) background
Link Active: rgba(255,255,255,0.2) background + white left border
```

### Login Page

```
Background: linear-gradient(135deg, #667eea, #764ba2)
Card: White, 400px wide max, rounded 15px, shadow
Logo: 80px circle with gradient background
Button: Full gradient with hover effects
```

## Layout Structure

```
┌─────────────────────────────────────┐
│           Header (70px)              │
├──────────┬──────────────────────────┤
│          │                          │
│ Sidebar  │   Main Content Area      │
│  (250px) │   (Scrollable)           │
│          │                          │
│  Gradient│   White Background       │
│ Purple   │   Padding: 20px          │
│          │   Max Width: 1400px      │
├──────────┼──────────────────────────┤
│       Footer                         │
└─────────────────────────────────────┘
```

## Animations

### Fade In
```css
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}
Duration: 0.5s
Easing: ease-in
```

### Slide Up
```css
@keyframes slideUp {
  from { opacity: 0; transform: translateY(30px); }
  to { opacity: 1; transform: translateY(0); }
}
Duration: 0.6s
Easing: ease-out
```

### Button Hover
```css
transform: translateY(-2px)
box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4)
transition: all 0.3s ease
```

## Responsive Breakpoints

```
Desktop:  > 992px   (Normal layout)
Tablet:   576px-992px (Some adjustments)
Mobile:   < 576px   (Sidebar offscreen, single column)
```

## Shadows Hierarchy

```
Subtle:       0 2px 10px rgba(0,0,0,0.1)
Medium:       0 5px 20px rgba(0,0,0,0.15)
Strong:       0 10px 30px rgba(0,0,0,0.3)
Interactive:  0 5px 15px rgba(102,126,234,0.4)
```

## Icon Usage

Currently using emoji for icons:
```
📦 Package/Inventory
📊 Dashboard/Stats
📋 Requests/Forms
👨‍🏫 Teachers
📄 Reports
🔍 Search/Browse
🚪 Logout
👤 Profile
```

## Best Practices

### Colors
- Use primary for main CTAs
- Use secondary for accents
- Use status colors for indicators
- Maintain 4.5:1 contrast ratio

### Spacing
- Never use arbitrary values
- Use the spacing scale
- Be consistent with padding
- Use margin for separation

### Typography
- Use semibold for labels
- Use regular for body
- Keep line-height at 1.6
- Don't use color alone for meaning

### Interactions
- Always show hover state
- Use smooth transitions
- Provide visual feedback
- Maintain accessibility

## CSS Variables

All colors are CSS variables in `src/index.css`:

```css
:root {
  --primary-color: #667eea;
  --secondary-color: #764ba2;
  --success-color: #51cf66;
  --warning-color: #ffd43b;
  --danger-color: #ff6b6b;
  --info-color: #74c0fc;
  --light-color: #f8f9fa;
  --dark-color: #343a40;
  --border-radius: 10px;
  --box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  --transition: all 0.3s ease;
}
```

Change these to customize the entire design!

## Component Quick Code

### Primary Button
```jsx
<button style={{
  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  color: 'white',
  border: 'none',
  borderRadius: '10px',
  padding: '10px 20px',
  fontWeight: '600',
  cursor: 'pointer'
}}>
  Click Me
</button>
```

### Card
```jsx
<div style={{
  background: 'white',
  borderRadius: '10px',
  boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
  padding: '20px',
  marginBottom: '20px'
}}>
  Content
</div>
```

### Status Badge
```jsx
<span style={{
  background: 'linear-gradient(135deg, #51cf66, #40c057)',
  color: 'white',
  padding: '8px 12px',
  borderRadius: '20px',
  fontWeight: '500'
}}>
  Approved
</span>
```

---

**Last Updated**: January 2026  
**Version**: 1.0  
**Design System**: OlineIMS Professional
