# 📸 Borrow Request System - Visual Guide

## 🎯 Quick Navigation

This guide shows you exactly what to expect at each step of the borrow request process.

---

## 👨‍🏫 TEACHER SIDE

### Step 1: Browse Inventory
**Route**: `/teacher/inventory`
**Sidebar**: Click "Browse Inventory"

**What You'll See**:
```
┌─────────────────────────────────────────────────────────┐
│  Browse Inventory                                       │
│  View and request available equipment                   │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  [Search...] [Category ▼] [Card View] [List View]     │
│                                                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │ Microscope   │  │ Projector    │  │ Laptop       │ │
│  │ MS-001       │  │ PJ-002       │  │ LP-003       │ │
│  │ Good         │  │ Excellent    │  │ Good         │ │
│  │ Available:   │  │ Available:   │  │ Available:   │ │
│  │ 5/10         │  │ 3/5          │  │ 8/15         │ │
│  │              │  │              │  │              │ │
│  │ [Details]    │  │ [Details]    │  │ [Details]    │ │
│  │ [Borrow]     │  │ [Borrow]     │  │ [Borrow]     │ │
│  └──────────────┘  └──────────────┘  └──────────────┘ │
└─────────────────────────────────────────────────────────┘
```

### Step 2: Submit Borrow Request
**Action**: Click "Borrow" button

**Modal Form**:
```
┌─────────────────────────────────────────┐
│  Borrow Request - Microscope            │
├─────────────────────────────────────────┤
│                                         │
│  Item Name                              │
│  ┌─────────────────────────────────┐   │
│  │ Microscope                      │   │
│  └─────────────────────────────────┘   │
│                                         │
│  Quantity *                             │
│  ┌─────────────────────────────────┐   │
│  │ 1                               │   │
│  └─────────────────────────────────┘   │
│                                         │
│  Purpose *                              │
│  ┌─────────────────────────────────┐   │
│  │ For laboratory demonstration    │   │
│  │                                 │   │
│  └─────────────────────────────────┘   │
│                                         │
│  Expected Return Date *                 │
│  ┌─────────────────────────────────┐   │
│  │ 2026-02-10                      │   │
│  └─────────────────────────────────┘   │
│                                         │
│  [Submit Request]  [Cancel]             │
└─────────────────────────────────────────┘
```

**Success Message**:
```
✅ Borrow request submitted successfully
```

### Step 3: Track Your Requests
**Route**: `/teacher/reservations`
**Sidebar**: Click "My Reservations"

**Two Tabs Interface**:
```
┌─────────────────────────────────────────────────────────────┐
│  My Reservations                                            │
│  Manage your borrowed items and track your requests         │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  [📦 My Borrowed Items] [📋 My Borrow Requests]            │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Request Code │ Item       │ Qty │ Status  │ Date   │   │
│  ├─────────────────────────────────────────────────────┤   │
│  │ BR-20260203  │ Microscope │ 1   │ pending │ Feb 3  │   │
│  │ -0001        │            │     │ 🟡      │ 2026   │   │
│  │              │            │     │         │ [View] │   │
│  │              │            │     │         │[Cancel]│   │
│  ├─────────────────────────────────────────────────────┤   │
│  │ BR-20260202  │ Projector  │ 1   │ approved│ Feb 2  │   │
│  │ -0005        │            │     │ 🟢      │ 2026   │   │
│  │              │            │     │         │ [View] │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

**Status Colors**:
- 🟡 **Pending** - Yellow badge
- 🟢 **Approved** - Green badge
- 🔵 **Borrowed** - Blue badge
- ✅ **Returned** - Green badge
- 🔴 **Rejected** - Red badge

---

## 👨‍💼 ADMIN SIDE

### Step 1: View Pending Requests
**Route**: `/admin/reservations`
**Sidebar**: Click "Reservations"

**Two Tabs Interface**:
```
┌─────────────────────────────────────────────────────────────────┐
│  Reservations Management                                        │
│  Manage borrowed items and borrow requests                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  [📦 Borrowed List] [📋 Borrow Requests]                       │
│                                                                 │
│  Pending Borrow Requests (3)                                    │
│  New requests waiting for approval                              │
│                                                                 │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │ Code      │ Teacher    │ Item       │ Qty │ Date Requested││
│  ├───────────────────────────────────────────────────────────┤ │
│  │ BR-20260  │ Juan Dela  │ Microscope │ 1   │ Feb 3, 2026   ││
│  │ 203-0001  │ Cruz       │            │     │               ││
│  │           │ ID: T-001  │ MS-001     │     │ [✓ Approve]   ││
│  │           │            │            │     │ [✕ Reject]    ││
│  ├───────────────────────────────────────────────────────────┤ │
│  │ BR-20260  │ Maria      │ Projector  │ 2   │ Feb 3, 2026   ││
│  │ 203-0002  │ Santos     │            │     │               ││
│  │           │ ID: T-002  │ PJ-002     │     │ [✓ Approve]   ││
│  │           │            │            │     │ [✕ Reject]    ││
│  └───────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

### Step 2: Approve Request
**Action**: Click "✓ Approve" button

**Approval Modal**:
```
┌─────────────────────────────────────────┐
│  ✓ Approve Request                      │
├─────────────────────────────────────────┤
│                                         │
│  Quantity to Approve *                  │
│  ┌─────────────────────────────────┐   │
│  │ 1                               │   │
│  └─────────────────────────────────┘   │
│                                         │
│  Expected Return Date *                 │
│  ┌─────────────────────────────────┐   │
│  │ 2026-02-10                      │   │
│  └─────────────────────────────────┘   │
│                                         │
│  Admin Notes                            │
│  ┌─────────────────────────────────┐   │
│  │ Approved for laboratory use     │   │
│  │                                 │   │
│  └─────────────────────────────────┘   │
│                                         │
│  [Cancel]  [Approve]                    │
└─────────────────────────────────────────┘
```

**Success Message**:
```
✅ Request approved successfully
```

### Step 3: Reject Request (Alternative)
**Action**: Click "✕ Reject" button

**Rejection Modal**:
```
┌─────────────────────────────────────────┐
│  ✕ Reject Request                       │
├─────────────────────────────────────────┤
│                                         │
│  Reason for Rejection *                 │
│  ┌─────────────────────────────────┐   │
│  │ Item not available for the      │   │
│  │ requested period. Please try    │   │
│  │ again next week.                │   │
│  │                                 │   │
│  └─────────────────────────────────┘   │
│                                         │
│  [Cancel]  [Reject]                     │
└─────────────────────────────────────────┘
```

### Step 4: View Borrowed Items
**Tab**: Click "Borrowed List"

**Borrowed Items List**:
```
┌─────────────────────────────────────────────────────────────────┐
│  Currently Borrowed Items (5)                                   │
│  Items that have been issued and are currently with teachers    │
│                                                                 │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │ Code   │ Teacher │ Item  │ Qty │ Borrowed │ Expected Return││
│  ├───────────────────────────────────────────────────────────┤ │
│  │ BR-202 │ Juan    │ Micro │ 1   │ Feb 3    │ Feb 10, 2026   ││
│  │ 60203  │ Dela    │ scope │     │ 2026     │ 🟢             ││
│  │ -0001  │ Cruz    │       │     │          │                ││
│  │        │         │       │     │          │ [📥 Mark as    ││
│  │        │         │       │     │          │  Returned]     ││
│  ├───────────────────────────────────────────────────────────┤ │
│  │ BR-202 │ Maria   │ Proje │ 2   │ Feb 1    │ Feb 5, 2026    ││
│  │ 60201  │ Santos  │ ctor  │     │ 2026     │ 🔴 OVERDUE     ││
│  │ -0003  │         │       │     │          │                ││
│  │        │         │       │     │          │ [📥 Mark as    ││
│  │        │         │       │     │          │  Returned]     ││
│  └───────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

**Date Colors**:
- 🟢 **Green** - Return date is in the future
- 🔴 **Red** - Overdue (past return date)

### Step 5: Mark as Returned
**Action**: Click "📥 Mark as Returned"

**Confirmation**:
```
┌─────────────────────────────────────────┐
│  Confirm Return                         │
├─────────────────────────────────────────┤
│                                         │
│  Mark this item as returned?            │
│                                         │
│  Item: Microscope                       │
│  Teacher: Juan Dela Cruz                │
│  Quantity: 1                            │
│                                         │
│  [Cancel]  [Confirm]                    │
└─────────────────────────────────────────┘
```

**Success Message**:
```
✅ Item returned successfully
```

---

## 📊 Status Flow Visualization

```
┌─────────────────────────────────────────────────────────────┐
│                    BORROW REQUEST LIFECYCLE                 │
└─────────────────────────────────────────────────────────────┘

    TEACHER                    ADMIN                  SYSTEM
       │                         │                       │
       │                         │                       │
   [Submit]                      │                       │
       │────────────────────────>│                       │
       │                         │                       │
       │                    [Review]                     │
       │                         │                       │
       │                         ├──[Approve]───────────>│
       │                         │                       │
       │                         │              [Update Inventory]
       │<────[Notification]──────┤                       │
       │                         │                       │
       │                    [Issue Item]                 │
       │                         │                       │
       │                         ├──[Mark Borrowed]─────>│
       │<────[Notification]──────┤                       │
       │                         │                       │
   [Use Item]                    │                       │
       │                         │                       │
       │                         │                       │
   [Return]                      │                       │
       │────────────────────────>│                       │
       │                         │                       │
       │                    [Receive]                    │
       │                         │                       │
       │                         ├──[Mark Returned]─────>│
       │                         │                       │
       │                         │              [Restore Inventory]
       │<────[Notification]──────┤                       │
       │                         │                       │
```

---

## 🎨 Color Coding Reference

### Status Badges

**Pending** 🟡
```css
background: #ffc107 (yellow)
color: #000
```

**Approved** 🟢
```css
background: #28a745 (green)
color: #fff
```

**Borrowed** 🔵
```css
background: #17a2b8 (blue)
color: #fff
```

**Returned** ✅
```css
background: #28a745 (green)
color: #fff
```

**Rejected** 🔴
```css
background: #dc3545 (red)
color: #fff
```

**Cancelled** ⚫
```css
background: #6c757d (gray)
color: #fff
```

### Buttons

**Primary Actions** (Approve, Submit, Borrow)
```css
background: #667eea (purple-blue gradient)
color: #fff
hover: #764ba2
```

**Success Actions** (Mark as Returned)
```css
background: #28a745 (green)
color: #fff
hover: #218838
```

**Danger Actions** (Reject, Cancel)
```css
background: #dc3545 (red)
color: #fff
hover: #c82333
```

**Info Actions** (View, Details)
```css
background: #007bff (blue)
color: #fff
hover: #0056b3
```

---

## 📱 Responsive Design

### Desktop View (> 1024px)
- Card view: 4 columns
- Full table display
- Side-by-side modals

### Tablet View (768px - 1024px)
- Card view: 3 columns
- Scrollable tables
- Full-width modals

### Mobile View (< 768px)
- Card view: 1 column
- Stacked table rows
- Full-screen modals

---

## 🔔 Notification Examples

### Success Notifications
```
┌─────────────────────────────────────┐
│ ✅ Success                          │
│ Borrow request submitted            │
│ successfully                        │
└─────────────────────────────────────┘
```

### Error Notifications
```
┌─────────────────────────────────────┐
│ ❌ Error                            │
│ Failed to submit request            │
│ Please try again                    │
└─────────────────────────────────────┘
```

### Warning Notifications
```
┌─────────────────────────────────────┐
│ ⚠️ Warning                          │
│ Only 2 items available              │
└─────────────────────────────────────┘
```

---

## 🎯 Key UI Elements

### Request Code Format
```
BR-YYYYMMDD-####

Example: BR-20260203-0001
         │  │       │
         │  │       └─ Sequential number (4 digits)
         │  └───────── Date (YYYYMMDD)
         └──────────── Prefix (Borrow Request)
```

### Quantity Display
```
Available: 5/10
           │ │
           │ └─ Total quantity
           └─── Available quantity
```

### Date Format
```
Feb 3, 2026
│   │  │
│   │  └─ Year
│   └──── Day
└──────── Month (abbreviated)
```

---

This visual guide shows exactly what users will see at each step of the borrow request process. The system is designed to be intuitive and user-friendly for both teachers and admins.
