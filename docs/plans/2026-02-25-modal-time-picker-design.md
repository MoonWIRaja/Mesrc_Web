# Modal Time Picker Design

**Date:** 2026-02-25
**Component:** ContactAdminPage Weekly Hours

## Problem

The TimePicker dropdowns (SelectContent) overflow outside the Weekly Hours card container when opened, creating a poor user experience.

## Solution

Replace inline dropdown Select components with a modal-based time picker approach.

## Components

### 1. TimeDisplay Component
- **Purpose:** Display current time in read-only format
- **Interaction:** Clickable trigger that opens modal
- **Styling:** Match existing TimePicker trigger appearance
- **Props:** `value` (string), `onChange` (function), `className` (string)

### 2. TimeModal Component
- **Purpose:** Modal dialog for time selection
- **Features:**
  - Backdrop blur overlay
  - Large hour selector (1-12)
  - Minute selector (15-min intervals)
  - AM/PM toggle
  - Confirm/Cancel buttons
  - Responsive design

### 3. ContactAdminPage Modifications
- Replace TimePicker with TimeDisplay in Weekly Hours section
- Add overflow-hidden to Weekly Hours card
- Manage modal state

## Data Flow

```
User clicks TimeDisplay
  ↓
Modal opens with current time pre-selected
  ↓
User modifies hour/minute/AM-PM
  ↓
User clicks Confirm → Modal closes → onChange called
User clicks Cancel → Modal closes → No change
```

## UI Improvements

- Add `overflow-hidden` to Weekly Hours card
- Improve hover states for interactive elements
- Better spacing and visual hierarchy
- Consistent with existing blue accent color scheme

## Technical Notes

- Uses existing UI components (Dialog, Button)
- No external dependencies
- Backward compatible with existing data format ("HH:MM AM/PM")
