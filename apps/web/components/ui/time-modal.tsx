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
