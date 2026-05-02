# School Inventory Management System - Complete Structure Design

## System Overview

A comprehensive web-based inventory management system designed for educational institutions to manage tools, equipment, and resources. The system supports two user roles (Admin and Teacher) with distinct functionalities for borrowing, distribution, and inventory tracking.

## Architecture

### Technology Stack

**Frontend:**
- React 18 with TypeScript
- Vite (Build tool & Dev server)
- React Router (Client-side routing)
- Tailwind CSS (Styling)
- shadcn/ui (UI Component library)
- Axios (HTTP client)

**Backend:**
- Laravel 11 (PHP Framework)
- Laravel Sanctum (API Authentication)
- MySQL/SQLite (Database)
- RESTful API Architecture

**Real-time Communication:**
- PHP WebSocket Server (Custom implementation)
- Real-time notifications and updates

**Development Environment:**
- Windows-based deployment
- Batch scripts for service management

---

## System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT LAYER                             │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  React Frontend (TypeScript + Vite)                      │   │
│  │  - Admin Dashboard & Pages                               │   │
│  │  - Teacher Dashboard & Pages                             │   │
│  │  - Authentication Pages                                  │   │
│  │  - Real-time Notification UI                             │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                              ↕ HTTP/HTTPS
┌─────────────────────────────────────────────────────────────────┐
│                      APPLICATION LAYER                           │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  Laravel Backend (RESTful API)                           │   │
│  │  ┌────────────────┐  ┌────────────────┐                 │   │
│  │  │ Auth Module    │  │ Admin Module   │                 │   │
│  │  │ - Login        │  │ - Inventory    │                 │   │
│  │  │ - Register     │  │ - Requests     │                 │   │
│  │  │ - Password     │  │ - Teachers     │                 │   │
│  │  │   Reset        │  │ - Reports      │                 │   │
│  │  └────────────────┘  │ - Logs         │                 │   │
│  │                      │ - Purchase     │                 │   │
│  │  ┌────────────────┐  │   Orders       │                 │   │
│  │  │ Teacher Module │  │ - Suppliers    │                 │   │
│  │  │ - Browse       │  │ - Distribution │                 │   │
│  │  │   Inventory    │  │ - Trash        │                 │   │
│  │  │ - Borrow       │  └────────────────┘                 │   │
│  │  │   Requests     │                                     │   │
│  │  │ - Distribution │  ┌────────────────┐                 │   │
│  │  │   Requests     │  │ Notification   │                 │   │
│  │  │ - My Inventory │  │ Service        │                 │   │
│  │  │ - Groups       │  └────────────────┘                 │   │
│  │  └────────────────┘                                     │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                              ↕
┌─────────────────────────────────────────────────────────────────┐
│                    REAL-TIME LAYER                               │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  PHP WebSocket Server                                    │   │
│  │  - Real-time notifications                               │   │
│  │  - Live updates                                          │   │
│  │  - Connection management                                 │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                              ↕
┌─────────────────────────────────────────────────────────────────┐
│                       DATA LAYER                                 │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  MySQL/SQLite Database                                   │   │
│  │  - Users (Admins, Teachers)                              │   │
│  │  - Inventory (Tools & Equipment)                         │   │
│  │  - Transactions (Borrow, Distribution)                   │   │
│  │  - Logs & Audit Trail                                    │   │
│  │  - Notifications                                         │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                              ↕
┌─────────────────────────────────────────────────────────────────┐
│                    SCHEDULED TASKS LAYER                         │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  Laravel Scheduler (Cron Jobs)                           │   │
│  │  - Return reminders (1 day, 3 days before due)          │   │
│  │  - Overdue notifications (3x daily)                     │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

---

## User Roles & Permissions

### 1. Admin Role

**Access Level:** Full system control

**Core Responsibilities:**
- Manage inventory (CRUD operations)
- Process borrow requests (approve/reject/issue/return)
- Manage teachers (CRUD operations)
- Handle distribution requests
- Generate reports
- Monitor system logs
- Manage purchase orders
- Manage suppliers
- View and manage trash (soft deletes)

### 2. Teacher Role

**Access Level:** Limited to personal operations

**Core Responsibilities:**
- Browse available inventory
- Submit borrow requests
- Submit distribution requests
- Manage personal inventory
- Create and manage distribution groups
- View activity logs
- Track request status

---

## Core Modules & Functionalities

### Module 1: Authentication & Authorization

**Features:**
- Unified login system (Admin & Teacher)
- Teacher self-registration
- Password reset via email
- Token-based authentication (Laravel Sanctum)
- Role-based access control
- Login attempt logging

**Endpoints:**
```
POST /api/auth/login
POST /api/auth/teacher/register
POST /api/auth/forgot-password
POST /api/auth/reset-password
POST /api/admin/logout
POST /api/teacher/logout
GET  /api/admin/me
GET  /api/teacher/me
```

---

### Module 2: Inventory Management

**Admin Features:**
- Add/Edit/Delete inventory items
- Track quantities (total, available, borrowed)
- Manage item conditions
- Set item locations
- Upload item images
- Track acquisition dates and prices
- Categorize items
- Soft delete with trash management

**Teacher Features:**
- Browse available inventory
- View item details
- Filter by category
- Search functionality
- Manage personal inventory (items owned by teacher)

**Data Model:**
```
ToolEquipment
├── item_code (unique identifier)
├── item_name
├── description
├── category
├── quantity_total
├── quantity_available
├── quantity_borrowed
├── condition_status (excellent/good/fair/poor/damaged)
├── location
├── unit_price
├── image
├── acquisition_date
├── status (active/inactive)
└── notes
```

**Endpoints:**
```
Admin:
GET    /api/admin/inventory
POST   /api/admin/inventory
GET    /api/admin/inventory/{id}
PUT    /api/admin/inventory/{id}
DELETE /api/admin/inventory/{id}
GET    /api/admin/inventory-categories

Teacher:
GET    /api/teacher/inventory
GET    /api/teacher/inventory/{id}
GET    /api/teacher/inventory-categories
GET    /api/teacher/my-inventory
POST   /api/teacher/my-inventory
PUT    /api/teacher/my-inventory/{id}
DELETE /api/teacher/my-inventory/{id}
```

---

### Module 3: Borrow Request Management

**Teacher Workflow:**
1. Browse available inventory
2. Submit borrow request with:
   - Item selection
   - Quantity needed
   - Purpose/reason
   - Borrow date
   - Expected return date
3. Track request status
4. Cancel pending requests

**Admin Workflow:**
1. View all borrow requests
2. Review request details
3. Approve or reject with notes
4. Issue items (mark as borrowed)
5. Process returns
6. Track overdue items

**Request Statuses:**
- `pending` - Awaiting admin review
- `approved` - Approved by admin, ready for pickup
- `borrowed` - Items issued to teacher
- `returned` - Items returned
- `rejected` - Request denied
- `cancelled` - Cancelled by teacher
- `overdue` - Past expected return date

**Data Model:**
```
BorrowRequest
├── teacher_id
├── item_id
├── quantity_requested
├── purpose
├── borrow_date
├── expected_return_date
├── actual_return_date
├── status
├── admin_notes
├── condition_before
├── condition_after
└── timestamps
```

**Endpoints:**
```
Admin:
GET  /api/admin/requests
POST /api/admin/requests/{id}/approve
POST /api/admin/requests/{id}/reject
POST /api/admin/requests/{id}/issue
POST /api/admin/requests/{id}/return
GET  /api/admin/requests/statistics

Teacher:
GET    /api/teacher/requests
POST   /api/teacher/requests
GET    /api/teacher/requests/{id}
POST   /api/teacher/requests/{id}/cancel
GET    /api/teacher/requests/statistics
```

---

### Module 4: Distribution Management

**Purpose:** Permanent or long-term assignment of items to teachers

**Distribution Request Flow:**
1. Teacher submits distribution request
2. Admin reviews and approves/rejects
3. Upon approval, creates item distribution record
4. Items transferred to teacher's inventory
5. Track distribution history

**Distribution Groups:**
- Teachers can create groups for collaborative distribution
- Add/remove teachers from groups
- Group-based distribution requests

**Data Models:**
```
DistributionRequest
├── teacher_id
├── item_id
├── quantity_requested
├── reason
├── notes
├── status (pending/approved/rejected/distributed)
├── reviewed_by (admin_id)
├── admin_notes
├── reviewed_at
└── distribution_id

ItemDistribution
├── teacher_id
├── item_id
├── quantity
├── distribution_date
├── expected_return_date
├── actual_return_date
├── status (active/returned/cancelled)
├── notes
└── distributed_by (admin_id)

DistributionGroup
├── name
├── description
├── created_by (teacher_id)
└── members (teachers)
```

**Endpoints:**
```
Admin:
GET  /api/admin/distribution-requests
GET  /api/admin/distribution-requests/{id}
POST /api/admin/distribution-requests/{id}/approve
POST /api/admin/distribution-requests/{id}/reject
GET  /api/admin/distributions
POST /api/admin/distributions
POST /api/admin/distributions/{id}/return
POST /api/admin/distributions/{id}/cancel
GET  /api/admin/distribution
GET  /api/admin/distribution/groups

Teacher:
GET    /api/teacher/distribution-requests
POST   /api/teacher/distribution-requests
DELETE /api/teacher/distribution-requests/{id}
GET    /api/teacher/distribution-groups
POST   /api/teacher/distribution-groups
PUT    /api/teacher/distribution-groups/{id}
DELETE /api/teacher/distribution-groups/{id}
POST   /api/teacher/distribution-groups/{id}/add-teachers
POST   /api/teacher/distribution-groups/{id}/remove-teachers
```

---

### Module 5: Purchase Order Management

**Features:**
- Create purchase orders for new inventory
- Link to suppliers
- Track order status
- Manage order items with quantities and prices
- Calculate totals (subtotal, tax, shipping, discount)
- Approval workflow
- Receive items into inventory
- Order cancellation

**PO Statuses:**
- `draft` - Being prepared
- `pending` - Awaiting approval
- `approved` - Approved for ordering
- `ordered` - Sent to supplier
- `received` - Items received
- `cancelled` - Order cancelled

**Data Models:**
```
PurchaseOrder
├── po_number (auto-generated: PO-YYYYMM-0001)
├── po_date
├── expected_delivery_date
├── status
├── supplier_id
├── supplier_name
├── supplier_contact_info
├── company_info
├── subtotal
├── discount
├── tax
├── shipping_fee
├── total_amount
├── delivery_address
├── payment_method
├── payment_terms
├── requested_by
├── approved_by
├── approval_date
├── notes
└── terms_conditions

PurchaseOrderItem
├── purchase_order_id
├── item_name
├── description
├── quantity
├── unit_price
├── total_price
└── notes
```

**Endpoints:**
```
GET    /api/admin/purchase-orders
POST   /api/admin/purchase-orders
GET    /api/admin/purchase-orders/{id}
PUT    /api/admin/purchase-orders/{id}
DELETE /api/admin/purchase-orders/{id}
POST   /api/admin/purchase-orders/{id}/approve
POST   /api/admin/purchase-orders/{id}/cancel
POST   /api/admin/purchase-orders/{id}/receive
GET    /api/admin/purchase-orders/statistics
```

---

### Module 6: Supplier Management

**Features:**
- Maintain supplier database
- Track supplier contact information
- Link suppliers to purchase orders
- Supplier performance tracking

**Data Model:**
```
Supplier
├── name
├── contact_person
├── email
├── phone
├── address
├── city
├── state
├── postal_code
├── country
├── website
├── tax_id
├── payment_terms
├── notes
└── status (active/inactive)
```

**Endpoints:**
```
GET    /api/admin/suppliers
POST   /api/admin/suppliers
GET    /api/admin/suppliers/{id}
PUT    /api/admin/suppliers/{id}
DELETE /api/admin/suppliers/{id}
GET    /api/admin/suppliers/list
```

---

### Module 7: Teacher Management

**Admin Features:**
- View all teachers
- Add new teachers manually
- Edit teacher information
- Activate/deactivate accounts
- View teacher activity
- Track teacher's borrowed items

**Teacher Information:**
```
Teacher
├── employee_id
├── first_name
├── middle_initial
├── last_name
├── email (unique, used for login)
├── password (hashed)
├── department
├── position
├── phone
├── status (active/inactive/suspended)
└── timestamps
```

**Endpoints:**
```
GET    /api/admin/teachers
POST   /api/admin/teachers
GET    /api/admin/teachers/{id}
PUT    /api/admin/teachers/{id}
DELETE /api/admin/teachers/{id}
GET    /api/admin/teacher-departments
```

---

### Module 8: Dashboard & Analytics

**Admin Dashboard:**
- Total inventory count
- Available vs borrowed items
- Pending requests count
- Overdue items count
- Recent activities
- Low stock alerts
- Request statistics
- Distribution statistics
- Purchase order summary

**Teacher Dashboard:**
- Available items count
- Active borrow requests
- Active distributions
- Overdue items (if any)
- Recent notifications
- Quick actions (new request, browse inventory)

**Endpoints:**
```
GET /api/admin/dashboard
GET /api/admin/dashboard/statistics
GET /api/teacher/dashboard
```

---

### Module 9: Reports & Logs

**Report Types:**
- Inventory reports
- Borrow history reports
- Teacher activity reports
- Overdue items reports
- Distribution reports
- Purchase order reports
- Custom date range reports

**System Logs:**
- User login attempts
- Inventory changes
- Request status changes
- Admin actions
- System events
- Audit trail

**Data Models:**
```
SystemLog
├── log_type (auth/inventory/request/distribution/purchase_order)
├── action (create/update/delete/approve/reject)
├── user_type (admin/teacher)
├── user_id
├── description
├── ip_address
├── user_agent
├── reference_type
├── reference_id
└── metadata (JSON)

InventoryLog
├── item_id
├── action (add/update/delete/borrow/return/distribute)
├── quantity_change
├── quantity_before
├── quantity_after
├── performed_by
├── notes
└── timestamp

Report
├── title
├── type
├── generated_by (admin_id)
├── date_from
├── date_to
├── filters (JSON)
├── data (JSON)
└── generated_at
```

**Endpoints:**
```
GET    /api/admin/reports
POST   /api/admin/reports
GET    /api/admin/reports/{id}
DELETE /api/admin/reports/{id}
GET    /api/admin/logs
GET    /api/admin/logs/{id}
GET    /api/admin/logs/statistics
GET    /api/teacher/activity-logs
```

---

### Module 10: Notification System

**Notification Types:**
- Request status updates
- Approval/rejection notifications
- Return reminders (1 day, 3 days before due)
- Overdue notifications
- Distribution updates
- System announcements

**Delivery Methods:**
- In-app notifications (real-time via WebSocket)
- Email notifications (for critical events)

**Features:**
- Real-time push notifications
- Notification history
- Mark as read/unread
- Delete notifications
- Unread count badge

**Data Model:**
```
Notification
├── user_type (admin/teacher)
├── user_id
├── type (request/approval/reminder/overdue/distribution)
├── title
├── message
├── data (JSON - additional context)
├── read_at
├── created_at
└── reference_type/reference_id
```

**Endpoints:**
```
GET    /api/admin/notifications
GET    /api/admin/notifications/unread-count
POST   /api/admin/notifications/{id}/read
POST   /api/admin/notifications/mark-all-read
DELETE /api/admin/notifications/{id}
DELETE /api/admin/notifications/read/all

GET    /api/teacher/notifications
GET    /api/teacher/notifications/unread-count
POST   /api/teacher/notifications/{id}/read
POST   /api/teacher/notifications/mark-all-read
DELETE /api/teacher/notifications/{id}
DELETE /api/teacher/notifications/read/all
```

---

### Module 11: Trash Management

**Features:**
- Soft delete for all major entities
- View deleted items by type
- Restore deleted items
- Permanent deletion
- Empty trash (bulk delete)
- Track who deleted items

**Supported Entity Types:**
- Inventory items
- Borrow requests
- Teachers
- Purchase orders
- Suppliers
- Distribution requests

**Endpoints:**
```
GET    /api/admin/trash
GET    /api/admin/trash/stats
POST   /api/admin/trash/{type}/{id}/restore
DELETE /api/admin/trash/{type}/{id}
DELETE /api/admin/trash/empty
```

---

## Scheduled Tasks (Cron Jobs)

**Return Reminders:**
- Runs daily at 09:00 AM
- Sends reminders 1 day before due date
- Sends reminders 3 days before due date

**Overdue Notifications:**
- Runs 3 times daily (08:00, 14:00, 18:00)
- Checks for items past expected return date
- Sends notifications to teachers and admins

**Command:**
```bash
php artisan reminders:send-return --days=1
php artisan reminders:send-return --days=3
php artisan reminders:send-overdue
```

---

## Database Schema Summary

**Core Tables:**
1. `admins` - Admin user accounts
2. `teachers` - Teacher user accounts
3. `tools_equipment` - Inventory items
4. `borrow_requests` - Borrow transactions
5. `distribution_requests` - Distribution requests
6. `item_distributions` - Active distributions
7. `distribution_groups` - Teacher groups
8. `purchase_orders` - Purchase orders
9. `purchase_order_items` - PO line items
10. `suppliers` - Supplier information
11. `notifications` - User notifications
12. `system_logs` - Audit trail
13. `inventory_logs` - Inventory changes
14. `reports` - Generated reports
15. `login_attempts` - Authentication logs

**Relationships:**
- Teacher → BorrowRequests (1:N)
- Teacher → DistributionRequests (1:N)
- Teacher → ItemDistributions (1:N)
- ToolEquipment → BorrowRequests (1:N)
- ToolEquipment → DistributionRequests (1:N)
- Admin → SystemLogs (1:N)
- Supplier → PurchaseOrders (1:N)
- PurchaseOrder → PurchaseOrderItems (1:N)

---

## Frontend Structure

### Page Routes

**Public Routes:**
```
/login                  - Unified login page
/register               - Teacher registration
/forgot-password        - Password reset request
/reset-password         - Password reset form
```

**Admin Routes:**
```
/admin/dashboard        - Admin dashboard
/admin/inventory        - Inventory management
/admin/requests         - Borrow requests
/admin/reservations     - Reservations (legacy)
/admin/teachers         - Teacher management
/admin/reports          - Reports
/admin/logs             - System logs
/admin/purchase-orders  - Purchase orders
/admin/suppliers        - Supplier management
/admin/distribution     - Distribution list
/admin/trash            - Trash management
```

**Teacher Routes:**
```
/teacher/dashboard              - Teacher dashboard
/teacher/inventory              - Browse inventory
/teacher/my-requests            - My borrow requests
/teacher/reservations           - My reservations
/teacher/activity-logs          - Activity logs
/teacher/distribution-groups    - Distribution groups
/teacher/distribution-requests  - Distribution requests
```

### Component Structure

```
src/
├── components/
│   ├── common/           - Shared components
│   ├── ui/               - shadcn/ui components
│   ├── AppSidebar.tsx    - Navigation sidebar
│   └── NotificationProfile.tsx - Notification dropdown
├── pages/
│   ├── admin/            - Admin pages
│   ├── teacher/          - Teacher pages
│   ├── LoginPage.tsx
│   ├── RegisterPage.tsx
│   ├── ForgotPasswordPage.tsx
│   └── ResetPasswordPage.tsx
├── context/
│   ├── AuthContext.tsx   - Authentication state
│   └── NotificationContext.tsx - Notification state
├── hooks/
│   └── use-toast.ts      - Toast notifications
├── lib/
│   └── utils.ts          - Utility functions
├── utils/
│   ├── formatters.js     - Date/currency formatters
│   └── deviceDetection.ts - Device detection
├── App.tsx               - Main app component
└── main.tsx              - Entry point
```

---

## Security Features

1. **Authentication:**
   - Token-based auth (Laravel Sanctum)
   - Secure password hashing (bcrypt)
   - CSRF protection
   - Session management

2. **Authorization:**
   - Role-based access control
   - Route protection (middleware)
   - API endpoint guards

3. **Data Protection:**
   - SQL injection prevention (Eloquent ORM)
   - XSS protection
   - Input validation
   - Soft deletes for data recovery

4. **Audit Trail:**
   - Login attempt logging
   - System action logging
   - IP address tracking
   - User agent tracking

---

## Deployment & Operations

**Services:**
1. Laravel Backend (PHP)
2. React Frontend (Vite dev server / built static files)
3. WebSocket Server (PHP)
4. MySQL/SQLite Database
5. Laravel Scheduler (Cron)

**Startup Scripts:**
- `start-all-services.bat` - Start all services
- `backend/create-root-admin.bat` - Create admin account
- `backend/create-test-teacher.bat` - Create test teacher
- `websocket/start-websocket.bat` - Start WebSocket server

**Configuration Files:**
- `backend/.env` - Backend configuration
- `frontend/.env` - Frontend configuration
- `backend/config/*` - Laravel configuration files

---

## Key Features Summary

✅ Multi-role user management (Admin/Teacher)
✅ Comprehensive inventory tracking
✅ Borrow request workflow with approval
✅ Distribution management system
✅ Purchase order management
✅ Supplier database
✅ Real-time notifications
✅ Automated reminders and overdue alerts
✅ Detailed audit logging
✅ Report generation
✅ Soft delete with trash management
✅ Teacher self-registration
✅ Password reset functionality
✅ Distribution groups for collaboration
✅ Personal teacher inventory
✅ Responsive UI design
✅ Search and filter capabilities
✅ Statistics and analytics dashboards

---

## Future Enhancement Possibilities

- Mobile app (React Native)
- Barcode/QR code scanning
- Advanced reporting with charts
- Email notification templates
- SMS notifications
- File attachments for items
- Maintenance scheduling
- Item reservation system
- Multi-language support
- Export to Excel/PDF
- Advanced search with filters
- Item history timeline
- Batch operations
- API documentation (Swagger)
- Role permissions customization

---

**Document Version:** 1.0  
**Last Updated:** March 23, 2026  
**System Status:** Production Ready
