"use client";

import { Clock } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

interface TimePickerProps {
    value?: string;
    onChange: (value: string) => void;
}

const DEFAULT_HOUR = "09";
const DEFAULT_MINUTE = "00";
const DEFAULT_AMPM = "AM";

export function TimePicker({ value, onChange }: TimePickerProps) {
    const [hour, setHour] = useState(DEFAULT_HOUR);
    const [minute, setMinute] = useState(DEFAULT_MINUTE);
    const [ampm, setAmpm] = useState(DEFAULT_AMPM);

    useEffect(() => {
        if (!value) return;
        const match = value.match(/^(\d{2}):(\d{2})\s(AM|PM)$/);
        if (match) {
            setHour(match[1] ?? DEFAULT_HOUR);
            setMinute(match[2] ?? DEFAULT_MINUTE);
            setAmpm((match[3] as "AM" | "PM") ?? DEFAULT_AMPM);
        }
    }, [value]);

    const timeValue = useMemo(() => `${hour}:${minute} ${ampm}`, [hour, minute, ampm]);

    useEffect(() => {
        onChange(timeValue);
    }, [timeValue, onChange]);

    return (
        <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />

            <Select value={hour} onValueChange={setHour}>
                <SelectTrigger className="w-[72px] bg-white">
                    <SelectValue />
                </SelectTrigger>
                <SelectContent>
                    {Array.from({ length: 12 }, (_, i) => {
                        const h = (i + 1).toString().padStart(2, "0");
                        return (
                            <SelectItem key={h} value={h}>
                                {h}
                            </SelectItem>
                        );
                    })}
                </SelectContent>
            </Select>

            <span className="text-slate-500">:</span>

            <Select value={minute} onValueChange={setMinute}>
                <SelectTrigger className="w-[72px] bg-white">
                    <SelectValue />
                </SelectTrigger>
                <SelectContent>
                    {["00", "15", "30", "45"].map((m) => (
                        <SelectItem key={m} value={m}>
                            {m}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>

            <Select value={ampm} onValueChange={setAmpm}>
                <SelectTrigger className="w-[82px] bg-white">
                    <SelectValue />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="AM">AM</SelectItem>
                    <SelectItem value="PM">PM</SelectItem>
                </SelectContent>
            </Select>
        </div>
    );
}
