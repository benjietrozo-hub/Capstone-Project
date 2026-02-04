# Reservations Page - Admin Guide

## Overview
The new **Reservations Management** page provides a centralized view for managing borrowed items and borrow requests in the admin account.

## Features

### 📋 Two Legacy Tabs

#### 1. **Borrowed List Tab** (📤)
- Shows all items currently borrowed by teachers
- Displays:
  - Request code
  - Teacher name and employee ID
  - Item name and code
  - Quantity borrowed
  - Borrowed date
  - Expected return date (color-coded: red if overdue, green if on time)
- Actions:
  - **Mark as Returned** - Process item returns

#### 2. **Borrow Requests Tab** (📋)
- Shows all pending borrow requests waiting for approval
- Displays:
  - Request code
  - Teacher name and employee ID
  - Item name and code
  - Quantity requested
  - Date requested
- Actions:
  - **Approve** - Opens modal to set quantity and expected return date
  - **Reject** - Opens modal to provide rejection reason

## Access
- **Route**: `/admin/reservations`
- **Navigation**: Available in the admin sidebar under "Reservations"
- **Role**: Admin only

## Design Features
- Legacy tab design with gradient backgrounds
- Responsive tables with hover effects
- Color-coded status indicators
- Modal forms for approval/rejection
- Real-time data updates after actions

## Usage Flow

### Approving a Request:
1. Go to "Borrow Requests" tab
2. Click "✓ Approve" on a pending request
3. Set quantity to approve
4. Set expected return date
5. Add optional admin notes
6. Click "Approve"

### Rejecting a Request:
1. Go to "Borrow Requests" tab
2. Click "✕ Reject" on a pending request
3. Provide reason for rejection
4. Click "Reject"

### Processing Returns:
1. Go to "Borrowed List" tab
2. Find the item to return
3. Click "📥 Mark as Returned"
4. Confirm the action

## Technical Details
- **Component**: `frontend/src/pages/admin/ReservationsPage.tsx`
- **API Endpoints**: Uses `adminAPI.getBorrowRequests()` with status filters
- **State Management**: React hooks for tab switching and modal management
- **Styling**: Consistent with existing admin pages design system

## Notes
- The page automatically refreshes data after any action
- Toast notifications confirm successful operations
- Empty states show helpful messages when no data is available
- Overdue items are highlighted in red in the Borrowed List
