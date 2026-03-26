"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Instagram, Facebook, Loader2 } from "lucide-react";
import { DEFAULT_GALLERY_SETTINGS } from "@/lib/data/defaults";

interface GallerySettings {
    subtitle: string;
    title: string;
    description: string;
    elfsightWidgetId: string;
    tiktokUrl: string;
    instagramUrl: string;
    facebookUrl: string;
}

export function Gallery() {
    const [settings, setSettings] = useState<GallerySettings>(DEFAULT_GALLERY_SETTINGS);
    const [isLoading, setIsLoading] = useState(true);

    // Fetch gallery settings from API
    useEffect(() => {
        const fetchGallery = async () => {
            try {
                const res = await fetch("/api/data?section=gallery");
                const data = await res.json();
                console.log("Fetched gallery data:", data);
                if (data.data && data.data.settings) {
                    setSettings(data.data.settings);
                }
            } catch (error) {
                console.error("Failed to load gallery:", error);
            }
            setIsLoading(false);
        };
        fetchGallery();
    }, []);

    // Load Elfsight script and hide admin panel
    useEffect(() => {
        // Check if Elfsight script already loaded
        if (!document.querySelector('script[src*="elfsight"]')) {
            const script = document.createElement('script');
            script.src = "https://elfsightcdn.com/platform.js";
            script.async = true;
            document.body.appendChild(script);
        }

        // CSS to hide Elfsight admin panel
        const style = document.createElement('style');
        style.textContent = `
            /* Hide all Elfsight admin/edit buttons and panels */
            .elfsight-app-internal-control-panel,
            [class*="elfsight"][class*="edit"],
            [class*="elfsight"][class*="admin"],
            [class*="elfsight"][class*="control"],
            [class*="elfsight"][class*="panel"],
            .elfsight-app-edit-button,
            .elfsight-app-admin-button,
            .elfsight-controls,
            .elfsight-edit-controls,
            .elfsight-widget-controls,
            .eapps-widget-toolbar,
            div[class*="AdminPanel"],
            div[class*="OwnerPanel"] {
                display: none !important;
                opacity: 0 !important;
                visibility: hidden !important;
                pointer-events: none !important;
            }

            /* Disable hover effects for Elfsight elements */
            .elfsight-app-content {
                pointer-events: none !important;
            }
            .elfsight-app-content * {
                pointer-events: auto !important;
            }
        `;
        style.id = 'elfsight-admin-hider';
        document.head.appendChild(style);

        return () => {
            if (style.parentNode) {
                style.parentNode.removeChild(style);
            }
        };
    }, []);

    if (isLoading) {
        return (
            <section id="gallery" className="py-24 bg-slate-50">
                <div className="container mx-auto px-4 md:px-6 flex justify-center">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                </div>
            </section>
        );
    }

    return (
        <section id="gallery" className="py-24 bg-slate-50">
            <div className="container mx-auto px-4 md:px-6">
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5 }}
                    >
                        <h2 className="text-blue-600 font-bold tracking-wide uppercase text-sm mb-3">{settings.subtitle}</h2>
                        <h3 className="text-3xl md:text-5xl font-bold text-slate-900 leading-tight mb-6">
                            {settings.title}
                        </h3>
                        <p className="text-slate-600 text-lg leading-relaxed">
                            {settings.description}
                        </p>

                        {/* Social Links */}
                        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-4 mt-8">
                            {settings.tiktokUrl && (
                                <a
                                    href={settings.tiktokUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-1.5 sm:gap-2 px-4 sm:px-6 py-2.5 sm:py-3 bg-black text-white rounded-full text-sm sm:text-base font-semibold hover:bg-gray-800 transition-colors"
                                >
                                    <svg className="w-4 h-4 sm:w-5 sm:h-5" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.33 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
                                    </svg>
                                    TikTok
                                </a>
                            )}
                            {settings.instagramUrl && (
                                <a
                                    href={settings.instagramUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-1.5 sm:gap-2 px-4 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 text-white rounded-full text-sm sm:text-base font-semibold hover:opacity-90 transition-opacity"
                                >
                                    <Instagram className="w-4 h-4 sm:w-5 sm:h-5" />
                                    Instagram
                                </a>
                            )}
                            {settings.facebookUrl && (
                                <a
                                    href={settings.facebookUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-1.5 sm:gap-2 px-4 sm:px-6 py-2.5 sm:py-3 bg-blue-600 text-white rounded-full text-sm sm:text-base font-semibold hover:bg-blue-700 transition-colors"
                                >
                                    <Facebook className="w-4 h-4 sm:w-5 sm:h-5" />
                                    Facebook
                                </a>
                            )}
                        </div>
                    </motion.div>
                </div>

                {/* Elfsight Social Feed Widget */}
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="max-w-6xl mx-auto"
                >
                    {settings.elfsightWidgetId ? (
                        <div
                            className={`elfsight-app-${settings.elfsightWidgetId}`}
                            data-elfsight-app-lazy
                        ></div>
                    ) : (
                        <div className="p-8 bg-yellow-50 rounded-2xl border border-yellow-200 text-center">
                            <p className="text-yellow-800 font-medium">⚠️ Elfsight Widget ID not configured</p>
                            <p className="text-sm text-yellow-700 mt-2">
                                Go to <a href="/admin/gallery" className="underline">Admin Gallery</a> to add your Widget ID
                            </p>
                        </div>
                    )}
                </motion.div>
            </div>
        </section>
    );
}
