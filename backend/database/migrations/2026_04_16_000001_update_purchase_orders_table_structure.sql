-- Update purchase_orders table to match new modal structure
-- Migration script for updating purchase orders table

USE inventory_system;

-- Add new columns that are missing from the current structure
ALTER TABLE `purchase_orders` 
ADD COLUMN IF NOT EXISTS `mode_of_procurement` VARCHAR(255) DEFAULT NULL AFTER `po_date`,
ADD COLUMN IF NOT EXISTS `supplier_tin` VARCHAR(255) DEFAULT NULL AFTER `supplier_phone`,
ADD COLUMN IF NOT EXISTS `delivery_place` VARCHAR(255) DEFAULT NULL AFTER `delivery_address`,
ADD COLUMN IF NOT EXISTS `delivery_date` DATE DEFAULT NULL AFTER `delivery_place`,
ADD COLUMN IF NOT EXISTS `delivery_term` VARCHAR(255) DEFAULT NULL AFTER `delivery_date`,
ADD COLUMN IF NOT EXISTS `payment_term` VARCHAR(255) DEFAULT NULL AFTER `payment_terms`,
ADD COLUMN IF NOT EXISTS `amount_in_words` TEXT DEFAULT NULL AFTER `total_amount`,
ADD COLUMN IF NOT EXISTS `deleted_by` BIGINT(20) UNSIGNED DEFAULT NULL AFTER `admin_id`;

-- Update existing data to set default values for new fields
UPDATE `purchase_orders` SET 
    `mode_of_procurement` = 'SHOPPING' WHERE `mode_of_procurement` IS NULL,
    `supplier_tin` = 'N/A' WHERE `supplier_tin` IS NULL,
    `delivery_place` = 'N/A' WHERE `delivery_place` IS NULL,
    `delivery_term` = 'PICK-UP' WHERE `delivery_term` IS NULL,
    `payment_term` = '(Not specified)' WHERE `payment_term` IS NULL,
    `amount_in_words` = 'N/A' WHERE `amount_in_words` IS NULL;

-- Update column comments for better documentation
ALTER TABLE `purchase_orders` 
MODIFY COLUMN `mode_of_procurement` VARCHAR(255) DEFAULT NULL COMMENT 'Mode of procurement (SHOPPING, BIDDING, etc.)',
MODIFY COLUMN `supplier_tin` VARCHAR(255) DEFAULT NULL COMMENT 'Supplier Tax Identification Number',
MODIFY COLUMN `delivery_place` VARCHAR(255) DEFAULT NULL COMMENT 'Place of delivery',
MODIFY COLUMN `delivery_date` DATE DEFAULT NULL COMMENT 'Date of delivery',
MODIFY COLUMN `delivery_term` VARCHAR(255) DEFAULT NULL COMMENT 'Delivery term (PICK-UP, DELIVERY, etc.)',
MODIFY COLUMN `payment_term` VARCHAR(255) DEFAULT NULL COMMENT 'Payment term details',
MODIFY COLUMN `amount_in_words` TEXT DEFAULT NULL COMMENT 'Total amount written in words';

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_purchase_orders_mode_of_procurement ON `purchase_orders`(`mode_of_procurement`);
CREATE INDEX IF NOT EXISTS idx_purchase_orders_delivery_place ON `purchase_orders`(`delivery_place`);
CREATE INDEX IF NOT EXISTS idx_purchase_orders_delivery_term ON `purchase_orders`(`delivery_term`);
CREATE INDEX IF NOT EXISTS idx_purchase_orders_payment_term ON `purchase_orders`(`payment_term`);

-- Show updated table structure
DESCRIBE `purchase_orders`;
