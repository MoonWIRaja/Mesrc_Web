"use client";

import { useEffect, useState } from "react";
import { MessageCircle } from "lucide-react";
import { usePathname } from "next/navigation";
import { useContactSettings } from "@/hooks/useContactSettings";
import { DEFAULT_NAVBAR_SETTINGS } from "@/lib/data/defaults";

interface NavbarBrandSettings {
    brandName?: string;
    footerBrandName?: string;
}

export function WhatsAppFloatingButton() {
    const pathname = usePathname();
    const { settings, isLoading } = useContactSettings();
    const [brandName, setBrandName] = useState(DEFAULT_NAVBAR_SETTINGS.footerBrandName);

    useEffect(() => {
        const fetchBrandSettings = async () => {
            try {
                const res = await fetch("/api/data?section=navbar");
                const data = await res.json();
                const navbar = data.data as NavbarBrandSettings | undefined;
                if (navbar) {
                    setBrandName(navbar.footerBrandName || navbar.brandName || DEFAULT_NAVBAR_SETTINGS.footerBrandName);
                }
            } catch (error) {
                console.error("Failed to load brand settings:", error);
            }
        };

        fetchBrandSettings();
    }, []);

    if (pathname?.startsWith("/admin") || isLoading || !settings?.whatsappNumber) {
        return null;
    }

    // Format phone number for WhatsApp (remove +, spaces, dashes)
    const phoneNumber = settings.whatsappNumber.replace(/[+\s-]/g, "");
    const message = encodeURIComponent(`Hi ${brandName}, I would like to ask more...`);

    return (
        <a
            href={`https://wa.me/${phoneNumber}?text=${message}`}
            target="_blank"
            rel="noopener noreferrer"
            className="fixed bottom-6 right-6 z-50 bg-[#25D366] text-white p-4 rounded-full shadow-lg hover:shadow-2xl hover:bg-[#1EBE56] hover:scale-110 transition-all duration-300 flex items-center justify-center group"
            aria-label="WhatsApp Us"
        >
            <MessageCircle size={32} />
            <span className="absolute right-full mr-4 bg-white text-slate-800 px-3 py-1 rounded-lg shadow-md text-sm font-semibold opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                WhatsApp Us
            </span>
        </a>
    );
}
