# Codebase File Directory Structure

```text
role-based-OIMS/
|-- .kiro/
|   +-- specs/
|       +-- design-system-enhancement/
|           |-- design.md
|           |-- requirements.md
|           +-- tasks.md
|-- .vscode/
|   +-- settings.json
|-- artifacts/
|   +-- implementation_plan.md
|-- backend/
|   |-- app/
|   |   |-- Console/
|   |   |   +-- Commands/
|   |   |       |-- CleanupLegacyInventoryData.php
|   |   |       |-- PopulateDashboard.php
|   |   |       |-- ProtectAdmin.php
|   |   |       |-- PurgeOldLogs.php
|   |   |       |-- SendOverdueNotifications.php
|   |   |       |-- SendReturnReminders.php
|   |   |       +-- SetRootAdmin.php
|   |   |-- Http/
|   |   |   |-- Controllers/
|   |   |   |   |-- API/
|   |   |   |   |   |-- Admin/
|   |   |   |   |   |   |-- AdminManagementController.php
|   |   |   |   |   |   |-- ArchiveController.php
|   |   |   |   |   |   |-- BorrowHistoryController.php
|   |   |   |   |   |   |-- BorrowRequestController.php
|   |   |   |   |   |   |-- ClassroomController.php
|   |   |   |   |   |   |-- ClubController.php
|   |   |   |   |   |   |-- DashboardController.php
|   |   |   |   |   |   |-- DepartmentController.php
|   |   |   |   |   |   |-- DistributionListController.php
|   |   |   |   |   |   |-- DistributionRequestController.php
|   |   |   |   |   |   |-- InventoryController.php
|   |   |   |   |   |   |-- InventoryItemController.php
|   |   |   |   |   |   |-- ItemCategoryController.php
|   |   |   |   |   |   |-- ItemDistributionController.php
|   |   |   |   |   |   |-- ReportController.php
|   |   |   |   |   |   |-- SystemHealthController.php
|   |   |   |   |   |   |-- SystemLogController.php
|   |   |   |   |   |   +-- TeacherManagementController.php
|   |   |   |   |   |-- Auth/
|   |   |   |   |   |   |-- AdminAuthController.php
|   |   |   |   |   |   |-- TeacherAuthController.php
|   |   |   |   |   |   +-- UnifiedAuthController.php
|   |   |   |   |   |-- Teacher/
|   |   |   |   |   |   |-- BorrowRequestController.php
|   |   |   |   |   |   |-- DashboardController.php
|   |   |   |   |   |   |-- DistributionRequestController.php
|   |   |   |   |   |   |-- EntityController.php
|   |   |   |   |   |   |-- InventoryController.php
|   |   |   |   |   |   |-- ItemDistributionController.php
|   |   |   |   |   |   |-- SystemLogController.php
|   |   |   |   |   |   +-- TeacherInventoryController.php
|   |   |   |   |   |-- AdminController.php
|   |   |   |   |   |-- BulkDistributionController.php
|   |   |   |   |   |-- DistributionGroupController.php
|   |   |   |   |   |-- DistributionLogController.php
|   |   |   |   |   |-- ItemConditionLogController.php
|   |   |   |   |   |-- ItemTransferController.php
|   |   |   |   |   |-- NotificationController.php
|   |   |   |   |   |-- ProfileController.php
|   |   |   |   |   +-- SystemSettingController.php
|   |   |   |   +-- Controller.php
|   |   |   +-- Middleware/
|   |   |       |-- CheckMaintenanceMode.php
|   |   |       |-- CorrelationIdMiddleware.php
|   |   |       |-- CorsMiddleware.php
|   |   |       |-- ForceHttpsMiddleware.php
|   |   |       |-- LogAuthAttempt.php
|   |   |       |-- SecurityHeadersMiddleware.php
|   |   |       +-- VerifyCsrfToken.php
|   |   |-- Jobs/
|   |   |   |-- BroadcastWebSocketMessage.php
|   |   |   |-- ProcessSystemLog.php
|   |   |   +-- SendDistributionNotification.php
|   |   |-- Mail/
|   |   |   |-- PasswordResetMail.php
|   |   |   +-- SystemNotificationMail.php
|   |   |-- Models/
|   |   |   |-- Admin.php
|   |   |   |-- BorrowRequest.php
|   |   |   |-- BulkDistribution.php
|   |   |   |-- Classroom.php
|   |   |   |-- Club.php
|   |   |   |-- CustomField.php
|   |   |   |-- Department.php
|   |   |   |-- DistributionGroup.php
|   |   |   |-- DistributionLog.php
|   |   |   |-- DistributionRequest.php
|   |   |   |-- InventoryItem.php
|   |   |   |-- InventoryLog.php
|   |   |   |-- ItemCategory.php
|   |   |   |-- ItemConditionLog.php
|   |   |   |-- ItemDistribution.php
|   |   |   |-- ItemTransfer.php
|   |   |   |-- LoginAttempt.php
|   |   |   |-- MasterCategory.php
|   |   |   |-- Notification.php
|   |   |   |-- Report.php
|   |   |   |-- SystemLog.php
|   |   |   |-- SystemSetting.php
|   |   |   |-- Teacher.php
|   |   |   +-- ToolEquipment.php
|   |   |-- Observers/
|   |   |   +-- ItemDistributionObserver.php
|   |   |-- Providers/
|   |   |   |-- AppServiceProvider.php
|   |   |   |-- ObserverServiceProvider.php
|   |   |   |-- RouteServiceProvider.php
|   |   |   +-- TelescopeServiceProvider.php
|   |   |-- Services/
|   |   |   |-- DistributionNotificationService.php
|   |   |   |-- EmailNotificationService.php
|   |   |   |-- NotificationService.php
|   |   |   +-- PHPMailerService.php
|   |   +-- Traits/
|   |       +-- LogsActivity.php
|   |-- bootstrap/
|   |   |-- app.php
|   |   +-- providers.php
|   |-- config/
|   |   |-- app.php
|   |   |-- auth.php
|   |   |-- cache.php
|   |   |-- cors.php
|   |   |-- database.php
|   |   |-- filesystems.php
|   |   |-- logging.php
|   |   |-- mail.php
|   |   |-- queue.php
|   |   |-- sanctum.php
|   |   |-- services.php
|   |   |-- session.php
|   |   +-- telescope.php
|   |-- database/
|   |   |-- factories/
|   |   |   +-- UserFactory.php
|   |   |-- migrations/
|   |   |   |-- 0001_01_01_000000_create_users_table.php
|   |   |   |-- 0001_01_01_000001_create_cache_table.php
|   |   |   |-- 0001_01_01_000002_create_jobs_table.php
|   |   |   |-- 2026_01_29_045529_create_admins_table.php
|   |   |   |-- 2026_01_29_045535_create_teachers_table.php
|   |   |   |-- 2026_01_29_045535_create_tools_equipment_table.php
|   |   |   |-- 2026_01_29_045536_create_borrow_requests_table.php
|   |   |   |-- 2026_01_29_045536_create_notifications_table.php
|   |   |   |-- 2026_01_29_045537_create_reports_table.php
|   |   |   |-- 2026_01_29_045538_create_inventory_logs_table.php
|   |   |   |-- 2026_02_03_080106_add_middle_initial_and_last_name_to_teachers_table.php
|   |   |   |-- 2026_02_03_090359_add_missing_columns_to_teachers_table.php
|   |   |   |-- 2026_02_03_090540_make_full_name_nullable_in_teachers_table.php
|   |   |   |-- 2026_02_03_090818_remove_unique_constraints_from_teachers_table.php
|   |   |   |-- 2026_02_03_100046_create_teacher_inventory_table.php
|   |   |   |-- 2026_02_03_102204_add_deleted_at_to_tools_equipment_table.php
|   |   |   |-- 2026_02_03_102423_add_missing_columns_to_tools_equipment_table.php
|   |   |   |-- 2026_02_03_105227_create_personal_access_tokens_table.php
|   |   |   |-- 2026_02_03_120000_create_system_logs_table.php
|   |   |   |-- 2026_02_03_140000_cleanup_duplicate_and_unused_tables.php
|   |   |   |-- 2026_02_03_150000_split_admin_full_name_to_separate_fields.php
|   |   |   |-- 2026_02_03_152308_add_borrowed_status_to_borrow_requests_table.php
|   |   |   |-- 2026_02_03_160000_remove_full_name_from_teachers_table.php
|   |   |   |-- 2026_02_04_100000_create_distribution_groups_table.php
|   |   |   |-- 2026_02_04_110000_enhance_distribution_groups_for_teachers.php
|   |   |   |-- 2026_02_04_120000_add_soft_delete_to_tables.php
|   |   |   |-- 2026_02_04_130000_create_item_distributions_table.php
|   |   |   |-- 2026_02_04_200541_create_telescope_entries_table.php
|   |   |   |-- 2026_02_05_000001_add_deleted_at_to_reports_table.php
|   |   |   |-- 2026_02_05_000001_create_distribution_requests_table.php
|   |   |   |-- 2026_02_05_100000_update_notifications_table_for_unified_users.php
|   |   |   |-- 2026_02_06_000001_fix_notifications_table_timestamps.php
|   |   |   |-- 2026_02_06_000002_update_notifications_type_column.php
|   |   |   |-- 2026_02_11_000002_add_user_type_to_password_reset_tokens.php
|   |   |   |-- 2026_02_11_000003_create_login_attempts_table.php
|   |   |   |-- 2026_02_15_100000_create_bulk_distributions_table.php
|   |   |   |-- 2026_02_15_110000_add_bulk_distribution_id_to_item_distributions.php
|   |   |   |-- 2026_02_15_120000_create_distribution_logs_table.php
|   |   |   |-- 2026_04_13_123302_add_total_attempts_today_to_login_attempts_table.php
|   |   |   |-- 2026_04_13_123945_add_last_attempt_at_to_login_attempts_table.php
|   |   |   |-- 2026_04_13_142902_add_missing_fields_to_reports_table.php
|   |   |   |-- 2026_04_13_154135_fix_category_column.php
|   |   |   |-- 2026_04_14_001240_fix_inventory_logs_structure.php
|   |   |   |-- 2026_04_14_021754_add_item_id_to_inventory_logs_table.php
|   |   |   |-- 2026_04_15_100257_create_system_logs_table.php
|   |   |   |-- 2026_04_15_104414_add_missing_columns_to_inventory_logs_table.php
|   |   |   |-- 2026_04_15_104758_add_reference_id_to_system_logs_table.php
|   |   |   |-- 2026_04_15_110813_fix_inventory_logs_to_original_schema.php
|   |   |   |-- 2026_04_15_111034_fix_notifications_to_original_schema.php
|   |   |   |-- 2026_04_15_111229_fix_notifications_schema_properly.php
|   |   |   |-- 2026_04_15_124349_add_missing_columns_to_distribution_groups.php
|   |   |   |-- 2026_04_17_054438_add_deleted_at_to_distribution_groups_table.php
|   |   |   |-- 2026_04_30_045745_add_indexes_to_system_logs_table.php
|   |   |   |-- 2026_04_30_120206_drop_purchase_orders_and_suppliers_tables.php
|   |   |   |-- 2026_04_30_151222_create_item_categories_table.php
|   |   |   |-- 2026_04_30_151235_create_custom_fields_table.php
|   |   |   |-- 2026_04_30_151245_create_inventory_items_table.php
|   |   |   |-- 2026_04_30_151345_migrate_tools_equipment_to_serialized_items.php
|   |   |   |-- 2026_04_30_154314_create_borrow_request_items_and_update_borrow_requests_table.php
|   |   |   |-- 2026_04_30_155804_create_item_distribution_items_and_update_item_distributions_table.php
|   |   |   |-- 2026_04_30_160159_update_distribution_requests_table.php
|   |   |   |-- 2026_05_02_141953_make_item_id_nullable_in_borrow_requests_table.php
|   |   |   |-- 2026_05_02_150124_add_location_to_inventory_items_table.php
|   |   |   |-- 2026_05_03_043333_add_parent_category_to_teacher_inventory.php
|   |   |   |-- 2026_05_03_053624_add_parent_category_to_item_categories.php
|   |   |   |-- 2026_05_04_032650_create_master_categories_table.php
|   |   |   |-- 2026_05_05_165600_add_role_to_teachers_table.php
|   |   |   |-- 2026_05_05_222500_add_lifespan_and_disposed_status_to_inventory_items_table.php
|   |   |   |-- 2026_05_09_093726_create_departments_table.php
|   |   |   |-- 2026_05_09_093746_create_classrooms_table.php
|   |   |   |-- 2026_05_09_093812_create_clubs_table.php
|   |   |   |-- 2026_05_09_093822_create_item_transfers_table.php
|   |   |   |-- 2026_05_09_093830_create_item_condition_logs_table.php
|   |   |   |-- 2026_05_09_093934_update_item_distributions_for_polymorphic_assignments.php
|   |   |   |-- 2026_05_09_094005_update_distribution_requests_for_entity_requests.php
|   |   |   |-- 2026_05_09_095748_make_item_id_nullable_in_distribution_requests.php
|   |   |   |-- 2026_05_09_120213_add_missing_columns_to_transfer_and_condition_logs.php
|   |   |   |-- 2026_05_09_121459_make_item_id_nullable_in_item_distributions.php
|   |   |   |-- 2026_05_09_125030_add_location_fields_to_distribution_requests.php
|   |   |   |-- 2026_05_10_add_admin_roles.php
|   |   |   |-- 2026_05_15_072211_add_penalty_and_condition_to_borrow_requests_table.php
|   |   |   |-- 2026_05_15_072457_add_new_statuses_to_inventory_items_table.php
|   |   |   |-- 2026_05_15_112808_add_security_fields_to_users_tables.php
|   |   |   |-- 2026_05_16_132326_create_system_settings_table.php
|   |   |   +-- 2026_05_17_000001_add_master_list_fields_to_inventory_items_table.php
|   |   |-- seeders/
|   |   |   |-- DashboardSeeder.php
|   |   |   +-- DatabaseSeeder.php
|   |   +-- inventory_system.sql
|   |-- public/
|   |   |-- storage/
|   |   |   |-- categories/
|   |   |   |   |-- 9B8wv5PKgYRxbrsbJJyOIwB8lIEEa60pCZA2SgS3.png
|   |   |   |   +-- tZKfQrIcekd3MNuLpeOYuyS6JW0wBHnSA8he5LW1.jpg
|   |   |   |-- master_categories/
|   |   |   |   +-- SKN413qmNf51Z9hgWU50T9Yvs3Dabkw2DPe8VGgN.jpg
|   |   |   |-- profile_images/
|   |   |   |   +-- lbPjIkjyrupl5sAHXZ15jzaeIZFeVIQWmlMt8nNQ.jpg
|   |   |   +-- serialized_items/
|   |   |       |-- EsiQPVStUyT3F8yh1oJlHkZK3t0a1UsQqIcAZY61.webp
|   |   |       |-- OI3kwZGv29Eo91qFLvydutALBLxYxBklhWSWknrG.webp
|   |   |       +-- QHqoH4ihfAukywYIOlMd4GMg3CyUyhhyMzgOevYX.jpg
|   |   |-- .htaccess
|   |   |-- favicon.ico
|   |   |-- index.php
|   |   |-- robots.txt
|   |   |-- test_api.php
|   |   |-- test_dashboard.php
|   |   +-- test_inventory_api.php
|   |-- resources/
|   |   |-- css/
|   |   |   +-- app.css
|   |   |-- js/
|   |   |   |-- app.js
|   |   |   +-- bootstrap.js
|   |   +-- views/
|   |       |-- emails/
|   |       |   |-- distribution-notification.blade.php
|   |       |   |-- password-reset.blade.php
|   |       |   +-- system-notification.blade.php
|   |       +-- welcome.blade.php
|   |-- routes/
|   |   |-- api.php
|   |   |-- console.php
|   |   +-- web.php
|   |-- storage/
|   |   +-- app/
|   |       |-- private/
|   |       +-- public/
|   |           |-- categories/
|   |           |   |-- 9B8wv5PKgYRxbrsbJJyOIwB8lIEEa60pCZA2SgS3.png
|   |           |   +-- tZKfQrIcekd3MNuLpeOYuyS6JW0wBHnSA8he5LW1.jpg
|   |           |-- master_categories/
|   |           |   +-- SKN413qmNf51Z9hgWU50T9Yvs3Dabkw2DPe8VGgN.jpg
|   |           |-- profile_images/
|   |           |   +-- lbPjIkjyrupl5sAHXZ15jzaeIZFeVIQWmlMt8nNQ.jpg
|   |           +-- serialized_items/
|   |               |-- EsiQPVStUyT3F8yh1oJlHkZK3t0a1UsQqIcAZY61.webp
|   |               |-- OI3kwZGv29Eo91qFLvydutALBLxYxBklhWSWknrG.webp
|   |               +-- QHqoH4ihfAukywYIOlMd4GMg3CyUyhhyMzgOevYX.jpg
|   |-- tests/
|   |   |-- Feature/
|   |   |   +-- ExampleTest.php
|   |   |-- Unit/
|   |   |   +-- ExampleTest.php
|   |   +-- TestCase.php
|   |-- .editorconfig
|   |-- .env
|   |-- .env.example
|   |-- .env.production
|   |-- artisan
|   |-- composer.json
|   |-- composer.lock
|   |-- create-root-admin.bat
|   |-- create-root-admin.php
|   |-- create-test-teacher.bat
|   |-- create-test-teacher.php
|   |-- manage-admin-accounts.php
|   |-- package.json
|   |-- phpunit.xml
|   |-- Procfile
|   |-- README.md
|   |-- reset-admin-password.php
|   |-- start-scheduler.bat
|   |-- update_admin_role.php
|   +-- vite.config.js
|-- docs/
|   |-- school_coordination_proof/
|   |-- ARCHIVE_IMPLEMENTATION.md
|   |-- DATA_FLOW_DIAGRAM.md
|   |-- DATABASE_ERD.md
|   |-- DISTRIBUTE_TO_ALL_TEACHERS_GUIDE.md
|   |-- DISTRIBUTION_LIST_GUIDE.md
|   |-- DISTRIBUTION_LIST_REQUEST_FORM.md
|   |-- DISTRIBUTION_LIST_REQUEST_TEMPLATE.md
|   |-- EMAIL_CONFIGURATION_GUIDE.md
|   |-- FORGOT_PASSWORD_SETUP.md
|   |-- GROUP_DISTRIBUTION_GUIDE.md
|   |-- HOW_TO_RUN.md
|   |-- IMPLEMENTATION_CHECKLIST.md
|   |-- LOGIN_SECURITY_GUIDE.md
|   |-- MOBILE_RESPONSIVE_GUIDE.md
|   |-- MOBILE_SETUP_COMPLETE.md
|   |-- MULTI_TEACHER_DISTRIBUTION_GUIDE.md
|   |-- NETWORK_ACCESS_INSTRUCTIONS.md
|   |-- QUICK_START.md
|   |-- ROOT_ADMIN_CREDENTIALS.md
|   |-- SYSTEM_FLOW_DIAGRAM.md
|   |-- SYSTEM_FLOWCHART.md
|   |-- SYSTEM_STRUCTURE_DESIGN.md
|   |-- TEACHER_CREDENTIALS.md
|   +-- TROUBLESHOOTING.md
|-- frontend/
|   |-- dist/
|   |   |-- assets/
|   |   |   |-- html2canvas.esm-CBrSDip1.js
|   |   |   |-- index.es-BXZx9xKt.js
|   |   |   |-- index-C0OV0nd7.js
|   |   |   |-- index-CZfcjkgF.css
|   |   |   +-- purify.es-B5CD4DQe.js
|   |   |-- index.html
|   |   +-- Logo_n.jpg
|   |-- public/
|   |   +-- Logo_n.jpg
|   |-- src/
|   |   |-- api/
|   |   |   |-- axios.js
|   |   |   +-- index.js
|   |   |-- components/
|   |   |   |-- admin/
|   |   |   |   |-- CreateDistributionModal.tsx
|   |   |   |   |-- CreateGroupDistributionModal.tsx
|   |   |   |   |-- CreateGroupModal.tsx
|   |   |   |   |-- DirectAssignModal.tsx
|   |   |   |   |-- ManageGroupMembersModal.tsx
|   |   |   |   |-- ReceiveItemsModal.tsx
|   |   |   |   |-- ReturnDistributionModal.tsx
|   |   |   |   |-- SystemHealthCard.tsx
|   |   |   |   |-- ViewDistributionRequestModal.tsx
|   |   |   |   +-- ViewGroupModal.tsx
|   |   |   |-- auth/
|   |   |   |   +-- ForcedPasswordResetModal.tsx
|   |   |   |-- common/
|   |   |   |   |-- AuthHeader.tsx
|   |   |   |   |-- ConfirmationModal.tsx
|   |   |   |   |-- Footer.tsx
|   |   |   |   |-- FormElements.tsx
|   |   |   |   |-- Header.tsx
|   |   |   |   |-- InventoryCard.tsx
|   |   |   |   |-- Layout.tsx
|   |   |   |   |-- Loader.tsx
|   |   |   |   |-- Modal.tsx
|   |   |   |   |-- ProtectedRoute.tsx
|   |   |   |   |-- RoleBasedRedirect.tsx
|   |   |   |   |-- Sidebar.tsx
|   |   |   |   |-- Skeleton.tsx
|   |   |   |   |-- StatsCard.tsx
|   |   |   |   |-- StatusBadge.tsx
|   |   |   |   +-- Table.tsx
|   |   |   |-- teacher/
|   |   |   |   |-- CreateDistributionGroupModal.tsx
|   |   |   |   |-- ManageGroupMembersModal.tsx
|   |   |   |   +-- RequestDistributionModal.tsx
|   |   |   |-- ui/
|   |   |   |   |-- alert.tsx
|   |   |   |   |-- alert-dialog.tsx
|   |   |   |   |-- badge.tsx
|   |   |   |   |-- button.tsx
|   |   |   |   |-- calendar.tsx
|   |   |   |   |-- card.tsx
|   |   |   |   |-- checkbox.tsx
|   |   |   |   |-- dialog.tsx
|   |   |   |   |-- dropdown-menu.tsx
|   |   |   |   |-- form.tsx
|   |   |   |   |-- input.tsx
|   |   |   |   |-- label.tsx
|   |   |   |   |-- select.tsx
|   |   |   |   |-- separator.tsx
|   |   |   |   |-- sheet.tsx
|   |   |   |   |-- sidebar.tsx
|   |   |   |   |-- skeleton.tsx
|   |   |   |   |-- sonner.tsx
|   |   |   |   |-- switch.tsx
|   |   |   |   |-- table.tsx
|   |   |   |   |-- tabs.tsx
|   |   |   |   |-- textarea.tsx
|   |   |   |   |-- toast.tsx
|   |   |   |   |-- toaster.tsx
|   |   |   |   |-- tooltip.tsx
|   |   |   |   +-- use-toast.js
|   |   |   |-- .rebuild
|   |   |   |-- AppSidebar.tsx
|   |   |   |-- EmailHistory.tsx
|   |   |   |-- EmailNotificationExample.tsx
|   |   |   |-- EmailNotificationModal.tsx
|   |   |   |-- EnhancedNotificationProfile.tsx
|   |   |   |-- MobileMenuButton.tsx
|   |   |   |-- NavHeader.tsx
|   |   |   |-- NotificationProfile.tsx
|   |   |   +-- WebSocketStatus.tsx
|   |   |-- config/
|   |   |   +-- websocket.js
|   |   |-- context/
|   |   |   |-- AuthContext.tsx
|   |   |   |-- NotificationContext.tsx
|   |   |   +-- WebSocketContext.tsx
|   |   |-- hooks/
|   |   |   |-- useAuth.js
|   |   |   |-- useDebounce.ts
|   |   |   |-- useEmailNotifications.ts
|   |   |   |-- use-mobile.tsx
|   |   |   |-- useRole.js
|   |   |   |-- use-toast.ts
|   |   |   +-- useWebSocket.js
|   |   |-- lib/
|   |   |   +-- utils.ts
|   |   |-- pages/
|   |   |   |-- admin/
|   |   |   |   |-- AdminsPage.tsx
|   |   |   |   |-- BulkDistributionsPage.tsx
|   |   |   |   |-- Dashboard.tsx
|   |   |   |   |-- DistributionListPage.tsx
|   |   |   |   |-- DistributionLogsPage.tsx
|   |   |   |   |-- InventoryPage.tsx
|   |   |   |   |-- LogsPage.tsx
|   |   |   |   |-- MasterInventoryListPage.tsx
|   |   |   |   |-- ReportsPage.tsx
|   |   |   |   |-- RequestsPage.tsx
|   |   |   |   |-- ReservationsPage.tsx
|   |   |   |   |-- TeachersPage.tsx
|   |   |   |   +-- TrashPage.tsx
|   |   |   |-- common/
|   |   |   |   |-- HelpPage.tsx
|   |   |   |   |-- MaintenancePage.tsx
|   |   |   |   +-- ProfilePage.tsx
|   |   |   |-- shared/
|   |   |   |   +-- NotificationsPage.tsx
|   |   |   |-- teacher/
|   |   |   |   |-- ActivityLogsPage.tsx
|   |   |   |   |-- BrowseInventoryPage.tsx
|   |   |   |   |-- Dashboard.tsx
|   |   |   |   |-- DistributionGroupsPage.tsx
|   |   |   |   |-- DistributionRequestsPage.tsx
|   |   |   |   |-- MyInventoryPage.tsx
|   |   |   |   |-- MyReservationsPage.tsx
|   |   |   |   +-- ReportsPage.tsx
|   |   |   |-- ErrorPages.tsx
|   |   |   |-- ForgotPasswordPage.tsx
|   |   |   |-- LoginPage.tsx
|   |   |   |-- RegisterPage.tsx
|   |   |   +-- ResetPasswordPage.tsx
|   |   |-- services/
|   |   |   +-- emailService.ts
|   |   |-- styles/
|   |   |   +-- mobile.css
|   |   |-- utils/
|   |   |   |-- constants.js
|   |   |   |-- deviceDetection.ts
|   |   |   |-- errorHandler.js
|   |   |   |-- exportUtils.ts
|   |   |   |-- formatters.js
|   |   |   |-- roleUtils.js
|   |   |   |-- validators.js
|   |   |   |-- websocketHelper.js
|   |   |   +-- websocketTest.js
|   |   |-- App.tsx
|   |   |-- index.css
|   |   |-- main.tsx
|   |   +-- vite-env.d.ts
|   |-- .env
|   |-- index.html
|   |-- Logo_n.jpg
|   |-- package.json
|   |-- package-lock.json
|   |-- postcss.config.js
|   |-- railway.json
|   |-- README.md
|   |-- tailwind.config.js
|   |-- tsconfig.json
|   |-- tsconfig.node.json
|   +-- vite.config.ts
|-- research_docs/
|   |-- 5_18_2026.docx
|   |-- 5_18_2026_text.txt
|   |-- 5_20_2026.docx
|   |-- 5_20_2026_text.txt
|   |-- capstone_implementation_plan.md
|   |-- DEVELOPMENT OF A WEB-BASED PROPERTY INVENTORY MANAGEMENT SYSTEM (1).docx
|   |-- DEVELOPMENT OF A WEB-BASED PROPERTY INVENTORY MANAGEMENT SYSTEM2.docx
|   |-- DEVELOPMENT_OF_A_WEB-BASED_PROPERTY_INVENTORY_MANAGEMENT_SYSTEM2.md
|   |-- erd.png
|   |-- erd_diagram.html
|   |-- erd_final.png
|   |-- erd_v2.png
|   |-- erd_v3.png
|   |-- extracted_content.txt
|   |-- nano_banana_database.png
|   |-- system_algorithms.md
|   +-- system_architecture.png
|-- TROZO_FINAL/
|   |-- antigravity/
|   |   +-- brain/
|   |       +-- cbc53b4f-7c02-4751-8668-517a0f36bc45/
|   |           +-- scratch/
|   |               |-- check_schema.php
|   |               +-- update_schema.php
|   +-- TROZO_FINAL/
|       |-- .vscode/
|       |   +-- settings.json
|       +-- TROZO_FINAL/
|           |-- css/
|           |   |-- .htaccess
|           |   |-- 403.php
|           |   |-- Admin_Dashboard.css
|           |   |-- bootstrap.min.css
|           |   |-- denied.css
|           |   |-- Forgot_Password.css
|           |   |-- Home.css
|           |   |-- landing.css
|           |   |-- Log_in.css
|           |   |-- Register.css
|           |   |-- security_questions_modal.css
|           |   +-- Sign_in.css
|           |-- DB/
|           |   |-- access_requests.sql
|           |   |-- activity_logs_enhanced.sql
|           |   |-- add_soft_delete_columns.sql
|           |   |-- add_soft_delete_columns_safe.sql
|           |   |-- add_soft_delete_columns_simple.sql
|           |   |-- admin_privileges.sql
|           |   |-- check_otp_table.sql
|           |   |-- check_soft_delete_columns.sql
|           |   |-- cleanup_activity_logs.sql
|           |   |-- cleanup_before_removing_inventory_tables.sql
|           |   |-- conn.php
|           |   |-- delete_requests.sql
|           |   |-- ecommerce_tables.sql
|           |   |-- hardcoded_admin_logging.sql
|           |   |-- MYSQL_COMPATIBILITY_FIX.sql
|           |   |-- pending_admin_approvals.sql
|           |   |-- rbac_migration.sql
|           |   |-- remove_admin_audit_log.sql
|           |   |-- remove_borrow_request.sql
|           |   |-- remove_inventory_tables.sql
|           |   |-- SIMPLE_FIX_INSTRUCTIONS.md
|           |   |-- soft_delete_system.sql
|           |   |-- STEP_BY_STEP_SETUP.sql
|           |   |-- trozo_security.sql
|           |   |-- trozo_security_mariadb.sql
|           |   |-- trozo_security_mysql.sql
|           |   |-- trozo_security_mysql_clean.sql
|           |   |-- update_hardcoded_admin_logs.sql
|           |   +-- update_super_admin.sql
|           |-- delete_requests/
|           |   |-- delete_request_1_1772029316.pdf
|           |   |-- delete_request_2_1772030241.pdf
|           |   |-- delete_request_3_1772030374.pdf
|           |   |-- delete_request_4_1772030677.pdf
|           |   |-- delete_request_5_1772186029.pdf
|           |   |-- delete_request_6_1772187663.pdf
|           |   |-- delete_request_6_1777308307.pdf
|           |   |-- delete_request_7_1777309222.pdf
|           |   |-- delete_request_8_1778567225.pdf
|           |   +-- delete_request_9_1778567316.pdf
|           |-- documentation/
|           |   |-- ACCESS_REQUEST_AUTO_PRIVILEGE.md
|           |   |-- ACCESS_REQUESTS_SYSTEM.md
|           |   |-- ACTIVITY_LOGGER_OOP_COMPLETE.md
|           |   |-- ACTIVITY_LOGGER_OOP_ENHANCEMENT.md
|           |   |-- ACTIVITY_LOGS_ERROR_SOLUTION.md
|           |   |-- ACTIVITY_LOGS_FILTER_UPDATE.md
|           |   |-- ACTIVITY_LOGS_IMPLEMENTATION_GUIDE.md
|           |   |-- ACTIVITY_LOGS_MODAL_FEATURE.md
|           |   |-- ADMIN_AUDIT_LOG_VS_ACTIVITY_LOGS_ANALYSIS.md
|           |   |-- ADMIN_PRIVILEGES_SYSTEM.md
|           |   |-- ADMIN_ROLE_APPROVAL_SYSTEM.md
|           |   |-- BEFORE_AFTER_COMPARISON.md
|           |   |-- BYPASS_TIMER_FLOW.txt
|           |   |-- BYPASS_TIMER_IMPLEMENTATION.txt
|           |   |-- BYPASS_TIMER_README.md
|           |   |-- COMPLETE_DARK_THEME_SUMMARY.md
|           |   |-- COMPLETE_LOGIN_LOGOUT_LOGGING_SUMMARY.md
|           |   |-- CONTROL_PANEL_UPDATE.md
|           |   |-- CREATE_TABLE_FEATURE.md
|           |   |-- DARK_THEME_ENHANCEMENT.md
|           |   |-- DATABASE_CRUD_OPERATIONS.md
|           |   |-- DATABASE_IMPORT_FEATURE.md
|           |   |-- DATABASE_MANAGEMENT_FEATURES.md
|           |   |-- DATABASE_MANAGEMENT_LOGGING_AUDIT.md
|           |   |-- DATABASE_MANAGEMENT_OOP_COMPLETE.md
|           |   |-- DATABASE_MANAGEMENT_ROUTING_VERIFIED.md
|           |   |-- DATABASE_PROTECTED_TABLES_SYSTEM.md
|           |   |-- DATABASE_TABLE_GRID_LINES.md
|           |   |-- DATABASE_TABLE_RESIZE_ENHANCEMENT.md
|           |   |-- DELETE_ACTIVITY_LOGS_GUIDE.md
|           |   |-- DELETE_REQUEST_IMPLEMENTATION_COMPLETE.md
|           |   |-- DELETE_REQUEST_PDF_OOP_COMPLETE.md
|           |   |-- DELETE_REQUEST_QUICK_START.md
|           |   |-- DELETE_REQUEST_SOFT_DELETE_FIX.md
|           |   |-- DELETE_REQUEST_SYSTEM.md
|           |   |-- DEPLOYMENT_CHECKLIST.md
|           |   |-- DRAG_DROP_GUIDE.md
|           |   |-- DROP_TABLE_COMPLETE_SUMMARY.md
|           |   |-- DROP_TABLE_DELETE_REQUEST_SYSTEM.md
|           |   |-- DROP_TABLE_FEATURE.md
|           |   |-- DROP_TABLE_FLOW_DIAGRAM.md
|           |   |-- DROP_TABLE_IMPLEMENTATION_COMPLETE.md
|           |   |-- DROP_TABLE_PROTECTION_TEST.md
|           |   |-- DROP_TABLE_QUICK_GUIDE.md
|           |   |-- DROP_TABLE_QUICK_REFERENCE.md
|           |   |-- DUPLICATE_COLUMN_FIX_SUMMARY.md
|           |   |-- FINAL_DARK_THEME_COMPLETE.md
|           |   |-- FINAL_SOLUTION.md
|           |   |-- FIX_ACTIVITY_LOGS_ERROR.txt
|           |   |-- FIX_DUPLICATE_COLUMN_ERROR.md
|           |   |-- FORGOT_PASSWORD_FIX.md
|           |   |-- FPDF_SETUP.md
|           |   |-- HARDCODED_ADMIN_LOGGING_FIX.md
|           |   |-- HARDCODED_ADMIN_PASSWORD_FIX.md
|           |   |-- HARDCODED_SUPER_ADMIN.md
|           |   |-- IMPLEMENTATION_SUMMARY.txt
|           |   |-- IMPORT_GUIDE_MYSQL_SYNTAX.md
|           |   |-- IMPORT_INSTRUCTIONS.md
|           |   |-- INVENTORY_TABLES_CLEANUP_SUMMARY.md
|           |   |-- LOGIN_LOGOUT_ANIMATIONS.md
|           |   |-- LOGOUT_COUNT_FIX.md
|           |   |-- LOGOUT_FILTER_FIX.md
|           |   |-- MASTER_FIX_GUIDE.md
|           |   |-- MY_ACTIVITY_LOGS_USER_FEATURE.md
|           |   |-- MYSQL_COMPATIBILITY_GUIDE.md
|           |   |-- PDF_STATUS_UPDATE_GUIDE.md
|           |   |-- PDF_UPDATE_TROUBLESHOOTING.md
|           |   |-- PDF_VIEWER_UPDATE.md
|           |   |-- PDF_VIEWER_VISUAL_GUIDE.md
|           |   |-- PRIVILEGE_VS_TEMPORARY_ACCESS.md
|           |   |-- PROFILE_DROPDOWN_FIX.md
|           |   |-- QUICK_DELETE_LOGS_GUIDE.txt
|           |   |-- QUICK_FIX_GUIDE.md
|           |   |-- QUICK_FIX_GUIDE.txt
|           |   |-- QUICK_IMPORT.txt
|           |   |-- QUICK_REFERENCE.md
|           |   |-- QUICK_START.md
|           |   |-- QUICK_START_ACTIVITY_LOGS.txt
|           |   |-- QUICK_START_BYPASS.txt
|           |   |-- RBAC_CLASS_NAME_CONFLICT_FIX.md
|           |   |-- RBAC_OOP_COMPLETE.md
|           |   |-- README.md
|           |   |-- README_REDESIGN.md
|           |   |-- REDESIGN_DOCUMENTATION.md
|           |   |-- REDESIGN_SUMMARY.md
|           |   |-- REMOVE_ADMIN_AUDIT_LOG_SUMMARY.md
|           |   |-- RESIZABLE_COLUMNS_GUIDE.md
|           |   |-- SECURITY_QUESTIONS_OOP_COMPLETE.md
|           |   |-- SETUP_CHECKLIST.txt
|           |   |-- SETUP_GUIDE.md
|           |   |-- SOFT_DELETE_TRASH_SYSTEM.md
|           |   |-- START_HERE.md
|           |   |-- SUPER_ADMIN_CREDENTIALS.txt
|           |   |-- SUPER_ADMIN_PROTECTION.md
|           |   |-- SUPER_ADMIN_UPDATE_SUMMARY.md
|           |   |-- TEST_ACTIVITY_LOGS.txt
|           |   |-- TESTING_PRIVILEGE_SYSTEM.md
|           |   |-- USER_FILTER_FIX.md
|           |   +-- VISUAL_GUIDE.md
|           |-- IMAGES/
|           |   |-- home2.jpg
|           |   |-- logo.png
|           |   |-- online-shopping-1.avif
|           |   |-- online-shopping-2.jpg
|           |   |-- sample1.jpg
|           |   |-- sample10.jpg
|           |   |-- sample11.jpg
|           |   |-- sample12.jpg
|           |   |-- sample2.jpg
|           |   |-- sample3.webp
|           |   |-- sample4.jpg
|           |   |-- sample5.jpg
|           |   |-- sample6.jpg
|           |   |-- sample7.jpg
|           |   |-- sample8.jpg
|           |   +-- sample9.jpg
|           |-- js/
|           |   |-- .htaccess
|           |   |-- 403.php
|           |   |-- admin_dashboard.js
|           |   |-- bypass_timer.js
|           |   |-- denied.js
|           |   |-- emailcheck.js
|           |   |-- forgot_password.js
|           |   |-- idnumbercheck.js
|           |   |-- jquery-3.6.0.min.js
|           |   |-- landing.js
|           |   |-- login_val.js
|           |   |-- maintenance_notice.js
|           |   |-- passwordcheck.js
|           |   |-- register.js
|           |   |-- security_questions_modal.js
|           |   |-- security_questions_validation.js
|           |   |-- shared_layout.js
|           |   |-- sign_in.js
|           |   |-- Timer.js
|           |   |-- usernamecheck.js
|           |   +-- Val.js
|           |-- php/
|           |   |-- activity_logger/
|           |   |   |-- ActivityLogger.php
|           |   |   |-- ActivityLogsHelper.php
|           |   |   |-- ActivityLogsRetriever.php
|           |   |   |-- ARCHITECTURE.md
|           |   |   |-- autoload.php
|           |   |   |-- BEFORE_AFTER_COMPARISON.md
|           |   |   |-- IMPLEMENTATION_NOTES.md
|           |   |   |-- legacy_functions.php
|           |   |   |-- QUICK_REFERENCE.md
|           |   |   |-- README.md
|           |   |   +-- UserAgentParser.php
|           |   |-- database_management/
|           |   |   |-- views/
|           |   |   |   +-- layout.php
|           |   |   |-- ARCHITECTURE.md
|           |   |   |-- autoload.php
|           |   |   |-- DatabaseController.php
|           |   |   |-- DatabaseExporter.php
|           |   |   |-- DatabaseManager.php
|           |   |   |-- IMPLEMENTATION_NOTES.md
|           |   |   |-- ProtectedTablesConfig.php
|           |   |   |-- QueryExecutor.php
|           |   |   |-- QUICK_REFERENCE.md
|           |   |   |-- README.md
|           |   |   |-- styles.css
|           |   |   +-- TableOperations.php
|           |   |-- database_management_backups/
|           |   |   |-- BEFORE_AFTER_COMPARISON.md
|           |   |   |-- DATABASE_MANAGEMENT_OOP_REFACTORING.md
|           |   |   |-- Database_Management_Original_Backup.php
|           |   |   |-- FILE_ORGANIZATION.md
|           |   |   |-- OOP_REFACTORING_SUMMARY.md
|           |   |   |-- README.md
|           |   |   +-- TESTING_CHECKLIST.md
|           |   |-- delete_request_manager/
|           |   |   |-- autoload.php
|           |   |   |-- DeleteRequestController.php
|           |   |   |-- DeleteRequestManager.php
|           |   |   |-- legacy_functions.php
|           |   |   |-- PDFGenerator.php
|           |   |   +-- README.md
|           |   |-- fpdf/
|           |   |   |-- doc/
|           |   |   |   |-- __construct.htm
|           |   |   |   |-- acceptpagebreak.htm
|           |   |   |   |-- addfont.htm
|           |   |   |   |-- addlink.htm
|           |   |   |   |-- addpage.htm
|           |   |   |   |-- aliasnbpages.htm
|           |   |   |   |-- cell.htm
|           |   |   |   |-- close.htm
|           |   |   |   |-- error.htm
|           |   |   |   |-- footer.htm
|           |   |   |   |-- getpageheight.htm
|           |   |   |   |-- getpagewidth.htm
|           |   |   |   |-- getstringwidth.htm
|           |   |   |   |-- getx.htm
|           |   |   |   |-- gety.htm
|           |   |   |   |-- header.htm
|           |   |   |   |-- image.htm
|           |   |   |   |-- index.htm
|           |   |   |   |-- line.htm
|           |   |   |   |-- link.htm
|           |   |   |   |-- ln.htm
|           |   |   |   |-- multicell.htm
|           |   |   |   |-- output.htm
|           |   |   |   |-- pageno.htm
|           |   |   |   |-- rect.htm
|           |   |   |   |-- setauthor.htm
|           |   |   |   |-- setautopagebreak.htm
|           |   |   |   |-- setcompression.htm
|           |   |   |   |-- setcreator.htm
|           |   |   |   |-- setdisplaymode.htm
|           |   |   |   |-- setdrawcolor.htm
|           |   |   |   |-- setfillcolor.htm
|           |   |   |   |-- setfont.htm
|           |   |   |   |-- setfontsize.htm
|           |   |   |   |-- setkeywords.htm
|           |   |   |   |-- setleftmargin.htm
|           |   |   |   |-- setlinewidth.htm
|           |   |   |   |-- setlink.htm
|           |   |   |   |-- setmargins.htm
|           |   |   |   |-- setrightmargin.htm
|           |   |   |   |-- setsubject.htm
|           |   |   |   |-- settextcolor.htm
|           |   |   |   |-- settitle.htm
|           |   |   |   |-- settopmargin.htm
|           |   |   |   |-- setx.htm
|           |   |   |   |-- setxy.htm
|           |   |   |   |-- sety.htm
|           |   |   |   |-- text.htm
|           |   |   |   +-- write.htm
|           |   |   |-- font/
|           |   |   |   |-- courier.php
|           |   |   |   |-- courierb.php
|           |   |   |   |-- courierbi.php
|           |   |   |   |-- courieri.php
|           |   |   |   |-- helvetica.php
|           |   |   |   |-- helveticab.php
|           |   |   |   |-- helveticabi.php
|           |   |   |   |-- helveticai.php
|           |   |   |   |-- symbol.php
|           |   |   |   |-- times.php
|           |   |   |   |-- timesb.php
|           |   |   |   |-- timesbi.php
|           |   |   |   |-- timesi.php
|           |   |   |   +-- zapfdingbats.php
|           |   |   |-- makefont/
|           |   |   |   |-- cp1250.map
|           |   |   |   |-- cp1251.map
|           |   |   |   |-- cp1252.map
|           |   |   |   |-- cp1253.map
|           |   |   |   |-- cp1254.map
|           |   |   |   |-- cp1255.map
|           |   |   |   |-- cp1257.map
|           |   |   |   |-- cp1258.map
|           |   |   |   |-- cp874.map
|           |   |   |   |-- iso-8859-1.map
|           |   |   |   |-- iso-8859-11.map
|           |   |   |   |-- iso-8859-15.map
|           |   |   |   |-- iso-8859-16.map
|           |   |   |   |-- iso-8859-2.map
|           |   |   |   |-- iso-8859-4.map
|           |   |   |   |-- iso-8859-5.map
|           |   |   |   |-- iso-8859-7.map
|           |   |   |   |-- iso-8859-9.map
|           |   |   |   |-- koi8-r.map
|           |   |   |   |-- koi8-u.map
|           |   |   |   |-- makefont.php
|           |   |   |   +-- ttfparser.php
|           |   |   |-- tutorial/
|           |   |   |   |-- 20k_c1.txt
|           |   |   |   |-- 20k_c2.txt
|           |   |   |   |-- CevicheOne-Regular.php
|           |   |   |   |-- CevicheOne-Regular.ttf
|           |   |   |   |-- CevicheOne-Regular.z
|           |   |   |   |-- CevicheOne-Regular-Licence.txt
|           |   |   |   |-- countries.txt
|           |   |   |   |-- index.htm
|           |   |   |   |-- logo.png
|           |   |   |   |-- makefont.php
|           |   |   |   |-- tuto1.htm
|           |   |   |   |-- tuto1.php
|           |   |   |   |-- tuto2.htm
|           |   |   |   |-- tuto2.php
|           |   |   |   |-- tuto3.htm
|           |   |   |   |-- tuto3.php
|           |   |   |   |-- tuto4.htm
|           |   |   |   |-- tuto4.php
|           |   |   |   |-- tuto5.htm
|           |   |   |   |-- tuto5.php
|           |   |   |   |-- tuto6.htm
|           |   |   |   |-- tuto6.php
|           |   |   |   |-- tuto7.htm
|           |   |   |   +-- tuto7.php
|           |   |   |-- changelog.htm
|           |   |   |-- FAQ.htm
|           |   |   |-- fpdf.css
|           |   |   |-- fpdf.php
|           |   |   |-- install.txt
|           |   |   +-- license.txt
|           |   |-- includes/
|           |   |   |-- common_scripts.php
|           |   |   |-- sidebar.php
|           |   |   +-- top_navbar.php
|           |   |-- rbac/
|           |   |   |-- AuthenticationHelper.php
|           |   |   |-- autoload.php
|           |   |   |-- legacy_functions.php
|           |   |   |-- PermissionManager.php
|           |   |   |-- PrivilegeManager.php
|           |   |   |-- QUICK_REFERENCE.md
|           |   |   |-- RBACActivityLogger.php
|           |   |   |-- RBACConfig.php
|           |   |   |-- README.md
|           |   |   +-- RoleManager.php
|           |   |-- security_questions/
|           |   |   |-- autoload.php
|           |   |   |-- DummyAnswerGenerator.php
|           |   |   |-- EmailMasker.php
|           |   |   |-- legacy_functions.php
|           |   |   |-- README.md
|           |   |   |-- SecurityQuestionController.php
|           |   |   |-- SecurityQuestionManager.php
|           |   |   +-- SecurityUtility.php
|           |   |-- A_denied.php
|           |   |-- Access_Requests.php
|           |   |-- activity_logger.php
|           |   |-- Activity_Logs.php
|           |   |-- Admin_Analytics.php
|           |   |-- Admin_Customers.php
|           |   |-- Admin_Dashboard.php
|           |   |-- Admin_Orders.php
|           |   |-- Admin_Privileges.php
|           |   |-- Admin_Profile.php
|           |   |-- Admin_Role_Approvals.php
|           |   |-- Admin_Settings.php
|           |   |-- cart_handler.php
|           |   |-- check_account.php
|           |   |-- check_activity_logs_setup.php
|           |   |-- check_duplicate.php
|           |   |-- check_email.php
|           |   |-- check_exist.php
|           |   |-- check_id_number.php
|           |   |-- check_maintenance_status.php
|           |   |-- check_password.php
|           |   |-- check_username.php
|           |   |-- clear_login_attempts.php
|           |   |-- create_triggers.php
|           |   |-- create_user_handler.php
|           |   |-- Database_Management.php
|           |   |-- debug_email_send.php
|           |   |-- debug_login.php
|           |   |-- delete_activity_logs.php
|           |   |-- Delete_Requests_Management.php
|           |   |-- denied.php
|           |   |-- download_delete_request.php
|           |   |-- drop_triggers.php
|           |   |-- email_config.example.php
|           |   |-- email_config.php
|           |   |-- Force_Password_Reset.php
|           |   |-- Forgot_Password.php
|           |   |-- generate_delete_request_pdf.php
|           |   |-- get_security_questions.php
|           |   |-- Home.php
|           |   |-- log_export.php
|           |   |-- Login_Success.php
|           |   |-- maintenance_helper.php
|           |   |-- MaintenanceMiddleware.php
|           |   |-- merge_tables.php
|           |   |-- migrate_status.php
|           |   |-- My_Activity_Logs.php
|           |   |-- order_handler.php
|           |   |-- product_handler.php
|           |   |-- Products.php
|           |   |-- rbac_config.php
|           |   |-- Register.php
|           |   |-- request_admin_role.php
|           |   |-- request_authorization.php
|           |   |-- request_super_admin_access.php
|           |   |-- resend_otp.php
|           |   |-- reset_dev.php
|           |   |-- reset_password.php
|           |   |-- reset_password_final.php
|           |   |-- save_forced_security.php
|           |   |-- script.php
|           |   |-- send_otp.php
|           |   |-- send_otp_settings.php
|           |   |-- setup_hardcoded_admin.php
|           |   |-- Sign_in.php
|           |   |-- Sign_out.php
|           |   |-- status-code.php
|           |   |-- test_email_config.php
|           |   |-- test_email_system.php
|           |   |-- test_forgot_password.php
|           |   |-- test_password.php
|           |   |-- test_smtp_now.php
|           |   |-- toggle_maintenance.php
|           |   |-- Trash.php
|           |   |-- update_delete_request_pdf.php
|           |   |-- update_forced_password.php
|           |   |-- update_super_admin_email.php
|           |   |-- user_account_approval_helper.php
|           |   |-- User_Account_Approvals.php
|           |   |-- User_Cart.php
|           |   |-- User_Dashboard.php
|           |   |-- User_Management.php
|           |   |-- User_Orders.php
|           |   |-- User_Profile_Settings.php
|           |   |-- User_Settings.php
|           |   |-- validate_active_role.php
|           |   |-- verify_id.log
|           |   |-- verify_id_and_send_otp.php
|           |   |-- verify_id_number.php
|           |   |-- verify_otp.php
|           |   |-- verify_security_answers.php
|           |   |-- verify_security_questions.php
|           |   |-- verify_single_security_answer.php
|           |   +-- view_delete_request_pdf.php
|           |-- phpmailer/
|           |   |-- language/
|           |   |   |-- phpmailer.lang-af.php
|           |   |   |-- phpmailer.lang-ar.php
|           |   |   |-- phpmailer.lang-as.php
|           |   |   |-- phpmailer.lang-az.php
|           |   |   |-- phpmailer.lang-ba.php
|           |   |   |-- phpmailer.lang-be.php
|           |   |   |-- phpmailer.lang-bg.php
|           |   |   |-- phpmailer.lang-bn.php
|           |   |   |-- phpmailer.lang-ca.php
|           |   |   |-- phpmailer.lang-cs.php
|           |   |   |-- phpmailer.lang-da.php
|           |   |   |-- phpmailer.lang-de.php
|           |   |   |-- phpmailer.lang-el.php
|           |   |   |-- phpmailer.lang-eo.php
|           |   |   |-- phpmailer.lang-es.php
|           |   |   |-- phpmailer.lang-et.php
|           |   |   |-- phpmailer.lang-fa.php
|           |   |   |-- phpmailer.lang-fi.php
|           |   |   |-- phpmailer.lang-fo.php
|           |   |   |-- phpmailer.lang-fr.php
|           |   |   |-- phpmailer.lang-gl.php
|           |   |   |-- phpmailer.lang-he.php
|           |   |   |-- phpmailer.lang-hi.php
|           |   |   |-- phpmailer.lang-hr.php
|           |   |   |-- phpmailer.lang-hu.php
|           |   |   |-- phpmailer.lang-hy.php
|           |   |   |-- phpmailer.lang-id.php
|           |   |   |-- phpmailer.lang-it.php
|           |   |   |-- phpmailer.lang-ja.php
|           |   |   |-- phpmailer.lang-ka.php
|           |   |   |-- phpmailer.lang-ko.php
|           |   |   |-- phpmailer.lang-ku.php
|           |   |   |-- phpmailer.lang-lt.php
|           |   |   |-- phpmailer.lang-lv.php
|           |   |   |-- phpmailer.lang-mg.php
|           |   |   |-- phpmailer.lang-mn.php
|           |   |   |-- phpmailer.lang-ms.php
|           |   |   |-- phpmailer.lang-nb.php
|           |   |   |-- phpmailer.lang-nl.php
|           |   |   |-- phpmailer.lang-pl.php
|           |   |   |-- phpmailer.lang-pt.php
|           |   |   |-- phpmailer.lang-pt_br.php
|           |   |   |-- phpmailer.lang-ro.php
|           |   |   |-- phpmailer.lang-ru.php
|           |   |   |-- phpmailer.lang-si.php
|           |   |   |-- phpmailer.lang-sk.php
|           |   |   |-- phpmailer.lang-sl.php
|           |   |   |-- phpmailer.lang-sr.php
|           |   |   |-- phpmailer.lang-sr_latn.php
|           |   |   |-- phpmailer.lang-sv.php
|           |   |   |-- phpmailer.lang-tl.php
|           |   |   |-- phpmailer.lang-tr.php
|           |   |   |-- phpmailer.lang-uk.php
|           |   |   |-- phpmailer.lang-ur.php
|           |   |   |-- phpmailer.lang-vi.php
|           |   |   |-- phpmailer.lang-zh.php
|           |   |   +-- phpmailer.lang-zh_cn.php
|           |   |-- src/
|           |   |   |-- DSNConfigurator.php
|           |   |   |-- Exception.php
|           |   |   |-- OAuth.php
|           |   |   |-- OAuthTokenProvider.php
|           |   |   |-- PHPMailer.php
|           |   |   |-- POP3.php
|           |   |   +-- SMTP.php
|           |   |-- COMMITMENT
|           |   |-- composer.json
|           |   |-- get_oauth_token.php
|           |   |-- LICENSE
|           |   |-- README.md
|           |   |-- SECURITY.md
|           |   |-- SMTPUTF8.md
|           |   +-- VERSION
|           |-- profile_pictures/
|           |   |-- 0746f96aa7fa66bc2b6a9f02c827e772.jpg
|           |   |-- 2f1e75e6d0ba756798a5f54e2ca26725.jpg
|           |   |-- 326b69a959bf163e71e54157ec16e711.jpg
|           |   +-- bc5bee5c7cb43b819f6815b320185da7.jpg
|           |-- TROZO_FINAL/
|           |   +-- php/
|           |       +-- check_email.php
|           |-- uploads/
|           |   +-- profile_pics/
|           |-- .htaccess
|           |-- check_db.php
|           |-- check_db_types.php
|           |-- check_users.php
|           |-- check_users_pending.php
|           |-- download_phpmailer.bat
|           |-- fix_users_db.php
|           |-- index.php
|           |-- test_bypass_timer.html
|           +-- test_create_user.php
|-- websocket/
|   |-- queue/
|   |   +-- messages.json
|   |-- composer.json
|   |-- composer.lock
|   |-- README.md
|   |-- start-websocket.bat
|   |-- start-websocket.sh
|   |-- test-websocket.bat
|   |-- websocket_server.php
|   |-- WebSocketBroadcaster.php
|   |-- websocket-client.js
|   +-- WebSocketHandler.php
|-- check-services.bat
|-- DEPLOYMENT_CHECKLIST.md
|-- list_tree.ps1
|-- PRODUCTION_DEPLOYMENT_GUIDE.md
|-- QUICK_START_GUIDE.md
|-- quick_test.bat
|-- README.md
|-- setup-firewall-rules.bat
|-- start-all-services.bat
|-- start-all-services.sh
|-- test-network-access.bat
+-- tree_output.txt
```
