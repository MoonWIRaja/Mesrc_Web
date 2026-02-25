"use client";

import * as React from "react";
import { Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { TimeModal } from "@/components/ui/time-modal";

interface TimeDisplayProps {
  value?: string;
  onChange?: (value: string) => void;
  className?: string;
}

export function TimeDisplay({ value, onChange, className }: TimeDisplayProps) {
  const [isModalOpen, setIsModalOpen] = React.useState(false);

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
