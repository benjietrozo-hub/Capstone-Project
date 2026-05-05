# System Algorithms
## Web-Based Property Inventory Management System (OIMS)
### Caraga State University — Capstone Project Documentation
**Chapter 3 Supplement: Algorithm / Process Comparison**

---

## Overview

This document presents the formal algorithms for all major processes in the Web-Based Property Inventory Management System. For each process, two algorithms are defined:

- **Algorithm A** — The **Manual Process** (traditional paper-based approach used before the system)
- **Algorithm B** — The **Systematic Process** (digital process implemented in the OIMS)

These are used in Chapter 3 (Methodology) to measure and compare response time and operational efficiency as required by the panel's revision comments (FR 1.1, FR 1.2).

---

## PROCESS 1: Inventory Item Registration

### Algorithm 1-A: Manual Process (Adding Equipment to the Logbook)

```
ALGORITHM: ManualInventoryRegistration
INPUT:  Physical equipment item, paper logbook, pen
OUTPUT: Handwritten entry in the property inventory logbook

BEGIN
  STEP 1: Admin receives newly acquired equipment.
  STEP 2: Admin locates the physical property logbook.
  STEP 3: Admin manually writes the following on the logbook:
            - Equipment name
            - Property number (assigned manually by reference to previous entries)
            - Serial number (copied from the item label)
            - Condition of item (assessed visually)
            - Date acquired
            - Location/room assigned
  STEP 4: Admin verifies handwritten entry for errors.
  STEP 5: Admin signs the logbook entry.
  STEP 6: Logbook is returned to storage cabinet.
  STEP 7: If item has specifications (RAM, storage, etc.):
            - Admin writes a separate note or attaches a sticky label
  STEP 8: END — Item is now registered.

ESTIMATED TIME: 10 to 20 minutes per item
ERROR RISK:    High (illegible handwriting, missing fields, duplicate entries)
END
```

---

### Algorithm 1-B: Systematic Process (Digital Inventory Registration)

```
ALGORITHM: SystemInventoryRegistration
INPUT:  Admin credentials (JWT token), item data via web form
OUTPUT: InventoryItem record stored in MySQL database

BEGIN
  STEP 1: Admin logs into the system using email and password.
            -> System validates credentials via Sanctum authentication.
            -> JWT Bearer Token is issued and stored in browser localStorage.

  STEP 2: Admin navigates to: Admin Dashboard -> Inventory -> Add Item.

  STEP 3: Admin selects a Category (ItemCategory) from the dropdown.
            -> System fetches categories via GET /api/admin/inventory/categories
            -> If no matching category exists, admin creates one first.

  STEP 4: Admin fills in the item form:
            - Item Name         (string, required)
            - Serial Number     (string, required, unique)
            - Property Number   (auto-generated if blank: "AST-{id:06}")
            - Condition:        excellent / good / fair / poor / damaged
            - Status:           available / maintenance / damaged
            - Date Acquired     (date picker)
            - Location          (text field)
            - Item Image        (optional file upload, max 2MB)
            - Custom Attributes (key-value pairs per category template)

  STEP 5: Admin clicks "Add Item" (Submit).
            -> POST /api/admin/inventory/items

  STEP 6: Backend (InventoryItemController@store) executes:
            a. Validate all fields using Laravel validation rules.
            b. IF item_image is uploaded:
                 - Store image in /storage/app/public/serialized_items/
            c. Create InventoryItem record in MySQL.
            d. IF property_number is empty:
                 - Auto-generate: "AST-" + str_pad(item.id, 6, "0")
            e. Log activity: "Created serialized item: {serial_number}"
            f. Return HTTP 201 Created with item data.

  STEP 7: Frontend receives success response.
            -> Toast notification: "Item added successfully."
            -> Inventory table refreshes automatically.

  STEP 8: END — Item is now registered in the database.

ESTIMATED TIME: 1 to 3 minutes per item (seconds for bulk entry)
ERROR RISK:    Low (validation prevents duplicate serials, missing fields)
END
```

---

## PROCESS 2: Browsing Available Inventory

### Algorithm 2-A: Manual Process

```
ALGORITHM: ManualInventoryBrowse
INPUT:  Teacher request, physical access to stockroom or logbook
OUTPUT: Teacher identifies available equipment

BEGIN
  STEP 1: Teacher goes to the property custodian's office.
  STEP 2: Teacher requests to view the equipment logbook.
  STEP 3: Custodian retrieves the logbook from the cabinet.
  STEP 4: Teacher manually scans each logbook page to find:
            - Equipment type needed
            - Whether it is currently available or borrowed
  STEP 5: If equipment is borrowed, teacher must wait or return later.
  STEP 6: Teacher notes item details on paper for their request form.
  STEP 7: END — Teacher has identified available equipment.

ESTIMATED TIME: 15 to 30 minutes
ERROR RISK:    High (logbook may be outdated, custodian may not be present)
END
```

---

### Algorithm 2-B: Systematic Process

```
ALGORITHM: SystemInventoryBrowse
INPUT:  Teacher credentials (JWT token)
OUTPUT: List of available inventory items with real-time status

BEGIN
  STEP 1: Teacher logs in using their Teacher ID and password.
            -> System validates via Sanctum. JWT token stored in localStorage.

  STEP 2: Teacher navigates to: Teacher Dashboard -> Browse Inventory.

  STEP 3: System loads parent categories:
            -> GET /api/teacher/inventory/parent-categories
            -> Displays master category cards (e.g., Electronics, Office Equipment)

  STEP 4: Teacher clicks a parent category card.
            -> System fetches sub-categories:
            -> GET /api/teacher/inventory?parent_category={name}&per_page=50

  STEP 5: System renders category cards showing:
            - Category name and image
            - Available count (available_items)
            - Total units   (total_items)
            IF available_items = 0:
              -> Category card is marked "Fully Borrowed" (no borrow action)

  STEP 6: Teacher clicks a category card to view individual units.
            -> GET /api/teacher/inventory/categories/{id}
            -> Returns InventoryItem records with:
                serial_number, property_number, condition, status,
                item_image, custom_attributes, pending_requests_count

  STEP 7: For each item card displayed:
            IF item.status = "available" AND pending_requests_count = 0:
              -> "Borrow Unit" button is ENABLED (green)
            ELSE:
              -> Button is DISABLED with label "Already Borrowed" or "Requested"

  STEP 8: Teacher can view item specifications:
            -> Click "View Details" -> shows custom_attributes
               (e.g., RAM: 8GB, Storage: 512GB SSD, Processor: Intel i5)

  STEP 9: END — Teacher identifies available equipment in real-time.

ESTIMATED TIME: 10 to 30 seconds
ERROR RISK:    Very Low (data is live from database, always current)
END
```

---

## PROCESS 3: Submitting a Borrow Request

### Algorithm 3-A: Manual Process

```
ALGORITHM: ManualBorrowRequest
INPUT:  Teacher fills out a paper Borrow Request Form
OUTPUT: Signed paper form submitted to property custodian

BEGIN
  STEP 1: Teacher obtains a blank Borrow Request Form from the office.
  STEP 2: Teacher handwrites:
            - Name and Teacher ID
            - Department
            - Equipment needed and quantity
            - Purpose / reason for borrowing
            - Requested date
            - Intended return date
  STEP 3: Teacher submits the form to the property custodian.
  STEP 4: Teacher waits for custodian review (may take 1 day or more).
  STEP 5: END — Request has been submitted on paper.

ESTIMATED TIME: 20 to 40 minutes (travel + form filling + submission)
ERROR RISK:    High (form may be lost, custodian may be absent)
END
```

---

### Algorithm 3-B: Systematic Process

```
ALGORITHM: SystemBorrowRequest
INPUT:  Teacher JWT token, selected item/category, form data
OUTPUT: BorrowRequest record stored in database, admin notified instantly

BEGIN
  STEP 1: From Browse Inventory (after Algorithm 2-B):
            Teacher clicks "Borrow Unit" on an available item.

  STEP 2: System opens the Borrow Request Modal with:
            - Item name and serial number pre-filled
            - Expected Return Date (required, minimum = today)
            - Quantity (if borrowing by category, max = available_items)
            - Purpose / Reason (textarea, required)

  STEP 3: Teacher completes the form and clicks "Submit Request".
            -> POST /api/teacher/borrow-requests
            Request body:
              {
                category_id:          <int>,
                inventory_item_id:    <int|null>,
                quantity:             <int>,
                purpose:              <string>,
                expected_return_date: <date>
              }

  STEP 4: Backend processes the request:
            a. Validate all fields.
            b. Check that category has available items.
            c. Check for existing pending requests (prevent duplicates).
            d. Generate unique request_code (e.g., "BR-2026-00045").
            e. Create BorrowRequest with status = "pending".
            f. Fire: NotificationService::notifyAdminNewRequest()
               -> Admin receives real-time notification via WebSocket.

  STEP 5: Frontend receives HTTP 201 response.
            -> Toast: "Request Submitted! Waiting for admin approval."
            -> Inventory page refreshes (available count updates live).

  STEP 6: Teacher monitors request in:
            Teacher Dashboard -> My Requests
            -> Status lifecycle: pending -> borrowed -> returned / rejected

  STEP 7: END — Request submitted. Admin is notified instantly.

ESTIMATED TIME: 30 seconds to 2 minutes
ERROR RISK:    Very Low (backend validation enforced, duplicate prevention)
END
```

---

## PROCESS 4: Admin Approval of a Borrow Request

### Algorithm 4-A: Manual Process

```
ALGORITHM: ManualAdminApproval
INPUT:  Paper borrow request form submitted by teacher
OUTPUT: Approved or rejected form returned to teacher with custodian signature

BEGIN
  STEP 1: Property custodian receives the paper form.
  STEP 2: Custodian checks the physical stockroom for item availability.
  STEP 3: Custodian reviews the purpose and verifies teacher identity.
  STEP 4: IF item is available:
              a. Custodian writes approval on the form and signs it.
              b. Custodian records the borrow in the logbook:
                   - Borrower name, item, date borrowed, expected return date
              c. Custodian retrieves the physical item and hands it to teacher.
          ELSE:
              a. Custodian writes rejection reason on the form.
              b. Returns form to teacher.
  STEP 5: END — Request processed.

ESTIMATED TIME: 30 minutes to 1 full working day
ERROR RISK:    High (custodian may be on leave, logbook entry may be missed)
END
```

---

### Algorithm 4-B: Systematic Process

```
ALGORITHM: SystemAdminApproval
INPUT:  Admin JWT token, BorrowRequest ID, selected inventory_item IDs
OUTPUT: BorrowRequest set to "borrowed", items set to "borrowed",
        teacher notified via WebSocket

BEGIN
  STEP 1: Admin receives real-time notification of new borrow request.
            -> Notification bell icon updates in the dashboard NavHeader.

  STEP 2: Admin navigates to: Admin Dashboard -> Borrow Requests.
            -> GET /api/admin/borrow-requests?status=pending
            -> Table shows: request_code, teacher, category, qty, date.

  STEP 3: Admin clicks "Approve" on a pending row.
            -> Approval Modal opens showing:
                - Category name and quantity requested
                - Scrollable checkbox list of AVAILABLE items in that category
                  (GET /api/admin/inventory/items?category_id={id}&status=available)
                - Expected Return Date field (required)
                - Admin Notes field (optional)

  STEP 4: Admin selects exactly {quantity_requested} items by serial number.
            IF selected count != quantity_requested:
              -> Error: "Please select exactly {n} items."

  STEP 5: Admin sets return date and clicks "Confirm Approval".
            -> POST /api/admin/borrow-requests/{id}/approve
            Request body:
              {
                inventory_item_ids:   [<int>, ...],
                expected_return_date: <date>,
                admin_notes:          <string|null>
              }

  STEP 6: Backend (BorrowRequestController@approve) runs DB transaction:
            a. Verify all selected items have status = "available".
            b. Verify all selected items belong to correct category_id.
            c. Verify count matches quantity_requested.
            d. UPDATE inventory_items
               SET status = "borrowed"
               WHERE id IN (selected_ids)
            e. INSERT borrow_request_items (pivot):
               { borrow_request_id, inventory_item_id, status: "borrowed",
                 created_at, updated_at }
            f. UPDATE borrow_requests
               SET status = "borrowed",
                   expected_return_date = {date},
                   approved_by = {admin_id},
                   issued_by   = {admin_id}
            g. DB::commit()

  STEP 7: Log: "Approved borrow request for {category} by {teacher name}"
  STEP 8: NotificationService::notifyBorrowRequestApproved(br)
            -> Teacher receives: "Your request has been approved."

  STEP 9: Frontend auto-refreshes the requests table.
            -> Toast: "Request approved successfully."

  STEP 10: END — Items reserved for teacher. Inventory count decreases.

ESTIMATED TIME: 1 to 3 minutes
ERROR RISK:    Very Low (atomic DB transaction — partial updates are impossible)
END
```

---

## PROCESS 5: Item Return Processing

### Algorithm 5-A: Manual Process

```
ALGORITHM: ManualItemReturn
INPUT:  Physical items returned by teacher, paper logbook
OUTPUT: Return entry recorded in logbook, items returned to stockroom

BEGIN
  STEP 1: Teacher physically returns items to the property custodian's office.
  STEP 2: Custodian visually inspects items for damage.
  STEP 3: Custodian locates the original borrow entry in the logbook.
  STEP 4: Custodian writes the actual return date next to the borrow entry.
  STEP 5: Custodian updates the stockroom count manually.
  STEP 6: Custodian signs the logbook to confirm return.
  STEP 7: Teacher signs the logbook as acknowledgment of return.
  STEP 8: END — Item return is recorded.

ESTIMATED TIME: 10 to 20 minutes
ERROR RISK:    High (entry may be missed, condition not formally documented)
END
```

---

### Algorithm 5-B: Systematic Process

```
ALGORITHM: SystemItemReturn
INPUT:  Admin JWT token, BorrowRequest ID
OUTPUT: BorrowRequest set to "returned", InventoryItems set to "available",
        teacher notified

BEGIN
  STEP 1: Admin navigates to Admin Dashboard -> Borrow Requests.
            -> Filters by status = "borrowed" to see active loans.

  STEP 2: Admin clicks "Return" on the target borrowed row.
            -> POST /api/admin/borrow-requests/{id}/return
            Request body:
              {
                return_notes:          <string|null>,
                inventory_item_ids:    [<int>, ...]  // optional partial return
              }

  STEP 3: Backend (BorrowRequestController@return) runs DB transaction:
            a. Verify borrow_request.status = "borrowed".
            b. IF inventory_item_ids provided:
                 itemsToReturn = provided IDs  (supports partial return)
               ELSE:
                 itemsToReturn = ALL items linked to this request
            c. UPDATE inventory_items
               SET status = "available"
               WHERE id IN (itemsToReturn)
            d. UPDATE borrow_request_items (pivot)
               SET status      = "returned",
                   returned_at = NOW(),
                   updated_at  = NOW()
               WHERE inventory_item_id IN (itemsToReturn)
            e. Check if ALL pivot records now have status = "returned":
               IF stillBorrowedCount = 0:
                 UPDATE borrow_requests
                 SET status      = "returned",
                     received_by = {admin_id}
            f. DB::commit()

  STEP 4: Log: "Items returned for {category} by {teacher name}"
  STEP 5: NotificationService::notifyItemReturned(br)
            -> Teacher receives return confirmation notification.

  STEP 6: Frontend refreshes automatically.
            -> Toast: "Item returned successfully."
            -> Item reappears as "available" in Browse Inventory.

  STEP 7: END — Return recorded. Items available for the next borrower.

ESTIMATED TIME: 30 seconds to 1 minute
ERROR RISK:    Very Low (partial return supported; all changes are atomic)
END
```

---

## PROCESS 6: Retrieving Transaction History

### Algorithm 6-A: Manual Process

```
ALGORITHM: ManualHistoryRetrieval
INPUT:  Staff member, physical logbook, date range to search
OUTPUT: List of transactions found by manual page-by-page search

BEGIN
  STEP 1: Staff member retrieves the physical logbook from the cabinet.
  STEP 2: Staff member manually flips through each page to find entries.
  STEP 3: IF searching for a specific teacher:
            -> Must scan every entry for a matching name.
  STEP 4: IF searching for a date range:
            -> Must check each date stamp manually.
  STEP 5: Staff member writes down or photocopies relevant entries.
  STEP 6: Staff returns logbook to cabinet.
  STEP 7: END — History retrieved.

ESTIMATED TIME: 20 to 60 minutes (depending on logbook length)
ERROR RISK:    High (entries may be illegible, pages may be missing or torn)
END
```

---

### Algorithm 6-B: Systematic Process

```
ALGORITHM: SystemHistoryRetrieval
INPUT:  Admin JWT token, optional filters (year, status, search keyword)
OUTPUT: Paginated borrow transaction list grouped by year

BEGIN
  STEP 1: Admin navigates to Admin Dashboard -> Reports -> Borrow History tab.

  STEP 2: System fetches available years:
            -> GET /api/admin/borrow-history/years
            -> Returns: [2026, 2025, 2024, ...]

  STEP 3: System auto-expands the most recent year and loads its records:
            -> GET /api/admin/borrow-history?year={year}&per_page=200

  STEP 4: Backend (BorrowHistoryController@index) executes:
            SELECT borrow_requests.*
            FROM   borrow_requests
              JOIN teachers       ON borrow_requests.teacher_id  = teachers.id
              JOIN item_categories ON borrow_requests.category_id = item_categories.id
            WHERE  YEAR(borrow_requests.created_at) = {year}
              AND  borrow_requests.status IN
                   ('returned','borrowed','rejected','cancelled','approved')
              [AND  borrow_requests.status = {filter}   IF provided]
              [AND  (teacher.first_name LIKE '%{search}%'
                  OR request_code       LIKE '%{search}%'
                  OR category_name      LIKE '%{search}%')  IF search provided]
            ORDER  BY borrow_requests.created_at DESC
            LIMIT  200

  STEP 5: System renders year-grouped accordion table with columns:
            - Transaction Code (request_code)
            - Teacher name and department
            - Equipment category and unit count
            - Date requested and Expected return date
            - Status badge (returned / borrowed / rejected / cancelled)
            - Eye icon -> opens Transaction Detail Modal

  STEP 6: Admin expands/collapses any year section on demand.

  STEP 7: Admin applies search/filter without page reload:
            -> Status filter and search field update all expanded sections live.

  STEP 8: Admin clicks the Eye icon -> Detail Modal shows:
            - Request code and status
            - Teacher information (name, email, department)
            - Allocated inventory items (serial numbers + return status)
            - Purpose statement

  STEP 9: END — Full history retrieved and displayed.

ESTIMATED TIME: 3 to 10 seconds
ERROR RISK:    Very Low (indexed DB queries, paginated and searchable results)
END
```

---

## PROCESS 7: User Authentication (System Login)

### Algorithm 7-B: Systematic Process

```
ALGORITHM: SystemLogin
INPUT:  Email (or Teacher ID), Password
OUTPUT: JWT Bearer Token issued; user redirected to role-based dashboard

BEGIN
  STEP 1: User opens the system URL in any modern browser.
  STEP 2: User enters email and password on the Login page.
  STEP 3: User clicks "Login".
            -> POST /api/login
            Request body: { email, password }

  STEP 4: Backend (AuthController) executes:
            a. Validate email and password format.
            b. Check login_attempts table:
                 IF failed_attempts >= 5 in the last 15 minutes:
                   -> Return HTTP 429: "Too many attempts. Try again later."
            c. Attempt Sanctum authentication.
            d. IF credentials invalid:
                 - Increment login_attempts counter.
                 - Return HTTP 401: "Invalid credentials."
            e. IF credentials valid:
                 - Clear login_attempts counter.
                 - Generate Sanctum API token.
                 - Return HTTP 200:
                   { token, user: { id, name, role } }

  STEP 5: Frontend stores token and user in localStorage.
            Redirects based on role:
              IF role = "admin"   -> /admin/dashboard
              IF role = "teacher" -> /teacher/dashboard

  STEP 6: END — User authenticated with full role-based access.

ESTIMATED TIME: 3 to 5 seconds
SECURITY:      Brute-force protection via login_attempts table;
               Sanctum token-based authentication
END
```

---

## Summary: Response Time Comparison Table

| No. | Process | Manual Steps | Manual Avg. Time | System Steps | System Avg. Time | Reduction |
|:---:|---|:---:|:---:|:---:|:---:|:---:|
| 1 | Register Inventory Item | 8 | ~15 min | 8 | ~2 min | **~87%** |
| 2 | Browse Available Items | 7 | ~20 min | 9 | ~20 sec | **~98%** |
| 3 | Submit Borrow Request | 5 | ~30 min | 7 | ~1 min | **~97%** |
| 4 | Admin Approval Processing | 5 | ~4 hours | 10 | ~2 min | **~98%** |
| 5 | Item Return Processing | 8 | ~15 min | 7 | ~1 min | **~93%** |
| 6 | Retrieve Transaction History | 7 | ~40 min | 9 | ~5 sec | **~99%** |
| 7 | User Authentication (Login) | N/A | ~5 min | 6 | ~4 sec | **~99%** |

> **Note on Step Count:** The system process includes validation, database operations,
> and notification triggers that execute automatically and simultaneously in the background.
> The actual user-visible interactions are far fewer steps than the manual process.

---

## System Architecture Supporting the Algorithms

```
+------------------------------------------------------------------+
|                     USER LAYER (Browser)                         |
|   React + Vite (TypeScript) Frontend                             |
|   Roles: Admin | Teacher                                         |
|   Pages: Browse Inventory, Borrow Requests, Reports,             |
|          Inventory Management, Dashboard, Logs                   |
+----------------------------+-------------------------------------+
                             |  HTTPS REST API
                             v
+------------------------------------------------------------------+
|                  APPLICATION LAYER (Backend)                     |
|   Laravel 11 (PHP)  |  Laravel Sanctum Authentication           |
|                                                                  |
|   Controllers:                                                   |
|   - BorrowRequestController  (approve, reject, return)           |
|   - InventoryItemController  (CRUD, bulk create)                 |
|   - ItemCategoryController   (categories + custom fields)        |
|   - BorrowHistoryController  (history, years, stats)             |
|   - SystemLogController      (audit trail)                       |
|   - NotificationController   (real-time alerts)                  |
|                                                                  |
|   Middleware: auth:sanctum | role-check                          |
+----------------------------+-------------------------------------+
                             |  Eloquent ORM (SQL)
                             v
+------------------------------------------------------------------+
|                    DATA LAYER (Database)                         |
|   MySQL Database                                                 |
|                                                                  |
|   Key Tables:                                                    |
|   admins / teachers         - Users with role-based access       |
|   item_categories           - Equipment categories               |
|   custom_fields             - Per-category attribute templates   |
|   inventory_items           - Serialized units (serial numbers)  |
|   borrow_requests           - Request lifecycle tracking         |
|   borrow_request_items      - Pivot: request <-> inventory units |
|   system_logs               - Immutable audit trail              |
|   notifications             - Per-user real-time alerts          |
|   login_attempts            - Brute-force protection             |
+----------------------------+-------------------------------------+
                             |  WebSocket (Port 8080)
                             v
+------------------------------------------------------------------+
|              REAL-TIME NOTIFICATION LAYER                        |
|   Ratchet PHP WebSocket Server                                   |
|   Delivers instant push notifications to connected browsers      |
|   Events: new request | approval | rejection | item return       |
+------------------------------------------------------------------+
```

---

## Key Algorithmic Properties (Accountability Metrics)

| Property | Manual System | OIMS — Digital System |
|---|---|---|
| **Transparency** | Low — records only visible to custodian | High — all users see real-time status |
| **Traceability** | Low — handwritten, no audit trail | High — every action logged in `system_logs` with timestamp and user |
| **Auditability** | Low — signatures can be backdated | High — server-side timestamps, user-linked actions cannot be altered |
| **Speed** | 15 min to 4 hours per process | 5 seconds to 3 minutes per process |
| **Resource Utilization** | Paper, pen, physical cabinet, custodian travel | Server compute, MySQL queries, browser rendering |
| **Error Rate** | High (human error, illegible entries) | Low (server-side validation enforced) |
| **Concurrent Access** | None (one user per logbook at a time) | Unlimited simultaneous users |
| **History Retrieval** | 20–60 minutes manual search | 3–10 seconds database query |

---

*Document: System Algorithm Documentation*
*Project: Web-Based Property Inventory Management System (OIMS)*
*Institution: Caraga State University*
*Purpose: Chapter 3 (Methodology) — Algorithm and Process Comparison (FR 1.2)*
