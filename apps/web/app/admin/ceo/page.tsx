"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Save, Loader2, RefreshCw, Upload } from "lucide-react";
import { CeoMessageData } from "@/lib/data/store";
import { DEFAULT_CEO_MESSAGE_DATA } from "@/lib/data/defaults";
import { ImagePositionField } from "@/components/admin/ImagePositionField";
import { CeoMessageCard } from "@/components/sections/CeoMessageCard";
import { resolveImageBlur, resolveImageOpacity, resolveImageScale } from "@/lib/image-position";

const initialSettings: CeoMessageData = DEFAULT_CEO_MESSAGE_DATA;

export default function CeoMessageAdminPage() {
    const [settings, setSettings] = useState<CeoMessageData>(initialSettings || { image: "", message: "", name: "", title: "" });
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [previewViewportWidth, setPreviewViewportWidth] = useState(1280);
    const [message, setMessage] = useState({ type: "", text: "" });
    const imageInputRef = useRef<HTMLInputElement>(null);
    const imageScale = resolveImageScale(settings.imageScale);
    const imageOpacity = resolveImageOpacity(settings.imageOpacity);
    const imageBlur = resolveImageBlur(settings.imageBlur);

    // Load ceoMessage data from API on mount
    useEffect(() => {
        loadCeoMessageData();
    }, []);

    useEffect(() => {
        const updatePreviewViewportWidth = () => {
            setPreviewViewportWidth(window.innerWidth);
        };

        updatePreviewViewportWidth();
        window.addEventListener("resize", updatePreviewViewportWidth);
        return () => window.removeEventListener("resize", updatePreviewViewportWidth);
    }, []);

    const loadCeoMessageData = async () => {
        setIsLoading(true);
        try {
            const res = await fetch("/api/data?section=ceoMessage");
            const data = await res.json();
            if (data.data) {
                setSettings(data.data);
            }
        } catch (error) {
            console.error("Failed to load ceoMessage data:", error);
        }
        setIsLoading(false);
    };

    const handleSave = async () => {
        setIsSaving(true);
        setMessage({ type: "", text: "" });

        try {
            const res = await fetch("/api/data?section=ceomessage", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(settings),
            });
            const data = await res.json();

            if (data.success) {
                setMessage({ type: "success", text: "CEO Message saved! Landing page will now show this content." });
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

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: "image") => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        try {
            const formData = new FormData();
            formData.append("file", file);

            const res = await fetch("/api/upload", {
                method: "POST",
                body: formData,
            });

            const data = await res.json();

            if (data.success) {
                setSettings({ ...settings, [field]: data.url });
                setMessage({ type: "success", text: "Image uploaded successfully!" });
            } else {
                throw new Error(data.error);
            }
        } catch (error) {
            setMessage({ type: "error", text: "Failed to upload image." });
        } finally {
            setIsUploading(false);
            setTimeout(() => setMessage({ type: "", text: "" }), 3000);
        }
    };

    const previewData: CeoMessageData = {
        ...settings,
        message: settings.message || initialSettings.message,
        name: settings.name || initialSettings.name,
        title: settings.title || initialSettings.title,
        imageScale,
        imageOpacity,
        imageBlur,
    };
    const previewImageUrl = settings.image || initialSettings.image;

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-slate-900">CEO Message</h1>
                    <p className="text-slate-500 mt-1">Configure the CEO message section - changes appear on landing page</p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={loadCeoMessageData}
                        className="inline-flex items-center gap-2 border border-slate-200 hover:bg-slate-50 text-slate-700 font-medium px-4 py-3 rounded-xl transition-colors"
                    >
                        <RefreshCw className="w-4 h-4" />
                        Refresh
                    </button>
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
                                Save & Publish
                            </>
                        )}
                    </button>
                </div>
            </div>

            {/* Message */}
            {message.text && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`p-4 rounded-xl ${message.type === "success" ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-red-50 text-red-700 border border-red-200"}`}
                >
                    {message.text}
                </motion.div>
            )}

            {/* Hidden file inputs */}
            <input
                type="file"
                ref={imageInputRef}
                onChange={(e) => handleImageUpload(e, "image")}
                accept="image/jpeg,image/png,image/webp,image/gif"
                className="hidden"
            />

            {/* CEO Image */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 space-y-6">
                <h2 className="text-lg font-bold text-slate-900">CEO Photo</h2>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Image URL</label>
                        <div className="flex gap-3">
                            <input
                                type="text"
                                value={settings.image}
                                onChange={(e) => setSettings({ ...settings, image: e.target.value })}
                                className="flex-1 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="https://example.com/image.jpg"
                            />
                            <button
                                type="button"
                                onClick={() => imageInputRef.current?.click()}
                                disabled={isUploading}
                                className="inline-flex items-center gap-2 border border-slate-200 hover:bg-slate-50 text-slate-700 font-medium px-4 py-3 rounded-xl transition-colors disabled:opacity-70"
                            >
                                {isUploading ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Uploading...
                                    </>
                                ) : (
                                    <>
                                        <Upload className="w-4 h-4" />
                                        Upload
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                    <ImagePositionField
                        imageUrl={previewImageUrl}
                        position={settings.imagePosition}
                        label="CEO Image Focus"
                        description="preview bawah ni ikut bentuk section CEO di landing page, tapi dikecilkan untuk editor."
                        previewViewportWidth={previewViewportWidth}
                        previewFrameClassName="overflow-hidden rounded-xl border border-slate-200 bg-slate-100"
                        previewContent={(
                            <section className="overflow-hidden bg-slate-50 py-24">
                                <div className="container mx-auto px-4 md:px-6">
                                    <CeoMessageCard data={previewData} imageUrl={previewImageUrl} />
                                </div>
                            </section>
                        )}
                        zoomValue={imageScale}
                        onZoomChange={(nextScale) => setSettings({ ...settings, imageScale: nextScale })}
                        opacityValue={imageOpacity}
                        onOpacityChange={(nextOpacity) => setSettings({ ...settings, imageOpacity: nextOpacity })}
                        blurValue={imageBlur}
                        onBlurChange={(nextBlur) => setSettings({ ...settings, imageBlur: nextBlur })}
                        onChange={(imagePosition) => setSettings({ ...settings, imagePosition })}
                    />
                </div>
            </div>

            {/* Message Content */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 space-y-6">
                <h2 className="text-lg font-bold text-slate-900">Message</h2>
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">CEO Message</label>
                    <textarea
                        value={settings.message}
                        onChange={(e) => setSettings({ ...settings, message: e.target.value })}
                        rows={4}
                        className="w-full border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                        placeholder="Enter CEO message..."
                    />
                </div>
            </div>

            {/* CEO Info */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 space-y-6">
                <h2 className="text-lg font-bold text-slate-900">CEO Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Name</label>
                        <input
                            type="text"
                            value={settings.name}
                            onChange={(e) => setSettings({ ...settings, name: e.target.value })}
                            className="w-full border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder={`e.g., ${initialSettings.name}`}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Title</label>
                        <input
                            type="text"
                            value={settings.title}
                            onChange={(e) => setSettings({ ...settings, title: e.target.value })}
                            className="w-full border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder={`e.g., ${initialSettings.title}`}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
