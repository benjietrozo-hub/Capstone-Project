# Error Display Examples

## Example 1: Username Already Exists

When trying to create a teacher with an existing username:

**Error Alert Box:**
```
┌──────────────────────────────────────────────────────────┐
│ ⚠️  The username has already been taken.                 │
│                                                           │
│ Please fix the following errors:                         │
│  • Username: The username has already been taken.        │
└──────────────────────────────────────────────────────────┘
```

**Field Display:**
```
Username: [john_doe]
❌ The username has already been taken.
```

**Toast Notification:**
```
🔴 Username: The username has already been taken.
```

---

## Example 2: Multiple Validation Errors

When multiple fields have errors:

**Error Alert Box:**
```
┌──────────────────────────────────────────────────────────┐
│ ⚠️  The given data was invalid.                          │
│                                                           │
│ Please fix the following errors:                         │
│  • Username: The username has already been taken.        │
│  • Email: The email has already been taken.              │
│  • Employee Id: The employee id has already been taken.  │
└──────────────────────────────────────────────────────────┘
```

---

## Example 3: Missing Required Fields

When submitting without required fields:

**Error Alert Box:**
```
┌──────────────────────────────────────────────────────────┐
│ ⚠️  Please fill in all required fields                   │
│     (Employee ID, Username, Email)                       │
└──────────────────────────────────────────────────────────┘
```

---

## Example 4: Password Too Short

When password is less than 8 characters:

**Error Alert Box:**
```
┌──────────────────────────────────────────────────────────┐
│ ⚠️  Failed to save teacher                               │
│                                                           │
│ Please fix the following errors:                         │
│  • Password: The password must be at least 8 characters. │
└──────────────────────────────────────────────────────────┘
```

**Field Display:**
```
Password: [••••••]
❌ The password must be at least 8 characters.
```

---

## Example 5: Invalid Email Format

When email format is incorrect:

**Error Alert Box:**
```
┌──────────────────────────────────────────────────────────┐
│ ⚠️  Failed to save teacher                               │
│                                                           │
│ Please fix the following errors:                         │
│  • Email: The email must be a valid email address.       │
└──────────────────────────────────────────────────────────┘
```

**Field Display:**
```
Email: [invalid-email]
❌ The email must be a valid email address.
```

---

## Color Scheme

- **Background:** Light red (#FEF2F2)
- **Border:** Red (#EF4444)
- **Text:** Dark red (#991B1B)
- **Icon:** Red (#EF4444)

## Visibility Features

1. **Large Alert Box** - Impossible to miss
2. **Red Border** - 4px left border for attention
3. **Icon** - Visual warning symbol
4. **Bold Text** - Error message stands out
5. **Bullet List** - Easy to scan multiple errors
6. **Field Highlighting** - Red border on error fields
7. **Persistent Display** - Stays until fixed

## User Flow

1. User fills form incorrectly
2. Clicks "Save Teacher"
3. **Immediately sees:**
   - Large red alert box at top
   - Specific field errors below each field
   - Toast notification in corner
4. User fixes errors
5. Errors clear when form is resubmitted
6. Success message appears

---

**Result:** Users can't miss errors and know exactly what to fix!
