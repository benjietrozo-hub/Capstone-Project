# Database Cleanup Analysis

## Current Database Tables

### ✅ ACTIVE TABLES (In Use)

#### 1. **admins** ✓
- **Status**: ACTIVE
- **Usage**: Admin authentication and management
- **Model**: `App\Models\Admin`
- **Controllers**: `AdminAuthController`, `AdminDashboardController`
- **Keep**: YES

#### 2. **teachers** ✓
- **Status**: ACTIVE
- **Usage**: Teacher authentication and management
- **Model**: `App\Models\Teacher`
- **Controllers**: `TeacherAuthController`, `TeacherManagementController`
- **Keep**: YES

#### 3. **tools_equipment** ✓
- **Status**: ACTIVE
- **Usage**: Main inventory items
- **Model**: `App\Models\ToolEquipment`
- **Controllers**: `AdminInventoryController`, `TeacherInventoryController`
- **Keep**: YES

#### 4. **borrow_requests** ✓
- **Status**: ACTIVE
- **Usage**: Borrow request management
- **Model**: `App\Models\BorrowRequest`
- **Controllers**: `AdminBorrowRequestController`, `TeacherBorrowRequestController`
- **Keep**: YES

#### 5. **teacher_inventory** ✓
- **Status**: ACTIVE
- **Usage**: Teacher's personal inventory
- **Model**: `App\Models\TeacherInventory`
- **Controllers**: `TeacherInventoryController`
- **Keep**: YES

#### 6. **inventory_logs** ✓
- **Status**: ACTIVE
- **Usage**: Track inventory changes
- **Model**: `App\Models\InventoryLog`
- **Keep**: YES

#### 7. **system_logs** ✓
- **Status**: ACTIVE (NEW)
- **Usage**: System activity logging
- **Model**: `App\Models\SystemLog`
- **Controllers**: `SystemLogController`
- **Keep**: YES

#### 8. **personal_access_tokens** ✓
- **Status**: ACTIVE
- **Usage**: Laravel Sanctum authentication tokens
- **Required by**: Sanctum package
- **Keep**: YES

#### 9. **cache** ✓
- **Status**: ACTIVE
- **Usage**: Laravel cache storage
- **Required by**: Laravel framework
- **Keep**: YES

#### 10. **cache_locks** ✓
- **Status**: ACTIVE
- **Usage**: Laravel cache locking mechanism
- **Required by**: Laravel framework
- **Keep**: YES

#### 11. **jobs** ✓
- **Status**: ACTIVE
- **Usage**: Laravel queue jobs
- **Required by**: Laravel queue system
- **Keep**: YES

#### 12. **job_batches** ✓
- **Status**: ACTIVE
- **Usage**: Laravel batch job tracking
- **Required by**: Laravel queue system
- **Keep**: YES

#### 13. **failed_jobs** ✓
- **Status**: ACTIVE
- **Usage**: Track failed queue jobs
- **Required by**: Laravel queue system
- **Keep**: YES

#### 14. **sessions** ✓
- **Status**: ACTIVE
- **Usage**: User session storage
- **Required by**: Laravel session management
- **Keep**: YES

#### 15. **password_reset_tokens** ✓
- **Status**: ACTIVE
- **Usage**: Password reset functionality
- **Required by**: Laravel authentication
- **Keep**: YES

### ⚠️ PARTIALLY USED TABLES

#### 16. **notifications** ⚠️
- **Status**: PARTIALLY IMPLEMENTED
- **Usage**: Notification system (defined but not fully implemented)
- **Model**: `App\Models\Notification`
- **Controllers**: NONE (No controller implemented)
- **Frontend**: Placeholder in NotificationProfile component
- **Recommendation**: KEEP (for future implementation)
- **Action**: Implement notification system or remove if not needed

#### 17. **reports** ⚠️
- **Status**: PARTIALLY IMPLEMENTED
- **Usage**: Issue reporting system
- **Model**: `App\Models\Report`
- **Controllers**: `ReportController` (exists)
- **Frontend**: ReportsPage exists but may not be fully functional
- **Recommendation**: KEEP (functional but may need enhancement)
- **Action**: Verify frontend integration

### ❌ UNUSED TABLES (Can be Removed)

#### 18. **users** ❌
- **Status**: UNUSED
- **Usage**: Default Laravel users table
- **Model**: `App\Models\User` (exists but not used)
- **Reason**: Using separate `admins` and `teachers` tables instead
- **Recommendation**: REMOVE
- **Impact**: None (not referenced anywhere)

#### 19. **telescope_entries** ❌
- **Status**: UNUSED (Development Tool)
- **Usage**: Laravel Telescope debugging tool
- **Enabled**: Not enabled in .env
- **Recommendation**: REMOVE (unless needed for debugging)
- **Impact**: None in production
- **Note**: Useful for development, but not needed in production

#### 20. **telescope_entries_tags** ❌
- **Status**: UNUSED (Development Tool)
- **Usage**: Laravel Telescope tags
- **Recommendation**: REMOVE (unless needed for debugging)

#### 21. **telescope_monitoring** ❌
- **Status**: UNUSED (Development Tool)
- **Usage**: Laravel Telescope monitoring
- **Recommendation**: REMOVE (unless needed for debugging)

## Summary

### Tables to Keep: 17
- admins
- teachers
- tools_equipment
- borrow_requests
- teacher_inventory
- inventory_logs
- system_logs
- personal_access_tokens
- cache
- cache_locks
- jobs
- job_batches
- failed_jobs
- sessions
- password_reset_tokens
- notifications (for future use)
- reports (partially implemented)

### Tables to Remove: 4
- users (not used)
- telescope_entries (development only)
- telescope_entries_tags (development only)
- telescope_monitoring (development only)

## Cleanup Actions

### 1. Remove Unused User Table
The `users` table is not being used since we have separate `admins` and `teachers` tables.

### 2. Remove Telescope Tables (Optional)
Telescope is a development/debugging tool. If not actively using it:
- Remove telescope migrations
- Remove telescope configuration
- Uninstall telescope package

### 3. Implement or Remove Notifications
Decision needed:
- **Option A**: Fully implement notification system
- **Option B**: Remove notifications table if not planning to use

### 4. Verify Reports Implementation
- Check if reports functionality is being used
- If not used, consider removing
- If used, ensure frontend is properly integrated

## Migration Cleanup Script

Create a new migration to drop unused tables:
