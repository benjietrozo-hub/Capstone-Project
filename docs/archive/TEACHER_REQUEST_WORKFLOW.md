# Teacher Distribution Request Workflow
## Request Items for Self, Classroom, Club, or Department

---

## 🎯 Overview

Teachers can submit distribution requests not only for themselves but also for entities they manage:
- **Personal Inventory** - Items for their own use
- **Classroom** - Items for classrooms they are assigned to
- **Club/Organization** - Items for clubs they advise
- **Department** - Items for departments they head

---

## 👤 Teacher Permissions

### What Teachers Can Request For:

| Entity Type | Permission Required | Example |
|-------------|-------------------|---------|
| **Self** | Always allowed | Teacher A requests laptop for personal use |
| **Classroom** | Must be assigned teacher | Teacher A assigned to Room 101 can request for Room 101 |
| **Club** | Must be advisor | Teacher A advises Robotics Club, can request for it |
| **Department** | Must be department head | Teacher A heads Math Dept, can request for Math Dept |

### Permission Validation:
```php
// System checks:
- Classroom: assigned_teacher_id === current_teacher_id
- Club: advisor_teacher_id === current_teacher_id  
- Department: head_teacher_id === current_teacher_id
- Self: Always true
```

---

## 📝 Request Workflow

### Step 1: Teacher Submits Request

**Teacher Interface:**
```
┌─────────────────────────────────────────┐
│  New Distribution Request               │
├─────────────────────────────────────────┤
│  Request For: [Dropdown]                │
│    ○ Myself                             │
│    ○ My Classroom (Room 101)            │
│    ○ My Club (Robotics Club)            │
│    ○ My Department (Math Department)    │
│                                         │
│  Item Category: [Dropdown]              │
│  Quantity: [___]                        │
│  Priority: [Normal ▼]                   │
│  Reason: [Text Area]                    │
│                                         │
│  [Submit Request]                       │
└─────────────────────────────────────────┘
```

**API Call:**
```javascript
POST /api/teacher/distribution-requests
{
    "category_id": 5,
    "quantity_requested": 3,
    "requested_for_type": "Classroom",  // or "Teacher", "Club", "Department"
    "requested_for_id": 101,
    "reason": "Need projectors for science demonstrations",
    "priority": "normal",
    "notes": "Prefer newer models if available"
}
```

### Step 2: Admin Reviews Request

**Admin Interface:**
```
┌─────────────────────────────────────────────────────────┐
│  Distribution Request #123                              │
├─────────────────────────────────────────────────────────┤
│  Requested By: Teacher John Smith                       │
│  Requested For: Room 101 (Science Lab)                  │
│  Item: Projectors (Category: Electronics)               │
│  Quantity: 3 units                                      │
│  Priority: Normal                                       │
│  Reason: Need projectors for science demonstrations     │
│  Date: 2026-05-09                                       │
│                                                         │
│  Available Items: [Select 3 projectors]                │
│  ☑ Projector #001 (Excellent condition)                │
│  ☑ Projector #005 (Good condition)                     │
│  ☑ Projector #012 (Good condition)                     │
│                                                         │
│  Condition: [Good ▼]                                    │
│  Admin Notes: [Text Area]                               │
│                                                         │
│  [Approve & Assign]  [Reject]                          │
└─────────────────────────────────────────────────────────┘
```

**Admin Approval API:**
```javascript
POST /api/admin/distribution-requests/123/approve
{
    "inventory_item_ids": [1, 5, 12],
    "condition_on_distribution": "good",
    "admin_notes": "Approved for classroom use. Please handle with care."
}
```

### Step 3: Assignment Created

**System Actions:**
1. Creates ItemDistribution record:
   - `assignable_type` = "App\Models\Classroom"
   - `assignable_id` = 101
   - `distributed_by` = admin_id
   - `status` = "pending_acceptance"

2. Updates DistributionRequest:
   - `status` = "distributed"
   - `reviewed_by` = admin_id
   - `distribution_id` = new_distribution_id

3. Updates InventoryItems:
   - `status` = "distributed"

4. Sends notifications:
   - To requesting teacher
   - To classroom owner (if different)

### Step 4: Teacher Acknowledges

**Teacher receives notification:**
```
┌─────────────────────────────────────────┐
│  🔔 Distribution Approved                │
├─────────────────────────────────────────┤
│  Your request for 3 projectors has been │
│  approved and assigned to Room 101.     │
│                                         │
│  Please acknowledge receipt:            │
│  [View Details]  [Acknowledge]          │
└─────────────────────────────────────────┘
```

**Acknowledgment API:**
```javascript
POST /api/teacher/distributions/456/accept
{
    "notes": "Received all 3 projectors in good condition"
}
```

### Step 5: Items Added to Entity Inventory

**System Updates:**
- ItemDistribution status: "pending_acceptance" → "assigned"
- Items now appear in Room 101's inventory
- Teacher can view items when accessing Room 101 inventory

---

## 🔄 Bulk Requests

Teachers can request items for multiple entities at once:

**Example: Request calculators for all math classrooms**

```javascript
POST /api/teacher/distribution-requests/bulk
{
    "category_id": 8,
    "quantity_per_entity": 30,
    "requested_for": [
        { "type": "Classroom", "id": 101 },
        { "type": "Classroom", "id": 102 },
        { "type": "Classroom", "id": 103 }
    ],
    "reason": "Need calculators for all algebra classes",
    "priority": "high"
}
```

**Result:**
- Creates 3 separate distribution requests
- Admin can approve all at once or individually
- Each classroom gets 30 calculators assigned

---

## 📊 Teacher Dashboard Views

### My Requests
```
GET /api/teacher/distribution-requests
```
Shows all requests made by this teacher for any entity.

**Response:**
```json
{
    "success": true,
    "data": [
        {
            "id": 123,
            "requested_by": "Teacher John Smith",
            "requested_for_type": "Classroom",
            "requested_for_id": 101,
            "requested_for_name": "Room 101",
            "category": "Projectors",
            "quantity_requested": 3,
            "status": "pending",
            "created_at": "2026-05-09"
        },
        {
            "id": 124,
            "requested_by": "Teacher John Smith",
            "requested_for_type": "Club",
            "requested_for_id": 5,
            "requested_for_name": "Robotics Club",
            "category": "Arduino Kits",
            "quantity_requested": 10,
            "status": "approved",
            "created_at": "2026-05-08"
        }
    ]
}
```

### My Entities
```
GET /api/teacher/my-entities
```
Shows all entities this teacher can request for.

**Response:**
```json
{
    "success": true,
    "data": {
        "personal": {
            "type": "Teacher",
            "id": 42,
            "name": "John Smith",
            "can_request": true
        },
        "classrooms": [
            {
                "type": "Classroom",
                "id": 101,
                "name": "Room 101 - Science Lab",
                "can_request": true,
                "current_items": 15
            }
        ],
        "clubs": [
            {
                "type": "Club",
                "id": 5,
                "name": "Robotics Club",
                "can_request": true,
                "current_items": 8
            }
        ],
        "departments": [
            {
                "type": "Department",
                "id": 3,
                "name": "Math Department",
                "can_request": true,
                "current_items": 45
            }
        ]
    }
}
```

---

## 🔐 Security & Validation

### Request Validation Rules:

```php
// 1. Teacher must be active
if ($teacher->status !== 'active') {
    return error('Inactive teachers cannot submit requests');
}

// 2. Validate entity ownership
switch ($request->requested_for_type) {
    case 'Classroom':
        $classroom = Classroom::find($request->requested_for_id);
        if ($classroom->assigned_teacher_id !== $teacher->id) {
            return error('Not authorized for this classroom');
        }
        break;
        
    case 'Club':
        $club = Club::find($request->requested_for_id);
        if ($club->advisor_teacher_id !== $teacher->id) {
            return error('Not authorized for this club');
        }
        break;
        
    case 'Department':
        $department = Department::find($request->requested_for_id);
        if ($department->head_teacher_id !== $teacher->id) {
            return error('Not authorized for this department');
        }
        break;
        
    case 'Teacher':
        if ($request->requested_for_id !== $teacher->id) {
            return error('Can only request for yourself');
        }
        break;
}

// 3. Check if category has available items
$category = ItemCategory::find($request->category_id);
if ($category->available_items < $request->quantity_requested) {
    return error('Insufficient items available');
}

// 4. Check for duplicate pending requests
$duplicate = DistributionRequest::where('requested_by', $teacher->id)
    ->where('requested_for_type', $request->requested_for_type)
    ->where('requested_for_id', $request->requested_for_id)
    ->where('category_id', $request->category_id)
    ->where('status', 'pending')
    ->exists();
    
if ($duplicate) {
    return error('You already have a pending request for this item');
}
```

---

## 📱 Frontend Implementation Example

### Request Form Component

```vue
<template>
  <div class="distribution-request-form">
    <h2>New Distribution Request</h2>
    
    <!-- Entity Selection -->
    <div class="form-group">
      <label>Request For:</label>
      <select v-model="form.entity">
        <option value="self">Myself (Personal Inventory)</option>
        <option 
          v-for="classroom in myClassrooms" 
          :key="'classroom-' + classroom.id"
          :value="{type: 'Classroom', id: classroom.id}"
        >
          {{ classroom.name }}
        </option>
        <option 
          v-for="club in myClubs" 
          :key="'club-' + club.id"
          :value="{type: 'Club', id: club.id}"
        >
          {{ club.name }}
        </option>
        <option 
          v-if="myDepartment"
          :value="{type: 'Department', id: myDepartment.id}"
        >
          {{ myDepartment.name }}
        </option>
      </select>
    </div>
    
    <!-- Item Category -->
    <div class="form-group">
      <label>Item Category:</label>
      <select v-model="form.category_id">
        <option 
          v-for="category in categories" 
          :key="category.id"
          :value="category.id"
        >
          {{ category.name }} ({{ category.available_items }} available)
        </option>
      </select>
    </div>
    
    <!-- Quantity -->
    <div class="form-group">
      <label>Quantity:</label>
      <input 
        type="number" 
        v-model="form.quantity_requested" 
        min="1"
        :max="selectedCategory?.available_items"
      />
    </div>
    
    <!-- Priority -->
    <div class="form-group">
      <label>Priority:</label>
      <select v-model="form.priority">
        <option value="low">Low</option>
        <option value="normal">Normal</option>
        <option value="high">High</option>
        <option value="urgent">Urgent</option>
      </select>
    </div>
    
    <!-- Reason -->
    <div class="form-group">
      <label>Reason:</label>
      <textarea 
        v-model="form.reason" 
        placeholder="Explain why you need these items..."
        required
      ></textarea>
    </div>
    
    <!-- Notes -->
    <div class="form-group">
      <label>Additional Notes:</label>
      <textarea 
        v-model="form.notes" 
        placeholder="Any specific requirements or preferences..."
      ></textarea>
    </div>
    
    <button @click="submitRequest" :disabled="!isValid">
      Submit Request
    </button>
  </div>
</template>

<script>
export default {
  data() {
    return {
      form: {
        entity: 'self',
        category_id: null,
        quantity_requested: 1,
        priority: 'normal',
        reason: '',
        notes: ''
      },
      myClassrooms: [],
      myClubs: [],
      myDepartment: null,
      categories: []
    }
  },
  
  computed: {
    isValid() {
      return this.form.category_id && 
             this.form.quantity_requested > 0 && 
             this.form.reason.trim().length > 0;
    },
    
    selectedCategory() {
      return this.categories.find(c => c.id === this.form.category_id);
    }
  },
  
  methods: {
    async submitRequest() {
      const payload = {
        category_id: this.form.category_id,
        quantity_requested: this.form.quantity_requested,
        priority: this.form.priority,
        reason: this.form.reason,
        notes: this.form.notes
      };
      
      // Add entity information
      if (this.form.entity === 'self') {
        payload.requested_for_type = 'Teacher';
        payload.requested_for_id = this.currentTeacherId;
      } else {
        payload.requested_for_type = this.form.entity.type;
        payload.requested_for_id = this.form.entity.id;
      }
      
      try {
        const response = await axios.post('/api/teacher/distribution-requests', payload);
        this.$toast.success('Request submitted successfully!');
        this.$router.push('/teacher/requests');
      } catch (error) {
        this.$toast.error(error.response.data.message);
      }
    },
    
    async loadMyEntities() {
      const response = await axios.get('/api/teacher/my-entities');
      this.myClassrooms = response.data.data.classrooms;
      this.myClubs = response.data.data.clubs;
      this.myDepartment = response.data.data.departments[0];
    },
    
    async loadCategories() {
      const response = await axios.get('/api/teacher/distribution-requests/available-items');
      this.categories = response.data.data;
    }
  },
  
  mounted() {
    this.loadMyEntities();
    this.loadCategories();
  }
}
</script>
```

---

## 🎯 Summary

### Key Features:
✅ Teachers can request for multiple entity types
✅ Permission-based validation
✅ Bulk requests for multiple entities
✅ Clear approval workflow
✅ Entity-specific inventory tracking
✅ Notification system for all parties

### Benefits:
- **Flexibility:** Teachers manage inventory for all their responsibilities
- **Accountability:** Clear tracking of who requested what for which entity
- **Efficiency:** Bulk requests save time
- **Transparency:** All parties notified of status changes
- **Organization:** Items properly assigned to correct entities

### Next Steps:
1. Implement entity models (Department, Classroom, Club)
2. Update DistributionRequest model with new fields
3. Create teacher request endpoints
4. Build admin approval interface
5. Implement notification system
6. Create teacher dashboard for managing requests
