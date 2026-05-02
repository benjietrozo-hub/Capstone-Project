# Data Flow Diagram (DFD)
## Inventory of Other Properties (Tools and Equipment) Management System

---

## Context Diagram (Level 0)

### System Overview - External Entities and Data Flows

```
                    ┌─────────────────────────┐
                    │   In-Charge Personnel   │
                    │        (Admin)          │
                    └───────────┬─────────────┘
                                │
                    ┌───────────┼───────────┐
                    │           │           │
        Input/Update│           │           │View Reports
        Inventory   │           │           │Approvals
        Data        │           │           │Statistics
                    │           │           │
                    ▼           │           ▼
    ┌───────────────────────────┼───────────────────────┐
    │                           │                       │
    │                           ▼                       │
    │           ┌─────────────────────────────┐        │
    │           │                             │        │
    │           │   INVENTORY MANAGEMENT      │        │
    │           │          SYSTEM             │        │
    │           │   (Automated Process)       │        │
    │           │                             │        │
    │           └─────────────────────────────┘        │
    │                           │                       │
    │                           │                       │
    │           ┌───────────────┼───────────────┐      │
    │           │               │               │      │
    │           │ Provide       │ Save/Manage   │      │
    │           │ Assigned      │ Inventory     │      │
    │           │ Items         │ Data          │      │
    │           │               │               │      │
    │           ▼               ▼               │      │
    │   ┌──────────────┐  ┌──────────────┐    │      │
    │   │   Teachers   │  │   System     │    │      │
    │   │              │  │   Database   │    │      │
    │   └──────┬───────┘  └──────────────┘    │      │
    │          │                               │      │
    │          │ View Assigned Items           │      │
    │          │ Submit Requests               │      │
    │          │                               │      │
    │          └───────────────────────────────┘      │
    │                                                  │
    │                                                  │
    └──────────────────────────────────────────────────┘
                                │
                                │ View Reports
                                │ Approvals
                                │
                    ┌───────────▼─────────────┐
                    │  School Administrators  │
                    │    (View Only Access)   │
                    └─────────────────────────┘
```

**External Entities:**
1. **In-Charge Personnel (Admin)** - Manages entire system
2. **Teachers** - Request and use inventory items
3. **School Administrators** - View reports and approvals
4. **System Database** - Stores all data

**Main Data Flows:**
- Admin inputs/updates inventory data
- System provides assigned items to teachers
- Teachers view assigned items and submit requests
- Database saves and manages all inventory data
- Administrators view reports and approvals

---

## Level 1 DFD - Main Processes

### Detailed System Processes

```
┌─────────────────┐
│  In-Charge      │
│  Personnel      │
└────────┬────────┘
         │
         │ Login Credentials
         │
         ▼
┌─────────────────────────────────────────────────────────────────┐
│ 1.0                                                              │
│ AUTHENTICATION                                                   │
│ & AUTHORIZATION                                                  │
└────────┬────────────────────────────────────────────────────────┘
         │
         │ User Session Token
         │
         ▼
┌─────────────────────────────────────────────────────────────────┐
│                        MAIN PROCESSES                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │ 2.0          │  │ 3.0          │  │ 4.0          │         │
│  │ INVENTORY    │  │ BORROW       │  │ DISTRIBUTION │         │
│  │ MANAGEMENT   │  │ REQUEST      │  │ MANAGEMENT   │         │
│  │              │  │ PROCESSING   │  │              │         │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘         │
│         │                 │                 │                  │
│         │                 │                 │                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │ 5.0          │  │ 6.0          │  │ 7.0          │         │
│  │ PURCHASE     │  │ TEACHER      │  │ NOTIFICATION │         │
│  │ ORDER        │  │ MANAGEMENT   │  │ SYSTEM       │         │
│  │ MANAGEMENT   │  │              │  │              │         │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘         │
│         │                 │                 │                  │
│         │                 │                 │                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │ 8.0          │  │ 9.0          │  │ 10.0         │         │
│  │ REPORT       │  │ SYSTEM       │  │ TRASH        │         │
│  │ GENERATION   │  │ LOGGING      │  │ MANAGEMENT   │         │
│  │              │  │              │  │              │         │
│  └──────────────┘  └──────────────┘  └──────────────┘         │
│                                                                  │
└──────────────────────────┬───────────────────────────────────────┘
                           │
                           │ All Data Operations
                           │
                           ▼
                  ┌─────────────────┐
                  │  D1: DATABASE   │
                  │                 │
                  │  • Admins       │
                  │  • Teachers     │
                  │  • Inventory    │
                  │  • Requests     │
                  │  • Distributions│
                  │  • POs          │
                  │  • Logs         │
                  │  • Notifications│
                  └─────────────────┘
```


---

## Level 2 DFD - Process 2.0: Inventory Management

### Detailed Inventory Management Process

```
┌─────────────────┐
│  In-Charge      │
│  Personnel      │
└────────┬────────┘
         │
         │ Item Details
         │ (Add/Update/Delete)
         │
         ▼
┌─────────────────────────────────────────────────────────────────┐
│ 2.1                                                              │
│ VALIDATE INVENTORY DATA                                          │
│ • Check required fields                                          │
│ • Validate item code uniqueness                                  │
│ • Verify quantities                                              │
└────────┬────────────────────────────────────────────────────────┘
         │
         │ Validated Data
         │
         ▼
┌─────────────────────────────────────────────────────────────────┐
│ 2.2                                                              │
│ PROCESS INVENTORY OPERATION                                      │
│ • Create new item                                                │
│ • Update existing item                                           │
│ • Soft delete item                                               │
│ • Update quantities                                              │
└────────┬────────────────────────────────────────────────────────┘
         │
         │ Operation Details
         │
         ▼
┌─────────────────────────────────────────────────────────────────┐
│ 2.3                                                              │
│ UPDATE INVENTORY DATABASE                                        │
│ • Save to tools_equipment table                                  │
│ • Update quantity_total                                          │
│ • Update quantity_available                                      │
│ • Update quantity_borrowed                                       │
└────────┬────────────────────────────────────────────────────────┘
         │
         │ Inventory Record
         │
         ▼
┌─────────────────────────────────────────────────────────────────┐
│ 2.4                                                              │
│ LOG INVENTORY ACTIVITY                                           │
│ • Create inventory log entry                                     │
│ • Record action type                                             │
│ • Store quantity changes                                         │
│ • Save admin ID                                                  │
└────────┬────────────────────────────────────────────────────────┘
         │
         │ Log Entry
         │
         ▼
    ┌────────────┐         ┌────────────┐
    │ D1:        │         │ D2:        │
    │ tools_     │         │ inventory_ │
    │ equipment  │         │ logs       │
    └────────────┘         └────────────┘
         │
         │ Item Data
         │
         ▼
┌─────────────────┐
│   Teachers      │
│ (Browse Items)  │
└─────────────────┘
```

---

## Level 2 DFD - Process 3.0: Borrow Request Processing

### Detailed Borrow Request Workflow

```
┌─────────────────┐
│   Teachers      │
└────────┬────────┘
         │
         │ Request Details
         │ (Item, Quantity, Purpose, Dates)
         │
         ▼
┌─────────────────────────────────────────────────────────────────┐
│ 3.1                                                              │
│ VALIDATE BORROW REQUEST                                          │
│ • Check item availability                                        │
│ • Verify quantity available                                      │
│ • Validate dates                                                 │
│ • Check teacher status                                           │
└────────┬────────────────────────────────────────────────────────┘
         │
         │ Validated Request
         │
         ▼
┌─────────────────────────────────────────────────────────────────┐
│ 3.2                                                              │
│ CREATE BORROW REQUEST                                            │
│ • Generate request record                                        │
│ • Set status to PENDING                                          │
│ • Store request details                                          │
│ • Link to teacher and item                                       │
└────────┬────────────────────────────────────────────────────────┘
         │
         │ Request Record
         │
         ▼
    ┌────────────┐
    │ D3:        │
    │ borrow_    │
    │ requests   │
    └────┬───────┘
         │
         │ Pending Request
         │
         ▼
┌─────────────────────────────────────────────────────────────────┐
│ 3.3                                                              │
│ NOTIFY ADMIN                                                     │
│ • Create notification                                            │
│ • Send via WebSocket                                             │
│ • Update notification count                                      │
└────────┬────────────────────────────────────────────────────────┘
         │
         │ Notification
         │
         ▼
┌─────────────────┐
│  In-Charge      │
│  Personnel      │
└────────┬────────┘
         │
         │ Approval Decision
         │ (Approve/Reject)
         │
         ▼
┌─────────────────────────────────────────────────────────────────┐
│ 3.4                                                              │
│ PROCESS ADMIN DECISION                                           │
│ • Update request status                                          │
│ • Add admin notes                                                │
│ • Record decision timestamp                                      │
└────────┬────────────────────────────────────────────────────────┘
         │
         │
    ┌────┴────┐
    │         │
    ▼         ▼
┌────────┐ ┌────────┐
│APPROVED│ │REJECTED│
└───┬────┘ └───┬────┘
    │          │
    │          │ Rejection Notice
    │          │
    │          ▼
    │      ┌─────────────────┐
    │      │ 3.5             │
    │      │ NOTIFY TEACHER  │
    │      │ (Rejection)     │
    │      └─────────────────┘
    │
    │ Approval Notice
    │
    ▼
┌─────────────────────────────────────────────────────────────────┐
│ 3.6                                                              │
│ ISSUE ITEMS                                                      │
│ • Update status to BORROWED                                      │
│ • Record condition before                                        │
│ • Set borrow date                                                │
│ • Update item quantities                                         │
└────────┬────────────────────────────────────────────────────────┘
         │
         │ Updated Quantities
         │
         ▼
┌─────────────────────────────────────────────────────────────────┐
│ 3.7                                                              │
│ UPDATE INVENTORY QUANTITIES                                      │
│ • Decrease quantity_available                                    │
│ • Increase quantity_borrowed                                     │
│ • Save changes                                                   │
└────────┬────────────────────────────────────────────────────────┘
         │
         │
         ▼
    ┌────────────┐
    │ D1:        │
    │ tools_     │
    │ equipment  │
    └────────────┘
         │
         │ Item in Use
         │
         ▼
┌─────────────────┐
│   Teachers      │
│ (Using Items)   │
└────────┬────────┘
         │
         │ Return Items
         │
         ▼
┌─────────────────────────────────────────────────────────────────┐
│ 3.8                                                              │
│ PROCESS RETURN                                                   │
│ • Inspect item condition                                         │
│ • Record condition after                                         │
│ • Set actual return date                                         │
│ • Update status to RETURNED                                      │
│ • Restore inventory quantities                                   │
└────────┬────────────────────────────────────────────────────────┘
         │
         │ Return Complete
         │
         ▼
    ┌────────────┐         ┌────────────┐
    │ D3:        │         │ D1:        │
    │ borrow_    │         │ tools_     │
    │ requests   │         │ equipment  │
    └────────────┘         └────────────┘
```


---

## Level 2 DFD - Process 4.0: Distribution Management

### Detailed Distribution Process

```
┌─────────────────┐
│   Teachers      │
└────────┬────────┘
         │
         │ Distribution Request
         │ (Item, Quantity, Reason)
         │
         ▼
┌─────────────────────────────────────────────────────────────────┐
│ 4.1                                                              │
│ VALIDATE DISTRIBUTION REQUEST                                    │
│ • Check item availability                                        │
│ • Verify quantity                                                │
│ • Validate justification                                         │
│ • Check teacher eligibility                                      │
└────────┬────────────────────────────────────────────────────────┘
         │
         │ Validated Request
         │
         ▼
┌─────────────────────────────────────────────────────────────────┐
│ 4.2                                                              │
│ CREATE DISTRIBUTION REQUEST                                      │
│ • Generate request record                                        │
│ • Set status to PENDING                                          │
│ • Store request details                                          │
└────────┬────────────────────────────────────────────────────────┘
         │
         │ Request Record
         │
         ▼
    ┌────────────┐
    │ D4:        │
    │ distrib_   │
    │ requests   │
    └────┬───────┘
         │
         │ Pending Request
         │
         ▼
┌─────────────────────────────────────────────────────────────────┐
│ 4.3                                                              │
│ NOTIFY ADMIN                                                     │
│ • Create notification                                            │
│ • Send to admin                                                  │
└────────┬────────────────────────────────────────────────────────┘
         │
         │ Notification
         │
         ▼
┌─────────────────┐
│  In-Charge      │
│  Personnel      │
└────────┬────────┘
         │
         │ Review & Decision
         │ (Approve/Reject)
         │
         ▼
┌─────────────────────────────────────────────────────────────────┐
│ 4.4                                                              │
│ PROCESS ADMIN DECISION                                           │
│ • Update request status                                          │
│ • Add admin notes                                                │
│ • Record reviewer ID                                             │
│ • Set reviewed_at timestamp                                      │
└────────┬────────────────────────────────────────────────────────┘
         │
         │
    ┌────┴────┐
    │         │
    ▼         ▼
┌────────┐ ┌────────┐
│APPROVED│ │REJECTED│
└───┬────┘ └───┬────┘
    │          │
    │          │ Rejection Notice
    │          │
    │          ▼
    │      ┌─────────────────┐
    │      │ 4.5             │
    │      │ NOTIFY TEACHER  │
    │      │ (Rejection)     │
    │      └─────────────────┘
    │
    │ Approval
    │
    ▼
┌─────────────────────────────────────────────────────────────────┐
│ 4.6                                                              │
│ CREATE ITEM DISTRIBUTION                                         │
│ • Generate distribution record                                   │
│ • Set distribution date                                          │
│ • Link to request                                                │
│ • Set status to DISTRIBUTED                                      │
└────────┬────────────────────────────────────────────────────────┘
         │
         │ Distribution Record
         │
         ▼
    ┌────────────┐
    │ D5:        │
    │ item_      │
    │ distrib    │
    └────┬───────┘
         │
         │
         ▼
┌─────────────────────────────────────────────────────────────────┐
│ 4.7                                                              │
│ TRANSFER TO TEACHER INVENTORY                                    │
│ • Add to teacher_inventory table                                 │
│ • Update main inventory quantities                               │
│ • Record transfer details                                        │
└────────┬────────────────────────────────────────────────────────┘
         │
         │ Updated Records
         │
    ┌────┴────┐
    │         │
    ▼         ▼
┌────────────┐  ┌────────────┐
│ D6:        │  │ D1:        │
│ teacher_   │  │ tools_     │
│ inventory  │  │ equipment  │
└────────────┘  └────────────┘
         │
         │ Assigned Items
         │
         ▼
┌─────────────────┐
│   Teachers      │
│ (View My Items) │
└─────────────────┘
```


---

## Level 2 DFD - Process 5.0: Purchase Order Management

### Detailed Purchase Order Process

```
┌─────────────────┐
│  In-Charge      │
│  Personnel      │
└────────┬────────┘
         │
         │ PO Details
         │ (Supplier, Items, Quantities, Prices)
         │
         ▼
┌─────────────────────────────────────────────────────────────────┐
│ 5.1                                                              │
│ VALIDATE PURCHASE ORDER                                          │
│ • Check supplier exists                                          │
│ • Verify item details                                            │
│ • Validate quantities and prices                                 │
│ • Calculate totals                                               │
└────────┬────────────────────────────────────────────────────────┘
         │
         │ Validated PO Data
         │
         ▼
┌─────────────────────────────────────────────────────────────────┐
│ 5.2                                                              │
│ CREATE PURCHASE ORDER                                            │
│ • Generate PO number (PO-YYYYMM-####)                           │
│ • Create PO record                                               │
│ • Create PO items                                                │
│ • Set status to DRAFT                                            │
└────────┬────────────────────────────────────────────────────────┘
         │
         │ PO Record
         │
         ▼
    ┌────────────┐         ┌────────────┐
    │ D7:        │         │ D8:        │
    │ purchase_  │         │ purchase_  │
    │ orders     │         │ order_items│
    └────┬───────┘         └────────────┘
         │
         │ Draft PO
         │
         ▼
┌─────────────────────────────────────────────────────────────────┐
│ 5.3                                                              │
│ SUBMIT FOR APPROVAL                                              │
│ • Update status to PENDING                                       │
│ • Set submission date                                            │
│ • Create approval notification                                   │
└────────┬────────────────────────────────────────────────────────┘
         │
         │ Approval Request
         │
         ▼
┌─────────────────┐
│  In-Charge      │
│  Personnel      │
│  (Approver)     │
└────────┬────────┘
         │
         │ Approval Decision
         │
         ▼
┌─────────────────────────────────────────────────────────────────┐
│ 5.4                                                              │
│ PROCESS APPROVAL                                                 │
│ • Update status to APPROVED                                      │
│ • Record approved_by                                             │
│ • Set approval_date                                              │
│ • Log approval action                                            │
└────────┬────────────────────────────────────────────────────────┘
         │
         │ Approved PO
         │
         ▼
┌─────────────────────────────────────────────────────────────────┐
│ 5.5                                                              │
│ SEND TO SUPPLIER                                                 │
│ • Generate PO document                                           │
│ • Send to supplier                                               │
│ • Update status to ORDERED                                       │
└────────┬────────────────────────────────────────────────────────┘
         │
         │ Order Sent
         │
         ▼
┌─────────────────┐
│   Supplier      │
│ (External)      │
└────────┬────────┘
         │
         │ Items Delivered
         │
         ▼
┌─────────────────────────────────────────────────────────────────┐
│ 5.6                                                              │
│ RECEIVE ITEMS                                                    │
│ • Verify items vs PO                                             │
│ • Check quantities                                               │
│ • Inspect quality                                                │
│ • Update status to RECEIVED                                      │
└────────┬────────────────────────────────────────────────────────┘
         │
         │ Received Items
         │
         ▼
┌─────────────────────────────────────────────────────────────────┐
│ 5.7                                                              │
│ ADD TO INVENTORY                                                 │
│ • Create/Update inventory items                                  │
│ • Set acquisition dates                                          │
│ • Update quantities                                              │
│ • Record unit prices                                             │
└────────┬────────────────────────────────────────────────────────┘
         │
         │ New Inventory Items
         │
         ▼
    ┌────────────┐
    │ D1:        │
    │ tools_     │
    │ equipment  │
    └────────────┘
```

---

## Level 2 DFD - Process 7.0: Notification System

### Detailed Notification Process

```
┌─────────────────────────────────────────────────────────────────┐
│                    SYSTEM EVENTS (Triggers)                      │
│                                                                  │
│  • Request Created        • Request Status Changed              │
│  • Item Issued           • Return Due Soon                      │
│  • Item Overdue          • Distribution Approved                │
│  • PO Approved           • Teacher Added                        │
└────────┬────────────────────────────────────────────────────────┘
         │
         │ Event Data
         │
         ▼
┌─────────────────────────────────────────────────────────────────┐
│ 7.1                                                              │
│ DETECT EVENT                                                     │
│ • Identify event type                                            │
│ • Extract event data                                             │
│ • Determine recipients                                           │
└────────┬────────────────────────────────────────────────────────┘
         │
         │ Event Details
         │
         ▼
┌─────────────────────────────────────────────────────────────────┐
│ 7.2                                                              │
│ CREATE NOTIFICATION                                              │
│ • Generate notification message                                  │
│ • Set notification type                                          │
│ • Link to reference (request/item/PO)                           │
│ • Set recipient (admin/teacher)                                  │
└────────┬────────────────────────────────────────────────────────┘
         │
         │ Notification Record
         │
         ▼
    ┌────────────┐
    │ D9:        │
    │ notific-   │
    │ ations     │
    └────┬───────┘
         │
         │ Notification Data
         │
         ▼
┌─────────────────────────────────────────────────────────────────┐
│ 7.3                                                              │
│ SEND NOTIFICATION                                                │
│ • Send via WebSocket (real-time)                                │
│ • Send via Email (if critical)                                  │
│ • Update unread count                                            │
└────────┬────────────────────────────────────────────────────────┘
         │
         │
    ┌────┴────┐
    │         │
    ▼         ▼
┌────────┐ ┌────────┐
│WebSocket│ │ Email  │
│Server  │ │Service │
└───┬────┘ └───┬────┘
    │          │
    │          │
    └────┬─────┘
         │
         │ Delivered Notification
         │
    ┌────┴────┐
    │         │
    ▼         ▼
┌────────┐ ┌────────┐
│ Admin  │ │Teacher │
│Dashboard│ │Dashboard
└────────┘ └────────┘
         │
         │ Mark as Read
         │
         ▼
┌─────────────────────────────────────────────────────────────────┐
│ 7.4                                                              │
│ UPDATE NOTIFICATION STATUS                                       │
│ • Set read_at timestamp                                          │
│ • Update unread count                                            │
│ • Log read action                                                │
└────────┬────────────────────────────────────────────────────────┘
         │
         │ Updated Status
         │
         ▼
    ┌────────────┐
    │ D9:        │
    │ notific-   │
    │ ations     │
    └────────────┘
```


---

## Level 2 DFD - Process 8.0: Report Generation

### Detailed Report Generation Process

```
┌─────────────────┐
│  In-Charge      │
│  Personnel      │
└────────┬────────┘
         │
         │ Report Request
         │ (Type, Date Range, Filters)
         │
         ▼
┌─────────────────────────────────────────────────────────────────┐
│ 8.1                                                              │
│ VALIDATE REPORT PARAMETERS                                       │
│ • Check report type                                              │
│ • Validate date range                                            │
│ • Verify filter criteria                                         │
└────────┬────────────────────────────────────────────────────────┘
         │
         │ Validated Parameters
         │
         ▼
┌─────────────────────────────────────────────────────────────────┐
│ 8.2                                                              │
│ QUERY DATABASE                                                   │
│ • Execute queries based on report type                           │
│ • Apply filters and date range                                   │
│ • Join related tables                                            │
│ • Aggregate data                                                 │
└────────┬────────────────────────────────────────────────────────┘
         │
         │ Query Results
         │
         ▼
    ┌────────────────────────────────────────────────────┐
    │  DATABASE TABLES                                   │
    │                                                    │
    │  D1: tools_equipment    D3: borrow_requests       │
    │  D2: inventory_logs     D4: distribution_requests │
    │  D7: purchase_orders    D10: teachers             │
    │  D11: system_logs                                 │
    └────────┬───────────────────────────────────────────┘
             │
             │ Raw Data
             │
             ▼
┌─────────────────────────────────────────────────────────────────┐
│ 8.3                                                              │
│ PROCESS AND FORMAT DATA                                          │
│ • Calculate statistics                                           │
│ • Format dates and numbers                                       │
│ • Group and sort data                                            │
│ • Generate summaries                                             │
└────────┬────────────────────────────────────────────────────────┘
         │
         │ Formatted Data
         │
         ▼
┌─────────────────────────────────────────────────────────────────┐
│ 8.4                                                              │
│ GENERATE REPORT                                                  │
│ • Create report structure                                        │
│ • Add charts/graphs (if applicable)                             │
│ • Format for display/export                                      │
│ • Save report record                                             │
└────────┬────────────────────────────────────────────────────────┘
         │
         │ Report Record
         │
         ▼
    ┌────────────┐
    │ D12:       │
    │ reports    │
    └────┬───────┘
         │
         │ Generated Report
         │
         ▼
┌─────────────────────────────────────────────────────────────────┐
│ 8.5                                                              │
│ DELIVER REPORT                                                   │
│ • Display in browser                                             │
│ • Export to PDF/Excel (optional)                                │
│ • Send to admin                                                  │
└────────┬────────────────────────────────────────────────────────┘
         │
         │ Report Output
         │
         ▼
┌─────────────────┐
│  In-Charge      │
│  Personnel      │
│ (View Report)   │
└─────────────────┘
         │
         │ Share Report
         │
         ▼
┌─────────────────┐
│  School         │
│  Administrators │
└─────────────────┘
```

---

## Level 2 DFD - Process 9.0: System Logging

### Detailed Logging Process

```
┌─────────────────────────────────────────────────────────────────┐
│                    USER ACTIONS (All System Activities)          │
│                                                                  │
│  • Login/Logout          • Create/Update/Delete Records         │
│  • Approve/Reject        • Issue/Return Items                   │
│  • Generate Reports      • Change Settings                      │
└────────┬────────────────────────────────────────────────────────┘
         │
         │ Action Data
         │
         ▼
┌─────────────────────────────────────────────────────────────────┐
│ 9.1                                                              │
│ CAPTURE ACTION DETAILS                                           │
│ • Identify user (admin/teacher)                                  │
│ • Record action type                                             │
│ • Extract action data                                            │
│ • Get timestamp                                                  │
│ • Capture IP address                                             │
│ • Get user agent                                                 │
└────────┬────────────────────────────────────────────────────────┘
         │
         │ Action Details
         │
         ▼
┌─────────────────────────────────────────────────────────────────┐
│ 9.2                                                              │
│ DETERMINE LOG TYPE                                               │
│ • Authentication log (login/logout)                              │
│ • Inventory log (item changes)                                   │
│ • Request log (status changes)                                   │
│ • System log (general actions)                                   │
└────────┬────────────────────────────────────────────────────────┘
         │
         │ Categorized Log
         │
         ▼
┌─────────────────────────────────────────────────────────────────┐
│ 9.3                                                              │
│ CREATE LOG ENTRY                                                 │
│ • Generate log record                                            │
│ • Set log type                                                   │
│ • Store action description                                       │
│ • Link to reference (if applicable)                             │
│ • Add metadata (JSON)                                            │
└────────┬────────────────────────────────────────────────────────┘
         │
         │ Log Record
         │
    ┌────┴────┬────────┐
    │         │        │
    ▼         ▼        ▼
┌────────┐┌────────┐┌────────┐
│ D11:   ││ D2:    ││ D13:   │
│system_ ││invent- ││login_  │
│logs    ││ory_logs││attempts│
└────────┘└────────┘└────────┘
         │
         │ Stored Logs
         │
         ▼
┌─────────────────────────────────────────────────────────────────┐
│ 9.4                                                              │
│ PROVIDE LOG ACCESS                                               │
│ • Query logs by filters                                          │
│ • Search by user/action/date                                     │
│ • Generate log statistics                                        │
│ • Export logs                                                    │
└────────┬────────────────────────────────────────────────────────┘
         │
         │ Log Data
         │
         ▼
┌─────────────────┐
│  In-Charge      │
│  Personnel      │
│ (View Logs)     │
└─────────────────┘
```


---

## Level 2 DFD - Process 1.0: Authentication & Authorization

### Detailed Authentication Process

```
┌─────────────────┐
│   User          │
│ (Admin/Teacher) │
└────────┬────────┘
         │
         │ Login Credentials
         │ (Email, Password)
         │
         ▼
┌─────────────────────────────────────────────────────────────────┐
│ 1.1                                                              │
│ VALIDATE CREDENTIALS                                             │
│ • Check email exists                                             │
│ • Verify password hash                                           │
│ • Check account status (active/inactive)                         │
│ • Determine user role (admin/teacher)                           │
└────────┬────────────────────────────────────────────────────────┘
         │
         │ Validation Query
         │
         ▼
    ┌────────────┐         ┌────────────┐
    │ D10:       │         │ D14:       │
    │ admins     │         │ teachers   │
    └────┬───────┘         └────┬───────┘
         │                      │
         │ User Record          │
         │                      │
         └──────────┬───────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────────────────────┐
│ 1.2                                                              │
│ PROCESS AUTHENTICATION                                           │
│ • Generate API token (Sanctum)                                   │
│ • Create session                                                 │
│ • Set token expiration                                           │
│ • Store token in database                                        │
└────────┬────────────────────────────────────────────────────────┘
         │
         │ Token & Session
         │
         ▼
    ┌────────────┐
    │ D15:       │
    │ personal_  │
    │ access_    │
    │ tokens     │
    └────┬───────┘
         │
         │ Authentication Token
         │
         ▼
┌─────────────────────────────────────────────────────────────────┐
│ 1.3                                                              │
│ LOG AUTHENTICATION ATTEMPT                                       │
│ • Record login attempt                                           │
│ • Store IP address                                               │
│ • Log user agent                                                 │
│ • Set success/failure status                                     │
└────────┬────────────────────────────────────────────────────────┘
         │
         │ Login Log
         │
         ▼
    ┌────────────┐
    │ D13:       │
    │ login_     │
    │ attempts   │
    └────────────┘
         │
         │ Token Response
         │
         ▼
┌─────────────────┐
│   User          │
│ (Authenticated) │
└────────┬────────┘
         │
         │ API Requests with Token
         │
         ▼
┌─────────────────────────────────────────────────────────────────┐
│ 1.4                                                              │
│ AUTHORIZE REQUEST                                                │
│ • Validate token                                                 │
│ • Check token expiration                                         │
│ • Verify user role                                               │
│ • Check route permissions                                        │
└────────┬────────────────────────────────────────────────────────┘
         │
         │
    ┌────┴────┐
    │         │
    ▼         ▼
┌────────┐ ┌────────┐
│ALLOWED │ │DENIED  │
└───┬────┘ └───┬────┘
    │          │
    │          │ 401/403 Error
    │          │
    │          ▼
    │      ┌─────────────────┐
    │      │   User          │
    │      │ (Unauthorized)  │
    │      └─────────────────┘
    │
    │ Access Granted
    │
    ▼
┌─────────────────────────────────────────────────────────────────┐
│                    SYSTEM PROCESSES                              │
│  (Inventory, Requests, Reports, etc.)                           │
└─────────────────────────────────────────────────────────────────┘
```


---

## Data Store Dictionary

### Complete Database Schema Reference

```
┌─────────────────────────────────────────────────────────────────┐
│                      DATA STORES (Database Tables)               │
└─────────────────────────────────────────────────────────────────┘

D1: tools_equipment
├── Description: Main inventory items table
├── Primary Key: id
├── Contents:
│   ├── item_code (unique identifier)
│   ├── item_name
│   ├── description
│   ├── category
│   ├── quantity_total
│   ├── quantity_available
│   ├── quantity_borrowed
│   ├── condition_status
│   ├── location
│   ├── unit_price
│   ├── image
│   ├── acquisition_date
│   ├── status (active/inactive)
│   ├── notes
│   ├── deleted_at (soft delete)
│   └── deleted_by
└── Used By: Processes 2.0, 3.0, 4.0, 5.0

D2: inventory_logs
├── Description: Audit trail for inventory changes
├── Primary Key: id
├── Contents:
│   ├── item_id (FK to tools_equipment)
│   ├── action (add/update/delete/borrow/return)
│   ├── quantity_change
│   ├── quantity_before
│   ├── quantity_after
│   ├── performed_by (admin_id)
│   ├── notes
│   └── created_at
└── Used By: Processes 2.0, 9.0

D3: borrow_requests
├── Description: Teacher borrow requests
├── Primary Key: id
├── Contents:
│   ├── teacher_id (FK to teachers)
│   ├── item_id (FK to tools_equipment)
│   ├── quantity_requested
│   ├── purpose
│   ├── borrow_date
│   ├── expected_return_date
│   ├── actual_return_date
│   ├── status (pending/approved/borrowed/returned/rejected)
│   ├── admin_notes
│   ├── condition_before
│   ├── condition_after
│   ├── deleted_at (soft delete)
│   └── deleted_by
└── Used By: Processes 3.0, 7.0, 8.0

D4: distribution_requests
├── Description: Teacher distribution requests
├── Primary Key: id
├── Contents:
│   ├── teacher_id (FK to teachers)
│   ├── item_id (FK to tools_equipment)
│   ├── quantity_requested
│   ├── reason
│   ├── notes
│   ├── status (pending/approved/rejected/distributed)
│   ├── reviewed_by (admin_id)
│   ├── admin_notes
│   ├── reviewed_at
│   ├── distribution_id (FK to item_distributions)
│   └── deleted_at (soft delete)
└── Used By: Processes 4.0, 7.0, 8.0

D5: item_distributions
├── Description: Active item distributions to teachers
├── Primary Key: id
├── Contents:
│   ├── teacher_id (FK to teachers)
│   ├── item_id (FK to tools_equipment)
│   ├── quantity
│   ├── distribution_date
│   ├── expected_return_date
│   ├── actual_return_date
│   ├── status (active/returned/cancelled)
│   ├── notes
│   ├── distributed_by (admin_id)
│   └── deleted_at (soft delete)
└── Used By: Processes 4.0, 8.0

D6: teacher_inventory
├── Description: Items assigned to teachers
├── Primary Key: id
├── Contents:
│   ├── teacher_id (FK to teachers)
│   ├── item_name
│   ├── description
│   ├── category
│   ├── quantity
│   ├── condition_status
│   ├── acquisition_date
│   ├── notes
│   └── deleted_at (soft delete)
└── Used By: Processes 4.0

D7: purchase_orders
├── Description: Purchase orders for new inventory
├── Primary Key: id
├── Contents:
│   ├── po_number (auto-generated)
│   ├── po_date
│   ├── expected_delivery_date
│   ├── status (draft/pending/approved/ordered/received/cancelled)
│   ├── supplier_id (FK to suppliers)
│   ├── supplier_name
│   ├── supplier_contact_info
│   ├── company_info
│   ├── subtotal
│   ├── discount
│   ├── tax
│   ├── shipping_fee
│   ├── total_amount
│   ├── delivery_address
│   ├── payment_method
│   ├── payment_terms
│   ├── requested_by
│   ├── approved_by (admin_id)
│   ├── approval_date
│   ├── notes
│   ├── terms_conditions
│   ├── admin_id
│   ├── deleted_at (soft delete)
│   └── deleted_by
└── Used By: Processes 5.0, 8.0

D8: purchase_order_items
├── Description: Line items for purchase orders
├── Primary Key: id
├── Contents:
│   ├── purchase_order_id (FK to purchase_orders)
│   ├── item_name
│   ├── description
│   ├── quantity
│   ├── unit_price
│   ├── total_price
│   └── notes
└── Used By: Process 5.0

D9: notifications
├── Description: User notifications
├── Primary Key: id
├── Contents:
│   ├── user_type (admin/teacher)
│   ├── user_id
│   ├── type (request/approval/reminder/overdue/distribution)
│   ├── title
│   ├── message
│   ├── data (JSON - additional context)
│   ├── read_at
│   ├── reference_type
│   ├── reference_id
│   └── created_at
└── Used By: Process 7.0

D10: admins
├── Description: Admin user accounts
├── Primary Key: id
├── Contents:
│   ├── name
│   ├── email (unique)
│   ├── password (hashed)
│   ├── status (active/inactive)
│   ├── created_at
│   └── updated_at
└── Used By: Processes 1.0, 6.0

D11: system_logs
├── Description: System-wide activity logs
├── Primary Key: id
├── Contents:
│   ├── log_type (auth/inventory/request/distribution/purchase_order)
│   ├── action (create/update/delete/approve/reject)
│   ├── user_type (admin/teacher)
│   ├── user_id
│   ├── description
│   ├── ip_address
│   ├── user_agent
│   ├── reference_type
│   ├── reference_id
│   ├── metadata (JSON)
│   └── created_at
└── Used By: Processes 8.0, 9.0

D12: reports
├── Description: Generated reports
├── Primary Key: id
├── Contents:
│   ├── title
│   ├── type (inventory/borrow/teacher/overdue/distribution/purchase)
│   ├── generated_by (admin_id)
│   ├── date_from
│   ├── date_to
│   ├── filters (JSON)
│   ├── data (JSON)
│   ├── generated_at
│   └── deleted_at (soft delete)
└── Used By: Process 8.0

D13: login_attempts
├── Description: Authentication attempt logs
├── Primary Key: id
├── Contents:
│   ├── email
│   ├── user_type (admin/teacher)
│   ├── status (success/failed)
│   ├── ip_address
│   ├── user_agent
│   ├── attempted_at
│   └── failure_reason
└── Used By: Processes 1.0, 9.0

D14: teachers
├── Description: Teacher user accounts
├── Primary Key: id
├── Contents:
│   ├── employee_id (unique)
│   ├── first_name
│   ├── middle_initial
│   ├── last_name
│   ├── email (unique)
│   ├── password (hashed)
│   ├── department
│   ├── position
│   ├── phone
│   ├── status (active/inactive/suspended)
│   ├── created_at
│   ├── updated_at
│   └── deleted_at (soft delete)
└── Used By: Processes 1.0, 3.0, 4.0, 6.0

D15: personal_access_tokens
├── Description: API authentication tokens (Laravel Sanctum)
├── Primary Key: id
├── Contents:
│   ├── tokenable_type (Admin/Teacher)
│   ├── tokenable_id
│   ├── name
│   ├── token (hashed)
│   ├── abilities (JSON)
│   ├── last_used_at
│   ├── expires_at
│   └── created_at
└── Used By: Process 1.0

D16: distribution_groups
├── Description: Teacher collaboration groups
├── Primary Key: id
├── Contents:
│   ├── name
│   ├── description
│   ├── created_by (teacher_id)
│   ├── created_at
│   ├── updated_at
│   └── deleted_at (soft delete)
└── Used By: Process 4.0

D17: suppliers
├── Description: Supplier information
├── Primary Key: id
├── Contents:
│   ├── name
│   ├── contact_person
│   ├── email
│   ├── phone
│   ├── address
│   ├── city
│   ├── state
│   ├── postal_code
│   ├── country
│   ├── website
│   ├── tax_id
│   ├── payment_terms
│   ├── notes
│   ├── status (active/inactive)
│   ├── created_at
│   ├── updated_at
│   └── deleted_at (soft delete)
└── Used By: Process 5.0
```

