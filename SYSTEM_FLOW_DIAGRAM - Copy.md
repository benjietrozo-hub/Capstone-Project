# School Inventory Management System - Flow Diagram

## Main System Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                            ADMIN ROLE                                │
│                     (In-charge Personnel)                            │
└──────────────────┬──────────────────────────────────────────────────┘
                   │
                   │ Manages & Controls
                   │
    ┌──────────────┼──────────────┬──────────────┬──────────────┐
    │              │               │              │              │
    ▼              ▼               ▼              ▼              ▼
┌─────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐
│Teachers │  │Inventory │  │ Borrow   │  │Purchase  │  │Suppliers │
│Management│  │Management│  │ Requests │  │ Orders   │  │Management│
└─────────┘  └──────────┘  └──────────┘  └──────────┘  └──────────┘
    │              │               │              │              │
    │              │               │              │              │
    │              │               ▼              │              │
    │              │        ┌──────────┐          │              │
    │              │        │Distribution        │              │
    │              │        │ Requests │          │              │
    │              │        └──────────┘          │              │
    │              │               │              │              │
    │              └───────────────┼──────────────┘              │
    │                              │                             │
    │                              ▼                             │
    │                    ┌──────────────────┐                   │
    │                    │   DATABASE       │◄──────────────────┘
    │                    │  (MySQL/SQLite)  │
    │                    └──────────────────┘
    │                              │
    │                              │ Reads Data
    │                              │
    └──────────────────────────────┼────────────────────────────┐
                                   │                            │
                                   ▼                            ▼
                          ┌─────────────────┐         ┌─────────────────┐
                          │  TEACHER ROLE   │         │  REPORTS &      │
                          │                 │         │  SYSTEM LOGS    │
                          └─────────────────┘         └─────────────────┘
                                   │
                                   │ Submits & Views
                                   │
                    ┌──────────────┼──────────────┐
                    │              │              │
                    ▼              ▼              ▼
            ┌──────────┐   ┌──────────┐   ┌──────────┐
            │  Browse  │   │  Borrow  │   │Distribution
            │Inventory │   │ Requests │   │ Requests │
            └──────────┘   └──────────┘   └──────────┘
```

---

## Detailed Workflow Diagrams

### 1. Inventory Management Flow

```
┌──────────────────┐
│  ADMIN           │
│  (In-charge)     │
└────────┬─────────┘
         │
         │ Inputs Data
         │
         ▼
┌─────────────────────────────────┐
│   INVENTORY MANAGEMENT          │
│                                 │
│  Actions:                       │
│  • Add New Items                │
│  • Update Item Details          │
│  • Delete Items (Soft Delete)   │
│  • Track Quantities             │
│  • Set Conditions               │
│  • Upload Images                │
│  • Categorize Items             │
└────────┬────────────────────────┘
         │
         │ Stores/Updates
         │
         ▼
┌─────────────────────────────────┐
│   DATABASE                      │
│   tools_equipment table         │
│                                 │
│  • item_code                    │
│  • item_name                    │
│  • category                     │
│  • quantity_total               │
│  • quantity_available           │
│  • quantity_borrowed            │
│  • condition_status             │
│  • location                     │
│  • unit_price                   │
└────────┬────────────────────────┘
         │
         │ View Data
         │
         ▼
┌─────────────────────────────────┐
│   TEACHER                       │
│                                 │
│  Actions:                       │
│  • Browse Available Items       │
│  • Search & Filter              │
│  • View Item Details            │
│  • Check Availability           │
└─────────────────────────────────┘
```


### 2. Borrow Request Workflow

```
┌──────────────────┐
│   TEACHER        │
└────────┬─────────┘
         │
         │ 1. Submits Request
         │
         ▼
┌─────────────────────────────────┐
│   BORROW REQUEST                │
│                                 │
│  Request Details:               │
│  • Select Item                  │
│  • Quantity Needed              │
│  • Purpose/Reason               │
│  • Borrow Date                  │
│  • Expected Return Date         │
│                                 │
│  Status: PENDING                │
└────────┬────────────────────────┘
         │
         │ 2. Notification Sent
         │
         ▼
┌─────────────────────────────────┐
│   ADMIN (In-charge)             │
│                                 │
│  Reviews Request:               │
│  • Check Item Availability      │
│  • Verify Teacher Info          │
│  • Review Purpose               │
└────────┬────────────────────────┘
         │
         │ 3. Decision
         │
    ┌────┴────┐
    │         │
    ▼         ▼
┌────────┐ ┌────────┐
│APPROVE │ │REJECT  │
└───┬────┘ └───┬────┘
    │          │
    │          │ 4a. Rejection Notice
    │          │
    │          ▼
    │      ┌──────────────┐
    │      │  TEACHER     │
    │      │  (Notified)  │
    │      └──────────────┘
    │
    │ 4b. Approval Notice
    │
    ▼
┌─────────────────────────────────┐
│   Status: APPROVED              │
│   Ready for Pickup              │
└────────┬────────────────────────┘
         │
         │ 5. Issue Items
         │
         ▼
┌─────────────────────────────────┐
│   Status: BORROWED              │
│                                 │
│  • Update Quantities            │
│  • Record Condition Before      │
│  • Set Borrow Date              │
└────────┬────────────────────────┘
         │
         │ 6. Teacher Uses Items
         │
         ▼
┌─────────────────────────────────┐
│   AUTOMATED REMINDERS           │
│                                 │
│  • 3 days before due            │
│  • 1 day before due             │
│  • Overdue notifications        │
│    (3x daily if not returned)   │
└────────┬────────────────────────┘
         │
         │ 7. Return Items
         │
         ▼
┌─────────────────────────────────┐
│   ADMIN PROCESSES RETURN        │
│                                 │
│  • Inspect Item Condition       │
│  • Record Condition After       │
│  • Update Quantities            │
│  • Set Actual Return Date       │
│                                 │
│  Status: RETURNED               │
└─────────────────────────────────┘
```


### 3. Distribution Request Workflow

```
┌──────────────────┐
│   TEACHER        │
└────────┬─────────┘
         │
         │ 1. Submits Distribution Request
         │    (For permanent/long-term assignment)
         │
         ▼
┌─────────────────────────────────┐
│   DISTRIBUTION REQUEST          │
│                                 │
│  Request Details:               │
│  • Select Item                  │
│  • Quantity Requested           │
│  • Reason/Justification         │
│  • Notes                        │
│                                 │
│  Status: PENDING                │
└────────┬────────────────────────┘
         │
         │ 2. Notification Sent
         │
         ▼
┌─────────────────────────────────┐
│   ADMIN (In-charge)             │
│                                 │
│  Reviews Request:               │
│  • Check Item Availability      │
│  • Evaluate Justification       │
│  • Verify Teacher Department    │
└────────┬────────────────────────┘
         │
         │ 3. Decision
         │
    ┌────┴────┐
    │         │
    ▼         ▼
┌────────┐ ┌────────┐
│APPROVE │ │REJECT  │
└───┬────┘ └───┬────┘
    │          │
    │          │ 4a. Rejection Notice
    │          │
    │          ▼
    │      ┌──────────────┐
    │      │  TEACHER     │
    │      │  (Notified)  │
    │      └──────────────┘
    │
    │ 4b. Creates Distribution
    │
    ▼
┌─────────────────────────────────┐
│   ITEM DISTRIBUTION             │
│                                 │
│  • Transfer Items to Teacher    │
│  • Update Inventory Quantities  │
│  • Record Distribution Date     │
│  • Set Expected Return (if any) │
│                                 │
│  Status: DISTRIBUTED            │
└────────┬────────────────────────┘
         │
         │ 5. Items Added to
         │
         ▼
┌─────────────────────────────────┐
│   TEACHER'S INVENTORY           │
│                                 │
│  Teacher can now:               │
│  • View their items             │
│  • Manage personal inventory    │
│  • Track item status            │
└─────────────────────────────────┘
```


### 4. Purchase Order Workflow

```
┌──────────────────┐
│   ADMIN          │
│   (In-charge)    │
└────────┬─────────┘
         │
         │ 1. Creates Purchase Order
         │
         ▼
┌─────────────────────────────────┐
│   PURCHASE ORDER                │
│                                 │
│  PO Details:                    │
│  • PO Number (Auto-generated)   │
│  • Select Supplier              │
│  • Add Items & Quantities       │
│  • Set Prices                   │
│  • Calculate Totals             │
│  • Delivery Information         │
│  • Payment Terms                │
│                                 │
│  Status: DRAFT                  │
└────────┬────────────────────────┘
         │
         │ 2. Submit for Approval
         │
         ▼
┌─────────────────────────────────┐
│   Status: PENDING               │
└────────┬────────────────────────┘
         │
         │ 3. Review & Approve
         │
         ▼
┌─────────────────────────────────┐
│   Status: APPROVED              │
│                                 │
│  • Approval Date Recorded       │
│  • Approved By (Admin)          │
└────────┬────────────────────────┘
         │
         │ 4. Send to Supplier
         │
         ▼
┌─────────────────────────────────┐
│   SUPPLIER                      │
│                                 │
│  • Receives PO                  │
│  • Processes Order              │
│  • Prepares Items               │
│  • Ships to School              │
└────────┬────────────────────────┘
         │
         │ 5. Items Delivered
         │
         ▼
┌─────────────────────────────────┐
│   ADMIN RECEIVES ITEMS          │
│                                 │
│  Actions:                       │
│  • Verify Items vs PO           │
│  • Check Quantities             │
│  • Inspect Quality              │
│  • Mark as Received             │
└────────┬────────────────────────┘
         │
         │ 6. Add to Inventory
         │
         ▼
┌─────────────────────────────────┐
│   INVENTORY UPDATED             │
│                                 │
│  • New items added              │
│  • Quantities increased         │
│  • Acquisition dates recorded   │
│  • Prices updated               │
│                                 │
│  Status: RECEIVED               │
└─────────────────────────────────┘
```


### 5. Teacher Management Flow

```
┌──────────────────┐
│   ADMIN          │
│   (In-charge)    │
└────────┬─────────┘
         │
         │ Inputs Data
         │
         ▼
┌─────────────────────────────────┐
│   TEACHER MANAGEMENT            │
│                                 │
│  Actions:                       │
│  • Add New Teacher              │
│  • Update Teacher Info          │
│  • Activate/Deactivate          │
│  • View Teacher Activity        │
│  • Track Borrowed Items         │
└────────┬────────────────────────┘
         │
         │ Stores/Updates
         │
         ▼
┌─────────────────────────────────┐
│   DATABASE                      │
│   teachers table                │
│                                 │
│  • employee_id                  │
│  • name (first, middle, last)   │
│  • email (login credential)     │
│  • department                   │
│  • position                     │
│  • phone                        │
│  • status                       │
└────────┬────────────────────────┘
         │
         │ View Data
         │
         ▼
┌─────────────────────────────────┐
│   ADMIN DASHBOARD               │
│                                 │
│  • Total Teachers               │
│  • Active Teachers              │
│  • Teacher Activity Logs        │
│  • Items per Teacher            │
└─────────────────────────────────┘


┌──────────────────┐
│   TEACHER        │
│   (Self-Register)│
└────────┬─────────┘
         │
         │ Registration
         │
         ▼
┌─────────────────────────────────┐
│   REGISTRATION FORM             │
│                                 │
│  Required Info:                 │
│  • Employee ID                  │
│  • Full Name                    │
│  • Email                        │
│  • Password                     │
│  • Department                   │
│  • Position                     │
│  • Phone                        │
└────────┬────────────────────────┘
         │
         │ Creates Account
         │
         ▼
┌─────────────────────────────────┐
│   TEACHER ACCOUNT CREATED       │
│                                 │
│  Status: ACTIVE                 │
│  Can now login and use system   │
└─────────────────────────────────┘
```


### 6. Notification System Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    SYSTEM EVENTS                             │
└────────┬────────────────────────────────────────────────────┘
         │
         │ Triggers
         │
    ┌────┴────┬────────┬────────┬────────┬────────┐
    │         │        │        │        │        │
    ▼         ▼        ▼        ▼        ▼        ▼
┌────────┐┌────────┐┌────────┐┌────────┐┌────────┐┌────────┐
│Request ││Request ││Item    ││Return  ││Overdue ││Distri- │
│Created ││Status  ││Issued  ││Reminder││Alert   ││bution  │
│        ││Changed ││        ││        ││        ││Update  │
└───┬────┘└───┬────┘└───┬────┘└───┬────┘└───┬────┘└───┬────┘
    │         │        │        │        │        │
    └─────────┴────────┴────────┴────────┴────────┘
                       │
                       │ Creates Notification
                       │
                       ▼
         ┌─────────────────────────────┐
         │   NOTIFICATION SERVICE      │
         │                             │
         │  • Creates notification     │
         │  • Stores in database       │
         │  • Determines recipients    │
         └─────────┬───────────────────┘
                   │
                   │ Sends via
                   │
            ┌──────┴──────┐
            │             │
            ▼             ▼
    ┌──────────────┐  ┌──────────────┐
    │  WEBSOCKET   │  │    EMAIL     │
    │  (Real-time) │  │  (Critical)  │
    └──────┬───────┘  └──────┬───────┘
           │                 │
           │                 │
           └────────┬────────┘
                    │
                    │ Delivers to
                    │
            ┌───────┴────────┐
            │                │
            ▼                ▼
    ┌──────────────┐  ┌──────────────┐
    │    ADMIN     │  │   TEACHER    │
    │              │  │              │
    │ • Dashboard  │  │ • Dashboard  │
    │ • Bell Icon  │  │ • Bell Icon  │
    │ • Badge      │  │ • Badge      │
    │   Count      │  │   Count      │
    └──────────────┘  └──────────────┘
```


### 7. Reports & Logs Flow

```
┌──────────────────┐
│   ADMIN          │
│   (In-charge)    │
└────────┬─────────┘
         │
         │ Requests Report
         │
         ▼
┌─────────────────────────────────┐
│   REPORT GENERATION             │
│                                 │
│  Select Report Type:            │
│  • Inventory Report             │
│  • Borrow History               │
│  • Teacher Activity             │
│  • Overdue Items                │
│  • Distribution Report          │
│  • Purchase Order Report        │
│                                 │
│  Set Parameters:                │
│  • Date Range                   │
│  • Filters (category, status)   │
│  • Teacher/Department           │
└────────┬────────────────────────┘
         │
         │ Queries Database
         │
         ▼
┌─────────────────────────────────┐
│   DATABASE                      │
│                                 │
│  Aggregates data from:          │
│  • tools_equipment              │
│  • borrow_requests              │
│  • distribution_requests        │
│  • purchase_orders              │
│  • inventory_logs               │
│  • system_logs                  │
└────────┬────────────────────────┘
         │
         │ Generates Report
         │
         ▼
┌─────────────────────────────────┐
│   REPORT OUTPUT                 │
│                                 │
│  • Summary Statistics           │
│  • Detailed Tables              │
│  • Charts/Graphs                │
│  • Export Options (PDF/Excel)   │
└─────────────────────────────────┘


┌─────────────────────────────────┐
│   SYSTEM ACTIVITY               │
│                                 │
│  All Actions:                   │
│  • User Login/Logout            │
│  • Inventory Changes            │
│  • Request Status Changes       │
│  • Admin Actions                │
│  • Data Modifications           │
└────────┬────────────────────────┘
         │
         │ Automatically Logs
         │
         ▼
┌─────────────────────────────────┐
│   SYSTEM LOGS                   │
│                                 │
│  Recorded Data:                 │
│  • Timestamp                    │
│  • User (Admin/Teacher)         │
│  • Action Type                  │
│  • Description                  │
│  • IP Address                   │
│  • User Agent                   │
│  • Reference ID                 │
└────────┬────────────────────────┘
         │
         │ View Data
         │
         ▼
┌─────────────────────────────────┐
│   ADMIN LOGS PAGE               │
│                                 │
│  Features:                      │
│  • Search & Filter              │
│  • Date Range Selection         │
│  • User Filter                  │
│  • Action Type Filter           │
│  • Export Logs                  │
└─────────────────────────────────┘
```


### 8. Authentication Flow

```
┌──────────────────┐
│   USER           │
│ (Admin/Teacher)  │
└────────┬─────────┘
         │
         │ 1. Access System
         │
         ▼
┌─────────────────────────────────┐
│   LOGIN PAGE                    │
│                                 │
│  Enter Credentials:             │
│  • Email                        │
│  • Password                     │
└────────┬────────────────────────┘
         │
         │ 2. Submit
         │
         ▼
┌─────────────────────────────────┐
│   AUTHENTICATION SERVICE        │
│                                 │
│  Validates:                     │
│  • Email exists                 │
│  • Password correct             │
│  • Account active               │
│  • Logs attempt                 │
└────────┬────────────────────────┘
         │
         │ 3. Check Credentials
         │
    ┌────┴────┐
    │         │
    ▼         ▼
┌────────┐ ┌────────┐
│SUCCESS │ │ FAIL   │
└───┬────┘ └───┬────┘
    │          │
    │          │ 4a. Error Message
    │          │
    │          ▼
    │      ┌──────────────┐
    │      │  LOGIN PAGE  │
    │      │  (Try Again) │
    │      └──────────────┘
    │
    │ 4b. Generate Token
    │
    ▼
┌─────────────────────────────────┐
│   SANCTUM TOKEN                 │
│                                 │
│  • Creates API token            │
│  • Stores in database           │
│  • Returns to client            │
└────────┬────────────────────────┘
         │
         │ 5. Store Token
         │
         ▼
┌─────────────────────────────────┐
│   CLIENT (Browser)              │
│                                 │
│  • Saves token in localStorage  │
│  • Includes in API requests     │
│  • Maintains session            │
└────────┬────────────────────────┘
         │
         │ 6. Redirect Based on Role
         │
    ┌────┴────┐
    │         │
    ▼         ▼
┌────────┐ ┌────────┐
│ ADMIN  │ │TEACHER │
│Dashboard│ │Dashboard
└────────┘ └────────┘


┌──────────────────┐
│   TEACHER        │
│   (New User)     │
└────────┬─────────┘
         │
         │ 1. Click Register
         │
         ▼
┌─────────────────────────────────┐
│   REGISTRATION PAGE             │
│                                 │
│  Fill Form:                     │
│  • Employee ID                  │
│  • Full Name                    │
│  • Email                        │
│  • Password                     │
│  • Department                   │
│  • Position                     │
│  • Phone                        │
└────────┬────────────────────────┘
         │
         │ 2. Submit
         │
         ▼
┌─────────────────────────────────┐
│   VALIDATION                    │
│                                 │
│  Checks:                        │
│  • Email unique                 │
│  • Employee ID unique           │
│  • Required fields filled       │
│  • Password strength            │
└────────┬────────────────────────┘
         │
         │ 3. Create Account
         │
         ▼
┌─────────────────────────────────┐
│   TEACHER ACCOUNT CREATED       │
│                                 │
│  • Status: Active               │
│  • Can login immediately        │
│  • Welcome notification sent    │
└─────────────────────────────────┘


┌──────────────────┐
│   USER           │
│ (Forgot Password)│
└────────┬─────────┘
         │
         │ 1. Click Forgot Password
         │
         ▼
┌─────────────────────────────────┐
│   FORGOT PASSWORD PAGE          │
│                                 │
│  Enter Email:                   │
│  • Registered email address     │
└────────┬────────────────────────┘
         │
         │ 2. Submit
         │
         ▼
┌─────────────────────────────────┐
│   PASSWORD RESET SERVICE        │
│                                 │
│  • Generates reset token        │
│  • Creates reset link           │
│  • Sends email                  │
└────────┬────────────────────────┘
         │
         │ 3. Email Sent
         │
         ▼
┌─────────────────────────────────┐
│   USER EMAIL                    │
│                                 │
│  • Reset link with token        │
│  • Expires in 60 minutes        │
└────────┬────────────────────────┘
         │
         │ 4. Click Link
         │
         ▼
┌─────────────────────────────────┐
│   RESET PASSWORD PAGE           │
│                                 │
│  Enter:                         │
│  • New Password                 │
│  • Confirm Password             │
└────────┬────────────────────────┘
         │
         │ 5. Submit
         │
         ▼
┌─────────────────────────────────┐
│   PASSWORD UPDATED              │
│                                 │
│  • Password changed             │
│  • Can login with new password  │
│  • Redirect to login            │
└─────────────────────────────────┘
```


### 9. Distribution Groups Flow

```
┌──────────────────┐
│   TEACHER        │
└────────┬─────────┘
         │
         │ 1. Creates Group
         │
         ▼
┌─────────────────────────────────┐
│   DISTRIBUTION GROUP            │
│                                 │
│  Group Details:                 │
│  • Group Name                   │
│  • Description                  │
│  • Created By (Teacher)         │
└────────┬────────────────────────┘
         │
         │ 2. Add Members
         │
         ▼
┌─────────────────────────────────┐
│   ADD TEACHERS TO GROUP         │
│                                 │
│  • Search teachers              │
│  • Select multiple teachers     │
│  • Add to group                 │
└────────┬────────────────────────┘
         │
         │ 3. Group Created
         │
         ▼
┌─────────────────────────────────┐
│   ACTIVE GROUP                  │
│                                 │
│  Members can:                   │
│  • View group items             │
│  • Collaborate on requests      │
│  • Share resources              │
│                                 │
│  Creator can:                   │
│  • Add/Remove members           │
│  • Edit group details           │
│  • Delete group                 │
└─────────────────────────────────┘
```

### 10. Trash Management Flow

```
┌──────────────────┐
│   ADMIN          │
│   (In-charge)    │
└────────┬─────────┘
         │
         │ 1. Deletes Item
         │
         ▼
┌─────────────────────────────────┐
│   SOFT DELETE                   │
│                                 │
│  Item Types:                    │
│  • Inventory Items              │
│  • Borrow Requests              │
│  • Teachers                     │
│  • Purchase Orders              │
│  • Suppliers                    │
│  • Distribution Requests        │
│                                 │
│  Action:                        │
│  • Sets deleted_at timestamp    │
│  • Records deleted_by (admin)   │
│  • Hides from main views        │
└────────┬────────────────────────┘
         │
         │ 2. Moved to Trash
         │
         ▼
┌─────────────────────────────────┐
│   TRASH PAGE                    │
│                                 │
│  View Options:                  │
│  • Filter by type               │
│  • Search deleted items         │
│  • View deletion date           │
│  • See who deleted              │
└────────┬────────────────────────┘
         │
         │ 3. Admin Decision
         │
    ┌────┴────┐
    │         │
    ▼         ▼
┌────────┐ ┌────────┐
│RESTORE │ │PERMANENT
│        │ │DELETE  │
└───┬────┘ └───┬────┘
    │          │
    │          │ 4a. Permanently Deleted
    │          │     (Cannot be recovered)
    │          │
    │          ▼
    │      ┌──────────────┐
    │      │  REMOVED     │
    │      │  FROM DB     │
    │      └──────────────┘
    │
    │ 4b. Restored
    │
    ▼
┌─────────────────────────────────┐
│   ITEM RESTORED                 │
│                                 │
│  • Clears deleted_at            │
│  • Returns to main view         │
│  • Logs restoration action      │
│  • Fully functional again       │
└─────────────────────────────────┘
```


### 11. Scheduled Tasks Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    LARAVEL SCHEDULER                         │
│                    (Cron Jobs)                               │
└────────┬────────────────────────────────────────────────────┘
         │
         │ Runs Automatically
         │
    ┌────┴────┬────────┬────────┐
    │         │        │        │
    ▼         ▼        ▼        ▼
┌────────┐┌────────┐┌────────┐┌────────┐
│ 09:00  ││ 08:00  ││ 14:00  ││ 18:00  │
│ Daily  ││ Daily  ││ Daily  ││ Daily  │
└───┬────┘└───┬────┘└───┬────┘└───┬────┘
    │         │        │        │
    │         └────────┴────────┘
    │                  │
    │                  │ Overdue Check
    │                  │
    │                  ▼
    │         ┌─────────────────────────────┐
    │         │  OVERDUE NOTIFICATIONS      │
    │         │                             │
    │         │  Checks:                    │
    │         │  • Borrowed items           │
    │         │  • Past expected return     │
    │         │  • Not yet returned         │
    │         │                             │
    │         │  Sends:                     │
    │         │  • Notification to teacher  │
    │         │  • Alert to admin           │
    │         │  • Email (if configured)    │
    │         └─────────────────────────────┘
    │
    │ Return Reminders
    │
    ▼
┌─────────────────────────────────┐
│   RETURN REMINDERS              │
│                                 │
│  3 Days Before Due:             │
│  • Query borrowed items         │
│  • Due in 3 days                │
│  • Send reminder notification   │
│                                 │
│  1 Day Before Due:              │
│  • Query borrowed items         │
│  • Due tomorrow                 │
│  • Send urgent reminder         │
└────────┬────────────────────────┘
         │
         │ Creates Notifications
         │
         ▼
┌─────────────────────────────────┐
│   NOTIFICATION SERVICE          │
│                                 │
│  • Creates notification record  │
│  • Sends via WebSocket          │
│  • Sends email (if enabled)     │
│  • Updates notification count   │
└────────┬────────────────────────┘
         │
         │ Delivers to
         │
         ▼
┌─────────────────────────────────┐
│   TEACHER                       │
│                                 │
│  Receives:                      │
│  • In-app notification          │
│  • Email reminder               │
│  • Dashboard alert              │
└─────────────────────────────────┘
```


---

## Data Flow Architecture

### Complete System Data Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                         PRESENTATION LAYER                       │
│                                                                  │
│  ┌──────────────────────┐         ┌──────────────────────┐     │
│  │   ADMIN INTERFACE    │         │  TEACHER INTERFACE   │     │
│  │                      │         │                      │     │
│  │  • Dashboard         │         │  • Dashboard         │     │
│  │  • Inventory Mgmt    │         │  • Browse Inventory  │     │
│  │  • Request Mgmt      │         │  • My Requests       │     │
│  │  • Teacher Mgmt      │         │  • My Inventory      │     │
│  │  • Purchase Orders   │         │  • Distribution      │     │
│  │  • Suppliers         │         │  • Groups            │     │
│  │  • Reports & Logs    │         │  • Activity Logs     │     │
│  │  • Distribution      │         │  • Notifications     │     │
│  │  • Trash             │         │                      │     │
│  │  • Notifications     │         │                      │     │
│  └──────────┬───────────┘         └──────────┬───────────┘     │
│             │                                │                  │
│             └────────────────┬───────────────┘                  │
│                              │                                  │
└──────────────────────────────┼──────────────────────────────────┘
                               │
                               │ HTTP/HTTPS (REST API)
                               │ WebSocket (Real-time)
                               │
┌──────────────────────────────┼──────────────────────────────────┐
│                              │    APPLICATION LAYER              │
│                              ▼                                   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │              LARAVEL BACKEND (API)                      │   │
│  │                                                         │   │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │   │
│  │  │ Controllers  │  │  Services    │  │  Middleware  │ │   │
│  │  │              │  │              │  │              │ │   │
│  │  │ • Auth       │  │ • Notif      │  │ • Auth       │ │   │
│  │  │ • Admin      │  │   Service    │  │ • CORS       │ │   │
│  │  │ • Teacher    │  │              │  │ • Logging    │ │   │
│  │  └──────────────┘  └──────────────┘  └──────────────┘ │   │
│  │                                                         │   │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │   │
│  │  │   Models     │  │   Traits     │  │  Commands    │ │   │
│  │  │              │  │              │  │              │ │   │
│  │  │ • Admin      │  │ • LogsActivity│ │ • Reminders  │ │   │
│  │  │ • Teacher    │  │              │  │ • Overdue    │ │   │
│  │  │ • Tool       │  │              │  │              │ │   │
│  │  │ • Borrow     │  │              │  │              │ │   │
│  │  │ • Distrib    │  │              │  │              │ │   │
│  │  │ • PO         │  │              │  │              │ │   │
│  │  └──────────────┘  └──────────────┘  └──────────────┘ │   │
│  └─────────────────────────────────────────────────────────┘   │
│                              │                                  │
│                              │ Eloquent ORM                     │
│                              │                                  │
└──────────────────────────────┼──────────────────────────────────┘
                               │
┌──────────────────────────────┼──────────────────────────────────┐
│                              │      DATA LAYER                   │
│                              ▼                                   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │              MySQL / SQLite DATABASE                    │   │
│  │                                                         │   │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │   │
│  │  │   Users      │  │  Inventory   │  │ Transactions │ │   │
│  │  │              │  │              │  │              │ │   │
│  │  │ • admins     │  │ • tools_     │  │ • borrow_    │ │   │
│  │  │ • teachers   │  │   equipment  │  │   requests   │ │   │
│  │  │              │  │              │  │ • distrib_   │ │   │
│  │  │              │  │              │  │   requests   │ │   │
│  │  │              │  │              │  │ • item_      │ │   │
│  │  │              │  │              │  │   distrib    │ │   │
│  │  └──────────────┘  └──────────────┘  └──────────────┘ │   │
│  │                                                         │   │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │   │
│  │  │  Purchasing  │  │    Logs      │  │   Groups     │ │   │
│  │  │              │  │              │  │              │ │   │
│  │  │ • purchase_  │  │ • system_    │  │ • distrib_   │ │   │
│  │  │   orders     │  │   logs       │  │   groups     │ │   │
│  │  │ • purchase_  │  │ • inventory_ │  │              │ │   │
│  │  │   order_     │  │   logs       │  │              │ │   │
│  │  │   items      │  │ • login_     │  │              │ │   │
│  │  │ • suppliers  │  │   attempts   │  │              │ │   │
│  │  │              │  │              │  │              │ │   │
│  │  └──────────────┘  └──────────────┘  └──────────────┘ │   │
│  │                                                         │   │
│  │  ┌──────────────┐  ┌──────────────┐                   │   │
│  │  │ Notifications│  │   Reports    │                   │   │
│  │  │              │  │              │                   │   │
│  │  │ • notific-   │  │ • reports    │                   │   │
│  │  │   ations     │  │              │                   │   │
│  │  │              │  │              │                   │   │
│  │  └──────────────┘  └──────────────┘                   │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘


┌─────────────────────────────────────────────────────────────────┐
│                    REAL-TIME COMMUNICATION LAYER                 │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │           PHP WEBSOCKET SERVER                          │   │
│  │                                                         │   │
│  │  • Maintains persistent connections                    │   │
│  │  • Broadcasts notifications                            │   │
│  │  • Handles real-time updates                           │   │
│  │  • Manages user sessions                               │   │
│  │                                                         │   │
│  │  Port: 8080 (configurable)                             │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘


┌─────────────────────────────────────────────────────────────────┐
│                      SCHEDULED TASKS LAYER                       │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │           LARAVEL TASK SCHEDULER                        │   │
│  │                                                         │   │
│  │  Daily at 09:00:                                       │   │
│  │  • Send return reminders (3 days before)               │   │
│  │  • Send return reminders (1 day before)                │   │
│  │                                                         │   │
│  │  3x Daily (08:00, 14:00, 18:00):                       │   │
│  │  • Check for overdue items                             │   │
│  │  • Send overdue notifications                          │   │
│  │                                                         │   │
│  │  Requires: Windows Task Scheduler or Cron             │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```


---

## User Journey Maps

### Admin User Journey

```
┌─────────────────────────────────────────────────────────────────┐
│                      ADMIN DAILY WORKFLOW                        │
└─────────────────────────────────────────────────────────────────┘

START
  │
  ▼
┌─────────────────┐
│ 1. LOGIN        │
│ • Enter email   │
│ • Enter password│
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ 2. DASHBOARD    │
│ View Summary:   │
│ • Total items   │
│ • Pending req   │
│ • Overdue items │
│ • Notifications │
└────────┬────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────────┐
│ 3. DAILY TASKS (Choose based on priority)                       │
└─────────────────────────────────────────────────────────────────┘
         │
    ┌────┴────┬────────┬────────┬────────┬────────┐
    │         │        │        │        │        │
    ▼         ▼        ▼        ▼        ▼        ▼
┌────────┐┌────────┐┌────────┐┌────────┐┌────────┐┌────────┐
│Process ││Manage  ││Add/Edit││Create  ││Generate││Check   │
│Borrow  ││Distrib ││Inventory│Purchase││Reports ││Overdue │
│Requests││Requests││Items   ││Orders  ││        ││Items   │
└───┬────┘└───┬────┘└───┬────┘└───┬────┘└───┬────┘└───┬────┘
    │         │        │        │        │        │
    │         │        │        │        │        │
    └─────────┴────────┴────────┴────────┴────────┘
                       │
                       ▼
              ┌─────────────────┐
              │ 4. REVIEW LOGS  │
              │ • System logs   │
              │ • Activity logs │
              │ • Audit trail   │
              └────────┬────────┘
                       │
                       ▼
              ┌─────────────────┐
              │ 5. LOGOUT       │
              └─────────────────┘
                       │
                       ▼
                      END
```

### Teacher User Journey

```
┌─────────────────────────────────────────────────────────────────┐
│                     TEACHER DAILY WORKFLOW                       │
└─────────────────────────────────────────────────────────────────┘

START
  │
  ▼
┌─────────────────┐
│ 1. LOGIN        │
│ • Enter email   │
│ • Enter password│
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ 2. DASHBOARD    │
│ View Summary:   │
│ • Available     │
│ • My requests   │
│ • My items      │
│ • Notifications │
└────────┬────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────────┐
│ 3. COMMON TASKS (Choose based on need)                          │
└─────────────────────────────────────────────────────────────────┘
         │
    ┌────┴────┬────────┬────────┬────────┐
    │         │        │        │        │
    ▼         ▼        ▼        ▼        ▼
┌────────┐┌────────┐┌────────┐┌────────┐┌────────┐
│Browse  ││Submit  ││Submit  ││Check   ││Manage  │
│Invent- ││Borrow  ││Distrib ││Request ││My      │
│ory     ││Request ││Request ││Status  ││Invent- │
│        ││        ││        ││        ││ory     │
└───┬────┘└───┬────┘└───┬────┘└───┬────┘└───┬────┘
    │         │        │        │        │
    │         │        │        │        │
    └─────────┴────────┴────────┴────────┘
                       │
                       ▼
              ┌─────────────────┐
              │ 4. MANAGE GROUPS│
              │ • Create groups │
              │ • Add members   │
              │ • Collaborate   │
              └────────┬────────┘
                       │
                       ▼
              ┌─────────────────┐
              │ 5. LOGOUT       │
              └─────────────────┘
                       │
                       ▼
                      END
```


---

## System Integration Points

### External Integrations

```
┌─────────────────────────────────────────────────────────────────┐
│                    INVENTORY SYSTEM                              │
└────────┬────────────────────────────────────────────────────────┘
         │
         │ Integrates with
         │
    ┌────┴────┬────────┬────────┬────────┐
    │         │        │        │        │
    ▼         ▼        ▼        ▼        ▼
┌────────┐┌────────┐┌────────┐┌────────┐┌────────┐
│ Email  ││WebSocket│Database││File    ││Browser │
│Service ││Server  ││        ││Storage ││        │
└────────┘└────────┘└────────┘└────────┘└────────┘
    │         │        │        │        │
    │         │        │        │        │
    ▼         ▼        ▼        ▼        ▼
┌────────┐┌────────┐┌────────┐┌────────┐┌────────┐
│SMTP    ││Port    ││MySQL/  ││Local   ││Chrome/ │
│Server  ││8080    ││SQLite  ││Disk    ││Edge/   │
│        ││        ││        ││        ││Firefox │
└────────┘└────────┘└────────┘└────────┘└────────┘
```

### API Endpoints Summary

```
┌─────────────────────────────────────────────────────────────────┐
│                      API STRUCTURE                               │
└─────────────────────────────────────────────────────────────────┘

BASE URL: http://localhost:8000/api

PUBLIC ENDPOINTS:
├── POST   /auth/login
├── POST   /auth/teacher/register
├── POST   /auth/forgot-password
└── POST   /auth/reset-password

ADMIN ENDPOINTS (Requires: auth:sanctum):
├── /admin
│   ├── POST   /logout
│   ├── GET    /me
│   ├── GET    /dashboard
│   ├── GET    /dashboard/statistics
│   │
│   ├── /inventory
│   │   ├── GET    /
│   │   ├── POST   /
│   │   ├── GET    /{id}
│   │   ├── PUT    /{id}
│   │   └── DELETE /{id}
│   │
│   ├── /requests
│   │   ├── GET    /
│   │   ├── GET    /statistics
│   │   ├── POST   /{id}/approve
│   │   ├── POST   /{id}/reject
│   │   ├── POST   /{id}/issue
│   │   └── POST   /{id}/return
│   │
│   ├── /teachers
│   │   ├── GET    /
│   │   ├── POST   /
│   │   ├── GET    /{id}
│   │   ├── PUT    /{id}
│   │   └── DELETE /{id}
│   │
│   ├── /purchase-orders
│   │   ├── GET    /
│   │   ├── POST   /
│   │   ├── GET    /{id}
│   │   ├── PUT    /{id}
│   │   ├── DELETE /{id}
│   │   ├── POST   /{id}/approve
│   │   ├── POST   /{id}/cancel
│   │   └── POST   /{id}/receive
│   │
│   ├── /suppliers
│   │   ├── GET    /
│   │   ├── POST   /
│   │   ├── GET    /{id}
│   │   ├── PUT    /{id}
│   │   └── DELETE /{id}
│   │
│   ├── /distribution
│   │   ├── GET    /
│   │   ├── GET    /statistics
│   │   ├── GET    /groups
│   │   └── POST   /groups
│   │
│   ├── /distribution-requests
│   │   ├── GET    /
│   │   ├── GET    /{id}
│   │   ├── POST   /{id}/approve
│   │   └── POST   /{id}/reject
│   │
│   ├── /distributions
│   │   ├── GET    /
│   │   ├── POST   /
│   │   ├── GET    /{id}
│   │   ├── POST   /{id}/return
│   │   └── POST   /{id}/cancel
│   │
│   ├── /reports
│   │   ├── GET    /
│   │   ├── POST   /
│   │   └── GET    /{id}
│   │
│   ├── /logs
│   │   ├── GET    /
│   │   ├── GET    /{id}
│   │   └── GET    /statistics
│   │
│   ├── /trash
│   │   ├── GET    /
│   │   ├── GET    /stats
│   │   ├── POST   /{type}/{id}/restore
│   │   ├── DELETE /{type}/{id}
│   │   └── DELETE /empty
│   │
│   └── /notifications
│       ├── GET    /
│       ├── GET    /unread-count
│       ├── POST   /{id}/read
│       ├── POST   /mark-all-read
│       └── DELETE /{id}

TEACHER ENDPOINTS (Requires: auth:sanctum):
└── /teacher
    ├── POST   /logout
    ├── GET    /me
    ├── GET    /dashboard
    │
    ├── /inventory
    │   ├── GET    /
    │   └── GET    /{id}
    │
    ├── /my-inventory
    │   ├── GET    /
    │   ├── POST   /
    │   ├── GET    /{id}
    │   ├── PUT    /{id}
    │   └── DELETE /{id}
    │
    ├── /requests
    │   ├── GET    /
    │   ├── POST   /
    │   ├── GET    /{id}
    │   └── POST   /{id}/cancel
    │
    ├── /distribution-groups
    │   ├── GET    /
    │   ├── POST   /
    │   ├── GET    /{id}
    │   ├── PUT    /{id}
    │   ├── DELETE /{id}
    │   ├── POST   /{id}/add-teachers
    │   └── POST   /{id}/remove-teachers
    │
    ├── /distribution-requests
    │   ├── GET    /
    │   ├── POST   /
    │   └── DELETE /{id}
    │
    └── /notifications
        ├── GET    /
        ├── GET    /unread-count
        ├── POST   /{id}/read
        ├── POST   /mark-all-read
        └── DELETE /{id}
```

---

## Technology Stack Details

### Frontend Stack

```
┌─────────────────────────────────────────────────────────────────┐
│                      FRONTEND TECHNOLOGIES                       │
└─────────────────────────────────────────────────────────────────┘

Core Framework:
├── React 18.x
│   ├── TypeScript (Type safety)
│   ├── React Router (Navigation)
│   └── Context API (State management)

Build Tool:
├── Vite
│   ├── Fast HMR (Hot Module Replacement)
│   ├── Optimized builds
│   └── Dev server

UI Framework:
├── Tailwind CSS (Utility-first styling)
├── shadcn/ui (Component library)
│   ├── Radix UI primitives
│   ├── Accessible components
│   └── Customizable themes

HTTP Client:
├── Axios
│   ├── Request/Response interceptors
│   ├── Token management
│   └── Error handling

Real-time:
├── WebSocket Client
│   ├── Native WebSocket API
│   ├── Auto-reconnection
│   └── Event handling

Utilities:
├── date-fns (Date formatting)
├── clsx (Class name management)
└── react-hook-form (Form handling)
```

### Backend Stack

```
┌─────────────────────────────────────────────────────────────────┐
│                      BACKEND TECHNOLOGIES                        │
└─────────────────────────────────────────────────────────────────┘

Core Framework:
├── Laravel 11.x
│   ├── PHP 8.2+
│   ├── Eloquent ORM
│   └── Artisan CLI

Authentication:
├── Laravel Sanctum
│   ├── Token-based auth
│   ├── SPA authentication
│   └── API token management

Database:
├── MySQL (Production)
├── SQLite (Development)
└── Migrations & Seeders

Email:
├── Laravel Mail
│   ├── SMTP support
│   ├── Queue support
│   └── Mailable classes

Scheduling:
├── Laravel Scheduler
│   ├── Cron job management
│   ├── Task scheduling
│   └── Command execution

Real-time:
├── Custom PHP WebSocket Server
│   ├── Ratchet library
│   ├── Event broadcasting
│   └── Connection management

Development Tools:
├── Laravel Telescope (Debugging)
├── Composer (Dependency management)
└── Artisan commands
```

---

## Deployment Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    WINDOWS SERVER DEPLOYMENT                     │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│  SERVER COMPONENTS                                               │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  1. PHP Development Server                                      │
│     • Port: 8000                                                │
│     • Command: php artisan serve                                │
│     • Serves Laravel API                                        │
│                                                                  │
│  2. Vite Development Server                                     │
│     • Port: 5173                                                │
│     • Command: npm run dev                                      │
│     • Serves React frontend                                     │
│                                                                  │
│  3. WebSocket Server                                            │
│     • Port: 8080                                                │
│     • Command: php websocket_server.php                         │
│     • Handles real-time communication                           │
│                                                                  │
│  4. Database Server                                             │
│     • MySQL: Port 3306                                          │
│     • SQLite: File-based                                        │
│                                                                  │
│  5. Task Scheduler                                              │
│     • Windows Task Scheduler                                    │
│     • Runs: php artisan schedule:run                            │
│     • Frequency: Every minute                                   │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘

STARTUP SEQUENCE:
1. start-all-services.bat
   ├── Starts backend (Laravel)
   ├── Starts frontend (Vite)
   └── Starts WebSocket server

CONFIGURATION FILES:
├── backend/.env (Backend config)
├── frontend/.env (Frontend config)
└── websocket/config.php (WebSocket config)
```

---

**Document Version:** 1.0  
**Last Updated:** March 23, 2026  
**Created For:** School Inventory Management System
