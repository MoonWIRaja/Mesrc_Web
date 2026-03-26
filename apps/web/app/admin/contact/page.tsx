"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Save, Loader2, Phone, Mail, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TimeDisplay } from "@/components/ui/time-display";

interface DayHours {
    isOpen: boolean;
    openTime?: string;
    closeTime?: string;
}

interface WeeklyHours {
    monday: DayHours;
    tuesday: DayHours;
    wednesday: DayHours;
    thursday: DayHours;
    friday: DayHours;
    saturday: DayHours;
    sunday: DayHours;
}

interface ContactSettings {
    phone: string;
    email: string;
    whatsappNumber: string;
    hotlineNumber: string;
    locationName: string;
    locationAddress: string;
    googleMapsUrl: string;
    weeklyHours: WeeklyHours;
}

const defaultDayHours: DayHours = {
    isOpen: true,
    openTime: "09:00 AM",
    closeTime: "06:00 PM",
};

const initialSettings: ContactSettings = {
    phone: "+60 3-1234 5678",
    email: "info@eyespecialist.com",
    whatsappNumber: "+60123456789",
    hotlineNumber: "+60 3-1234 5678",
    locationName: "KL Eye Medical Tower",
    locationAddress: "Level 4, Cemerlang Building, 123 Jalan Ampang, 50450 Kuala Lumpur",
    googleMapsUrl: "",
    weeklyHours: {
        monday: defaultDayHours,
        tuesday: defaultDayHours,
        wednesday: defaultDayHours,
        thursday: defaultDayHours,
        friday: defaultDayHours,
        saturday: { isOpen: true, openTime: "09:00 AM", closeTime: "01:00 PM" },
        sunday: { isOpen: false },
    },
};

export default function ContactAdminPage() {
    const [settings, setSettings] = useState<ContactSettings>(initialSettings);
    const [isSaving, setIsSaving] = useState(false);
    const [message, setMessage] = useState({ type: "", text: "" });
    const [isLoading, setIsLoading] = useState(true);
    const [isFetchingLocation, setIsFetchingLocation] = useState(false);

    // Load settings from API on mount
    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = async () => {
        setIsLoading(true);
        try {
            const res = await fetch("/api/data?section=contact");
            const data = await res.json();
            if (data.data) {
                // Ensure weeklyHours has default structure if not present
                const loadedSettings = data.data;
                if (!loadedSettings.hotlineNumber && loadedSettings.phone) {
                    loadedSettings.hotlineNumber = loadedSettings.phone;
                }
                if (!loadedSettings.weeklyHours) {
                    loadedSettings.weeklyHours = initialSettings.weeklyHours;
                }
                setSettings(loadedSettings);
            }
        } catch (error) {
            console.error("Failed to load contact settings:", error);
        }
        setIsLoading(false);
    };

    // Auto-fetch location data from Google Maps URL
    const fetchLocationFromMaps = async () => {
        if (!settings.googleMapsUrl) return;
        
        setIsFetchingLocation(true);
        try {
            const parseMapsInput = (input: string) => {
                const trimmed = input.trim();

                // Support pasted full iframe HTML by extracting src="..."
                const iframeSrcMatch = trimmed.match(/src=["']([^"']+)["']/i);
                const mapsUrl = iframeSrcMatch?.[1] ?? trimmed;

                const url = new URL(mapsUrl);
                const params = new URLSearchParams(url.search);

                const fromQuery = params.get("query") || params.get("q");
                const fromEmbedPb = params.get("pb")?.match(/!2s([^!]+)/)?.[1];
                const placeName = decodeURIComponent(fromQuery || fromEmbedPb || "").replace(/\+/g, " ").trim();
                const address = decodeURIComponent(params.get("q") || "").replace(/\+/g, " ").trim();

                return {
                    mapsUrl,
                    placeName,
                    address,
                };
            };

            const parsed = parseMapsInput(settings.googleMapsUrl);
            
            // Keep existing values when parser cannot extract full details.
            // Embedded map URLs often don't contain full postal address.
            const placeName = parsed.placeName || settings.locationName || "KL Eye Medical Tower";
            const address = parsed.address || settings.locationAddress || "";
            
            setSettings({
                ...settings,
                googleMapsUrl: parsed.mapsUrl,
                locationName: placeName,
                locationAddress: address,
            });
            
            setMessage({ type: "success", text: "Location auto-filled from Google Maps!" });
            setTimeout(() => setMessage({ type: "", text: "" }), 3000);
        } catch (error) {
            console.error("Failed to fetch location:", error);
        }
        setIsFetchingLocation(false);
    };

    // Update weekly hours for a specific day
    const updateDayHours = (day: keyof WeeklyHours, field: keyof DayHours, value: string | boolean) => {
        setSettings({
            ...settings,
            weeklyHours: {
                ...settings.weeklyHours,
                [day]: {
                    ...settings.weeklyHours[day],
                    [field]: value,
                },
            },
        });
    };

    const handleSave = async () => {
        setIsSaving(true);
        setMessage({ type: "", text: "" });

        try {
            const payload = {
                ...settings,
                // Keep legacy "phone" field in sync while admin edits hotline only.
                phone: settings.hotlineNumber || settings.phone,
            };

            const res = await fetch("/api/data?section=contact", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });
            const data = await res.json();

            if (data.success) {
                setMessage({ type: "success", text: "Contact settings saved! WhatsApp links will now use this number." });
            } else {
                throw new Error(data.error);
            }
        } catch (error) {
            setMessage({ type: "error", text: "Failed to save contact settings." });
        } finally {
            setIsSaving(false);
        }
        setTimeout(() => setMessage({ type: "", text: "" }), 5000);
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-slate-900">Contact & Location</h1>
                    <p className="text-slate-500 mt-1">Manage contact information and clinic locations</p>
                </div>
                <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-xl transition-colors disabled:opacity-70"
                >
                    {isSaving ? (
                        <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            Saving...
                        </>
                    ) : (
                        <>
                            <Save className="w-5 h-5" />
                            Save Changes
                        </>
                    )}
                </button>
            </div>

            {/* Message */}
            {message.text && (
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                    className={`p-4 rounded-xl ${message.type === "success" ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-red-50 text-red-700 border border-red-200"}`}>
                    {message.text}
                </motion.div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Contact Info - Left Column */}
                <div className="lg:col-span-1 bg-white rounded-2xl p-6 shadow-sm border border-slate-100 space-y-4">
                    <h2 className="text-lg font-bold text-slate-900">Contact Info</h2>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Email</label>
                        <input type="email" value={settings.email || ""}
                            onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                            className="w-full border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">WhatsApp Number</label>
                        <input type="text" value={settings.whatsappNumber || ""}
                            onChange={(e) => setSettings({ ...settings, whatsappNumber: e.target.value })}
                            className="w-full border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="+60123456789" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Hotline Number</label>
                        <input type="text" value={settings.hotlineNumber || settings.phone || ""}
                            onChange={(e) => setSettings({ ...settings, hotlineNumber: e.target.value, phone: e.target.value })}
                            className="w-full border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="+60 3-1234 5678" />
                    </div>
                </div>

                {/* Location - Middle Column */}
                <div className="lg:col-span-1 bg-white rounded-2xl p-6 shadow-sm border border-slate-100 space-y-4">
                    <h2 className="text-lg font-bold text-slate-900">Location</h2>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Google Maps URL</label>
                        <div className="flex gap-2">
                            <input type="url" value={settings.googleMapsUrl || ""}
                                onChange={(e) => setSettings({ ...settings, googleMapsUrl: e.target.value })}
                                onBlur={fetchLocationFromMaps}
                                className="flex-1 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="https://maps.google.com/..." />
                            <Button
                                onClick={fetchLocationFromMaps}
                                disabled={isFetchingLocation || !settings.googleMapsUrl}
                                className="bg-blue-600 hover:bg-blue-700"
                                size="sm"
                            >
                                {isFetchingLocation ? "..." : "Auto"}
                            </Button>
                        </div>
                        <p className="text-xs text-slate-500 mt-1">Paste Google Maps URL, location will auto-fill</p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Location Name</label>
                        <input type="text" value={settings.locationName || ""}
                            onChange={(e) => setSettings({ ...settings, locationName: e.target.value })}
                            className="w-full border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="KL Eye Medical Tower" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Location Address</label>
                        <textarea value={settings.locationAddress || ""}
                            onChange={(e) => setSettings({ ...settings, locationAddress: e.target.value })}
                            rows={3}
                            className="w-full border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                            placeholder="Level 4, Cemerlang Building..." />
                    </div>
                </div>

                {/* Weekly Hours - Right Column */}
                <div className="lg:col-span-1 bg-white rounded-2xl p-6 shadow-sm border border-slate-100 overflow-hidden">
                    <h2 className="text-lg font-bold text-slate-900 mb-4">Weekly Hours</h2>
                    <div className="space-y-2">
                        {settings.weeklyHours && (Object.keys(settings.weeklyHours) as Array<keyof WeeklyHours>).map((day) => {
                            const dayData = settings.weeklyHours[day];
                            const dayLabel = day.charAt(0).toUpperCase() + day.slice(1);
                            
                            return (
                                <div key={day} className="flex flex-col gap-2 p-3 bg-slate-50 rounded-lg border border-slate-100">
                                    {/* Day Header */}
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <div className="w-20 text-sm font-semibold text-slate-700">
                                                {dayLabel}
                                            </div>
                                            <label className="flex items-center gap-2 cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={dayData?.isOpen ?? false}
                                                    onChange={(e) => updateDayHours(day, "isOpen", e.target.checked)}
                                                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                                                />
                                                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                                                    dayData?.isOpen 
                                                        ? "bg-green-100 text-green-700" 
                                                        : "bg-red-100 text-red-700"
                                                }`}>
                                                    {dayData?.isOpen ? "Open" : "Closed"}
                                                </span>
                                            </label>
                                        </div>
                                    </div>
                                    
                                    {/* Time Pickers (only if open) */}
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
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}
