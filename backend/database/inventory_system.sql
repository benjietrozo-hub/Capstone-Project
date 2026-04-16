-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Apr 16, 2026 at 10:12 AM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `inventory_system`
--

-- --------------------------------------------------------

--
-- Table structure for table `admins`
--

CREATE TABLE `admins` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `username` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `full_name` varchar(255) NOT NULL,
  `phone` varchar(255) DEFAULT NULL,
  `profile_image` varchar(255) DEFAULT NULL,
  `status` enum('active','inactive') NOT NULL DEFAULT 'active',
  `last_login` timestamp NULL DEFAULT NULL,
  `remember_token` varchar(100) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `admins`
--

INSERT INTO `admins` (`id`, `username`, `email`, `password`, `full_name`, `phone`, `profile_image`, `status`, `last_login`, `remember_token`, `created_at`, `updated_at`, `deleted_at`) VALUES
(1, 'admin', 'admin@example.com', '\\\\/Y.ylTsglJ6Af5GHWehOOG6q6uVVu02sLuhkkbu994EyS8c7CMm', 'Admin User', '555-1234', NULL, 'active', '2026-01-28 16:27:46', NULL, '2026-01-28 23:33:14', '2026-01-28 16:27:46', NULL),
(2, 'benjie.trozo', 'benjie.trozo@csucc.edu.ph', '$2y$12$tJQSQUBWuBb.U9X8OBYVeOLCJePt26edPsLmEQxPRgj06ui8v6SP6', 'Benjie Trozo', NULL, NULL, 'active', '2026-02-01 20:53:36', NULL, '2026-02-01 20:47:33', '2026-02-01 20:53:36', NULL),
(3, 'loren.torres', 'loren.torres@gmail.com', '$2y$12$CngFg5BeQyENH6busoB0TePGc3dDzC4p.qWiKBOPxAfzakUSNlz2i', 'Lorean Marie Torres', NULL, NULL, 'active', '2026-04-16 00:09:19', NULL, '2026-04-15 01:44:22', '2026-04-16 00:09:19', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `borrow_requests`
--

CREATE TABLE `borrow_requests` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `request_code` varchar(255) NOT NULL,
  `teacher_id` bigint(20) UNSIGNED NOT NULL,
  `item_id` bigint(20) UNSIGNED NOT NULL,
  `quantity_requested` int(11) NOT NULL,
  `quantity_approved` int(11) DEFAULT NULL,
  `date_requested` date NOT NULL,
  `date_needed` date NOT NULL,
  `date_approved` date DEFAULT NULL,
  `date_borrowed` date DEFAULT NULL,
  `expected_return_date` date DEFAULT NULL,
  `due_date` date DEFAULT NULL,
  `date_returned` date DEFAULT NULL,
  `purpose` text NOT NULL,
  `admin_notes` text DEFAULT NULL,
  `return_notes` text DEFAULT NULL,
  `status` enum('pending','approved','rejected','borrowed','returned','overdue','cancelled') NOT NULL DEFAULT 'pending',
  `approved_by` bigint(20) UNSIGNED DEFAULT NULL,
  `issued_by` bigint(20) UNSIGNED DEFAULT NULL,
  `received_by` bigint(20) UNSIGNED DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `borrow_requests`
--

INSERT INTO `borrow_requests` (`id`, `request_code`, `teacher_id`, `item_id`, `quantity_requested`, `quantity_approved`, `date_requested`, `date_needed`, `date_approved`, `date_borrowed`, `expected_return_date`, `due_date`, `date_returned`, `purpose`, `admin_notes`, `return_notes`, `status`, `approved_by`, `issued_by`, `received_by`, `created_at`, `updated_at`, `deleted_at`) VALUES
(1, 'REQ-20260416-2336', 7, 1, 1, NULL, '2026-04-16', '2026-04-16', NULL, NULL, '2027-02-12', NULL, NULL, 'School', 'xzxzxz', NULL, 'returned', NULL, NULL, NULL, '2026-04-15 17:43:42', '2026-04-15 20:32:42', NULL),
(2, 'REQ-20260416-9439', 7, 3, 1, NULL, '2026-04-16', '2026-04-16', NULL, NULL, '2027-02-12', NULL, NULL, 'asas', 'sasa', NULL, 'returned', NULL, NULL, NULL, '2026-04-15 18:37:17', '2026-04-15 19:31:31', NULL),
(3, 'REQ-20260416-9695', 7, 3, 5, NULL, '2026-04-16', '2026-04-16', NULL, NULL, '2026-09-11', NULL, NULL, 'saasas', 'xzxxwdd', NULL, 'returned', NULL, NULL, NULL, '2026-04-15 20:36:28', '2026-04-15 20:39:22', NULL),
(4, 'REQ-20260416-4798', 7, 3, 8, NULL, '2026-04-16', '2026-04-16', NULL, NULL, '2027-02-12', NULL, NULL, 'for school', 'sasas', NULL, 'borrowed', NULL, NULL, NULL, '2026-04-15 20:40:01', '2026-04-15 20:41:03', NULL),
(5, 'REQ-20260416-7607', 7, 3, 1, NULL, '2026-04-16', '2026-04-16', NULL, NULL, '2027-02-12', NULL, NULL, 'gy', NULL, NULL, 'pending', NULL, NULL, NULL, '2026-04-15 22:15:24', '2026-04-15 22:15:24', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `bulk_distributions`
--

CREATE TABLE `bulk_distributions` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `group_id` int(11) NOT NULL,
  `item_id` int(11) NOT NULL,
  `distributed_by` bigint(20) UNSIGNED NOT NULL,
  `total_quantity` int(11) NOT NULL,
  `quantity_per_member` int(11) NOT NULL,
  `status` enum('pending','processing','completed','cancelled') NOT NULL DEFAULT 'pending',
  `purpose` text DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `distribution_date` date NOT NULL,
  `expected_return_date` date DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `bulk_distributions`
--

INSERT INTO `bulk_distributions` (`id`, `group_id`, `item_id`, `distributed_by`, `total_quantity`, `quantity_per_member`, `status`, `purpose`, `notes`, `distribution_date`, `expected_return_date`, `created_at`, `updated_at`, `deleted_at`) VALUES
(1, 11, 1, 3, 5, 2, 'pending', 'For scholl', 'asas', '2026-04-15', '2028-02-12', '2026-04-15 06:14:38', '2026-04-15 06:14:38', NULL),
(2, 11, 3, 3, 9, 4, 'cancelled', 'zzZ', 'asasa', '2026-04-16', '2027-12-12', '2026-04-15 06:27:22', '2026-04-15 16:35:04', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `cache`
--

CREATE TABLE `cache` (
  `key` varchar(255) NOT NULL,
  `value` mediumtext NOT NULL,
  `expiration` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `cache_locks`
--

CREATE TABLE `cache_locks` (
  `key` varchar(255) NOT NULL,
  `owner` varchar(255) NOT NULL,
  `expiration` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `distribution_groups`
--

CREATE TABLE `distribution_groups` (
  `id` int(10) UNSIGNED NOT NULL,
  `group_name` varchar(255) NOT NULL,
  `group_type` varchar(255) NOT NULL,
  `list_type` varchar(255) NOT NULL DEFAULT 'user',
  `visibility` varchar(255) NOT NULL DEFAULT 'private',
  `created_by` int(11) DEFAULT NULL,
  `auto_membership` tinyint(1) NOT NULL DEFAULT 0,
  `department` varchar(255) DEFAULT NULL,
  `deleted_by` int(11) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `distribution_groups`
--

INSERT INTO `distribution_groups` (`id`, `group_name`, `group_type`, `list_type`, `visibility`, `created_by`, `auto_membership`, `department`, `deleted_by`, `description`, `is_active`, `created_at`, `updated_at`, `deleted_at`) VALUES
(9, 'Test Group 1776260826', 'custom', 'user', 'private', NULL, 0, NULL, 3, 'Test description', 1, '2026-04-15 05:47:06', '2026-04-15 06:03:01', '2026-04-15 06:03:01'),
(10, 'Test Group 1776261318', 'custom', 'user', 'private', NULL, 0, NULL, 3, 'Test description', 1, '2026-04-15 05:55:18', '2026-04-15 06:03:25', '2026-04-15 06:03:25'),
(11, 'Pilipino Teachers', 'department', 'user', 'private', NULL, 0, NULL, NULL, 'sasas', 1, '2026-04-15 06:02:38', '2026-04-15 06:02:38', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `distribution_group_members`
--

CREATE TABLE `distribution_group_members` (
  `id` int(10) UNSIGNED NOT NULL,
  `group_id` int(10) UNSIGNED NOT NULL,
  `teacher_id` int(10) UNSIGNED NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `distribution_group_members`
--

INSERT INTO `distribution_group_members` (`id`, `group_id`, `teacher_id`, `created_at`, `updated_at`, `deleted_at`) VALUES
(1, 11, 4, '2026-04-15 06:02:38', '2026-04-15 06:02:38', NULL),
(2, 11, 6, '2026-04-15 06:02:38', '2026-04-15 06:02:38', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `distribution_logs`
--

CREATE TABLE `distribution_logs` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `distributable_type` varchar(255) NOT NULL,
  `distributable_id` bigint(20) UNSIGNED NOT NULL,
  `teacher_id` int(11) NOT NULL,
  `item_id` int(11) NOT NULL,
  `quantity` int(11) NOT NULL,
  `action` enum('created','processed','cancelled','returned','modified') NOT NULL,
  `description` text DEFAULT NULL,
  `old_values` text DEFAULT NULL,
  `new_values` text DEFAULT NULL,
  `performed_by` bigint(20) UNSIGNED NOT NULL,
  `performed_by_type` varchar(255) NOT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `distribution_requests`
--

CREATE TABLE `distribution_requests` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `teacher_id` bigint(20) UNSIGNED NOT NULL,
  `item_id` bigint(20) UNSIGNED NOT NULL,
  `quantity_requested` int(11) NOT NULL,
  `reason` text DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `status` enum('pending','approved','rejected','distributed') NOT NULL DEFAULT 'pending',
  `reviewed_by` bigint(20) UNSIGNED DEFAULT NULL,
  `admin_notes` text DEFAULT NULL,
  `reviewed_at` timestamp NULL DEFAULT NULL,
  `distribution_id` bigint(20) UNSIGNED DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `failed_jobs`
--

CREATE TABLE `failed_jobs` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `uuid` varchar(255) NOT NULL,
  `connection` text NOT NULL,
  `queue` text NOT NULL,
  `payload` longtext NOT NULL,
  `exception` longtext NOT NULL,
  `failed_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `inventory_logs`
--

CREATE TABLE `inventory_logs` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `item_id` bigint(20) UNSIGNED NOT NULL,
  `action` varchar(255) NOT NULL,
  `user_id` int(11) DEFAULT NULL,
  `user_type` varchar(255) NOT NULL,
  `table_name` varchar(50) DEFAULT NULL,
  `record_id` int(11) DEFAULT NULL,
  `details` text DEFAULT NULL,
  `old_values` text DEFAULT NULL,
  `new_values` text DEFAULT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `inventory_logs`
--

INSERT INTO `inventory_logs` (`id`, `item_id`, `action`, `user_id`, `user_type`, `table_name`, `record_id`, `details`, `old_values`, `new_values`, `ip_address`, `user_agent`, `created_at`, `updated_at`) VALUES
(1, 6, 'created', NULL, 'admin', NULL, NULL, 'Item created', NULL, NULL, NULL, NULL, '2026-04-15 02:26:29', '2026-04-15 02:26:29'),
(2, 10, 'created', 3, 'admin', 'tools_equipment', 10, 'Item created', NULL, NULL, NULL, NULL, '2026-04-15 03:35:45', '2026-04-15 03:35:45'),
(3, 11, 'created', 3, 'admin', 'tools_equipment', 11, 'Item created', NULL, NULL, NULL, NULL, '2026-04-15 03:57:47', '2026-04-15 03:57:47');

-- --------------------------------------------------------

--
-- Table structure for table `item_distributions`
--

CREATE TABLE `item_distributions` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `item_id` int(11) NOT NULL,
  `teacher_id` int(11) NOT NULL,
  `distributed_by` bigint(20) UNSIGNED NOT NULL,
  `quantity_distributed` int(11) NOT NULL,
  `status` enum('active','returned','cancelled') NOT NULL DEFAULT 'active',
  `distribution_date` date NOT NULL,
  `expected_return_date` date DEFAULT NULL,
  `actual_return_date` date DEFAULT NULL,
  `purpose` text DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `admin_notes` text DEFAULT NULL,
  `condition_on_distribution` enum('excellent','good','fair','poor') NOT NULL DEFAULT 'good',
  `condition_on_return` enum('excellent','good','fair','poor') DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `jobs`
--

CREATE TABLE `jobs` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `queue` varchar(255) NOT NULL,
  `payload` longtext NOT NULL,
  `attempts` tinyint(3) UNSIGNED NOT NULL,
  `reserved_at` int(10) UNSIGNED DEFAULT NULL,
  `available_at` int(10) UNSIGNED NOT NULL,
  `created_at` int(10) UNSIGNED NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `jobs`
--

INSERT INTO `jobs` (`id`, `queue`, `payload`, `attempts`, `reserved_at`, `available_at`, `created_at`) VALUES
(1, 'default', '{\"uuid\":\"c4524a70-132f-4845-8177-f72865132e0c\",\"displayName\":\"App\\\\Jobs\\\\SendDistributionNotification\",\"job\":\"Illuminate\\\\Queue\\\\CallQueuedHandler@call\",\"maxTries\":3,\"maxExceptions\":null,\"failOnTimeout\":false,\"backoff\":\"60,300,900\",\"timeout\":null,\"retryUntil\":null,\"data\":{\"commandName\":\"App\\\\Jobs\\\\SendDistributionNotification\",\"command\":\"O:37:\\\"App\\\\Jobs\\\\SendDistributionNotification\\\":4:{s:10:\\\"\\u0000*\\u0000teacher\\\";O:45:\\\"Illuminate\\\\Contracts\\\\Database\\\\ModelIdentifier\\\":5:{s:5:\\\"class\\\";s:18:\\\"App\\\\Models\\\\Teacher\\\";s:2:\\\"id\\\";i:4;s:9:\\\"relations\\\";a:0:{}s:10:\\\"connection\\\";s:5:\\\"mysql\\\";s:15:\\\"collectionClass\\\";N;}s:7:\\\"\\u0000*\\u0000type\\\";s:16:\\\"bulk_distributed\\\";s:7:\\\"\\u0000*\\u0000data\\\";a:7:{s:20:\\\"bulk_distribution_id\\\";i:1;s:9:\\\"item_name\\\";s:14:\\\"Electric Drill\\\";s:9:\\\"item_code\\\";s:5:\\\"EQ001\\\";s:8:\\\"quantity\\\";i:2;s:10:\\\"group_name\\\";s:17:\\\"Pilipino Teachers\\\";s:17:\\\"distribution_date\\\";s:10:\\\"2026-04-15\\\";s:20:\\\"expected_return_date\\\";s:10:\\\"2028-02-12\\\";}s:11:\\\"\\u0000*\\u0000senderId\\\";i:3;}\"},\"createdAt\":1776262481,\"delay\":null}', 0, NULL, 1776262481, 1776262481),
(2, 'default', '{\"uuid\":\"b6e1846c-d792-4cbe-b571-8992a5b0f074\",\"displayName\":\"App\\\\Jobs\\\\SendDistributionNotification\",\"job\":\"Illuminate\\\\Queue\\\\CallQueuedHandler@call\",\"maxTries\":3,\"maxExceptions\":null,\"failOnTimeout\":false,\"backoff\":\"60,300,900\",\"timeout\":null,\"retryUntil\":null,\"data\":{\"commandName\":\"App\\\\Jobs\\\\SendDistributionNotification\",\"command\":\"O:37:\\\"App\\\\Jobs\\\\SendDistributionNotification\\\":4:{s:10:\\\"\\u0000*\\u0000teacher\\\";O:45:\\\"Illuminate\\\\Contracts\\\\Database\\\\ModelIdentifier\\\":5:{s:5:\\\"class\\\";s:18:\\\"App\\\\Models\\\\Teacher\\\";s:2:\\\"id\\\";i:6;s:9:\\\"relations\\\";a:0:{}s:10:\\\"connection\\\";s:5:\\\"mysql\\\";s:15:\\\"collectionClass\\\";N;}s:7:\\\"\\u0000*\\u0000type\\\";s:16:\\\"bulk_distributed\\\";s:7:\\\"\\u0000*\\u0000data\\\";a:7:{s:20:\\\"bulk_distribution_id\\\";i:1;s:9:\\\"item_name\\\";s:14:\\\"Electric Drill\\\";s:9:\\\"item_code\\\";s:5:\\\"EQ001\\\";s:8:\\\"quantity\\\";i:2;s:10:\\\"group_name\\\";s:17:\\\"Pilipino Teachers\\\";s:17:\\\"distribution_date\\\";s:10:\\\"2026-04-15\\\";s:20:\\\"expected_return_date\\\";s:10:\\\"2028-02-12\\\";}s:11:\\\"\\u0000*\\u0000senderId\\\";i:3;}\"},\"createdAt\":1776262481,\"delay\":null}', 0, NULL, 1776262481, 1776262481),
(3, 'default', '{\"uuid\":\"618a46c0-eb57-4686-aaa8-c77804020fb5\",\"displayName\":\"App\\\\Jobs\\\\SendDistributionNotification\",\"job\":\"Illuminate\\\\Queue\\\\CallQueuedHandler@call\",\"maxTries\":3,\"maxExceptions\":null,\"failOnTimeout\":false,\"backoff\":\"60,300,900\",\"timeout\":null,\"retryUntil\":null,\"data\":{\"commandName\":\"App\\\\Jobs\\\\SendDistributionNotification\",\"command\":\"O:37:\\\"App\\\\Jobs\\\\SendDistributionNotification\\\":4:{s:10:\\\"\\u0000*\\u0000teacher\\\";O:45:\\\"Illuminate\\\\Contracts\\\\Database\\\\ModelIdentifier\\\":5:{s:5:\\\"class\\\";s:18:\\\"App\\\\Models\\\\Teacher\\\";s:2:\\\"id\\\";i:4;s:9:\\\"relations\\\";a:0:{}s:10:\\\"connection\\\";s:5:\\\"mysql\\\";s:15:\\\"collectionClass\\\";N;}s:7:\\\"\\u0000*\\u0000type\\\";s:16:\\\"bulk_distributed\\\";s:7:\\\"\\u0000*\\u0000data\\\";a:7:{s:20:\\\"bulk_distribution_id\\\";i:2;s:9:\\\"item_name\\\";s:15:\\\"Laptop Computer\\\";s:9:\\\"item_code\\\";s:5:\\\"EQ003\\\";s:8:\\\"quantity\\\";i:4;s:10:\\\"group_name\\\";s:17:\\\"Pilipino Teachers\\\";s:17:\\\"distribution_date\\\";s:10:\\\"2026-04-16\\\";s:20:\\\"expected_return_date\\\";s:10:\\\"2027-12-12\\\";}s:11:\\\"\\u0000*\\u0000senderId\\\";i:3;}\"},\"createdAt\":1776263244,\"delay\":null}', 0, NULL, 1776263244, 1776263244),
(4, 'default', '{\"uuid\":\"cf88a85e-8838-4116-87ca-fc8d627d92a7\",\"displayName\":\"App\\\\Jobs\\\\SendDistributionNotification\",\"job\":\"Illuminate\\\\Queue\\\\CallQueuedHandler@call\",\"maxTries\":3,\"maxExceptions\":null,\"failOnTimeout\":false,\"backoff\":\"60,300,900\",\"timeout\":null,\"retryUntil\":null,\"data\":{\"commandName\":\"App\\\\Jobs\\\\SendDistributionNotification\",\"command\":\"O:37:\\\"App\\\\Jobs\\\\SendDistributionNotification\\\":4:{s:10:\\\"\\u0000*\\u0000teacher\\\";O:45:\\\"Illuminate\\\\Contracts\\\\Database\\\\ModelIdentifier\\\":5:{s:5:\\\"class\\\";s:18:\\\"App\\\\Models\\\\Teacher\\\";s:2:\\\"id\\\";i:6;s:9:\\\"relations\\\";a:0:{}s:10:\\\"connection\\\";s:5:\\\"mysql\\\";s:15:\\\"collectionClass\\\";N;}s:7:\\\"\\u0000*\\u0000type\\\";s:16:\\\"bulk_distributed\\\";s:7:\\\"\\u0000*\\u0000data\\\";a:7:{s:20:\\\"bulk_distribution_id\\\";i:2;s:9:\\\"item_name\\\";s:15:\\\"Laptop Computer\\\";s:9:\\\"item_code\\\";s:5:\\\"EQ003\\\";s:8:\\\"quantity\\\";i:4;s:10:\\\"group_name\\\";s:17:\\\"Pilipino Teachers\\\";s:17:\\\"distribution_date\\\";s:10:\\\"2026-04-16\\\";s:20:\\\"expected_return_date\\\";s:10:\\\"2027-12-12\\\";}s:11:\\\"\\u0000*\\u0000senderId\\\";i:3;}\"},\"createdAt\":1776263244,\"delay\":null}', 0, NULL, 1776263244, 1776263244);

-- --------------------------------------------------------

--
-- Table structure for table `job_batches`
--

CREATE TABLE `job_batches` (
  `id` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `total_jobs` int(11) NOT NULL,
  `pending_jobs` int(11) NOT NULL,
  `failed_jobs` int(11) NOT NULL,
  `failed_job_ids` longtext NOT NULL,
  `options` mediumtext DEFAULT NULL,
  `cancelled_at` int(11) DEFAULT NULL,
  `created_at` int(11) NOT NULL,
  `finished_at` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `login_attempts`
--

CREATE TABLE `login_attempts` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `identifier` varchar(255) NOT NULL,
  `ip_address` varchar(255) NOT NULL,
  `batch` int(11) NOT NULL DEFAULT 1,
  `attempts_in_batch` int(11) NOT NULL DEFAULT 0,
  `total_attempts_today` int(11) NOT NULL DEFAULT 0,
  `last_attempt_at` timestamp NULL DEFAULT NULL,
  `locked_until` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `login_attempts`
--

INSERT INTO `login_attempts` (`id`, `identifier`, `ip_address`, `batch`, `attempts_in_batch`, `total_attempts_today`, `last_attempt_at`, `locked_until`, `created_at`, `updated_at`) VALUES
(1, 'benjie.trozo@csucc.edu.ph', '127.0.0.1', 1, 0, 0, NULL, NULL, '2026-04-15 01:01:28', '2026-04-15 01:01:28'),
(2, 'loren.torres@gmail.com', '127.0.0.1', 1, 0, 0, '2026-04-16 00:08:59', NULL, '2026-04-15 01:48:05', '2026-04-16 00:09:19'),
(3, 'neilbryant.galindez@csucc.edu.ph', '127.0.0.1', 1, 0, 0, NULL, NULL, '2026-04-15 17:14:44', '2026-04-15 17:14:44');

-- --------------------------------------------------------

--
-- Table structure for table `migrations`
--

CREATE TABLE `migrations` (
  `id` int(10) UNSIGNED NOT NULL,
  `migration` varchar(255) NOT NULL,
  `batch` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `migrations`
--

INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES
(1, '0001_01_01_000000_create_users_table', 1),
(2, '0001_01_01_000001_create_cache_table', 1),
(3, '0001_01_01_000002_create_jobs_table', 1),
(4, '2026_01_29_045529_create_admins_table', 1),
(5, '2026_01_29_045535_create_teachers_table', 1),
(6, '2026_01_29_045535_create_tools_equipment_table', 1),
(7, '2026_01_29_045536_create_borrow_requests_table', 1),
(8, '2026_01_29_045536_create_notifications_table', 1),
(9, '2026_01_29_045537_create_reports_table', 1),
(10, '2026_01_29_045538_create_inventory_logs_table', 1),
(11, '2026_02_03_080106_add_middle_initial_and_last_name_to_teachers_table', 1),
(12, '2026_02_03_090359_add_missing_columns_to_teachers_table', 1),
(13, '2026_02_03_090540_make_full_name_nullable_in_teachers_table', 1),
(14, '2026_02_11_000003_create_login_attempts_table', 2),
(15, '2026_04_13_123302_add_total_attempts_today_to_login_attempts_table', 3),
(16, '2026_04_13_123945_add_last_attempt_at_to_login_attempts_table', 4),
(17, '2026_02_03_105227_create_personal_access_tokens_table', 5),
(18, '2026_04_15_100257_create_system_logs_table', 6),
(19, '2026_04_15_104414_add_missing_columns_to_inventory_logs_table', 7),
(20, '2026_04_15_104758_add_reference_id_to_system_logs_table', 8),
(21, '2026_04_15_110813_fix_inventory_logs_to_original_schema', 9),
(22, '2026_04_15_111229_fix_notifications_schema_properly', 10),
(23, '2026_02_04_000001_create_suppliers_table', 11),
(24, '2026_02_04_000002_create_purchase_orders_table', 12),
(25, '2026_02_04_000003_create_purchase_order_items_table', 13),
(26, '2026_02_03_100046_create_teacher_inventory_table', 14),
(27, '2026_02_03_102204_add_deleted_at_to_tools_equipment_table', 15),
(28, '2026_02_05_000001_create_distribution_requests_table', 16),
(29, '2026_04_15_124349_add_missing_columns_to_distribution_groups', 17);

-- --------------------------------------------------------

--
-- Table structure for table `notifications`
--

CREATE TABLE `notifications` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `user_id` int(11) NOT NULL,
  `user_type` enum('admin','teacher') NOT NULL,
  `type` varchar(255) NOT NULL,
  `is_read` tinyint(4) NOT NULL DEFAULT 0,
  `related_table` varchar(50) DEFAULT NULL,
  `title` varchar(255) NOT NULL,
  `message` text NOT NULL,
  `reference_id` int(11) DEFAULT NULL,
  `read_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `notifications`
--

INSERT INTO `notifications` (`id`, `user_id`, `user_type`, `type`, `is_read`, `related_table`, `title`, `message`, `reference_id`, `read_at`, `created_at`, `updated_at`) VALUES
(1, 7, 'teacher', 'borrow_request_approved', 1, 'borrow_request', 'Borrow Request Approved', 'Your request for 5 unit(s) of Laptop Computer has been approved and issued', NULL, '2026-04-15 20:41:54', '2026-04-15 20:39:09', '2026-04-15 20:41:54'),
(2, 7, 'teacher', 'item_returned', 1, 'borrow_request', 'Item Return Confirmed', 'Your return of 5 unit(s) of Laptop Computer has been confirmed', NULL, '2026-04-15 20:41:54', '2026-04-15 20:39:23', '2026-04-15 20:41:54'),
(3, 7, 'teacher', 'borrow_request_approved', 1, 'borrow_request', 'Borrow Request Approved', 'Your request for 8 unit(s) of Laptop Computer has been approved and issued', NULL, '2026-04-15 20:41:54', '2026-04-15 20:41:03', '2026-04-15 20:41:54');

-- --------------------------------------------------------

--
-- Table structure for table `password_reset_tokens`
--

CREATE TABLE `password_reset_tokens` (
  `email` varchar(255) NOT NULL,
  `token` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `personal_access_tokens`
--

CREATE TABLE `personal_access_tokens` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `tokenable_type` varchar(255) NOT NULL,
  `tokenable_id` bigint(20) UNSIGNED NOT NULL,
  `name` text NOT NULL,
  `token` varchar(64) NOT NULL,
  `abilities` text DEFAULT NULL,
  `last_used_at` timestamp NULL DEFAULT NULL,
  `expires_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `personal_access_tokens`
--

INSERT INTO `personal_access_tokens` (`id`, `tokenable_type`, `tokenable_id`, `name`, `token`, `abilities`, `last_used_at`, `expires_at`, `created_at`, `updated_at`) VALUES
(1, 'App\\Models\\Admin', 3, 'admin-token', 'b89b84d875f3cfcfc218bc9f848311e641dd5585664a1cb2cc60df0719a74dd5', '{\"expires_at\":\"2026-04-15T10:54:14.044931Z\",\"abilities\":[\"*\"]}', NULL, NULL, '2026-04-15 01:54:14', '2026-04-15 01:54:14'),
(2, 'App\\Models\\Admin', 3, 'admin-refresh', 'c4ce2fedf7263441bba2e0e9f82646758bff7942120993c381bdb1b63cf038d7', '{\"expires_at\":\"2026-04-22T09:54:14.293273Z\"}', NULL, NULL, '2026-04-15 01:54:14', '2026-04-15 01:54:14'),
(3, 'App\\Models\\Admin', 3, 'admin-token', 'd2232a7ad4d1294f603d42ba034aaab5b6c9474a2a7ec00d74f62c614d773641', '{\"expires_at\":\"2026-04-15T11:00:16.430479Z\",\"abilities\":[\"*\"]}', NULL, NULL, '2026-04-15 02:00:16', '2026-04-15 02:00:16'),
(4, 'App\\Models\\Admin', 3, 'admin-refresh', 'cc77cc4cfd939ec58c155c6a83761d286ac5114b09ba7fbf1a77237fe94279f9', '{\"expires_at\":\"2026-04-22T10:00:16.489868Z\"}', NULL, NULL, '2026-04-15 02:00:16', '2026-04-15 02:00:16'),
(5, 'App\\Models\\Admin', 3, 'admin-token', '2eddf9de6555ca47fbf0661157eaf543d72df7b3e4f8b5a4fec9b36ecf769a88', '{\"expires_at\":\"2026-04-15T11:04:47.444833Z\",\"abilities\":[\"*\"]}', '2026-04-15 03:04:44', NULL, '2026-04-15 02:04:47', '2026-04-15 03:04:44'),
(6, 'App\\Models\\Admin', 3, 'admin-refresh', '418d99e6cebd875d26cbecf056be76445ae4a68c21c29a3952ad7155058744b1', '{\"expires_at\":\"2026-04-22T10:04:47.514425Z\"}', NULL, NULL, '2026-04-15 02:04:47', '2026-04-15 02:04:47'),
(7, 'App\\Models\\Admin', 3, 'admin-token', 'a4849648bad342d5b064d88d113979dfcd9c5a350a2912aae238e6aa7e25b52a', '{\"expires_at\":\"2026-04-15T12:06:20.121684Z\",\"abilities\":[\"*\"]}', '2026-04-15 04:05:37', NULL, '2026-04-15 03:06:20', '2026-04-15 04:05:37'),
(8, 'App\\Models\\Admin', 3, 'admin-refresh', '9496eb6291bbf16adf1979ce5e7bfb8cdae1b8cecffa6b72f621ce4a4b69d820', '{\"expires_at\":\"2026-04-22T11:06:20.204016Z\"}', NULL, NULL, '2026-04-15 03:06:20', '2026-04-15 03:06:20'),
(9, 'App\\Models\\Admin', 3, 'admin-token', 'f52d23c83103e4efaae4a59b206a9f43ebf8b34c1199f316b78997248f8b3965', '{\"expires_at\":\"2026-04-15T13:16:44.550709Z\",\"abilities\":[\"*\"]}', '2026-04-15 05:16:36', NULL, '2026-04-15 04:16:44', '2026-04-15 05:16:36'),
(10, 'App\\Models\\Admin', 3, 'admin-refresh', '36ee9ef11dac2f6b82f20ea5f59d6191050b156440b4f6821dab817e2cc3a509', '{\"expires_at\":\"2026-04-22T12:16:44.817474Z\"}', NULL, NULL, '2026-04-15 04:16:44', '2026-04-15 04:16:44'),
(11, 'App\\Models\\Admin', 3, 'admin-token', '375e9374782c42766399d4669a031794a31bb654838bb15d7af378522f87bee1', '{\"expires_at\":\"2026-04-15T14:17:17.233167Z\",\"abilities\":[\"*\"]}', '2026-04-15 06:16:31', NULL, '2026-04-15 05:17:17', '2026-04-15 06:16:31'),
(12, 'App\\Models\\Admin', 3, 'admin-refresh', 'f0d3b3c5f705c1d991f8d83d6655f3cd1b18324fc781b4651fbf9a8c605049c6', '{\"expires_at\":\"2026-04-22T13:17:17.286628Z\"}', NULL, NULL, '2026-04-15 05:17:17', '2026-04-15 05:17:17'),
(13, 'App\\Models\\Admin', 3, 'admin-token', '60397b60b856e358dc6e6389f917f912ccc011995d6b4f928507e87970439539', '{\"expires_at\":\"2026-04-15T15:18:19.135988Z\",\"abilities\":[\"*\"]}', '2026-04-15 07:17:37', NULL, '2026-04-15 06:18:19', '2026-04-15 07:17:37'),
(14, 'App\\Models\\Admin', 3, 'admin-refresh', '745a0d38ab8e919a434934d65166514f774029f683d2f9a828fa51992c4d1567', '{\"expires_at\":\"2026-04-22T14:18:19.326092Z\"}', NULL, NULL, '2026-04-15 06:18:19', '2026-04-15 06:18:19'),
(15, 'App\\Models\\Admin', 3, 'admin-token', 'ddc2a224e49ee203bfee353c51e55baac61a0c103895387f947ee833a48d5f45', '{\"expires_at\":\"2026-04-15T16:18:59.590076Z\",\"abilities\":[\"*\"]}', '2026-04-15 08:09:29', NULL, '2026-04-15 07:18:59', '2026-04-15 08:09:29'),
(16, 'App\\Models\\Admin', 3, 'admin-refresh', '2b8045adb065feeeed772799304c50cdfdfc8e84094706b83402dd3a28be34f0', '{\"expires_at\":\"2026-04-22T15:18:59.936712Z\"}', NULL, NULL, '2026-04-15 07:18:59', '2026-04-15 07:18:59'),
(17, 'App\\Models\\Admin', 3, 'admin-token', '06f6a26d5537a1e0f2e3b9e2164f10a4004c438fa165afbc7f26755fd7eaca8a', '{\"expires_at\":\"2026-04-15T17:12:06.265209Z\",\"abilities\":[\"*\"]}', '2026-04-15 08:56:05', NULL, '2026-04-15 08:12:06', '2026-04-15 08:56:05'),
(18, 'App\\Models\\Admin', 3, 'admin-refresh', '4fe0d269c43bfbe09400fafd66b95a67f4d3c5a243c6557429cc40b5f2f63e64', '{\"expires_at\":\"2026-04-22T16:12:06.526051Z\"}', NULL, NULL, '2026-04-15 08:12:06', '2026-04-15 08:12:06'),
(19, 'App\\Models\\Admin', 3, 'admin-token', '716ac029e37969ab14cf70a9f892fb000111fd625083362b3b328a7d25517fb2', '{\"expires_at\":\"2026-04-15T18:34:28.139367Z\",\"abilities\":[\"*\"]}', '2026-04-15 09:54:11', NULL, '2026-04-15 09:34:28', '2026-04-15 09:54:11'),
(20, 'App\\Models\\Admin', 3, 'admin-refresh', '1d0dedbf01bd90e6694f314743cca4ac64a11619ffdf940dae4333890485d2a0', '{\"expires_at\":\"2026-04-22T17:34:28.189646Z\"}', NULL, NULL, '2026-04-15 09:34:28', '2026-04-15 09:34:28'),
(21, 'App\\Models\\Admin', 3, 'admin-token', '38af91ecfea418ed11db15b085f062bef9886908d1e4986f3123f4a833563b93', '{\"expires_at\":\"2026-04-16T00:45:44.107005Z\",\"abilities\":[\"*\"]}', '2026-04-15 16:45:34', NULL, '2026-04-15 15:45:44', '2026-04-15 16:45:34'),
(22, 'App\\Models\\Admin', 3, 'admin-refresh', 'e61f23305e66a2c492da9d6913c769d5f31632fb9fa44ebda06fce19038295c5', '{\"expires_at\":\"2026-04-22T23:45:44.478896Z\"}', NULL, NULL, '2026-04-15 15:45:44', '2026-04-15 15:45:44'),
(23, 'App\\Models\\Admin', 3, 'admin-token', 'f9af0cb33b854589435db8024b29bae8a9eb8a8e1c10b5423194e4acf941d380', '{\"expires_at\":\"2026-04-16T01:47:18.925413Z\",\"abilities\":[\"*\"]}', '2026-04-15 17:46:50', NULL, '2026-04-15 16:47:19', '2026-04-15 17:46:50'),
(24, 'App\\Models\\Admin', 3, 'admin-refresh', '1222fb27797896df6daf72ce4e7d8f43027f912cd2742d6e394fc561065a4834', '{\"expires_at\":\"2026-04-23T00:47:19.097419Z\"}', NULL, NULL, '2026-04-15 16:47:19', '2026-04-15 16:47:19'),
(25, 'App\\Models\\Teacher', 7, 'teacher-token', '33c7b1874cc1d720994343041fca70d5258dec42e1c516e7ed7be15326150746', '{\"expires_at\":\"2026-04-16T02:20:07.731347Z\",\"abilities\":[\"*\"]}', '2026-04-15 17:53:16', NULL, '2026-04-15 17:20:07', '2026-04-15 17:53:16'),
(26, 'App\\Models\\Teacher', 7, 'teacher-refresh', '1ecb9337d740d6d7fc5fbbead4ecd6b22259e28688dc9074fc96b801a2656a8f', '{\"expires_at\":\"2026-04-23T01:20:07.807725Z\"}', NULL, NULL, '2026-04-15 17:20:07', '2026-04-15 17:20:07'),
(27, 'App\\Models\\Admin', 3, 'admin-token', '132a3ac50e1fc0899ab0fdd1e46d15f0eee39c69de701eec1765e5523eef3170', '{\"expires_at\":\"2026-04-16T02:47:57.306920Z\",\"abilities\":[\"*\"]}', '2026-04-15 18:47:48', NULL, '2026-04-15 17:47:57', '2026-04-15 18:47:48'),
(28, 'App\\Models\\Admin', 3, 'admin-refresh', '156f0de38afafe907f0172e849f7b51fea004cf7af0f155e58c72053b5e11571', '{\"expires_at\":\"2026-04-23T01:47:57.389620Z\"}', NULL, NULL, '2026-04-15 17:47:57', '2026-04-15 17:47:57'),
(29, 'App\\Models\\Teacher', 7, 'teacher-token', 'ec53617a6a8150b73911f82a24151bf447efcb18196200f22ec35c3144d2bd03', '{\"expires_at\":\"2026-04-16T03:36:46.811473Z\",\"abilities\":[\"*\"]}', '2026-04-15 18:37:18', NULL, '2026-04-15 18:36:46', '2026-04-15 18:37:18'),
(30, 'App\\Models\\Teacher', 7, 'teacher-refresh', '21da493d7642a069f4785ed25b43c1e53c0cbf3c6639006adcdfaabcac4c9ad6', '{\"expires_at\":\"2026-04-23T02:36:46.851930Z\"}', NULL, NULL, '2026-04-15 18:36:46', '2026-04-15 18:36:46'),
(31, 'App\\Models\\Admin', 3, 'admin-token', '4e0b84b951c5492ccb92615bd51a08d7419118eed474c1e70f41aadb4ebda342', '{\"expires_at\":\"2026-04-16T04:30:56.124340Z\",\"abilities\":[\"*\"]}', '2026-04-15 20:30:33', NULL, '2026-04-15 19:30:56', '2026-04-15 20:30:33'),
(32, 'App\\Models\\Admin', 3, 'admin-refresh', '967de09a1bd81f4d7c3b8363f723abc8f1ce6f8a08a28a9464dce354734260cf', '{\"expires_at\":\"2026-04-23T03:30:56.175229Z\"}', NULL, NULL, '2026-04-15 19:30:56', '2026-04-15 19:30:56'),
(33, 'App\\Models\\Admin', 3, 'admin-token', 'afb0e978798ecc29e5ac903fc7e829216c731d4db523335b4fd4c012092a3dac', '{\"expires_at\":\"2026-04-16T05:32:28.525544Z\",\"abilities\":[\"*\"]}', '2026-04-15 21:32:16', NULL, '2026-04-15 20:32:28', '2026-04-15 21:32:16'),
(34, 'App\\Models\\Admin', 3, 'admin-refresh', 'b294425825edf8f5475237e2d2a4ca25e279af2ee21bb92b1cc94c8c6d07270e', '{\"expires_at\":\"2026-04-23T04:32:28.562367Z\"}', NULL, NULL, '2026-04-15 20:32:28', '2026-04-15 20:32:28'),
(35, 'App\\Models\\Teacher', 7, 'teacher-token', 'e798267ec3c7ae8b4c1c0780ec6aa607be71899b75c4a903ac34027352386364', '{\"expires_at\":\"2026-04-16T05:35:22.243814Z\",\"abilities\":[\"*\"]}', '2026-04-15 21:32:12', NULL, '2026-04-15 20:35:22', '2026-04-15 21:32:12'),
(36, 'App\\Models\\Teacher', 7, 'teacher-refresh', '3fc8a26be8b6c88dd0b1bdfd00e5b5f319a475350649606a12561ef05cec3d05', '{\"expires_at\":\"2026-04-23T04:35:22.329420Z\"}', NULL, NULL, '2026-04-15 20:35:22', '2026-04-15 20:35:22'),
(37, 'App\\Models\\Admin', 3, 'admin-token', 'dfcbd99ce588e030f7a2f760c7bedc9e8a00c8f7e79d1028fc78a70e08605706', '{\"expires_at\":\"2026-04-16T06:33:15.979874Z\",\"abilities\":[\"*\"]}', '2026-04-15 22:33:13', NULL, '2026-04-15 21:33:16', '2026-04-15 22:33:13'),
(38, 'App\\Models\\Admin', 3, 'admin-refresh', '9cf48d8db45b3911e0b6413a45b3530c09252b5e074cc52b04172c6245f52fbc', '{\"expires_at\":\"2026-04-23T05:33:16.127146Z\"}', NULL, NULL, '2026-04-15 21:33:16', '2026-04-15 21:33:16'),
(39, 'App\\Models\\Teacher', 7, 'teacher-token', '7a5ea8bfc5b5a53cb37b014015b3a48239900db25f5ea9df168920439f4a818a', '{\"expires_at\":\"2026-04-16T06:59:22.539182Z\",\"abilities\":[\"*\"]}', '2026-04-15 22:15:25', NULL, '2026-04-15 21:59:22', '2026-04-15 22:15:25'),
(40, 'App\\Models\\Teacher', 7, 'teacher-refresh', '5d26bca0e9e144d45962d6e0f20be0b6b2bc0ba8b2f87e7e328d055ad1749193', '{\"expires_at\":\"2026-04-23T05:59:22.571067Z\"}', NULL, NULL, '2026-04-15 21:59:22', '2026-04-15 21:59:22'),
(41, 'App\\Models\\Admin', 3, 'admin-token', 'a64d171189bc8340908043a7813f49f3596dfdffb363ebaa6b04f088eb8b1f89', '{\"expires_at\":\"2026-04-16T08:07:23.887888Z\",\"abilities\":[\"*\"]}', '2026-04-16 00:07:21', NULL, '2026-04-15 23:07:23', '2026-04-16 00:07:21'),
(42, 'App\\Models\\Admin', 3, 'admin-refresh', '955ab6af47446fbb9785a53a8f39b0101a9b5148ac87a28ad28c557f021dbd05', '{\"expires_at\":\"2026-04-23T07:07:23.950281Z\"}', NULL, NULL, '2026-04-15 23:07:23', '2026-04-15 23:07:23'),
(43, 'App\\Models\\Admin', 3, 'admin-token', 'f85cb3b59230a602d0bf725389be2f2c2d526319bb49d4992e8d2d6ab51cad21', '{\"expires_at\":\"2026-04-16T09:09:19.067160Z\",\"abilities\":[\"*\"]}', '2026-04-16 00:09:35', NULL, '2026-04-16 00:09:19', '2026-04-16 00:09:35'),
(44, 'App\\Models\\Admin', 3, 'admin-refresh', '481cfbd1ed2c37a43bb8ef37e5d9b188dbb823f384ecaadb9e9bd5277abbc813', '{\"expires_at\":\"2026-04-23T08:09:19.090725Z\"}', NULL, NULL, '2026-04-16 00:09:19', '2026-04-16 00:09:19');

-- --------------------------------------------------------

--
-- Table structure for table `purchase_orders`
--

CREATE TABLE `purchase_orders` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `po_number` varchar(255) NOT NULL,
  `po_date` date NOT NULL,
  `expected_delivery_date` date DEFAULT NULL,
  `status` enum('pending','approved','partially_received','completed','cancelled') NOT NULL DEFAULT 'pending',
  `company_name` varchar(255) DEFAULT NULL,
  `company_address` text DEFAULT NULL,
  `company_contact_person` varchar(255) DEFAULT NULL,
  `company_email` varchar(255) DEFAULT NULL,
  `company_phone` varchar(255) DEFAULT NULL,
  `supplier_id` bigint(20) UNSIGNED DEFAULT NULL,
  `supplier_name` varchar(255) NOT NULL,
  `supplier_address` text DEFAULT NULL,
  `supplier_contact_person` varchar(255) DEFAULT NULL,
  `supplier_email` varchar(255) DEFAULT NULL,
  `supplier_phone` varchar(255) DEFAULT NULL,
  `subtotal` decimal(12,2) NOT NULL DEFAULT 0.00,
  `discount` decimal(12,2) NOT NULL DEFAULT 0.00,
  `tax` decimal(12,2) NOT NULL DEFAULT 0.00,
  `shipping_fee` decimal(12,2) NOT NULL DEFAULT 0.00,
  `total_amount` decimal(12,2) NOT NULL DEFAULT 0.00,
  `delivery_address` text DEFAULT NULL,
  `delivery_method` varchar(255) DEFAULT NULL,
  `shipping_terms` varchar(255) DEFAULT NULL,
  `receiving_instructions` text DEFAULT NULL,
  `payment_method` varchar(255) DEFAULT NULL,
  `payment_terms` varchar(255) DEFAULT NULL,
  `reference` varchar(255) DEFAULT NULL,
  `requested_by` varchar(255) DEFAULT NULL,
  `approved_by` varchar(255) DEFAULT NULL,
  `approval_date` timestamp NULL DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `terms_conditions` text DEFAULT NULL,
  `admin_id` bigint(20) UNSIGNED DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `purchase_orders`
--

INSERT INTO `purchase_orders` (`id`, `po_number`, `po_date`, `expected_delivery_date`, `status`, `company_name`, `company_address`, `company_contact_person`, `company_email`, `company_phone`, `supplier_id`, `supplier_name`, `supplier_address`, `supplier_contact_person`, `supplier_email`, `supplier_phone`, `subtotal`, `discount`, `tax`, `shipping_fee`, `total_amount`, `delivery_address`, `delivery_method`, `shipping_terms`, `receiving_instructions`, `payment_method`, `payment_terms`, `reference`, `requested_by`, `approved_by`, `approval_date`, `notes`, `terms_conditions`, `admin_id`, `created_at`, `updated_at`, `deleted_at`) VALUES
(1, 'PO-202604-0001', '2026-04-15', '2026-12-12', 'approved', 'School Inventory System', NULL, NULL, NULL, NULL, 1, 'Hezron', 'Purok2', 'Benjie P Trozo', 'benjie.trozo@csucc.edu.ph', '925726212', 28000.00, 121.00, 11.88, 8766.00, 36656.88, NULL, 'courier', NULL, NULL, 'bank_transfer', 'Net 30', 'ggg', ' ', ' ', '2026-04-15 04:01:40', 'vg', NULL, 3, '2026-04-15 03:34:34', '2026-04-15 04:01:40', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `purchase_order_items`
--

CREATE TABLE `purchase_order_items` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `purchase_order_id` bigint(20) UNSIGNED NOT NULL,
  `item_code` varchar(255) DEFAULT NULL,
  `item_name` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `category` varchar(255) DEFAULT NULL,
  `quantity_ordered` int(11) NOT NULL,
  `quantity_received` int(11) NOT NULL DEFAULT 0,
  `unit_of_measure` varchar(255) NOT NULL DEFAULT 'pcs',
  `unit_price` decimal(12,2) NOT NULL,
  `line_total` decimal(12,2) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `purchase_order_items`
--

INSERT INTO `purchase_order_items` (`id`, `purchase_order_id`, `item_code`, `item_name`, `description`, `category`, `quantity_ordered`, `quantity_received`, `unit_of_measure`, `unit_price`, `line_total`, `created_at`, `updated_at`) VALUES
(1, 1, 'Equipment-1212', 'Printer', 'asasa', 'Hsas', 4, 0, 'pcs', 7000.00, 28000.00, '2026-04-15 03:34:34', '2026-04-15 03:34:34');

-- --------------------------------------------------------

--
-- Table structure for table `reports`
--

CREATE TABLE `reports` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `report_code` varchar(255) NOT NULL,
  `teacher_id` bigint(20) UNSIGNED NOT NULL,
  `item_id` bigint(20) UNSIGNED DEFAULT NULL,
  `issue_type` varchar(255) NOT NULL,
  `description` text NOT NULL,
  `resolution` text DEFAULT NULL,
  `status` enum('open','in_progress','resolved','closed') NOT NULL DEFAULT 'open',
  `priority` enum('low','medium','high','critical') NOT NULL DEFAULT 'medium',
  `assigned_to` bigint(20) UNSIGNED DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `sessions`
--

CREATE TABLE `sessions` (
  `id` varchar(255) NOT NULL,
  `user_id` bigint(20) UNSIGNED DEFAULT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` text DEFAULT NULL,
  `payload` longtext NOT NULL,
  `last_activity` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `suppliers`
--

CREATE TABLE `suppliers` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `supplier_code` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `address` text DEFAULT NULL,
  `contact_person` varchar(255) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `phone` varchar(255) DEFAULT NULL,
  `tax_id` varchar(255) DEFAULT NULL,
  `payment_terms` varchar(255) DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `status` enum('active','inactive') NOT NULL DEFAULT 'active',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `deleted_by` bigint(20) UNSIGNED DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `suppliers`
--

INSERT INTO `suppliers` (`id`, `supplier_code`, `name`, `address`, `contact_person`, `email`, `phone`, `tax_id`, `payment_terms`, `notes`, `status`, `created_at`, `updated_at`, `deleted_at`, `deleted_by`) VALUES
(1, 'SUP-0001', 'Hezron', 'Purok2', 'Lijay L. Jabines', 'neilbryant.galindez@csucc.edu.ph', '925726212', '1212', 'Net 30', 'sasasas', 'active', '2026-04-15 03:32:30', '2026-04-15 03:32:30', NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `system_logs`
--

CREATE TABLE `system_logs` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `log_type` varchar(255) DEFAULT NULL,
  `user_type` varchar(255) DEFAULT NULL,
  `user_id` bigint(20) UNSIGNED DEFAULT NULL,
  `reference_id` bigint(20) UNSIGNED DEFAULT NULL,
  `user_name` varchar(255) DEFAULT NULL,
  `action` varchar(255) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `ip_address` varchar(255) DEFAULT NULL,
  `user_agent` text DEFAULT NULL,
  `severity` varchar(255) DEFAULT NULL,
  `metadata` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`metadata`)),
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `system_logs`
--

INSERT INTO `system_logs` (`id`, `log_type`, `user_type`, `user_id`, `reference_id`, `user_name`, `action`, `description`, `ip_address`, `user_agent`, `severity`, `metadata`, `created_at`, `updated_at`) VALUES
(1, 'auth', 'admin', 3, NULL, ' ', 'login', 'Admin logged in successfully', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36', 'info', '{\"url\":\"http:\\/\\/127.0.0.1:8000\\/api\\/auth\\/login\",\"method\":\"POST\"}', '2026-04-15 02:04:47', '2026-04-15 02:04:47'),
(2, 'transaction', 'admin', 3, NULL, ' ', 'inventory_create', 'Created new inventory item: Television (Equipment-98)', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36', 'info', '{\"url\":\"http:\\/\\/127.0.0.1:8000\\/api\\/admin\\/inventory\",\"method\":\"POST\"}', '2026-04-15 02:26:29', '2026-04-15 02:26:29'),
(3, 'auth', 'admin', 3, NULL, ' ', 'login', 'Admin logged in successfully', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36', 'info', '{\"url\":\"http:\\/\\/127.0.0.1:8000\\/api\\/auth\\/login\",\"method\":\"POST\"}', '2026-04-15 03:06:20', '2026-04-15 03:06:20'),
(4, 'supplier', 'admin', 3, 1, NULL, 'created', 'Supplier Hezron created', NULL, NULL, NULL, NULL, '2026-04-15 03:32:30', '2026-04-15 03:32:30'),
(5, 'purchase_order', 'admin', 3, 1, NULL, 'created', 'Purchase Order PO-202604-0001 created', NULL, NULL, NULL, NULL, '2026-04-15 03:34:34', '2026-04-15 03:34:34'),
(6, 'transaction', 'admin', 3, NULL, ' ', 'inventory_create', 'Created new inventory item: Pliers (Tools-9123)', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36', 'info', '{\"url\":\"http:\\/\\/127.0.0.1:8000\\/api\\/admin\\/inventory\",\"method\":\"POST\"}', '2026-04-15 03:35:45', '2026-04-15 03:35:45'),
(7, 'transaction', 'admin', 3, NULL, ' ', 'teacher_deleted', 'Deleted teacher account:   ()', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36', 'warning', '{\"url\":\"http:\\/\\/127.0.0.1:8000\\/api\\/admin\\/teachers\\/5\",\"method\":\"DELETE\"}', '2026-04-15 03:52:46', '2026-04-15 03:52:46'),
(8, 'transaction', 'admin', 3, NULL, ' ', 'inventory_create', 'Created new inventory item: Scanner (Equipment-89)', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36', 'info', '{\"url\":\"http:\\/\\/127.0.0.1:8000\\/api\\/admin\\/inventory\",\"method\":\"POST\"}', '2026-04-15 03:57:47', '2026-04-15 03:57:47'),
(9, 'purchase_order', 'admin', 3, 1, NULL, 'approved', 'Purchase Order PO-202604-0001 approved', NULL, NULL, NULL, NULL, '2026-04-15 04:01:40', '2026-04-15 04:01:40'),
(10, 'auth', 'admin', 3, NULL, ' ', 'login', 'Admin logged in successfully', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36', 'info', '{\"url\":\"http:\\/\\/127.0.0.1:8000\\/api\\/auth\\/login\",\"method\":\"POST\"}', '2026-04-15 04:16:44', '2026-04-15 04:16:44'),
(11, NULL, NULL, NULL, NULL, NULL, 'delete_distribution_group', 'Moved distribution group to trash: Test Group 1776257961', '127.0.0.1', NULL, NULL, NULL, '2026-04-15 05:11:33', '2026-04-15 05:11:33'),
(12, NULL, NULL, NULL, NULL, NULL, 'delete_distribution_group', 'Moved distribution group to trash: Test Group 1776257776', '127.0.0.1', NULL, NULL, NULL, '2026-04-15 05:11:59', '2026-04-15 05:11:59'),
(13, 'auth', 'admin', 3, NULL, ' ', 'login', 'Admin logged in successfully', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36', 'info', '{\"url\":\"http:\\/\\/127.0.0.1:8000\\/api\\/auth\\/login\",\"method\":\"POST\"}', '2026-04-15 05:17:17', '2026-04-15 05:17:17'),
(14, NULL, NULL, NULL, NULL, NULL, 'delete_distribution_group', 'Moved distribution group to trash: Test Group 1776258752', '127.0.0.1', NULL, NULL, NULL, '2026-04-15 05:17:43', '2026-04-15 05:17:43'),
(15, NULL, NULL, NULL, NULL, NULL, 'delete_distribution_group', 'Moved distribution group to trash: Test Group 1776259090', '127.0.0.1', NULL, NULL, NULL, '2026-04-15 05:36:47', '2026-04-15 05:36:47'),
(16, NULL, NULL, NULL, NULL, NULL, 'delete_distribution_group', 'Moved distribution group to trash: Test Group 1776260826', '127.0.0.1', NULL, NULL, NULL, '2026-04-15 06:03:01', '2026-04-15 06:03:01'),
(17, NULL, NULL, NULL, NULL, NULL, 'delete_distribution_group', 'Moved distribution group to trash: Test Group 1776261318', '127.0.0.1', NULL, NULL, NULL, '2026-04-15 06:03:25', '2026-04-15 06:03:25'),
(18, 'auth', 'admin', 3, NULL, ' ', 'login', 'Admin logged in successfully', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36', 'info', '{\"url\":\"http:\\/\\/127.0.0.1:8000\\/api\\/auth\\/login\",\"method\":\"POST\"}', '2026-04-15 06:18:19', '2026-04-15 06:18:19'),
(19, 'auth', 'admin', 3, NULL, ' ', 'login', 'Admin logged in successfully', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36', 'info', '{\"url\":\"http:\\/\\/127.0.0.1:8000\\/api\\/auth\\/login\",\"method\":\"POST\"}', '2026-04-15 07:18:59', '2026-04-15 07:18:59'),
(20, 'auth', 'admin', 3, NULL, ' ', 'login', 'Admin logged in successfully', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36', 'info', '{\"url\":\"http:\\/\\/127.0.0.1:8000\\/api\\/auth\\/login\",\"method\":\"POST\"}', '2026-04-15 08:12:06', '2026-04-15 08:12:06'),
(21, 'auth', 'admin', 3, NULL, ' ', 'login', 'Admin logged in successfully', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36', 'info', '{\"url\":\"http:\\/\\/127.0.0.1:8000\\/api\\/auth\\/login\",\"method\":\"POST\"}', '2026-04-15 09:34:28', '2026-04-15 09:34:28'),
(22, 'auth', 'admin', 3, NULL, ' ', 'login', 'Admin logged in successfully', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36', 'info', '{\"url\":\"http:\\/\\/127.0.0.1:8000\\/api\\/auth\\/login\",\"method\":\"POST\"}', '2026-04-15 15:45:44', '2026-04-15 15:45:44'),
(23, 'auth', 'admin', 3, NULL, ' ', 'login', 'Admin logged in successfully', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36', 'info', '{\"url\":\"http:\\/\\/127.0.0.1:8000\\/api\\/auth\\/login\",\"method\":\"POST\"}', '2026-04-15 16:47:19', '2026-04-15 16:47:19'),
(24, 'transaction', 'admin', 3, NULL, ' ', 'teacher_created', 'Created new teacher account: Neilbryant Galindez (2131-212)', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36', 'info', '{\"url\":\"http:\\/\\/127.0.0.1:8000\\/api\\/admin\\/teachers\",\"method\":\"POST\"}', '2026-04-15 17:13:35', '2026-04-15 17:13:35'),
(25, 'auth', 'teacher', 7, NULL, 'Neilbryant Galindez', 'login', 'Teacher logged in successfully', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36 Edg/147.0.0.0', 'info', '{\"url\":\"http:\\/\\/127.0.0.1:8000\\/api\\/auth\\/login\",\"method\":\"POST\"}', '2026-04-15 17:20:07', '2026-04-15 17:20:07'),
(26, 'auth', 'admin', 3, NULL, ' ', 'login', 'Admin logged in successfully', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36', 'info', '{\"url\":\"http:\\/\\/127.0.0.1:8000\\/api\\/auth\\/login\",\"method\":\"POST\"}', '2026-04-15 17:47:57', '2026-04-15 17:47:57'),
(27, 'transaction', 'admin', 3, NULL, ' ', 'borrow_request_approved', 'Approved borrow request for Electric Drill by Neilbryant Galindez', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36', 'info', '{\"url\":\"http:\\/\\/127.0.0.1:8000\\/api\\/admin\\/requests\\/1\\/approve\",\"method\":\"POST\"}', '2026-04-15 17:58:06', '2026-04-15 17:58:06'),
(28, 'auth', 'teacher', 7, NULL, 'Neilbryant Galindez', 'login', 'Teacher logged in successfully', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36 Edg/147.0.0.0', 'info', '{\"url\":\"http:\\/\\/127.0.0.1:8000\\/api\\/auth\\/login\",\"method\":\"POST\"}', '2026-04-15 18:36:46', '2026-04-15 18:36:46'),
(29, 'transaction', 'admin', 3, NULL, ' ', 'borrow_request_approved', 'Approved borrow request for Laptop Computer by Neilbryant Galindez', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36', 'info', '{\"url\":\"http:\\/\\/127.0.0.1:8000\\/api\\/admin\\/requests\\/2\\/approve\",\"method\":\"POST\"}', '2026-04-15 18:37:38', '2026-04-15 18:37:38'),
(30, 'auth', 'admin', 3, NULL, ' ', 'login', 'Admin logged in successfully', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36', 'info', '{\"url\":\"http:\\/\\/127.0.0.1:8000\\/api\\/auth\\/login\",\"method\":\"POST\"}', '2026-04-15 19:30:56', '2026-04-15 19:30:56'),
(31, 'transaction', 'admin', 3, NULL, ' ', 'item_returned', 'Item returned: Laptop Computer by Neilbryant Galindez', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36', 'info', '{\"url\":\"http:\\/\\/127.0.0.1:8000\\/api\\/admin\\/requests\\/2\\/return\",\"method\":\"POST\"}', '2026-04-15 19:31:31', '2026-04-15 19:31:31'),
(32, 'auth', 'admin', 3, NULL, ' ', 'login', 'Admin logged in successfully', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36', 'info', '{\"url\":\"http:\\/\\/127.0.0.1:8000\\/api\\/auth\\/login\",\"method\":\"POST\"}', '2026-04-15 20:32:28', '2026-04-15 20:32:28'),
(33, 'transaction', 'admin', 3, NULL, ' ', 'item_returned', 'Item returned: Electric Drill by Neilbryant Galindez', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36', 'info', '{\"url\":\"http:\\/\\/127.0.0.1:8000\\/api\\/admin\\/requests\\/1\\/return\",\"method\":\"POST\"}', '2026-04-15 20:32:42', '2026-04-15 20:32:42'),
(34, 'auth', 'teacher', 7, NULL, 'Neilbryant Galindez', 'login', 'Teacher logged in successfully', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36 Edg/147.0.0.0', 'info', '{\"url\":\"http:\\/\\/127.0.0.1:8000\\/api\\/auth\\/login\",\"method\":\"POST\"}', '2026-04-15 20:35:22', '2026-04-15 20:35:22'),
(35, 'transaction', 'admin', 3, NULL, ' ', 'borrow_request_approved', 'Approved borrow request for Laptop Computer by Neilbryant Galindez', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36', 'info', '{\"url\":\"http:\\/\\/127.0.0.1:8000\\/api\\/admin\\/requests\\/3\\/approve\",\"method\":\"POST\"}', '2026-04-15 20:39:09', '2026-04-15 20:39:09'),
(36, 'transaction', 'admin', 3, NULL, ' ', 'item_returned', 'Item returned: Laptop Computer by Neilbryant Galindez', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36', 'info', '{\"url\":\"http:\\/\\/127.0.0.1:8000\\/api\\/admin\\/requests\\/3\\/return\",\"method\":\"POST\"}', '2026-04-15 20:39:22', '2026-04-15 20:39:22'),
(37, 'transaction', 'admin', 3, NULL, ' ', 'borrow_request_approved', 'Approved borrow request for Laptop Computer by Neilbryant Galindez', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36', 'info', '{\"url\":\"http:\\/\\/127.0.0.1:8000\\/api\\/admin\\/requests\\/4\\/approve\",\"method\":\"POST\"}', '2026-04-15 20:41:03', '2026-04-15 20:41:03'),
(38, 'auth', 'admin', 3, NULL, ' ', 'login', 'Admin logged in successfully', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36', 'info', '{\"url\":\"http:\\/\\/127.0.0.1:8000\\/api\\/auth\\/login\",\"method\":\"POST\"}', '2026-04-15 21:33:16', '2026-04-15 21:33:16'),
(39, 'auth', 'teacher', 7, NULL, 'Neilbryant Galindez', 'login', 'Teacher logged in successfully', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36 Edg/147.0.0.0', 'info', '{\"url\":\"http:\\/\\/127.0.0.1:8000\\/api\\/auth\\/login\",\"method\":\"POST\"}', '2026-04-15 21:59:22', '2026-04-15 21:59:22'),
(40, 'auth', 'admin', 3, NULL, ' ', 'login', 'Admin logged in successfully', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36', 'info', '{\"url\":\"http:\\/\\/127.0.0.1:8000\\/api\\/auth\\/login\",\"method\":\"POST\"}', '2026-04-15 23:07:23', '2026-04-15 23:07:23'),
(41, 'auth', NULL, NULL, NULL, 'loren.torres@gmail.com', 'login_failed', 'Invalid credentials for username: loren.torres@gmail.com (Batch: 1, Remaining: 2)', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36', 'warning', '{\"url\":\"http:\\/\\/127.0.0.1:8000\\/api\\/auth\\/login\",\"method\":\"POST\"}', '2026-04-16 00:08:59', '2026-04-16 00:08:59'),
(42, 'auth', 'admin', 3, NULL, ' ', 'login', 'Admin logged in successfully', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36', 'info', '{\"url\":\"http:\\/\\/127.0.0.1:8000\\/api\\/auth\\/login\",\"method\":\"POST\"}', '2026-04-16 00:09:19', '2026-04-16 00:09:19');

-- --------------------------------------------------------

--
-- Table structure for table `teachers`
--

CREATE TABLE `teachers` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `teacher_id` varchar(255) NOT NULL,
  `username` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `full_name` varchar(255) DEFAULT NULL,
  `first_name` varchar(255) DEFAULT NULL,
  `middle_initial` varchar(10) DEFAULT NULL,
  `last_name` varchar(255) DEFAULT NULL,
  `department` varchar(255) DEFAULT NULL,
  `phone` varchar(255) DEFAULT NULL,
  `profile_image` varchar(255) DEFAULT NULL,
  `status` enum('active','inactive','suspended') NOT NULL DEFAULT 'active',
  `last_login` timestamp NULL DEFAULT NULL,
  `remember_token` varchar(100) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `teachers`
--

INSERT INTO `teachers` (`id`, `teacher_id`, `username`, `email`, `password`, `full_name`, `first_name`, `middle_initial`, `last_name`, `department`, `phone`, `profile_image`, `status`, `last_login`, `remember_token`, `created_at`, `updated_at`, `deleted_at`) VALUES
(4, 'T004', 'Neil', 'neil@mail.com', '\\\\.RwH/yUZcdcNQdK/Pi', 'Neil Bryany O. Galinzed', NULL, NULL, NULL, 'CEIT', NULL, NULL, 'active', NULL, NULL, '2025-10-27 21:08:56', '2025-11-10 18:07:29', NULL),
(5, 'T005', 'benz', 'benjie@csucc.edu.ph', '$2y$12$7RPH52fE9p6KnuyQeXDQZejBIFw3rPjLVGIs0PliuC1PM5pvtPT..', 'Benjie P. Trozo', NULL, NULL, NULL, 'CEIT', NULL, NULL, 'active', NULL, NULL, '2025-10-28 00:52:15', '2026-04-15 03:52:46', '2026-04-15 03:52:46'),
(6, 'T006', 'loren.torres', 'loren.torres@gmail.com', '$2y$12$dHAxUdy0fvJFURw1pMHS2ePWjyKKkUQOMkHboEj9wx3EQ/pY8B7gi', 'Lorean Marie Torres', 'Lorean', NULL, 'Torres', 'Administration', NULL, NULL, 'active', NULL, NULL, '2026-04-15 01:44:53', '2026-04-15 01:44:53', NULL),
(7, '2131-212', 'Bryant', 'neilbryant.galindez@csucc.edu.ph', '$2y$12$suJFyeW7XeQuf.S8dXNEhOJTwJok/KZovy5DixiFZrC10O0.msuXW', NULL, 'Neilbryant', 'O.', 'Galindez', NULL, '09635447732', NULL, 'active', '2026-04-15 21:59:22', NULL, '2026-04-15 17:13:35', '2026-04-15 21:59:22', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `teacher_inventory`
--

CREATE TABLE `teacher_inventory` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `teacher_id` bigint(20) UNSIGNED NOT NULL,
  `item_code` varchar(255) NOT NULL,
  `item_name` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `category` varchar(255) NOT NULL,
  `quantity` int(11) NOT NULL DEFAULT 1,
  `condition` enum('excellent','good','fair','poor','damaged') NOT NULL DEFAULT 'good',
  `location` varchar(255) DEFAULT NULL,
  `unit_price` decimal(10,2) DEFAULT NULL,
  `image` varchar(255) DEFAULT NULL,
  `acquisition_date` date DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `status` enum('active','inactive','maintenance') NOT NULL DEFAULT 'active',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `tools_equipment`
--

CREATE TABLE `tools_equipment` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `item_code` varchar(255) NOT NULL,
  `item_name` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `category` varchar(255) NOT NULL,
  `quantity_total` int(11) NOT NULL,
  `quantity_available` int(11) NOT NULL,
  `quantity_borrowed` int(11) NOT NULL DEFAULT 0,
  `condition` enum('excellent','good','fair','poor','damaged') NOT NULL DEFAULT 'good',
  `location` varchar(255) DEFAULT NULL,
  `unit_price` decimal(10,2) DEFAULT NULL,
  `image` varchar(255) DEFAULT NULL,
  `acquisition_date` date DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `status` enum('active','inactive','maintenance') NOT NULL DEFAULT 'active',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `deleted_by` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `tools_equipment`
--

INSERT INTO `tools_equipment` (`id`, `item_code`, `item_name`, `description`, `category`, `quantity_total`, `quantity_available`, `quantity_borrowed`, `condition`, `location`, `unit_price`, `image`, `acquisition_date`, `notes`, `status`, `created_at`, `updated_at`, `deleted_at`, `deleted_by`) VALUES
(1, 'EQ001', 'Electric Drill', 'Cordless electric drill for construction and repair work', 'Tool', 5, 5, 0, 'good', 'Tool Room A', 150.00, NULL, NULL, NULL, 'active', '2025-10-27 16:46:32', '2026-04-15 20:32:42', NULL, NULL),
(2, 'EQ002', 'Projector', 'HD projector for presentations and lectures', 'Equipment', 3, 3, 0, 'excellent', 'Equipment Room', 800.00, NULL, NULL, NULL, 'active', '2025-10-27 16:46:32', '2025-11-11 23:53:56', NULL, NULL),
(3, 'EQ003', 'Laptop Computer', 'Dell Inspiron laptop for educational purposes', 'Equipment', 10, 2, 8, 'good', 'IT Department', 1200.00, NULL, NULL, NULL, 'active', '2025-10-27 16:46:32', '2026-04-15 20:41:03', NULL, NULL),
(4, 'Equipment-987', 'Printer', 'shahsa', 'Lab', 4, 4, 0, 'good', 'Principal Office', 10000.00, NULL, '2026-04-15', NULL, 'active', '2026-04-15 02:06:52', '2026-04-15 02:06:52', NULL, NULL),
(5, 'Equipment-976', 'Printer', 'sasas', 'Lab', 5, 5, 0, 'good', 'Principal Office', 10000.00, NULL, '2026-04-15', NULL, 'active', '2026-04-15 02:17:15', '2026-04-15 02:17:15', NULL, NULL),
(6, 'Equipment-98', 'Television', 'hssa', 'Lab', 12, 12, 0, 'good', 'Grade 1 room', 10000.00, NULL, '2026-04-15', NULL, 'active', '2026-04-15 02:26:29', '2026-04-15 02:26:29', NULL, NULL),
(7, 'Equipment-12', 'Router', 'wqwq', 'Lab', 4, 4, 0, 'good', 'Room 1', 5000.00, NULL, NULL, NULL, 'active', '2026-04-15 03:07:16', '2026-04-15 03:07:16', NULL, NULL),
(8, 'Equipment-17', 'Router', 'wqwq', 'Lab', 4, 4, 0, 'good', 'Room 1', 5000.00, NULL, '2026-02-12', NULL, 'active', '2026-04-15 03:07:38', '2026-04-15 03:07:38', NULL, NULL),
(9, 'Equipment-19', 'Router', 'wqwq', 'Lab', 4, 4, 0, 'good', 'Room 1', 5000.00, NULL, '2026-02-12', NULL, 'active', '2026-04-15 03:07:53', '2026-04-15 03:07:53', NULL, NULL),
(10, 'Tools-9123', 'Pliers', 'sasas', 'Lab', 12, 12, 0, 'good', 'asasas', 1000.00, NULL, '2026-12-12', NULL, 'active', '2026-04-15 03:35:45', '2026-04-15 03:35:45', NULL, NULL),
(11, 'Equipment-89', 'Scanner', 'sasas', 'Lab', 3, 3, 0, 'good', 'Room 1', 800.00, NULL, '2026-02-12', NULL, 'active', '2026-04-15 03:57:47', '2026-04-15 03:57:47', NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `email_verified_at` timestamp NULL DEFAULT NULL,
  `password` varchar(255) NOT NULL,
  `remember_token` varchar(100) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `admins`
--
ALTER TABLE `admins`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `admins_username_unique` (`username`),
  ADD UNIQUE KEY `admins_email_unique` (`email`);

--
-- Indexes for table `borrow_requests`
--
ALTER TABLE `borrow_requests`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `borrow_requests_request_code_unique` (`request_code`),
  ADD KEY `borrow_requests_item_id_foreign` (`item_id`),
  ADD KEY `borrow_requests_approved_by_foreign` (`approved_by`),
  ADD KEY `borrow_requests_issued_by_foreign` (`issued_by`),
  ADD KEY `borrow_requests_received_by_foreign` (`received_by`),
  ADD KEY `borrow_requests_status_index` (`status`),
  ADD KEY `borrow_requests_date_requested_index` (`date_requested`),
  ADD KEY `borrow_requests_teacher_id_status_index` (`teacher_id`,`status`);

--
-- Indexes for table `bulk_distributions`
--
ALTER TABLE `bulk_distributions`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `cache`
--
ALTER TABLE `cache`
  ADD PRIMARY KEY (`key`),
  ADD KEY `cache_expiration_index` (`expiration`);

--
-- Indexes for table `cache_locks`
--
ALTER TABLE `cache_locks`
  ADD PRIMARY KEY (`key`),
  ADD KEY `cache_locks_expiration_index` (`expiration`);

--
-- Indexes for table `distribution_groups`
--
ALTER TABLE `distribution_groups`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `distribution_group_members`
--
ALTER TABLE `distribution_group_members`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `distribution_group_members_group_id_teacher_id_unique` (`group_id`,`teacher_id`);

--
-- Indexes for table `distribution_logs`
--
ALTER TABLE `distribution_logs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `distribution_logs_distributable_type_distributable_id_index` (`distributable_type`,`distributable_id`);

--
-- Indexes for table `distribution_requests`
--
ALTER TABLE `distribution_requests`
  ADD PRIMARY KEY (`id`),
  ADD KEY `distribution_requests_teacher_id_foreign` (`teacher_id`),
  ADD KEY `distribution_requests_item_id_foreign` (`item_id`),
  ADD KEY `distribution_requests_reviewed_by_foreign` (`reviewed_by`),
  ADD KEY `distribution_requests_distribution_id_foreign` (`distribution_id`);

--
-- Indexes for table `failed_jobs`
--
ALTER TABLE `failed_jobs`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `failed_jobs_uuid_unique` (`uuid`);

--
-- Indexes for table `inventory_logs`
--
ALTER TABLE `inventory_logs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `inventory_logs_item_id_index` (`item_id`),
  ADD KEY `inventory_logs_action_index` (`action`),
  ADD KEY `inventory_logs_created_at_index` (`created_at`);

--
-- Indexes for table `item_distributions`
--
ALTER TABLE `item_distributions`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `jobs`
--
ALTER TABLE `jobs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `jobs_queue_index` (`queue`);

--
-- Indexes for table `job_batches`
--
ALTER TABLE `job_batches`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `login_attempts`
--
ALTER TABLE `login_attempts`
  ADD PRIMARY KEY (`id`),
  ADD KEY `login_attempts_identifier_ip_address_index` (`identifier`,`ip_address`);

--
-- Indexes for table `migrations`
--
ALTER TABLE `migrations`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `notifications`
--
ALTER TABLE `notifications`
  ADD PRIMARY KEY (`id`),
  ADD KEY `notifications_read_created_at_index` (`created_at`);

--
-- Indexes for table `password_reset_tokens`
--
ALTER TABLE `password_reset_tokens`
  ADD PRIMARY KEY (`email`);

--
-- Indexes for table `personal_access_tokens`
--
ALTER TABLE `personal_access_tokens`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `personal_access_tokens_token_unique` (`token`),
  ADD KEY `personal_access_tokens_tokenable_type_tokenable_id_index` (`tokenable_type`,`tokenable_id`),
  ADD KEY `personal_access_tokens_expires_at_index` (`expires_at`);

--
-- Indexes for table `purchase_orders`
--
ALTER TABLE `purchase_orders`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `purchase_orders_po_number_unique` (`po_number`),
  ADD KEY `purchase_orders_supplier_id_foreign` (`supplier_id`),
  ADD KEY `purchase_orders_admin_id_foreign` (`admin_id`);

--
-- Indexes for table `purchase_order_items`
--
ALTER TABLE `purchase_order_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `purchase_order_items_purchase_order_id_foreign` (`purchase_order_id`);

--
-- Indexes for table `reports`
--
ALTER TABLE `reports`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `reports_report_code_unique` (`report_code`),
  ADD KEY `reports_teacher_id_foreign` (`teacher_id`),
  ADD KEY `reports_item_id_foreign` (`item_id`),
  ADD KEY `reports_assigned_to_foreign` (`assigned_to`),
  ADD KEY `reports_status_index` (`status`),
  ADD KEY `reports_priority_index` (`priority`);

--
-- Indexes for table `sessions`
--
ALTER TABLE `sessions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `sessions_user_id_index` (`user_id`),
  ADD KEY `sessions_last_activity_index` (`last_activity`);

--
-- Indexes for table `suppliers`
--
ALTER TABLE `suppliers`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `suppliers_supplier_code_unique` (`supplier_code`),
  ADD KEY `suppliers_deleted_by_foreign` (`deleted_by`);

--
-- Indexes for table `system_logs`
--
ALTER TABLE `system_logs`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `teachers`
--
ALTER TABLE `teachers`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `teachers_teacher_id_unique` (`teacher_id`),
  ADD UNIQUE KEY `teachers_username_unique` (`username`),
  ADD UNIQUE KEY `teachers_email_unique` (`email`);

--
-- Indexes for table `teacher_inventory`
--
ALTER TABLE `teacher_inventory`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `teacher_inventory_item_code_unique` (`item_code`),
  ADD KEY `teacher_inventory_teacher_id_index` (`teacher_id`);

--
-- Indexes for table `tools_equipment`
--
ALTER TABLE `tools_equipment`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `tools_equipment_item_code_unique` (`item_code`),
  ADD KEY `tools_equipment_category_index` (`category`),
  ADD KEY `tools_equipment_status_index` (`status`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `users_email_unique` (`email`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `admins`
--
ALTER TABLE `admins`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `borrow_requests`
--
ALTER TABLE `borrow_requests`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `bulk_distributions`
--
ALTER TABLE `bulk_distributions`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `distribution_groups`
--
ALTER TABLE `distribution_groups`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT for table `distribution_group_members`
--
ALTER TABLE `distribution_group_members`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `distribution_logs`
--
ALTER TABLE `distribution_logs`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `distribution_requests`
--
ALTER TABLE `distribution_requests`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `failed_jobs`
--
ALTER TABLE `failed_jobs`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `inventory_logs`
--
ALTER TABLE `inventory_logs`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `item_distributions`
--
ALTER TABLE `item_distributions`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `jobs`
--
ALTER TABLE `jobs`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `login_attempts`
--
ALTER TABLE `login_attempts`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `migrations`
--
ALTER TABLE `migrations`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=30;

--
-- AUTO_INCREMENT for table `notifications`
--
ALTER TABLE `notifications`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT for table `personal_access_tokens`
--
ALTER TABLE `personal_access_tokens`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=45;

--
-- AUTO_INCREMENT for table `purchase_orders`
--
ALTER TABLE `purchase_orders`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `purchase_order_items`
--
ALTER TABLE `purchase_order_items`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `reports`
--
ALTER TABLE `reports`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `suppliers`
--
ALTER TABLE `suppliers`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `system_logs`
--
ALTER TABLE `system_logs`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=43;

--
-- AUTO_INCREMENT for table `teachers`
--
ALTER TABLE `teachers`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `teacher_inventory`
--
ALTER TABLE `teacher_inventory`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `tools_equipment`
--
ALTER TABLE `tools_equipment`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `borrow_requests`
--
ALTER TABLE `borrow_requests`
  ADD CONSTRAINT `borrow_requests_approved_by_foreign` FOREIGN KEY (`approved_by`) REFERENCES `admins` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `borrow_requests_issued_by_foreign` FOREIGN KEY (`issued_by`) REFERENCES `admins` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `borrow_requests_item_id_foreign` FOREIGN KEY (`item_id`) REFERENCES `tools_equipment` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `borrow_requests_received_by_foreign` FOREIGN KEY (`received_by`) REFERENCES `admins` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `borrow_requests_teacher_id_foreign` FOREIGN KEY (`teacher_id`) REFERENCES `teachers` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `distribution_group_members`
--
ALTER TABLE `distribution_group_members`
  ADD CONSTRAINT `distribution_group_members_group_id_foreign` FOREIGN KEY (`group_id`) REFERENCES `distribution_groups` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `distribution_requests`
--
ALTER TABLE `distribution_requests`
  ADD CONSTRAINT `distribution_requests_distribution_id_foreign` FOREIGN KEY (`distribution_id`) REFERENCES `item_distributions` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `distribution_requests_item_id_foreign` FOREIGN KEY (`item_id`) REFERENCES `tools_equipment` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `distribution_requests_reviewed_by_foreign` FOREIGN KEY (`reviewed_by`) REFERENCES `admins` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `distribution_requests_teacher_id_foreign` FOREIGN KEY (`teacher_id`) REFERENCES `teachers` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `inventory_logs`
--
ALTER TABLE `inventory_logs`
  ADD CONSTRAINT `inventory_logs_item_id_foreign` FOREIGN KEY (`item_id`) REFERENCES `tools_equipment` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `purchase_orders`
--
ALTER TABLE `purchase_orders`
  ADD CONSTRAINT `purchase_orders_admin_id_foreign` FOREIGN KEY (`admin_id`) REFERENCES `admins` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `purchase_orders_supplier_id_foreign` FOREIGN KEY (`supplier_id`) REFERENCES `suppliers` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `purchase_order_items`
--
ALTER TABLE `purchase_order_items`
  ADD CONSTRAINT `purchase_order_items_purchase_order_id_foreign` FOREIGN KEY (`purchase_order_id`) REFERENCES `purchase_orders` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `reports`
--
ALTER TABLE `reports`
  ADD CONSTRAINT `reports_assigned_to_foreign` FOREIGN KEY (`assigned_to`) REFERENCES `admins` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `reports_item_id_foreign` FOREIGN KEY (`item_id`) REFERENCES `tools_equipment` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `reports_teacher_id_foreign` FOREIGN KEY (`teacher_id`) REFERENCES `teachers` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `suppliers`
--
ALTER TABLE `suppliers`
  ADD CONSTRAINT `suppliers_deleted_by_foreign` FOREIGN KEY (`deleted_by`) REFERENCES `admins` (`id`) ON DELETE SET NULL;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
