# OlineIMS System Flowchart
## Online Inventory Management System

**System Overview:** A comprehensive web-based inventory management system for educational institutions with Laravel 11 backend and React 18 frontend.

---

## 🎯 Main System Architecture Flowchart

```mermaid
graph TB
    %% User Roles
    A[ADMIN<br/>In-charge Personnel] --> B[Teacher User]
    
    %% Core Modules
    A --> C[Inventory Management]
    A --> D[Teacher Management]
    A --> E[Borrow Requests]
    A --> F[Distribution Requests]
    A --> G[Purchase Orders]
    A --> H[Supplier Management]
    A --> I[Reports & Analytics]
    
    %% Teacher Actions
    B --> J[Browse Inventory]
    B --> K[Submit Borrow Requests]
    B --> L[Submit Distribution Requests]
    B --> M[View Personal Inventory]
    
    %% Database Layer
    C --> N[(MySQL Database)]
    D --> N
    E --> N
    F --> N
    G --> N
    H --> N
    I --> N
    
    %% External Services
    G --> O[Suppliers]
    P[WebSocket Service] --> Q[Real-time Notifications]
    N --> P
    
    %% Reporting
    N --> R[Reports Generator]
    I --> R
    
    style A fill:#e74c3c,color:#fff
    style B fill:#3498db,color:#fff
    style N fill:#2ecc71,color:#fff
    style O fill:#f39c12,color:#fff
    style P fill:#9b59b6,color:#fff
```

---

## 🔄 Authentication & Authorization Flow

```mermaid
sequenceDiagram
    participant User
    participant Login as Login Page
    participant Auth as Auth Service
    participant DB as Database
    participant Dashboard
    
    User->>Login: Enter Credentials
    Login->>Auth: Submit Login Request
    Auth->>DB: Validate Credentials
    DB-->>Auth: User Data
    Auth->>Auth: Generate Token (Sanctum)
    Auth-->>Login: Return Token + User Info
    Login-->>User: Redirect to Dashboard
    
    alt Admin User
        Auth->>Dashboard: Admin Dashboard
    else Teacher User
        Auth->>Dashboard: Teacher Dashboard
    end
```

---

## 📦 Inventory Management Workflow

```mermaid
flowchart TD
    A[Admin] --> B{Action}
    
    B -->|Add Item| C[Create New Item]
    B -->|Update Item| D[Edit Item Details]
    B -->|Delete Item| E[Soft Delete]
    B -->|View Items| F[Browse/Search Inventory]
    
    C --> G[Enter Item Details]
    G --> H[Upload Image]
    H --> I[Set Category]
    I --> J[Set Quantity]
    J --> K[Save to Database]
    
    D --> L[Modify Fields]
    L --> M[Update Database]
    
    E --> N[Mark as Deleted]
    N --> O[Keep in Database]
    
    F --> P[Apply Filters]
    P --> Q[Display Results]
    
    K --> R[(tools_equipment table)]
    M --> R
    N --> R
    
    S[Teacher] --> T[Browse Inventory]
    T --> P
    P --> Q
    Q --> U[View Item Details]
    
    style A fill:#e74c3c,color:#fff
    style S fill:#3498db,color:#fff
    style R fill:#2ecc71,color:#fff
```

---

## 📋 Borrow Request Lifecycle

```mermaid
stateDiagram-v2
    [*] --> Pending: Teacher Submits Request
    
    Pending --> Approved: Admin Approves
    Pending --> Rejected: Admin Rejects
    
    Approved --> Issued: Admin Issues Items
    Rejected --> [*]: Notification Sent
    
    Issued --> Borrowed: Items Collected
    Borrowed --> Returned: Items Returned
    Borrowed --> Overdue: Due Date Passed
    
    Overdue --> Returned: Items Returned
    Overdue --> Reminder: Send Notifications
    
    Returned --> [*]: Process Complete
    
    note right of Pending
        - Item Selection
        - Quantity Needed
        - Purpose/Reason
        - Borrow Date
        - Expected Return
    end note
    
    note right of Approved
        - Check Availability
        - Verify Teacher Info
        - Review Purpose
        - Approval Date
    end note
    
    note right of Issued
        - Update Quantities
        - Record Condition
        - Set Borrow Date
        - Issue Items
    end note
```

---

## 🚚 Distribution Request Process

```mermaid
flowchart TD
    A[Teacher] --> B[Submit Distribution Request]
    B --> C[Request Details]
    C --> D{Admin Review}
    
    D -->|Approve| E[Create Distribution]
    D -->|Reject| F[Send Rejection Notice]
    
    E --> G[Transfer Items to Teacher]
    G --> H[Update Inventory Quantities]
    H --> I[Record Distribution Date]
    I --> J[Add to Teacher's Inventory]
    
    J --> K[Teacher Can View Items]
    K --> L[Manage Personal Inventory]
    L --> M[Track Item Status]
    
    F --> N[Teacher Notified]
    N --> O[Request Ends]
    
    style A fill:#3498db,color:#fff
    style D fill:#e74c3c,color:#fff
    style G fill:#f39c12,color:#fff
```

---

## 💳 Purchase Order Management

```mermaid
flowchart LR
    A[Admin] --> B[Create Purchase Order]
    B --> C[Select Supplier]
    C --> D[Add Items & Quantities]
    D --> E[Set Prices]
    E --> F[Calculate Totals]
    F --> G[DRAFT Status]
    
    G --> H[Submit for Approval]
    H --> I[PENDING Status]
    I --> J{Review & Approve}
    
    J -->|Approve| K[APPROVED Status]
    J -->|Reject| L[Back to Draft]
    
    K --> M[Send to Supplier]
    M --> N[Supplier Processes Order]
    N --> O[Items Delivered]
    O --> P[Admin Receives Items]
    P --> Q[Verify vs PO]
    Q --> R[Check Quantities]
    R --> S[Inspect Quality]
    S --> T[Mark as Received]
    T --> U[Add to Inventory]
    
    style A fill:#e74c3c,color:#fff
    style K fill:#2ecc71,color:#fff
    style N fill:#f39c12,color:#fff
    style U fill:#9b59b6,color:#fff
```

---

## 🔔 Notification System Flow

```mermaid
graph TB
    A[System Events] --> B{Event Type}
    
    B -->|Request Created| C[Request Notification]
    B -->|Status Changed| D[Status Update]
    B -->|Item Issued| E[Issuance Alert]
    B -->|Return Reminder| F[Return Notification]
    B -->|Overdue Alert| G[Overdue Warning]
    B -->|Distribution Update| H[Distribution Notice]
    
    C --> I[Notification Service]
    D --> I
    E --> I
    F --> I
    G --> I
    H --> I
    
    I --> J{Delivery Method}
    
    J -->|Real-time| K[WebSocket]
    J -->|Critical| L[Email Service]
    
    K --> M[Live Dashboard Update]
    K --> N[Bell Icon + Badge]
    
    L --> O[Email Notification]
    
    M --> P[Admin Receives]
    N --> Q[Teacher Receives]
    O --> P
    O --> Q
    
    style A fill:#34495e,color:#fff
    style I fill:#9b59b6,color:#fff
    style K fill:#e67e22,color:#fff
    style L fill:#27ae60,color:#fff
```

---

## 📊 Reporting & Analytics Flow

```mermaid
flowchart TD
    A[Admin] --> B[Request Report]
    B --> C{Select Report Type}
    
    C -->|Inventory| D[Inventory Report]
    C -->|Borrow History| E[Borrow Report]
    C -->|Teacher Activity| F[Activity Report]
    C -->|Overdue Items| G[Overdue Report]
    C -->|Distribution| H[Distribution Report]
    C -->|Purchase Orders| I[PO Report]
    
    D --> J[Set Parameters]
    E --> J
    F --> J
    G --> J
    H --> J
    I --> J
    
    J --> K[Date Range]
    J --> L[Filters]
    J --> M[Teacher/Department]
    
    K --> N[Query Database]
    L --> N
    M --> N
    
    N --> O[Aggregate Data]
    O --> P[Generate Statistics]
    P --> Q[Create Tables]
    Q --> R[Generate Charts]
    R --> S[Export Options]
    
    S --> T[PDF Export]
    S --> U[Excel Export]
    S --> V[Screen Display]
    
    style A fill:#e74c3c,color:#fff
    style N fill:#2ecc71,color:#fff
    style S fill:#f39c12,color:#fff
```

---

## 🗄️ Database Schema Relationships

```mermaid
erDiagram
    ADMINS {
        bigint id PK
        varchar username
        varchar email UK
        varchar password
        varchar first_name
        varchar middle_name
        varchar last_name
        varchar phone
        enum status
        timestamp last_login
        timestamp deleted_at
    }
    
    TEACHERS {
        bigint id PK
        varchar teacher_id
        varchar employee_id
        varchar email UK
        varchar password
        varchar first_name
        varchar middle_initial
        varchar last_name
        varchar department
        varchar phone
        enum status
        timestamp last_login
        timestamp deleted_at
    }
    
    TOOLS_EQUIPMENT {
        bigint id PK
        varchar item_code UK
        varchar item_name
        text description
        varchar category
        int quantity_total
        int quantity_available
        int quantity_borrowed
        varchar condition_status
        varchar location
        decimal unit_price
        date acquisition_date
        varchar image
        enum status
        timestamp deleted_at
    }
    
    BORROW_REQUESTS {
        bigint id PK
        bigint teacher_id FK
        bigint item_id FK
        int quantity_requested
        varchar purpose
        date borrow_date
        date expected_return_date
        date actual_return_date
        enum status
        varchar condition_before
        varchar condition_after
        bigint approved_by FK
        timestamp approved_at
        timestamp issued_at
        timestamp returned_at
        timestamp created_at
        timestamp updated_at
    }
    
    DISTRIBUTION_REQUESTS {
        bigint id PK
        bigint teacher_id FK
        bigint item_id FK
        int quantity_requested
        text reason
        text notes
        enum status
        bigint reviewed_by FK
        timestamp reviewed_at
        timestamp distributed_at
        timestamp created_at
        timestamp updated_at
    }
    
    PURCHASE_ORDERS {
        bigint id PK
        varchar po_number UK
        bigint supplier_id FK
        date po_date
        enum status
        decimal total_amount
        text delivery_info
        text payment_terms
        bigint created_by FK
        bigint approved_by FK
        timestamp approved_at
        timestamp deleted_at
        timestamp created_at
        timestamp updated_at
    }
    
    SUPPLIERS {
        bigint id PK
        varchar supplier_code UK
        varchar name
        varchar contact_person
        varchar email
        varchar phone
        enum status
        timestamp deleted_at
    }
    
    NOTIFICATIONS {
        bigint id PK
        bigint user_id
        enum user_type
        varchar type
        varchar title
        text message
        bigint related_id
        varchar related_type
        boolean is_read
        timestamp read_at
        timestamp created_at
    }
    
    SYSTEM_LOGS {
        bigint id PK
        varchar log_type
        enum user_type
        bigint user_id
        varchar user_name
        varchar action
        text description
        json metadata
        varchar ip_address
        text user_agent
        enum severity
        timestamp created_at
    }
    
    %% Relationships
    ADMINS ||--o{ BORROW_REQUESTS : approves
    ADMINS ||--o{ DISTRIBUTION_REQUESTS : reviews
    ADMINS ||--o{ PURCHASE_ORDERS : creates
    ADMINS ||--o{ SYSTEM_LOGS : generates
    
    TEACHERS ||--o{ BORROW_REQUESTS : submits
    TEACHERS ||--o{ DISTRIBUTION_REQUESTS : requests
    TEACHERS ||--o{ NOTIFICATIONS : receives
    
    TOOLS_EQUIPMENT ||--o{ BORROW_REQUESTS : borrowed
    TOOLS_EQUIPMENT ||--o{ DISTRIBUTION_REQUESTS : distributed
    
    SUPPLIERS ||--o{ PURCHASE_ORDERS : receives
```

---

## 🔄 Complete System Workflow

```mermaid
graph TB
    subgraph "User Layer"
        A[Admin User]
        B[Teacher User]
    end
    
    subgraph "Application Layer"
        C[Authentication Service]
        D[Inventory Controller]
        E[Request Controller]
        F[Report Controller]
        G[Notification Service]
    end
    
    subgraph "Business Logic Layer"
        H[Borrow Request Logic]
        I[Distribution Logic]
        J[Purchase Order Logic]
        K[Teacher Management]
        L[Item Management]
    end
    
    subgraph "Data Layer"
        M[(MySQL Database)]
        N[File Storage]
    end
    
    subgraph "External Services"
        O[Email Service]
        P[WebSocket Server]
        Q[Suppliers]
    end
    
    %% Connections
    A --> C
    B --> C
    C --> M
    
    A --> D
    A --> E
    A --> F
    B --> D
    B --> E
    
    D --> L
    E --> H
    E --> I
    F --> M
    
    H --> M
    I --> M
    J --> M
    K --> M
    L --> M
    
    G --> P
    G --> O
    
    J --> Q
    Q --> J
    
    M --> N
    
    style A fill:#e74c3c,color:#fff
    style B fill:#3498db,color:#fff
    style M fill:#2ecc71,color:#fff
    style P fill:#9b59b6,color:#fff
    style Q fill:#f39c12,color:#fff
```

---

## 📱 Mobile Responsive Architecture

```mermaid
graph LR
    A[Mobile Device] --> B[React Frontend]
    C[Tablet] --> B
    D[Desktop] --> B
    
    B --> E[API Gateway]
    E --> F[Laravel Backend]
    
    F --> G[Authentication]
    F --> H[Business Logic]
    F --> I[Database Operations]
    
    I --> J[(MySQL Database)]
    
    H --> K[WebSocket Service]
    K --> L[Real-time Updates]
    L --> B
    
    subgraph "Responsive Features"
        M[Touch-friendly UI]
        N[Adaptive Layouts]
        O[Offline Support]
        P[Push Notifications]
    end
    
    B --> M
    B --> N
    B --> O
    B --> P
```

---

## 🚀 Deployment Architecture

```mermaid
graph TB
    subgraph "Development Environment"
        A[Local Development]
        B[XAMPP Server]
        C[MySQL Local]
    end
    
    subgraph "Production Environment"
        D[Web Server<br/>Apache/Nginx]
        E[PHP 8.2+]
        F[Laravel 11]
        G[MySQL Server]
        H[Redis Cache]
    end
    
    subgraph "Frontend Deployment"
        I[React Build]
        J[Static Files]
        K[CDN Distribution]
    end
    
    subgraph "External Services"
        L[Email Service]
        M[WebSocket Server]
        N[File Storage]
    end
    
    A --> D
    B --> D
    C --> G
    
    D --> E
    E --> F
    F --> G
    F --> H
    
    I --> J
    J --> K
    
    F --> L
    F --> M
    F --> N
    
    style A fill:#3498db,color:#fff
    style D fill:#e74c3c,color:#fff
    style G fill:#2ecc71,color:#fff
    style I fill:#f39c12,color:#fff
```

---

## 📈 Performance & Monitoring Flow

```mermaid
flowchart TD
    A[System Activity] --> B[Performance Monitoring]
    B --> C[Metrics Collection]
    
    C --> D{Monitor Type}
    
    D -->|Database| E[Query Performance]
    D -->|Application| F[Response Times]
    D -->|User Activity| G[Usage Analytics]
    D -->|Errors| H[Error Tracking]
    
    E --> I[Slow Query Detection]
    F --> J[API Performance]
    G --> K[User Behavior]
    H --> L[Exception Logging]
    
    I --> M[Optimization Reports]
    J --> M
    K --> M
    L --> M
    
    M --> N[Admin Dashboard]
    N --> O[Performance Alerts]
    O --> P[System Optimization]
    
    style A fill:#34495e,color:#fff
    style B fill:#e67e22,color:#fff
    style M fill:#27ae60,color:#fff
    style N fill:#e74c3c,color:#fff
```

---

## 🔐 Security Architecture

```mermaid
graph TB
    A[User Request] --> B[Security Layer]
    
    B --> C[Authentication<br/>Sanctum Tokens]
    C --> D[Authorization<br/>Role-based Access]
    D --> E[Input Validation<br/>Laravel Rules]
    E --> F[SQL Injection Protection<br/>Eloquent ORM]
    F --> G[XSS Protection<br/>CSRF Tokens]
    G --> H[Rate Limiting<br/>Login Attempts]
    H --> I[Audit Logging<br/>System Logs]
    
    I --> J[Business Logic]
    J --> K[Database Operations]
    
    subgraph "Security Features"
        L[Password Hashing]
        M[Session Management]
        N[Encryption]
        O[Secure Headers]
    end
    
    C --> L
    D --> M
    F --> N
    G --> O
    
    style A fill:#34495e,color:#fff
    style B fill:#e74c3c,color:#fff
    style J fill:#2ecc71,color:#fff
    style K fill:#2ecc71,color:#fff
```

---

## 📋 Summary

This flowchart documentation provides a comprehensive visual representation of the OlineIMS system, covering:

1. **Main Architecture** - Overall system structure and components
2. **Authentication Flow** - User login and authorization process
3. **Inventory Management** - Item lifecycle and administration
4. **Request Workflows** - Borrow and distribution request processes
5. **Purchase Orders** - Procurement and supplier management
6. **Notification System** - Real-time alerts and communications
7. **Reporting** - Analytics and data visualization
8. **Database Schema** - Complete entity relationships
9. **System Workflow** - End-to-end process flow
10. **Mobile Architecture** - Responsive design considerations
11. **Deployment Structure** - Production environment setup
12. **Performance Monitoring** - System health and optimization
13. **Security Framework** - Protection mechanisms and compliance

The system is designed as a modern, scalable inventory management solution using Laravel 11 for the backend API and React 18 for the frontend, with real-time capabilities through WebSocket integration and comprehensive reporting features.
