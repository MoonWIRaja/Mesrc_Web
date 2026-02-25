# Modal Time Picker Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Fix TimePicker overflow issue by replacing inline dropdowns with a modal-based time picker

**Architecture:** Create TimeDisplay component (read-only trigger) and TimeModal component (dialog-based picker), modify ContactAdminPage to use new components

**Tech Stack:** React, shadcn/ui Dialog component, Tailwind CSS

---

### Task 1: Check Dialog component availability

**Files:**
- Check: `apps/web/components/ui/dialog.tsx`

**Step 1: Verify Dialog component exists**

Run: `cat apps/web/components/ui/dialog.tsx`
Expected: File exists with Dialog, DialogContent, DialogHeader, DialogTitle components

**Step 2: If missing, create Dialog component**

If file doesn't exist, run: `npx shadcn@latest add dialog`

**Step 3: Verify Button component exists**

Run: `cat apps/web/components/ui/button.tsx`
Expected: File exists

**Step 4: Commit if Dialog was added**

```bash
git add apps/web/components/ui/dialog.tsx apps/web/components.json
git commit -m "feat: add shadcn Dialog component"
```

---

### Task 2: Create TimeModal component

**Files:**
- Create: `apps/web/components/ui/time-modal.tsx`

**Step 1: Create TimeModal component**

```tsx
"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface TimeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  value?: string;
  onSave: (value: string) => void;
}

export function TimeModal({ open, onOpenChange, value, onSave }: TimeModalProps) {
  // Parse value in format "HH:MM AM/PM"
  const parseValue = (val: string) => {
    if (!val) return { hour: 9, minute: 0, ampm: "AM" as "AM" | "PM" };
    const [time, ampm] = val.split(" ");
    const [hour, minute] = time.split(":");
    return { hour: parseInt(hour), minute: parseInt(minute), ampm: ampm as "AM" | "PM" };
  };

  const { hour: initialHour, minute: initialMinute, ampm: initialAmpm } = parseValue(value || "09:00 AM");

  const [hour, setHour] = React.useState(initialHour);
  const [minute, setMinute] = React.useState(initialMinute);
  const [ampm, setAmpm] = React.useState<"AM" | "PM">(initialAmpm);

  // Reset state when value prop changes and modal is closed
  React.useEffect(() => {
    if (!open && value) {
      const { hour, minute, ampm } = parseValue(value);
      setHour(hour);
      setMinute(minute);
      setAmpm(ampm);
    }
  }, [value, open]);

  const handleSave = () => {
    const formattedTime = `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")} ${ampm}`;
    onSave(formattedTime);
    onOpenChange(false);
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  const hours = Array.from({ length: 12 }, (_, i) => i + 1);
  const minutes = [0, 15, 30, 45];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[320px]">
        <DialogHeader>
          <DialogTitle>Select Time</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Hour Selector */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Hour</label>
            <div className="grid grid-cols-4 gap-2">
              {hours.map((h) => (
                <Button
                  key={h}
                  type="button"
                  variant={hour === h ? "default" : "outline"}
                  onClick={() => setHour(h)}
                  className="h-10"
                >
                  {h}
                </Button>
              ))}
            </div>
          </div>

          {/* Minute Selector */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Minute</label>
            <div className="grid grid-cols-4 gap-2">
              {minutes.map((m) => (
                <Button
                  key={m}
                  type="button"
                  variant={minute === m ? "default" : "outline"}
                  onClick={() => setMinute(m)}
                  className="h-10"
                >
                  {m.toString().padStart(2, "0")}
                </Button>
              ))}
            </div>
          </div>

          {/* AM/PM Toggle */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Period</label>
            <div className="grid grid-cols-2 gap-2">
              <Button
                type="button"
                variant={ampm === "AM" ? "default" : "outline"}
                onClick={() => setAmpm("AM")}
                className="h-10"
              >
                AM
              </Button>
              <Button
                type="button"
                variant={ampm === "PM" ? "default" : "outline"}
                onClick={() => setAmpm("PM")}
                className="h-10"
              >
                PM
              </Button>
            </div>
          </div>

          {/* Preview */}
          <div className="bg-slate-50 rounded-lg p-4 text-center">
            <div className="text-2xl font-semibold text-slate-900">
              {hour.toString().padStart(2, "0")}:{minute.toString().padStart(2, "0")} {ampm}
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button type="button" variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button type="button" onClick={handleSave}>
            Confirm
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
```

**Step 2: Commit TimeModal component**

```bash
git add apps/web/components/ui/time-modal.tsx
git commit -m "feat: add TimeModal component for time selection"
```

---

### Task 3: Create TimeDisplay component

**Files:**
- Create: `apps/web/components/ui/time-display.tsx`

**Step 1: Create TimeDisplay component**

```tsx
"use client";

import * as React from "react";
import { Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface TimeDisplayProps {
  value?: string;
  onChange?: (value: string) => void;
  className?: string;
}

export function TimeDisplay({ value, onChange, className }: TimeDisplayProps) {
  const [isModalOpen, setIsModalOpen] = React.useState(false);

  // Import TimeModal dynamically to avoid circular dependency issues
  const TimeModal = React.useMemo(
    () => require("./time-modal").TimeModal,
    []
  );

  return (
    <>
      <button
        type="button"
        onClick={() => setIsModalOpen(true)}
        className={cn(
          "flex items-center gap-1 h-8 px-3 bg-white border border-slate-200 rounded-lg text-sm text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-colors cursor-pointer",
          className
        )}
      >
        <Clock className="h-3 w-3 text-muted-foreground" />
        <span className="font-medium">{value || "09:00 AM"}</span>
      </button>

      <TimeModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        value={value}
        onSave={onChange || (() => {})}
      />
    </>
  );
}
```

**Step 2: Commit TimeDisplay component**

```bash
git add apps/web/components/ui/time-display.tsx
git commit -m "feat: add TimeDisplay component for read-only time display"
```

---

### Task 4: Modify ContactAdminPage to use TimeDisplay

**Files:**
- Modify: `apps/web/app/admin/contact/page.tsx:268-323`

**Step 1: Replace TimePicker import with TimeDisplay**

Find line 7 and replace:
```tsx
import { TimePicker } from "@/components/ui/time-picker";
```

With:
```tsx
import { TimeDisplay } from "@/components/ui/time-display";
```

**Step 2: Update the Weekly Hours section**

Find the TimePicker usage around lines 302-317 and replace with TimeDisplay. Replace this block:

```tsx
{dayData?.isOpen && (
    <div className="flex items-center gap-2 pl-20">
        <TimePicker
            value={dayData.openTime}
            onChange={(value) => updateDayHours(day, "openTime", value)}
            compact
            className="flex-1"
        />
        <span className="text-slate-400 text-xs">-</span>
        <TimePicker
            value={dayData.closeTime}
            onChange={(value) => updateDayHours(day, "closeTime", value)}
            compact
            className="flex-1"
        />
    </div>
)}
```

With:
```tsx
{dayData?.isOpen && (
    <div className="flex items-center gap-2 pl-20">
        <TimeDisplay
            value={dayData.openTime}
            onChange={(value) => updateDayHours(day, "openTime", value)}
            className="flex-1"
        />
        <span className="text-slate-400 text-xs">-</span>
        <TimeDisplay
            value={dayData.closeTime}
            onChange={(value) => updateDayHours(day, "closeTime", value)}
            className="flex-1"
        />
    </div>
)}
```

**Step 3: Add overflow-hidden to Weekly Hours card**

Find the Weekly Hours card div (around line 268) and update className:

Original:
```tsx
<div className="lg:col-span-1 bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
```

Updated:
```tsx
<div className="lg:col-span-1 bg-white rounded-2xl p-6 shadow-sm border border-slate-100 overflow-hidden">
```

**Step 4: Verify the changes**

Run: `git diff apps/web/app/admin/contact/page.tsx`
Expected: Shows TimePicker replaced with TimeDisplay and overflow-hidden added

**Step 5: Commit ContactAdminPage changes**

```bash
git add apps/web/app/admin/contact/page.tsx
git commit -m "fix: replace TimePicker with TimeDisplay modal to prevent overflow"
```

---

### Task 5: Test the implementation

**Files:**
- Test: Manual browser testing

**Step 1: Start the dev server**

Run: `cd apps/web && npm run dev`
Expected: Server starts successfully on localhost

**Step 2: Navigate to Contact Admin page**

Open: `http://localhost:3000/admin/contact`
Expected: Page loads without errors

**Step 3: Test time display clicking**

Action: Click on any time display button (e.g., "09:00 AM")
Expected: Modal opens with time picker

**Step 4: Test time selection in modal**

Action: Click different hour, minute, and AM/PM
Expected: Preview updates in real-time

**Step 5: Test confirm action**

Action: Click "Confirm" button
Expected: Modal closes and time display updates

**Step 6: Test cancel action**

Action: Open modal, change values, click "Cancel"
Expected: Modal closes and time display stays unchanged

**Step 7: Verify no overflow**

Action: Open multiple time modals
Expected: Modals display properly without overflowing outside card

**Step 8: Test on mobile**

Action: Resize browser to mobile viewport (< 768px)
Expected: Modal is responsive and usable on small screens

---

### Task 6: Optional - Clean up old TimePicker component

**Files:**
- Delete: `apps/web/components/ui/time-picker.tsx`

**Step 1: Check if TimePicker is used elsewhere**

Run: `grep -r "time-picker" apps/web --include="*.tsx" --include="*.ts" | grep -v "time-display"`
Expected: No other usages found (only in contact admin page)

**Step 2: Remove old TimePicker component**

Run: `rm apps/web/components/ui/time-picker.tsx`

**Step 3: Commit cleanup**

```bash
git rm apps/web/components/ui/time-picker.tsx
git commit -m "chore: remove deprecated TimePicker component"
```

---

## Completion Checklist

- [ ] Dialog component installed
- [ ] TimeModal component created
- [ ] TimeDisplay component created
- [ ] ContactAdminPage updated to use TimeDisplay
- [ ] overflow-hidden added to Weekly Hours card
- [ ] Manual testing completed
- [ ] Mobile responsiveness verified
- [ ] Old TimePicker component removed (optional)
