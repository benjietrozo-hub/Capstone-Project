# Implementation Plan: System Performance & Accountability Enhancement

This document outlines the proposed changes to resolve slow loading pages and fetching files, while enhancing system accountability and scaling for production.

## 🚀 Implementation Checklist

### Phase 1: Speed Optimization (Quick Wins)
- [x] 1.1 Optimize WebSocket Queue (Message-per-file approach)
- [x] 1.2 Compress Large Assets (`Logo_n.jpg`)
- [x] 1.3 Cleanup `.env` and environment configuration

### Phase 2: Backend Performance (Scalability)
- [x] 2.1 Implement Background Queues for Logging/Notifications
- [x] 2.2 Add Database Indexes & Eager Loading
- [x] 2.3 Implement Dashboard Stats Caching

### Phase 3: Accountability & Auditing
- [x] 3.1 Record State-Change Snapshots (Old vs New values)
- [x] 3.2 Implement Detailed Login/Security History
- [x] 3.3 Create Automated Log Retention Policy

### Phase 4: Frontend Performance
- [x] 4.1 Implement React Query for Data Caching
- [x] 4.2 Add Skeleton Loaders for Perceived Speed

### Phase 5: REST API Standards
- [x] 5.1 Implement Request Correlation IDs
- [x] 5.2 Optimize for Partial Responses (Infrastructure ready)
- [x] 5.3 Standardize API Error Handling

### Phase 6: Deployment & Scaling (Future)
- [ ] 6.1 Transition to Redis for Cache/Session/Queue
- [ ] 6.2 Nginx + PHP-FPM Configuration

### Phase 7: Professional Hardening (Future)
- [ ] 7.1 Set up Automated Off-site Backups
- [ ] 7.2 Implement Automated Testing Suite

---

## 1. Speed Optimization (Phase 1)

### 1.1 WebSocket Queue Optimization
- **Issue:** `WebSocketBroadcaster` reads/writes the entire `messages.json` with an exclusive lock on every broadcast.
- **Solution:** 
    - Switch to a **message-per-file** approach in the `websocket/queue/` directory.
    - Each broadcast creates a unique file (e.g., `msg_1714450000_random.json`).
    - The WebSocket server will scan the directory and process files in order, deleting them after processing.
    - This eliminates file contention and locking delays.

### 1.2 Asset Optimization
- **Issue:** `Logo_n.jpg` is 883KB.
- **Solution:** 
    - Compress the image to < 50KB using modern formats (WebP/JPEG with optimization).
    - Audit other assets in `frontend/public/` for similar issues.

### 1.3 Environment & Configuration
- **Issue:** Typos in `.env` and `APP_DEBUG=true` in local production-like environments.
- **Solution:**
    - Clean up `backend/.env`.
    - Optimize `php.ini` settings (Opcache enabled).
    - Ensure Vite is running in production mode for build tests.

## 2. Backend Performance (Phase 2)

### 2.1 Asynchronous Background Tasks
- **Issue:** Activity logging and notifications are synchronous.
- **Solution:**
    - Dispatch `SystemLog` creation and WebSocket broadcasts as **Background Jobs**.
    - Utilize Laravel's `queue:listen` (already configured in `start-all-services.bat`).
    - This will make requests feel instantaneous to the user.

### 2.2 Database Efficiency
- **Issue:** Frequent `count()` calls and potential N+1 queries.
- **Solution:**
    - Use `withCount()` in controllers to fetch counts along with models in a single query.
    - Add missing indexes to `tools_equipment` (item_name) and `system_logs` (action, severity).
    - Implement a 5-minute cache for dashboard statistics.

## 3. Accountability & Auditing (Phase 3)

### 3.1 Detailed Audit Trail
- **Requirement:** Enhance accountability for data changes.
- **Solution:**
    - Modify the `LogsActivity` trait to record `old_values` and `new_values` for `update` actions.
    - Store this snapshot in the `metadata` column of the `system_logs` table.

### 3.2 Login & Security History
- **Requirement:** Track user access more effectively.
- **Solution:**
    - Record successful logins with IP address, Browser User Agent, and Timestamp.
    - Implement a dedicated "Security Logs" view for Administrators.

### 3.3 Log Retention Policy
- **Requirement:** Prevent database bloat.
- **Solution:**
    - Create a scheduled command `logs:purge` to archive logs older than 90 days to a flat file and remove them from the database.

## 4. Frontend Performance (Phase 4)

### 4.1 Smarter Data Fetching
- **Solution:**
    - Implement `React Query` (TanStack Query) to handle caching and background re-fetching.
    - Add skeleton loaders to replace generic loading spinners for a better perceived performance.

## 5. REST API Standards & Optimization (Phase 5)

### 5.1 Request Correlation (Traceability)
- **Solution:**
    - Implement a middleware that attaches a unique `X-Request-ID` to every request.
    - Log this ID in both REST logs and WebSocket messages to allow end-to-end tracing of user actions.

### 5.2 Partial Responses & Eager Loading
- **Solution:**
    - Allow the frontend to request specific fields (Resource Narrowing) to reduce bandwidth.
    - Optimize API endpoints to use `with()` and `withCount()` to prevent N+1 query patterns.

### 5.3 Standardized Error Handling
- **Solution:**
    - Implement a global API error handler to ensure all errors return a consistent JSON structure with appropriate HTTP status codes.

## 6. Deployment & Production Scaling (Phase 6)

### 6.1 Redis Integration
- **Solution:**
    - Transition `CACHE_STORE`, `SESSION_DRIVER`, and `QUEUE_CONNECTION` from `database` to `redis`.
    - This offloads overhead from the MySQL database and significantly increases concurrent request handling.

### 6.2 Production Server Setup (Nginx + PHP-FPM)
- **Solution:**
    - Configure Nginx as a reverse proxy with PHP-FPM for the backend.
    - Enable HTTP/2 and Brotli/Gzip compression for faster delivery of JSON payloads and assets.

## 7. Professional Hardening (Phase 7)

### 7.1 Automated Backups
- **Solution:**
    - Implement automated daily off-site backups for the MySQL database and user-uploaded media.

### 7.2 Automated Testing & CI/CD
- **Solution:**
    - Set up a suite of Feature Tests for critical business logic (e.g., Inventory limits, Borrowing rules).
    - Implement a basic CI/CD pipeline to automate deployments and quality checks.

---

## Success Metrics
- **Response Time:** API response time for state changes should drop from ~1-2s to < 200ms.
- **Concurrency:** Ability to handle 100+ simultaneous users without database lock contention.
- **Audit Coverage:** 100% of data-mutating actions will include a state-change snapshot.
- **Traceability:** Ability to link any WebSocket update back to a specific REST API request via Correlation ID.
- **Disaster Readiness:** Ability to restore the system from a backup in less than 30 minutes.
