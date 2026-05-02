# Entity Relationship Diagram (ERD)
## Online Inventory Management System (Tools and Equipment)

**Database Name:** `inventory_system`  
**Database Type:** MySQL  
**Last Updated:** March 23, 2026

---

## ERD Overview Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         INVENTORY MANAGEMENT SYSTEM                          │
│                              Database: inventory_system                      │
└─────────────────────────────────────────────────────────────────────────────┘

                    ┌──────────────────┐
                    │     ADMINS       │
                    ├──────────────────┤
                    │ PK id            │
                    │    username      │
                    │    email (UQ)    │
                    │    password      │
                    │    first_name    │
                    │    middle_name   │
                    │    last_name     │
                    │    phone         │
                    │    status        │
                    │    last_login    │
                    │    deleted_at    │
                    └────────┬─────────┘
                             │
                             │ 1:N (created/approved/distributed)
                             │
        ┌────────────────────┼────────────────────┬──────────────────┐
        │                    │                    │                  │
        ▼                    ▼                    ▼                  ▼
┌───────────────┐   ┌────────────────┐   ┌──────────────┐   ┌─────────────┐
│ PURCHASE      │   │ DISTRIBUTION   │   │ BORROW       │   │ SYSTEM      │
│ ORDERS        │   │ REQUESTS       │   │ REQUESTS     │   │ LOGS        │
│               │   │ (reviewed_by)  │   │ (approved)   │   │             │
└───────────────┘   └────────────────┘   └──────────────┘   └─────────────┘


                    ┌──────────────────┐
                    │    TEACHERS      │
                    ├──────────────────┤
                    │ PK id            │
                    │    teacher_id    │
                    │    employee_id   │
                    │    email (UQ)    │
                    │    password      │
                    │    first_name    │
                    │    middle_initial│
                    │    last_name     │
                    │    department    │
                    │    phone         │
                    │    status        │
                    │    last_login    │
                    │    deleted_at    │
                    └────────┬─────────┘
                             │
                             │ 1:N (requests/distributions)
                             │
        ┌────────────────────┼────────────────────┬──────────────────┐
        │                    │                    │                  │
        ▼                    ▼                    ▼                  ▼
┌───────────────┐   ┌────────────────┐   ┌──────────────┐   ┌─────────────┐
│ BORROW        │   │ DISTRIBUTION   │   │ ITEM         │   │ TEACHER     │
│ REQUESTS      │   │ REQUESTS       │   │ DISTRIBUTIONS│   │ INVENTORY   │
└───────┬───────┘   └────────┬───────┘   └──────┬───────┘   └─────────────┘
        │                    │                   │
        │                    │                   │
        │                    │                   │
        └────────────────────┼───────────────────┘
                             │
                             │ N:1 (item_id)
                             │
                             ▼
                    ┌──────────────────┐
                    │ TOOLS_EQUIPMENT  │
                    ├──────────────────┤
                    │ PK id            │
                    │    item_code (UQ)│
                    │    item_name     │
                    │    description   │
                    │    category      │
                    │    quantity_total│
                    │    quantity_avail│
                    │    quantity_borrow│
                    │    condition_stat│
                    │    location      │
                    │    unit_price    │
                    │    acquisition_dt│
                    │    image         │
                    │    status        │
                    │    deleted_at    │
                    └────────┬─────────┘
                             │
                             │ 1:N
                             │
                             ▼
                    ┌──────────────────┐
                    │ INVENTORY_LOGS   │
                    │ (audit trail)    │
                    └──────────────────┘


┌──────────────────┐         ┌──────────────────┐         ┌──────────────────┐
│   SUPPLIERS      │ 1:N     │ PURCHASE_ORDERS  │ 1:N     │ PURCHASE_ORDER   │
│                  ├────────>│                  ├────────>│ _ITEMS           │
│ PK id            │         │ PK id            │         │ PK id            │
│    supplier_code │         │    po_number (UQ)│         │ FK purchase_order│
│    name          │         │ FK supplier_id   │         │    item_name     │
│    contact_person│         │    po_date       │         │    quantity      │
│    email         │         │    status        │         │    unit_price    │
│    phone         │         │    total_amount  │         │    total_price   │
│    status        │         │    deleted_at    │         └──────────────────┘
│    deleted_at    │         └──────────────────┘
└──────────────────┘


┌──────────────────┐         ┌──────────────────┐         ┌──────────────────┐
│ DISTRIBUTION     │ N:M     │ DISTRIBUTION     │         │   TEACHERS       │
│ _GROUPS          ├────────>│ _GROUP_MEMBERS   │<────────┤                  │
│                  │         │ (pivot table)    │         │                  │
│ PK id            │         ├──────────────────┤         └──────────────────┘
│    group_name    │         │ FK group_id      │
│    group_type    │         │ FK teacher_id    │
│    description   │         │    created_at    │
│ FK created_by    │         │    updated_at    │
│    is_active     │         └──────────────────┘
│    deleted_at    │
└──────────────────┘


┌──────────────────┐
│  NOTIFICATIONS   │
├──────────────────┤
│ PK id            │
│    user_id       │
│    user_type     │ (admin/teacher)
│    type          │
│    title         │
│    message       │
│    related_id    │
│    related_type  │
│    is_read       │
│    read_at       │
└──────────────────┘


┌──────────────────┐
│  SYSTEM_LOGS     │
├──────────────────┤
│ PK id            │
│    log_type      │
│    user_type     │
│    user_id       │
│    user_name     │
│    action        │
│    description   │
│    metadata      │ (JSON)
│    ip_address    │
│    user_agent    │
│    severity      │
└──────────────────┘
```


---

## Detailed Entity Descriptions

### 1. ADMINS Table

**Purpose:** Store administrator user accounts

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | BIGINT | PK, AUTO_INCREMENT | Primary key |
| username | VARCHAR(255) | NULLABLE | Admin username |
| email | VARCHAR(255) | UNIQUE, NOT NULL | Login email |
| password | VARCHAR(255) | NOT NULL | Hashed password |
| first_name | VARCHAR(255) | NOT NULL | First name |
| middle_name | VARCHAR(255) | NULLABLE | Middle name |
| last_name | VARCHAR(255) | NOT NULL | Last name |
| phone | VARCHAR(20) | NULLABLE | Contact number |
| profile_image | VARCHAR(255) | NULLABLE | Profile photo path |
| status | ENUM | DEFAULT 'active' | active, inactive |
| last_login | TIMES