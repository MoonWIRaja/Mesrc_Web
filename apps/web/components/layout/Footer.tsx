"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Eye, Facebook, Instagram, Music2, MapPin, Phone, Mail } from "lucide-react";
import { usePathname } from "next/navigation";
import { useContactSettings } from "@/hooks/useContactSettings";
import { DEFAULT_CONTACT_DATA, DEFAULT_NAVBAR_SETTINGS } from "@/lib/data/defaults";

interface FooterSettings {
    brandName?: string;
    logoUrl?: string;
    footerBrandName?: string;
    footerDescription?: string;
    copyrightText?: string;
}

interface SocialLinks {
    tiktokUrl?: string;
    instagramUrl?: string;
    facebookUrl?: string;
}

export function Footer() {
    const pathname = usePathname();
    const { settings } = useContactSettings();
    const [footerSettings, setFooterSettings] = useState<FooterSettings>({});
    const [socialLinks, setSocialLinks] = useState<SocialLinks>({});
    const [logoFailed, setLogoFailed] = useState(false);
    const footerPhone = settings?.hotlineNumber || settings?.phone || DEFAULT_CONTACT_DATA.phone;
    const footerEmail = settings?.email || DEFAULT_CONTACT_DATA.email;
    const footerAddress = settings?.locationAddress || DEFAULT_CONTACT_DATA.address;
    const footerBrand = footerSettings.footerBrandName || footerSettings.brandName || DEFAULT_NAVBAR_SETTINGS.footerBrandName;
    const logoUrl = footerSettings.logoUrl?.trim() || "";
    const shouldShowLogo = Boolean(logoUrl) && !logoFailed;
    const brandParts = footerBrand.split(" ");
    const firstBrandWord = brandParts[0] || "MESRC";
    const restBrandName = brandParts.slice(1).join(" ");
    const footerDescription = footerSettings.footerDescription || DEFAULT_NAVBAR_SETTINGS.footerDescription;
    const copyrightText = footerSettings.copyrightText || DEFAULT_NAVBAR_SETTINGS.copyrightText;
    const quickLinks = [
        { label: "About Us", href: "/#about" },
        { label: "Specialist Doctors", href: "/#doctors" },
        { label: "Services & Treatments", href: "/#services" },
        { label: "Promotions", href: "/#promotions" },
        { label: "Gallery", href: "/#gallery" },
        { label: "Contact Us", href: "/#contact" },
    ];

    useEffect(() => {
        const fetchFooterSettings = async () => {
            try {
                const res = await fetch("/api/data?section=navbar");
                const data = await res.json();
                if (data.data) {
                    setFooterSettings(data.data);
                }
            } catch (error) {
                console.error("Failed to load footer settings:", error);
            }
        };

        const fetchGallerySettings = async () => {
            try {
                const res = await fetch("/api/data?section=gallery");
                const data = await res.json();
                if (data.data?.settings) {
                    setSocialLinks({
                        tiktokUrl: data.data.settings.tiktokUrl,
                        instagramUrl: data.data.settings.instagramUrl,
                        facebookUrl: data.data.settings.facebookUrl,
                    });
                }
            } catch (error) {
                console.error("Failed to load social links:", error);
            }
        };

        fetchFooterSettings();
        fetchGallerySettings();
    }, []);

    useEffect(() => {
        setLogoFailed(false);
    }, [logoUrl]);

    if (pathname?.startsWith("/admin")) {
        return null;
    }

    return (
        <footer className="bg-slate-900 border-t border-slate-800 text-slate-300 pt-16 pb-8">
            <div className="w-full px-4 md:px-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 lg:gap-8 mb-12">

                    {/* Brand Info */}
                    <div className="flex flex-col gap-6">
                        <Link href="/" className="flex items-center gap-2 group">
                            {shouldShowLogo ? (
                                <img
                                    src={logoUrl}
                                    alt={footerBrand}
                                    className="h-10 w-auto object-contain"
                                    onError={() => setLogoFailed(true)}
                                />
                            ) : (
                                <div className="bg-blue-600 p-2 rounded-xl text-white">
                                    <Eye size={24} />
                                </div>
                            )}
                            <span
                                className="text-xl tracking-tight text-white"
                                style={{ fontFamily: '"Times New Roman", Times, serif', fontWeight: 400 }}
                            >
                                {firstBrandWord} {restBrandName && <span className="text-blue-500">{restBrandName}</span>}
                            </span>
                        </Link>
                        <p className="text-slate-400 text-sm leading-relaxed">
                            {footerDescription}
                        </p>
                        <div className="flex items-center gap-4">
                            <a href={socialLinks.tiktokUrl || "#"} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-blue-600 hover:text-white transition-colors" aria-label="TikTok">
                                <Music2 size={18} />
                            </a>
                            <a href={socialLinks.instagramUrl || "#"} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-blue-600 hover:text-white transition-colors" aria-label="Instagram">
                                <Instagram size={18} />
                            </a>
                            <a href={socialLinks.facebookUrl || "#"} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-blue-600 hover:text-white transition-colors" aria-label="Facebook">
                                <Facebook size={18} />
                            </a>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 className="font-semibold text-white text-lg mb-6">Quick Links</h3>
                        <ul className="flex flex-col gap-3">
                            {quickLinks.map((item) => (
                                <li key={item.label}>
                                    <Link href={item.href} className="text-slate-400 hover:text-blue-400 transition-colors text-sm flex items-center gap-2">
                                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                                        {item.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Contact Info */}
                    <div>
                        <h3 className="font-semibold text-white text-lg mb-6">Contact Us</h3>
                        <ul className="flex flex-col gap-4">
                            <li className="flex items-start gap-3">
                                <MapPin size={18} className="text-blue-500 shrink-0 mt-0.5" />
                                <span className="text-sm text-slate-400 leading-relaxed whitespace-pre-line">
                                    {footerAddress}
                                </span>
                            </li>
                            <li className="flex items-center gap-3">
                                <Phone size={18} className="text-blue-500 shrink-0" />
                                <span className="text-sm text-slate-400">{footerPhone}</span>
                            </li>
                            <li className="flex items-center gap-3">
                                <Mail size={18} className="text-blue-500 shrink-0" />
                                <span className="text-sm text-slate-400">{footerEmail}</span>
                            </li>
                        </ul>
                    </div>

                </div>

                {/* Bottom Bar */}
                <div className="pt-8 mt-8 border-t border-slate-800 flex items-center justify-center">
                    <p className="text-sm text-slate-500 text-center md:text-left">
                        {copyrightText}
                    </p>
                </div>
            </div>
        </footer>
    );
}
