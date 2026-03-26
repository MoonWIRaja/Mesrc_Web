"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { RefreshCw, AlertCircle, CheckCircle, Save, Loader2 } from "lucide-react";
import { DEFAULT_GALLERY_SETTINGS } from "@/lib/data/defaults";

interface SocialConnection {
    platform: "instagram" | "tiktok" | "facebook";
    isConnected: boolean;
    lastSync: string | null;
}

const platformNames = {
    instagram: "Instagram",
    tiktok: "TikTok",
    facebook: "Facebook",
};

interface GallerySettings {
    subtitle: string;
    title: string;
    description: string;
    elfsightWidgetId: string;
    tiktokUrl: string;
    instagramUrl: string;
    facebookUrl: string;
}

export default function GalleryAdminPage() {
    const [connections, setConnections] = useState<Record<string, SocialConnection>>({
        instagram: { platform: "instagram", isConnected: false, lastSync: null },
        tiktok: { platform: "tiktok", isConnected: false, lastSync: null },
        facebook: { platform: "facebook", isConnected: false, lastSync: null },
    });
    const [message, setMessage] = useState({ type: "", text: "" });
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [settings, setSettings] = useState<GallerySettings>(DEFAULT_GALLERY_SETTINGS);

    // Load settings from database on mount
    useEffect(() => {
        loadSettings();
        checkAllConnections();
    }, []);

    const loadSettings = async () => {
        setIsLoading(true);
        try {
            const res = await fetch("/api/data?section=gallery");
            const data = await res.json();
            console.log("Loaded gallery data:", data);
            if (data.data && data.data.settings) {
                setSettings(data.data.settings);
            }
        } catch (error) {
            console.error("Failed to load gallery settings:", error);
        }
        setIsLoading(false);
    };

    const handleSaveAll = async () => {
        setIsSaving(true);
        setMessage({ type: "", text: "" });

        try {
            const res = await fetch("/api/data?section=gallery", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    posts: [],
                    settings
                }),
            });
            const data = await res.json();

            if (data.success) {
                setMessage({ type: "success", text: "Settings saved! Landing page will now show these changes." });
            } else {
                throw new Error(data.error);
            }
        } catch (error) {
            setMessage({ type: "error", text: "Failed to save settings." });
        } finally {
            setIsSaving(false);
        }
        setTimeout(() => setMessage({ type: "", text: "" }), 5000);
    };

    const checkAllConnections = async () => {
        setIsLoading(true);
        for (const platform of ["instagram", "tiktok", "facebook"] as const) {
            try {
                const res = await fetch(`/api/social/${platform}?action=status`);
                const data = await res.json();
                setConnections(prev => ({
                    ...prev,
                    [platform]: {
                        platform,
                        isConnected: data.connected || false,
                        lastSync: data.connected ? new Date().toLocaleString() : null,
                    }
                }));
            } catch (error) {
                console.error(`Failed to check ${platform} status:`, error);
            }
        }
        setIsLoading(false);
    };

    const handleConnect = async (platform: "instagram" | "tiktok" | "facebook") => {
        try {
            // Get OAuth URL
            const res = await fetch(`/api/social/${platform}?action=connect`);
            const data = await res.json();

            if (data.authUrl) {
                // Open OAuth popup
                const popup = window.open(data.authUrl, "oauth", "width=600,height=800");

                // Listen for callback
                const checkPopup = setInterval(() => {
                    if (popup?.closed) {
                        clearInterval(checkPopup);
                        checkAllConnections();
                    }
                }, 500);
            }
        } catch (error) {
            console.error("Connect error:", error);
            setMessage({ type: "error", text: `Failed to connect ${platformNames[platform]}` });
        }
    };

    const handleDisconnect = async (platform: "instagram" | "tiktok" | "facebook") => {
        try {
            await fetch(`/api/social/${platform}?action=disconnect`);
            setConnections(prev => ({
                ...prev,
                [platform]: { platform, isConnected: false, lastSync: null }
            }));
            setMessage({ type: "success", text: `${platformNames[platform]} disconnected` });
        } catch (error) {
            console.error("Disconnect error:", error);
        }
        setTimeout(() => setMessage({ type: "", text: "" }), 3000);
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-slate-900">Gallery Settings</h1>
                    <p className="text-slate-500 mt-1">Configure Elfsight widget and section info</p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={loadSettings}
                        className="inline-flex items-center gap-2 border border-slate-200 hover:bg-slate-50 text-slate-700 font-medium px-4 py-3 rounded-xl transition-colors"
                    >
                        <RefreshCw className="w-4 h-4" />
                        Refresh
                    </button>
                    <button
                        onClick={handleSaveAll}
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
            </div>

            {/* Message */}
            {message.text && (
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                    className={`p-4 rounded-xl flex items-center gap-2 ${message.type === "success" ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-red-50 text-red-700 border border-red-200"}`}>
                    {message.type === "success" ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                    {message.text}
                </motion.div>
            )}

            {/* Settings */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 space-y-6">
                <div>
                    <h2 className="text-lg font-bold text-slate-900 mb-4">Gallery Settings</h2>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Elfsight Widget ID</label>
                            <input
                                type="text"
                                value={settings.elfsightWidgetId}
                                onChange={(e) => setSettings({ ...settings, elfsightWidgetId: e.target.value })}
                                className="w-full border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="bcd7384a-8326-437c-b98e-fffba2bf9a05"
                            />
                            <p className="text-xs text-slate-500 mt-1">
                                Get your widget ID from <a href="https://elfsight.com" target="_blank" className="text-blue-600 hover:underline">elfsight.com</a>
                            </p>
                        </div>

                        <hr className="border-slate-200" />

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Section Subtitle</label>
                            <input
                                type="text"
                                value={settings.subtitle}
                                onChange={(e) => setSettings({ ...settings, subtitle: e.target.value })}
                                className="w-full border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Follow Us"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Section Title</label>
                            <input
                                type="text"
                                value={settings.title}
                                onChange={(e) => setSettings({ ...settings, title: e.target.value })}
                                className="w-full border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Connect With Us On Social Media"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Section Description</label>
                            <textarea
                                value={settings.description}
                                onChange={(e) => setSettings({ ...settings, description: e.target.value })}
                                rows={3}
                                className="w-full border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                                placeholder="Stay updated with our latest news..."
                            />
                        </div>

                        <hr className="border-slate-200" />

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">TikTok Profile URL</label>
                            <input
                                type="url"
                                value={settings.tiktokUrl}
                                onChange={(e) => setSettings({ ...settings, tiktokUrl: e.target.value })}
                                className="w-full border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="https://www.tiktok.com/@yourusername"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Instagram Profile URL</label>
                            <input
                                type="url"
                                value={settings.instagramUrl}
                                onChange={(e) => setSettings({ ...settings, instagramUrl: e.target.value })}
                                className="w-full border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="https://www.instagram.com/yourusername"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Facebook Profile URL</label>
                            <input
                                type="url"
                                value={settings.facebookUrl}
                                onChange={(e) => setSettings({ ...settings, facebookUrl: e.target.value })}
                                className="w-full border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="https://www.facebook.com/yourpage"
                            />
                        </div>
                    </div>
                </div>

                {/* Preview */}
                <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
                    <h3 className="text-sm font-bold text-blue-900 mb-3">Preview</h3>
                    <div className="text-center space-y-4">
                        <div>
                            <p className="text-blue-600 font-bold text-xs uppercase tracking-wide">{settings.subtitle}</p>
                            <h4 className="text-2xl font-bold text-slate-900 mt-1">{settings.title}</h4>
                            <p className="text-slate-600 text-sm mt-2">{settings.description}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
