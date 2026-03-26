"use client";

import React from "react";
import { Calendar } from "lucide-react";
import { cn } from "@/lib/utils";

interface DatetimePickerProps {
  value?: Date;
  onChange?: (date: Date | null) => void;
  placeholder?: string;
  className?: string;
  showTimeSelect?: boolean;
  timeFormat?: "12" | "24";
  timeIntervals?: number;
  minDate?: Date;
  dateFormat?: string;
}

export const DatetimePicker: React.FC<DatetimePickerProps> = ({
  value,
  onChange,
  placeholder = "Select date and time",
  className,
  showTimeSelect = true,
  timeFormat = "12",
  timeIntervals = 15,
  minDate,
  dateFormat,
}) => {
  const toInputValue = (date?: Date) => {
    if (!date) return "";

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hour = String(date.getHours()).padStart(2, "0");
    const minute = String(date.getMinutes()).padStart(2, "0");

    return showTimeSelect
      ? `${year}-${month}-${day}T${hour}:${minute}`
      : `${year}-${month}-${day}`;
  };

  const fromInputValue = (rawValue: string) => {
    if (!rawValue) return null;
    if (showTimeSelect) {
      const parsed = new Date(rawValue);
      return Number.isNaN(parsed.getTime()) ? null : parsed;
    }
    const parsed = new Date(`${rawValue}T00:00:00`);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  };

  const inputValue = toInputValue(value);
  const minInputValue = toInputValue(minDate);
  const inputType = showTimeSelect ? "datetime-local" : "date";

  // Keep prop for backwards compatibility although native input controls format.
  void timeFormat;
  void timeIntervals;
  void dateFormat;

  return (
    <div className="relative">
      <input
        type={inputType}
        value={inputValue}
        min={minInputValue || undefined}
        onChange={(e) => onChange?.(fromInputValue(e.target.value))}
        placeholder={placeholder}
        className={cn(
          "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          "pr-10",
          className
        )}
      />
      <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
    </div>
  );
};
