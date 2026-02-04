# View Mode Visual Guide

## Toggle Button Location

```
┌────────────────────────────────────────────────────────┐
│ Inventory Management                    [🔔] [👤]      │
│ Manage all equipment and tools                         │
│ [← Back] [🏠 Home]                                     │
├────────────────────────────────────────────────────────┤
│                                                        │
│ Search: [____________]  Category: [All ▼]  [🎴][📋] [+ Add] │
│                                                        │
└────────────────────────────────────────────────────────┘
                                              ↑
                                    View Mode Toggle
```

## Card View (Default) 🎴

```
┌──────────────────────────────────────────────────────────────┐
│ [🎴] [📋]  ← Toggle (Card is active)                         │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────┐│
│ │Electric Drill│ │Projector    │ │Laptop       │ │Hammer   ││
│ │ITEM0001     │ │ITEM0002     │ │ITEM0003     │ │ITEM0004 ││
│ │             │ │             │ │             │ │         ││
│ │Category: Tool│ │Category: Eq │ │Category: Eq │ │Category ││
│ │Available: 5/5│ │Available: 3/3│ │Available:10│ │Available││
│ │Condition:Good│ │Condition:Exc│ │Condition:Gd │ │Condition││
│ │Location: Lab │ │Location: Rm │ │Location: Lab│ │Location ││
│ │             │ │             │ │             │ │         ││
│ │[Details][Borrow]│[Details][Borrow]│[Details][Borrow]│[Details]││
│ └─────────────┘ └─────────────┘ └─────────────┘ └─────────┘│
│                                                              │
│ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────┐│
│ │Batuta       │ │...          │ │...          │ │...      ││
│ └─────────────┘ └─────────────┘ └─────────────┘ └─────────┘│
└──────────────────────────────────────────────────────────────┘
```

### Card Features
- ✅ Visual cards with borders
- ✅ Green left accent
- ✅ Item name prominent
- ✅ Key info displayed
- ✅ Color-coded availability
- ✅ Action buttons at bottom
- ✅ Hover effects

## List View 📋

```
┌──────────────────────────────────────────────────────────────┐
│ [🎴] [📋]  ← Toggle (List is active)                         │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│ ┌────────────────────────────────────────────────────────┐  │
│ │ Code    │ Name          │ Category │ Qty │ Condition  │  │
│ ├────────────────────────────────────────────────────────┤  │
│ │ ITEM0001│ Electric Drill│ Tool     │ 5/5 │ Good       │  │
│ │ ITEM0002│ Projector     │ Equipment│ 3/3 │ Excellent  │  │
│ │ ITEM0003│ Laptop        │ Equipment│10/10│ Good       │  │
│ │ ITEM0004│ Hammer Set    │ Tool     │ 8/8 │ Good       │  │
│ │ ITEM0006│ Batuta        │ Tool     │20/20│ Good       │  │
│ └────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────┘
```

### List Features
- ✅ Traditional table format
- ✅ All data in columns
- ✅ Compact display
- ✅ More items visible
- ✅ Easy to compare
- ✅ Sortable columns

## Toggle Button States

### Card View Active
```
┌─────────────────┐
│ [🎴] [📋]       │  ← Card icon is highlighted
│  ▔▔▔            │     (white background, shadow)
└─────────────────┘
```

### List View Active
```
┌─────────────────┐
│ [🎴] [📋]       │  ← List icon is highlighted
│       ▔▔▔       │     (white background, shadow)
└─────────────────┘
```

## Responsive Behavior

### Desktop (> 1280px)
```
Card View: 4 columns
┌───┐ ┌───┐ ┌───┐ ┌───┐
│   │ │   │ │   │ │   │
└───┘ └───┘ └───┘ └───┘
```

### Laptop (1024px - 1280px)
```
Card View: 3 columns
┌───┐ ┌───┐ ┌───┐
│   │ │   │ │   │
└───┘ └───┘ └───┘
```

### Tablet (768px - 1024px)
```
Card View: 2 columns
┌───┐ ┌───┐
│   │ │   │
└───┘ └───┘
```

### Mobile (< 768px)
```
Card View: 1 column
┌───┐
│   │
└───┘
┌───┐
│   │
└───┘
```

## Card Design Details

```
┌─────────────────────────────────┐
│ ┃ Electric Drill        [Active]│  ← Green left border
│ ┃ ITEM0001                      │  ← Item code in green
│ ┃                               │
│ ┃ Category:        Tool         │
│ ┃ Available:       5/5 ✓        │  ← Green if available
│ ┃ Condition:       [Good]       │  ← Badge
│ ┃ Location:        Lab 1        │
│ ┃ Price:           $50.00       │
│ ┃                               │
│ ┃ ─────────────────────────────│  ← Separator
│ ┃ [Details]      [Borrow]      │  ← Action buttons
└─────────────────────────────────┘
```

## Color Coding

### Availability
- **Green** (> 0): Available items
- **Red** (= 0): Out of stock

### Condition Badges
- **Excellent**: Green badge
- **Good**: Blue badge
- **Fair**: Yellow badge
- **Poor**: Orange badge
- **Damaged**: Red badge

### Status Badges
- **Active**: Green badge
- **Inactive**: Gray badge
- **Maintenance**: Yellow badge

## User Flow

1. **Page Loads** → Card view displayed (default)
2. **User clicks List icon** → Switches to list view
3. **User clicks Card icon** → Switches back to card view
4. **View preference** → Persists during session

## Quick Comparison

| Feature | Card View | List View |
|---------|-----------|-----------|
| Visual Appeal | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ |
| Data Density | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| Mobile Friendly | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ |
| Quick Scan | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| Comparison | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| Modern Look | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ |

## Status

✅ **Card View**: Default, modern, visual
✅ **List View**: Alternative, compact, data-focused
✅ **Toggle**: Easy to switch between views
✅ **Responsive**: Works on all screen sizes

---

**Default View**: Card Mode 🎴
**Alternative**: List Mode 📋
**Toggle**: Top right corner
