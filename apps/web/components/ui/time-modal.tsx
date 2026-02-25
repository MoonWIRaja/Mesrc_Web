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

// Constants
const DEFAULT_TIME = "09:00 AM";
const HOURS = Array.from({ length: 12 }, (_, i) => i + 1);
const MINUTES = [0, 15, 30, 45];

interface TimeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  value?: string;
  onSave: (value: string) => void;
}

// Parse time value in format "HH:MM AM/PM"
const parseValue = (val: string): { hour: number; minute: number; ampm: "AM" | "PM" } => {
  if (!val) return { hour: 9, minute: 0, ampm: "AM" };

  try {
    const parts = val.trim().split(" ");
    if (parts.length < 2) return { hour: 9, minute: 0, ampm: "AM" };

    const [time, ampm] = parts;
    const timeParts = time.split(":");

    if (timeParts.length !== 2) return { hour: 9, minute: 0, ampm: "AM" };

    const hour = parseInt(timeParts[0], 10);
    const minute = parseInt(timeParts[1], 10);

    // Validate values
    if (isNaN(hour) || isNaN(minute)) return { hour: 9, minute: 0, ampm: "AM" };

    return {
      hour: Math.max(1, Math.min(12, hour)),
      minute: Math.max(0, Math.min(59, minute)),
      ampm: ampm === "PM" ? "PM" : "AM",
    };
  } catch {
    return { hour: 9, minute: 0, ampm: "AM" };
  }
};

export function TimeModal({ open, onOpenChange, value, onSave }: TimeModalProps) {
  const { hour: initialHour, minute: initialMinute, ampm: initialAmpm } = parseValue(value || DEFAULT_TIME);

  const [hour, setHour] = React.useState(initialHour);
  const [minute, setMinute] = React.useState(initialMinute);
  const [ampm, setAmpm] = React.useState<"AM" | "PM">(initialAmpm);

  // Reset state when modal opens
  React.useEffect(() => {
    if (open) {
      const { hour: newHour, minute: newMinute, ampm: newAmpm } = parseValue(value || DEFAULT_TIME);
      setHour(newHour);
      setMinute(newMinute);
      setAmpm(newAmpm);
    }
  }, [open, value]);

  const handleSave = React.useCallback(() => {
    const formattedTime = `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")} ${ampm}`;
    onSave(formattedTime);
    onOpenChange(false);
  }, [hour, minute, ampm, onSave, onOpenChange]);

  const handleCancel = React.useCallback(() => {
    onOpenChange(false);
  }, [onOpenChange]);

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
              {HOURS.map((h) => (
                <Button
                  key={h}
                  type="button"
                  variant={hour === h ? "default" : "outline"}
                  onClick={() => setHour(h)}
                  className="h-10"
                  aria-label={`${h} o'clock`}
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
              {MINUTES.map((m) => (
                <Button
                  key={m}
                  type="button"
                  variant={minute === m ? "default" : "outline"}
                  onClick={() => setMinute(m)}
                  className="h-10"
                  aria-label={`${m} minutes`}
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
                aria-label="AM period"
              >
                AM
              </Button>
              <Button
                type="button"
                variant={ampm === "PM" ? "default" : "outline"}
                onClick={() => setAmpm("PM")}
                className="h-10"
                aria-label="PM period"
              >
                PM
              </Button>
            </div>
          </div>

          {/* Preview */}
          <div className="bg-slate-50 rounded-lg p-4 text-center">
            <div className="text-2xl font-semibold text-slate-900" aria-live="polite">
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
