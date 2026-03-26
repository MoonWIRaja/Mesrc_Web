import { useState, useEffect } from "react";

export interface ContactSettings {
    phone: string;
    hotlineNumber?: string;
    email: string;
    whatsappNumber: string;
    address?: string;
    locationName?: string;
    locationAddress?: string;
    googleMapsUrl?: string;
    facebookUrl?: string;
    instagramUrl?: string;
    tiktokUrl?: string;
    youtubeUrl?: string;
    weeklyHours?: Record<string, { isOpen: boolean; openTime?: string; closeTime?: string }>;
}

export function useContactSettings() {
    const [settings, setSettings] = useState<ContactSettings | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchContact = async () => {
            try {
                const res = await fetch("/api/data?section=contact");
                const data = await res.json();
                if (data.data) {
                    setSettings(data.data);
                }
            } catch (error) {
                console.error("Failed to load contact settings:", error);
            }
            setIsLoading(false);
        };
        fetchContact();
    }, []);

    return { settings, isLoading };
}
