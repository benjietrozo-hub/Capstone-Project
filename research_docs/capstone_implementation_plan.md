# Capstone Implementation Plan
### Web-Based Property Inventory Management System (OIMS)
**Last Updated:** May 5, 2026 | **Status:** Updated with v2 Research Document Requirements


---

## Part 1: Gap Analysis Summary

This plan cross-references three sources:
1. **The Capstone Research Document** (`.docx`)
2. **Panel Comments** — Proposal Defense + Final Defense
3. **Current Codebase** (`role-based-OIMS`)

---

## Part 2: Panel Comments vs. Current System State

### 🔴 CRITICAL GAPS — Not Yet Implemented

| Panel Requirement | Item Code | Status | Notes |
|---|---|---|---|
| Disable Borrow button when **all items** in a category have 0 available | FR 1.2 | ❌ Missing | Category-level disable is not wired to the button on the **categories view**. |
| **Teacher Digital Acceptance** for accountability | DOC 4.4.1 | ❌ Missing | Requirement from v2: Teacher must "Accept" distribution/borrowing digitally for it to be "legally binding." |
| **Chronological-Alphabetical Sorting** | DOC 1.1 | ⚠️ Partial | Requirement from v2: Items must be grouped by **Year of Acquisition** and then sorted alphabetically. |
| **Disposal/Lifespan Flagging** | DOC 1.2 | ❌ Missing | Requirement from v2: Flag items that exceed their expected lifespan. |
| **Penalty Handling** & Condition Validation | FR-005 | ⚠️ Partial | Requirement from v2: Return process needs specific condition validation and "penalty handling" logic. |
| **Large Report Optimization** | FR-008 | ❌ Missing | Noted as a deferral in v2 doc for summary reports. |
| **Notification Delay Fix** | FR-009 | ⚠️ Partial | v2 Status: "Sometimes Delay". Needs real-time performance optimization. |
| **Input Validation Hardening** | FR-012 | ⚠️ Partial | v2 Status: "Improve Validation". |
| **System Performance/Response Time** | NFR-05 | ⚠️ Partial | v2 Status: "Not Totally Accurate". Needs optimization for 3s load target. |
| **Uptime Monitoring Logs** | NFR-06 | ❌ Missing | v2 Status: "Deferred". Needs implementation of uptime tracking. |
| **Data Accuracy & Consistency** | NFR-10 | ⚠️ Partial | v2 Status: "Need Improvement". Cross-check records for consistency. |
| **Backup & Recovery Testing** | NFR-11 | ❌ Missing | v2 Status: "Deferred". Need formal test cases for data recovery. |
| Specific **return deadline** computed from quantity | FR 1.2 | ⚠️ Partial | Needs formula-based suggestion. |
| **Variety/Specification option** per item | FR 1.2 | ⚠️ Partial | Needs category-level attribute templates. |
| **Response Time Comparison** (Manual vs. System) | FR 1.2 | ✅ Done | Documented in `system_algorithms.md`. |
| **Algorithm/Steps** (Manual vs. System) | FR 1.2 | ✅ Done | Documented in `system_algorithms.md`. |
| System must be **deployed/hosted online** | Uncoded | ❌ Missing | Still runs on localhost. |
| **User Manual** with FAQ | Uncoded | ❌ Missing | No in-system help or external manual. |
| **SMART Objectives** in documentation | ARC 2.1 | ❌ Missing | Chapter 1 needs updating based on v2 objectives. |
| **Proof of Barangay Coordination** | FR 1.2 | ❌ Missing | No formal certification or photos. |



---

### 🟡 PARTIALLY IMPLEMENTED — Needs Refinement

| Panel Requirement | Item Code | Status | Notes |
|---|---|---|---|
| All borrowed items/transactions must have a **history log** | FR 1.2 | ✅ Mostly Done | `BorrowHistoryController.php` and `ReportsPage.tsx` implement a year-grouped history with drill-down. However, the **teacher side has no history view** — teachers can only see current requests in `MyRequestsPage.tsx`. |
| **Accountability: Transparency, Traceability, Auditability** | FR 1.1 | ✅ Mostly Done | `SystemLogController`, `LogsActivity` trait, and `LogsPage.tsx` exist. Missing: no **public-facing audit trail** visible to teachers for their own transactions. |
| **Operational Efficiency** (speed + resource utilization) | FR 1.1 | ⚠️ Missing context | The system is fast, but there is **no built-in benchmark** or report comparing manual vs. digital process time. |
| Pilot Testing Evidence | FR 1.3 | ⚠️ Missing | No structured pilot test results page, user feedback form, or testing artifacts in the repo. |

---

### ✅ ALREADY IMPLEMENTED — Confirmed in Codebase

| Requirement | Evidence |
|---|---|
| Borrow button disabled when specific item is `borrowed` or has pending requests | `BrowseInventoryPage.tsx` line 526: `disabled={item.status !== 'available' \|\| pending_requests_count > 0}` |
| Expected return date field required in borrow form | `BrowseInventoryPage.tsx` line 662–668; `BorrowRequestController.php` line 56 |
| Admin borrow request approval with item assignment | `BorrowRequestController.php` — full approve, reject, return lifecycle |
| Full borrow transaction history (admin side) | `BorrowHistoryController.php` + `ReportsPage.tsx` — year-grouped with detail modal |
| Item specifications via `custom_attributes` JSON | `InventoryItem` model, `InventoryItemController.php`, and Details modal in `BrowseInventoryPage.tsx` |
| Role-based access control (Admin / Teacher) | Entire architecture is role-separated with Auth guards |
| Notifications for borrow status changes | `NotificationService`, `NotificationController.php` |
| Soft-delete / Archive system | `ArchiveController.php`, `SoftDeletes` trait on models |
| System activity logs | `SystemLogController.php`, `LogsPage.tsx`, `LogsActivity` trait |
| Inventory categories with images | `ItemCategoryController.php`, `ItemCategory` model, category images in storage |

---

## Part 3: Prioritized Implementation Tasks

### 🔴 Priority 1 — System Logic Gaps (Most Impactful for Defense)

#### Task 1.1 — Disable Borrow Button at Category Level
**Panel Comment:** *"If all item like Epson printer was borrowed, the button should be disabled."*

- **Location:** `BrowseInventoryPage.tsx` — the **categories view** cards (lines 329–374)
- **What to do:** Add a check on the category card: if `cat.available_items === 0`, render a "Fully Borrowed" badge and remove/disable the click-through OR show the card grayed out with no borrow option.
- **Backend:** `available_items` is already returned by the API — just use it on the frontend card.

---

#### Task 1.2 — Computed Return Deadline Suggestion
**Panel Comment:** *"There should be a specific date as to when the item must be returned based on the number/quantity of each item."*

- **What to do:** Add a helper function that computes a suggested return date:
  - Base formula: e.g., `quantity × N days` (decide with adviser, e.g., 3 days per unit)
  - Pre-fill `expected_return_date` in the borrow form based on this formula
  - Show a tooltip: *"Suggested: {date} based on {quantity} item(s)"*
- **Location:** `BrowseInventoryPage.tsx` → `handleOpenRequestModal()` and the form field

---

#### Task 1.3 — Teacher-Side Transaction History
**Panel Comment:** *"All borrowed items/transactions must have a history log."*

- **Current state:** Admin has history in `ReportsPage.tsx`. Teachers only see active requests in `MyRequestsPage.tsx`.
- **What to do:** Add a **"My History"** tab or section in `MyRequestsPage.tsx` (or a new `MyHistoryPage.tsx`) showing completed/returned/rejected transactions with all details (item name, serial number, dates, purpose, status).
- **Backend:** `BorrowHistoryController::index()` can be reused — just add a teacher-scoped endpoint filtering by `teacher_id = auth()->id()`.

---

#### Task 1.4 — Attribute Template UI for Admin (Variety/Specification)
...
- **What to do:**
  1. Use the existing `custom_fields` table to define templates.
  2. Auto-render fields in Add/Edit modals.
  3. Filter by spec in Teacher view.

#### Task 1.5 — Teacher Digital Acceptance Flow
**Requirement from v2:** *"The teacher must 'Accept' the distribution digitally for the accountability to be legally binding in the system."*

- **Location:** `MyRequestsPage.tsx` and `DistributionHistory`
- **What to do:** Add an "Accept Receipt" or "Acknowledge" button for pending distributions. Update the record status to "Accepted" with a timestamp once clicked.
- **Backend:** Add an `acknowledged_at` column to `borrow_requests` or a separate table for distributions.

#### Task 1.6 — Chronological-Alphabetical Sorting
**Requirement from v2:** *"The proposed system will organize inventory records using a chronological-alphabetical approach, grouping items by year of acquisition and arranging them alphabetically."*

- **What to do:** Update the Category/Item list query to order by `acquisition_year DESC` then `name ASC`.
- **Backend:** Ensure `inventory_items` has an `acquisition_year` field (or extract from `date_acquired`).

#### Task 1.7 — Disposal/Lifespan Flagging
**Requirement from v2:** *"Flagging equipment that exceeds its expected lifespan to ensure accurate and up-to-date records."*

- **What to do:**
  - Add `expected_lifespan_years` to Category or Item.
  - On the dashboard, show a "Flagged for Disposal" count.
  - Display a red alert icon on items where `today - date_acquired > lifespan`.

#### Task 1.8 — Penalty & Condition Tracking (Return Flow)
**Requirement from v2:** *"Needs condition validation and penalty handling."*

- **What to do:**
  - Add "Penalty Amount" and "Remarks" to the Return modal.
  - If condition is "Damaged" or "Lost", prompt for penalty details.

#### Task 1.9 — Large Report Optimization
**Requirement from v2 (FR-008):** *"Large report optimization not yet implemented"*

- **What to do:** Implement pagination or "Load More" for summary tables. Use database-level aggregation for dashboard stats instead of loading all records.

#### Task 1.10 — Notification Performance Optimization
**Requirement from v2 (FR-009):** *"Sometimes Delay"*

- **What to do:** Review the WebSocket event loop and `NotificationService` to ensure messages are pushed immediately without waiting for other background tasks.

#### Task 1.11 — Input Validation & Accuracy
**Requirement from v2 (FR-012/NFR-10):** *"Improve Validation" / "Need Improvement"*

- **What to do:** Add stricter regex for serial numbers, ensure quantity limits are checked on both frontend and backend, and add database constraints to prevent inconsistent data states.

#### Task 1.12 — Maintenance & Uptime (NFR-06 / NFR-11)
- **What to do:** 
  - Create a simple log for system availability.
  - Document a "Backup & Recovery" procedure.
  - Perform a formal restore test to verify data integrity.

#### Task 1.13 — Official Printable Distribution List (PDF)
**Requirement from v2:** *"The system successfully consolidated borrowed items and assigned equipment into a clean, printable PDF/Web list."*

- **What to do:**
  - Enhance the "Print" button on the Distribution List page.
  - Ensure the layout matches the school's official printed distribution list format.
  - Include headers for "Assigned Personnel," "Quantity," "Serial Number," and "Condition."
  - Add a signature line for the Inventory Coordinator and Teacher.

#### Task 1.14 — Distribution Request Flow
**Requirement from v2:** *"Teacher... requesting additional items... Distribution Requests"*

- **What to do:**
  - Ensure Teachers can specifically request "Distribution" (permanent allocation) vs "Borrowing" (temporary).
  - Add a "Request Distribution" button in the Browse Inventory view for items that can be permanently assigned (like classroom tools).
  - Backend: Separate the `borrow_requests` logic or add a `request_type` (borrow vs distribute) to handle different approval workflows.



---

### 🟠 Priority 2 — Deployment & Accessibility

#### Task 2.1 — Deploy System Online
**Panel Comment:** *"The system must be uploaded to the internet."*

- **What to do:**
  1. Choose a hosting platform (suggested: **Railway** or **Render** for the Laravel backend + **Vercel** or **Netlify** for the React frontend, or a VPS with cPanel)
  2. Create `.env.production` for the backend with proper DB credentials, `APP_URL`, `SANCTUM_STATEFUL_DOMAINS`
  3. Update the frontend's `VITE_API_BASE_URL` to the live backend URL
  4. Run `php artisan migrate --force` and `php artisan storage:link` on the production server
  5. Configure CORS for the live domain in `config/cors.php`

> [!IMPORTANT]
> The WebSocket server (`websocket/` directory) also needs to be running on the production server or replaced with a managed service like **Pusher** or **Ably** for real-time notifications.

---

### 🟡 Priority 3 — Documentation & Research Artifacts

#### Task 3.1 — Response Time Comparison Table
**Panel Comment (FR 1.2):** *"Reflect in your methodology the comparison between manual and system in terms of response time. Include algorithm/steps between manual process to systematic process."*

- **What to produce:**
  Create a **benchmark table** in Chapter 3 (Methodology) of the document. Example:

| Process Step | Manual Process | Steps | Avg. Time | System Process | Steps | Avg. Time |
|---|---|---|---|---|---|---|
| Browse available items | Go to stockroom, check logbook | 4 steps | ~10 min | Open Browse Inventory page | 1 step | ~10 sec |
| Submit borrow request | Fill paper form, get signature | 5 steps | ~20 min | Click "Borrow Unit", fill form | 2 steps | ~30 sec |
| Admin approval | Find admin physically, review logbook | 6 steps | ~1 day | Admin views dashboard, clicks Approve | 3 steps | ~2 min |
| Return confirmation | Return item, admin signs logbook | 3 steps | ~15 min | Admin clicks "Mark Returned" | 1 step | ~1 min |
| Check borrow history | Search physical logbook manually | 5 steps | ~30 min | Filter history on Reports page | 1 step | ~5 sec |

- **In the system:** Optionally add a **"System Performance"** statistics card on the Admin Dashboard showing average response times from the `borrow_requests` timestamps (e.g., `approved_at - created_at`).

---

#### Task 3.2 — SMART Objectives Revision
**Requirement from v2 (Section 1.3):** *"To ensure objectives are Specific, Measurable, Attainable, Relevant, and Time-bound."*

**Exact Objectives to integrate into Chapter 1:**
1.  **Digitization:** Achieve 100% encoding of existing items within the first 3 months of implementation.
2.  **Tracking Speed:** Enable retrieval of any item record within 5 seconds during system use.
3.  **Data Integrity:** Consolidate identical items with 0% duplication errors during the evaluation period.
4.  **Process Efficiency:** Reduce distribution recording and reporting time by at least 50% within 2 months of use.
5.  **User Satisfaction:** Achieve at least a 90% satisfaction rating based on User Acceptance Testing (UAT).


---

#### Task 3.3 — User Manual with FAQ
**Panel Comment:** *"Provide a user manual on how to deploy and use your system and FAQ questions."*

- **Option A (In-system):** Add a `/help` route in the frontend with a Help page showing:
  - Role-specific guides (Admin Guide / Teacher Guide)
  - Step-by-step screenshots for common tasks (borrow, approve, return, view history)
  - FAQ section (accordion-style)
- **Option B (External document):** Create a `USER_MANUAL.pdf` in the `docs/` folder
- **Recommended:** Do **both** — the in-system help page for usability, plus a PDF for the panel routing.

---

#### Task 3.4 — Pilot Testing Evidence Module
**Panel Comment (FR 1.3):** *"Provide more proof of objectives accomplishment. More pilot testing to the end-user."*

- **What to produce:**
  1. A **structured pilot test** with actual barangay staff as users
  2. Capture **response time data** (manual vs. system) using a stopwatch or browser DevTools timing
  3. Create a **feedback form** (Google Forms or embedded in the system) for end-user satisfaction ratings
  4. Document results in Chapter 4 with tables, charts, and screenshots

---

### 🟢 Priority 4 — Polish & Documentation Formatting

#### Task 4.1 — Update System Architecture Diagram
**Panel Comment (FR 1.1):** *"Update your system architecture and requirements based on the comments of the panel."*

The current architecture should now reflect:
- React (Vite) Frontend → Laravel REST API Backend → MySQL Database
- WebSocket Server for real-time notifications
- Role-based access: Admin & Teacher
- Serialized inventory model (categories → items with serial numbers)
- The new modules: Borrow lifecycle, Distribution, Archive/Trash, History

#### Task 4.2 — Follow Capstone Template Format
**Panel Comment:** *"Follow capstone template format."*

- Align the `.docx` with the Caraga State University capstone template
- Ensure Chapter 1–4 headings, spacing, fonts, and citation format match the required template

#### Task 4.3 — Barangay Coordination Proof
**Panel Comment (FR 1.2):** *"Please coordinate to the barangay in the development of the system."*

- Prepare a formal **coordination letter** to the Barangay
- Take **photos during deployment/training**
- Have the Barangay Secretary or Chairman sign a **certification letter** confirming system deployment
- Include these in the appendix of the capstone document

---

## Part 4: Execution Timeline

```
Week 1 (May 6–10):
  ✦ Task 1.1 — Disable Borrow button at category level (2 hours)
  ✦ Task 1.2 — Computed return deadline suggestion (3 hours)
  ✦ Task 1.3 — Teacher-side history page (4 hours)

Week 2 (May 11–17):
  ✦ Task 1.4 — Attribute template UI (4–6 hours)
  ✦ Task 3.3 — User Manual / Help Page (6 hours)
  ✦ Task 2.1 — Begin deployment setup (ongoing)

Week 3 (May 18–24):
  ✦ Task 3.1 — Response time comparison (documentation)
  ✦ Task 3.2 — SMART objectives revision (documentation)
  ✦ Task 4.1 — Update system architecture diagram
  ✦ Task 3.4 — Conduct pilot testing with barangay users

Week 4 (May 25–31):
  ✦ Task 4.2 — Capstone template formatting
  ✦ Task 4.3 — Barangay coordination proof
  ✦ Final review with adviser
  ✦ System goes live
```

---

## Part 5: Quick Reference — Files to Modify

| Task | Files |
|---|---|
| 1.1 Disable category button | `frontend/src/pages/Teacher/BrowseInventoryPage.tsx` |
| 1.2 Return date suggestion | `frontend/src/pages/Teacher/BrowseInventoryPage.tsx` |
| 1.3 Teacher history page | `frontend/src/pages/Teacher/MyRequestsPage.tsx` (or new `MyHistoryPage.tsx`), new backend route in `routes/api.php`, possibly a new teacher-scoped controller method |
| 1.4 Attribute template UI | `frontend/src/pages/admin/InventoryPage.tsx`, `backend/app/Http/Controllers/API/Admin/ItemCategoryController.php`, `backend/app/Models/ItemCategory.php` |
| 2.1 Deployment | `.env`, `config/cors.php`, `frontend/.env.production`, Dockerfile or hosting config |
| 3.3 Help page | New `frontend/src/pages/HelpPage.tsx`, add route in router |

---

> [!NOTE]
> **Do not start editing files until this plan is reviewed and approved.** Each task above is a standalone unit of work. Confirm priority order with your adviser before proceeding.
