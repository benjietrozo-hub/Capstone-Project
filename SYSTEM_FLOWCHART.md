# OlineIMS Text-Based Flowchart

Below is the low-level text representation of the system workflows using standard ASCII characters. This does not require any special renderer or plugin to view.

```text
                              [ START ]
                                  |
                                  v
                        +-------------------+
                        |   Has Account?    |----(No)----> [ Register Account ]
                        +-------------------+                      |
                                  |                                |
                                (Yes)                              |
                                  |                                v
                        +-----------------------------------------------+
                        |             Unified Login System              |
                        |             (Role Verification)               |
                        |          (Checks Maintenance Mode)            |
                        +-----------------------------------------------+
                                  |                               |
                             (Is Admin)                      (Is Teacher)
                                  |                               |
                                  v                               v
+-------------------------------------------+   +-------------------------------------------+
|             ADMIN WORKFLOW                |   |            TEACHER WORKFLOW               |
+-------------------------------------------+   +-------------------------------------------+
|                                           |   |                                           |
| +--> [ Dashboard Analytics ]              |   | +--> [ Dashboard Analytics ]              |
| |      - View Real-time Stats             |   | |      - View Personal Metrics            |
| |                                         |   | |                                         |
| +--> [ Manage Inventory ]                 |   | +--> [ Browse Inventory ]                 |
| |      - Add, Edit, Archive Items         |   | |      |                                  |
| |      - Update Quantities                |   | |      +--> [ Request to Borrow ]         |
| |                                         |   | |      |      (Awaits Approval)           |
| +--> [ Manage Borrow Requests ] <---------|---| |      |                                  |
| |      |                                  |   | |      +--> [ Request Distribution ]      |
| |      +-- (Approve) -> [ Deduct Stock ]  |-->|-|                                         |
| |      |                                  |   | +--> [ My Requests & Items ]              |
| |      +-- (Reject)  -> [ Notify User ]   |   | |      - Check Status (Approved/Rejected) |
| |                                         |   | |      - [ Initiate Return Item ]         |
| +--> [ Manage Distributions ]             |   | |      |   |                              |
| |      - Create Distribution Groups       |   | |      |   v                              |
| |      - Execute Bulk Distributions       |   | |      | (Admin Confirms Return)          |
| |      - Export Logs (PDF/Excel)          |   | |      |   |                              |
| |                                         |   | |      |   v                              |
| +--> [ Manage Reports ] <-----------------|---| |      | [ Stock Restored ]               |
| |      - Resolve Lost/Damaged Items       |   | |      |                                  |
| |      - Track Issue History              |   | |      +-> [ Report Damaged/Lost Item ]   |
| |                                         |   | |                                         |
| +--> [ User Management ]                  |   | +--> [ View Distribution Groups ]         |
| |      - Approve/Reject Teachers          |   |        - See Assigned Consumables         |
| |                                         |   |                                           |
| +--> [ System Logs & Archive ]            |   |                                           |
|        - View Audit Trails                |   |                                           |
|        - Restore Soft-Deleted Data        |   |                                           |
+-------------------------------------------+   +-------------------------------------------+

.............................................................................................
                         BACKGROUND SUBSYSTEMS & ALGORITHMS
.............................................................................................

[ WebSocket & Email Engine ]
  * Triggers instantly across the system when:
    -> A new request is submitted, approved, or rejected.
    -> Stock falls below the minimum threshold.
    -> A borrowed item is overdue.

[ Database Transaction Controller ]
  * Triggers during Inventory Deductions:
    -> Locks the row to prevent "Race Conditions" (e.g., two people requesting the last item).
    -> Rolls back automatically if an error occurs during distribution.
    
[ Maintenance Mode Monitor ]
  * Polling/WebSocket system that forces non-admin users to log out when active.

=====================================================================
                      CURRENT ALGORITHMS USED
=====================================================================

1. DATA PROCESSING & LOGIC
   * Batch Processing Algorithm: Used in Bulk Distributions to iterate 
     over sets of teachers and items, performing bulk database inserts 
     and stock deductions in a single transaction.
   * State Machine Algorithm: Enforces strict lifecycle transitions for
     requests (Pending -> Approved/Rejected -> Issued -> Returned).
   * Set Theory (Array Differences): Used to calculate intersections and
     differences when updating Distribution Groups to see exactly who 
     was added or removed.

2. SEARCH, RETRIEVAL & AGGREGATION
   * Substring/Pattern Matching: Uses SQL LIKE operations for linear 
     searches across strings (searching inventory, teachers, logs).
   * Offset-Based Pagination Algorithm: Calculates total pages and uses 
     LIMIT/OFFSET to efficiently retrieve chunks of data.
   * Multi-Attribute Sorting: Employs database-level sorting algorithms 
     (like Quicksort/Mergesort internally) for ordering data.
   * Data Aggregation & Statistical Algorithms: Uses COUNT, SUM, and 
     GROUP BY algorithms to compile real-time dashboard metrics.

3. ARCHITECTURE & CONCURRENCY
   * Publish-Subscribe (Pub/Sub): The WebSocket server instantly pushes
     events (like low stock) only to subscribed clients (e.g., Admin).
   * Asynchronous Queueing (FIFO): The Email Notification Service uses a 
     First-In-First-Out queue to process emails in the background.
   * Pessimistic/Optimistic Locking: Wraps deductions in DB Transactions 
     to prevent race conditions when two users act simultaneously.

4. SECURITY, AUTHENTICATION & AUDITING
   * Cryptographic Hashing (Bcrypt): Secures passwords and security
     questions using one-way salted hashing.
   * Token-Based Authentication: Generates and verifies cryptographic 
     signatures (Sanctum/JWT) on every API request.
   * Token Bucket Algorithm (Rate Limiting): Prevents brute-force attacks
     by throttling requests over a specific timeframe.
   * Audit Trail / Event Sourcing Pattern: The System Logs meticulously 
     record every state change (who did what, and when) for accountability.

5. DATA INTEGRITY & EXPORTING
   * Soft Deletion (Tombstoning) Algorithm: Instead of permanently 
     destroying data, records are flagged with a `deleted_at` timestamp. 
     The Archive system uses algorithms to either completely purge or 
     restore these tombstones.
   * File Stream Generation: Algorithms used in Export features to 
     dynamically parse database objects into downloadable PDF/Excel files.

6. FRONTEND STATE MANAGEMENT
   * Stale-While-Revalidate (SWR): TanStack Query instantly returns cached 
     data while fetching fresh data in the background.
   * LRU Garbage Collection: Automatically sweeps memory to delete cached
     queries that haven't been accessed recently.
   * Virtual DOM Diffing Algorithm: React calculates the minimal O(n) DOM 
     manipulations needed to update the UI when state changes.
```
