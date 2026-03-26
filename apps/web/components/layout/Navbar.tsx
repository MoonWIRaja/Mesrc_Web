"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Eye } from "lucide-react";
import { DEFAULT_NAVBAR_SETTINGS } from "@/lib/data/defaults";

const NAV_LINKS = [
    { name: "About", href: "/#about" },
    { name: "Doctors", href: "/#doctors" },
    { name: "Services", href: "/#services" },
    { name: "Promotions", href: "/#promotions" },
    { name: "Reviews", href: "/#reviews" },
    { name: "Gallery", href: "/#gallery" },
    { name: "Contact", href: "/#contact" },
];

interface NavbarSettings {
    brandName: string;
    logoUrl: string;
}

export function Navbar() {
    const pathname = usePathname();
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [logoFailed, setLogoFailed] = useState(false);
    const [navbarSettings, setNavbarSettings] = useState<NavbarSettings>({
        brandName: DEFAULT_NAVBAR_SETTINGS.brandName,
        logoUrl: DEFAULT_NAVBAR_SETTINGS.logoUrl,
    });

    useEffect(() => {
        // Fetch navbar settings
        const fetchNavbarSettings = async () => {
            try {
                const res = await fetch("/api/data?section=navbar");
                const data = await res.json();
                if (data.data) {
                    setNavbarSettings(data.data);
                }
            } catch (error) {
                console.error("Failed to fetch navbar settings:", error);
            }
        };

        fetchNavbarSettings();
    }, []);

    useEffect(() => {
        const handleScroll = () => {
            // Sembunyikan navbar jika belum scroll melepasi 70% hero (untuk lebih responsif)
            setIsScrolled(window.scrollY > window.innerHeight * 0.7);
        };
        window.addEventListener("scroll", handleScroll);
        // Initial check
        handleScroll();
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    // Parse brand name - split into first word and rest
    const brandParts = (navbarSettings?.brandName || DEFAULT_NAVBAR_SETTINGS.brandName).split(" ");
    const firstBrandWord = brandParts[0] || "MESRC";
    const restBrandName = brandParts.slice(1).join(" ");
    const logoUrl = navbarSettings?.logoUrl?.trim() || "";
    const shouldShowLogo = Boolean(logoUrl) && !logoFailed;

    useEffect(() => {
        setLogoFailed(false);
    }, [logoUrl]);

    if (pathname?.startsWith("/admin")) {
        return null;
    }

    return (
        <AnimatePresence>
            {isScrolled && (
                <motion.nav
                    initial={{ y: -100, opacity: 0, x: "-50%" }}
                    animate={{ y: 0, opacity: 1, x: "-50%" }}
                    exit={{ y: -100, opacity: 0, x: "-50%" }}
                    transition={{ type: "spring", stiffness: 200, damping: 20 }}
                    className={`fixed top-6 left-1/2 z-50 w-[95%] max-w-6xl rounded-full transition-all duration-300 px-4 md:px-6 flex items-center justify-between ${isScrolled || isMobileMenuOpen
                        ? "bg-slate-900/90 backdrop-blur-xl border border-slate-700/50 shadow-2xl shadow-blue-900/20 py-2"
                        : "bg-slate-900/40 backdrop-blur-md border border-white/10 shadow-lg py-3"
                        }`}
                >
                    {/* Logo */}
                    <Link href="/#hero" className="flex items-center gap-3 group">
                        {shouldShowLogo ? (
                            <img
                                src={logoUrl}
                                alt={navbarSettings?.brandName || DEFAULT_NAVBAR_SETTINGS.brandName}
                                className="h-10 w-auto object-contain"
                                onError={() => setLogoFailed(true)}
                            />
                        ) : (
                            <div className="bg-blue-600 p-2 rounded-full text-white group-hover:bg-blue-500 transition-colors shadow-inner">
                                <Eye size={20} />
                            </div>
                        )}
                        <span className="font-bold text-lg tracking-tight text-white hidden md:block">
                            {firstBrandWord} {restBrandName && <span className="text-blue-400 font-medium">{restBrandName}</span>}
                        </span>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden lg:flex items-center gap-2 bg-slate-800/50 rounded-full px-2 border border-slate-700/50">
                        {NAV_LINKS.map((link) => (
                            <Link
                                key={link.name}
                                href={link.href}
                                className="text-sm font-medium text-slate-300 hover:text-white hover:bg-white/10 px-3 xl:px-4 py-2 rounded-full transition-all duration-300"
                            >
                                {link.name}
                            </Link>
                        ))}
                    </div>

                    <div className="hidden lg:block">
                        <Link
                            href="/#appointment"
                            className="bg-white hover:bg-blue-50 text-slate-900 px-5 xl:px-6 py-2.5 rounded-full text-sm font-bold transition-all shadow-md hover:scale-105 active:scale-95 whitespace-nowrap"
                        >
                            Book Appointment
                        </Link>
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        className="lg:hidden p-2 text-white bg-slate-800 rounded-full hover:bg-slate-700 transition"
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    >
                        {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
                    </button>

                    {/* Mobile Menu Dropdown */}
                    <AnimatePresence>
                        {isMobileMenuOpen && (
                            <motion.div
                                key="mobile-menu"
                                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                className="absolute top-[calc(100%+12px)] left-0 w-full bg-slate-900/95 backdrop-blur-xl border border-slate-800 shadow-2xl rounded-3xl py-6 px-6 flex flex-col gap-4 overflow-hidden"
                            >
                                <ul className="flex flex-col gap-1">
                                    {NAV_LINKS.map((link) => (
                                        <li key={link.name}>
                                            <Link
                                                href={link.href}
                                                onClick={() => setIsMobileMenuOpen(false)}
                                                className="block px-6 py-3 text-base font-medium text-slate-300 hover:bg-blue-600/20 hover:text-white rounded-xl transition-colors"
                                            >
                                                {link.name}
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                                <div className="px-2 pt-4 border-t border-slate-800">
                                    <Link
                                        href="/#appointment"
                                        onClick={() => setIsMobileMenuOpen(false)}
                                        className="flex justify-center w-full bg-blue-600 hover:bg-blue-500 text-white px-5 py-4 rounded-xl text-base font-bold transition-all shadow-lg shadow-blue-600/30"
                                    >
                                        📅 Book Appointment
                                    </Link>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.nav>
            )}
        </AnimatePresence>
    );
}
