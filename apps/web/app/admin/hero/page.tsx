"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Save, Loader2, RefreshCw, Upload } from "lucide-react";
import { HeroData } from "@/lib/data/store";
import { DEFAULT_HERO_DATA } from "@/lib/data/defaults";
import { ImagePositionField } from "@/components/admin/ImagePositionField";
import {
    resolveImageBlur,
    resolveImageOpacity,
    resolveImagePresentationStyle,
    resolveImageScale,
} from "@/lib/image-position";

export default function HeroAdminPage() {
    const [hero, setHero] = useState<HeroData>(DEFAULT_HERO_DATA);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [message, setMessage] = useState({ type: "", text: "" });
    const fileInputRef = useRef<HTMLInputElement>(null);
    const heroImageScale = resolveImageScale(hero.imageScale);
    const heroImageOpacity = resolveImageOpacity(hero.imageOpacity);
    const heroImageBlur = resolveImageBlur(hero.imageBlur);

    // Load hero data from API on mount
    useEffect(() => {
        loadHeroData();
    }, []);

    const loadHeroData = async () => {
        setIsLoading(true);
        try {
            const res = await fetch("/api/data?section=hero");
            const data = await res.json();
            if (data.data) {
                setHero(data.data);
            }
        } catch (error) {
            console.error("Failed to load hero data:", error);
        }
        setIsLoading(false);
    };

    const handleSave = async () => {
        setIsSaving(true);
        setMessage({ type: "", text: "" });

        try {
            const res = await fetch("/api/data?section=hero", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(hero),
            });
            const data = await res.json();

            if (data.success) {
                setMessage({ type: "success", text: "Hero section saved! Landing page will now show this content." });
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

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
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

            const contentType = res.headers.get("content-type") || "";
            const data = contentType.includes("application/json")
                ? await res.json()
                : null;

            if (!res.ok || !data?.success) {
                const serverMessage = data?.error || `Upload failed (HTTP ${res.status})`;
                throw new Error(serverMessage);
            }

            setHero({ ...hero, backgroundImage: data.url });
            setMessage({ type: "success", text: "Image uploaded successfully!" });
        } catch (error) {
            const errorText = error instanceof Error ? error.message : "Failed to upload image.";
            setMessage({ type: "error", text: errorText });
        } finally {
            setIsUploading(false);
            e.target.value = "";
            setTimeout(() => setMessage({ type: "", text: "" }), 3000);
        }
    };

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
                    <h1 className="text-2xl md:text-3xl font-bold text-slate-900">Hero Section</h1>
                    <p className="text-slate-500 mt-1">Configure the hero section - changes appear on landing page</p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={loadHeroData}
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

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Content Settings */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 space-y-6">
                    <h2 className="text-lg font-bold text-slate-900">Content</h2>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Badge Text</label>
                            <input
                                type="text"
                                value={hero.badge}
                                onChange={(e) => setHero({ ...hero, badge: e.target.value })}
                                className="w-full border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Main Title</label>
                            <input
                                type="text"
                                value={hero.title}
                                onChange={(e) => setHero({ ...hero, title: e.target.value })}
                                className="w-full border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Subtitle (Highlighted)</label>
                            <input
                                type="text"
                                value={hero.subtitle}
                                onChange={(e) => setHero({ ...hero, subtitle: e.target.value })}
                                className="w-full border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Description (Paragraph)</label>
                            <textarea
                                value={hero.description}
                                onChange={(e) => setHero({ ...hero, description: e.target.value })}
                                rows={3}
                                className="w-full border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                            />
                        </div>
                    </div>
                </div>

                {/* Stats Settings */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 space-y-6">
                    <h2 className="text-lg font-bold text-slate-900">Statistics</h2>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Patients Count</label>
                            <input
                                type="number"
                                value={hero.stats.patients}
                                onChange={(e) => setHero({ ...hero, stats: { ...hero.stats, patients: parseInt(e.target.value) || 0 } })}
                                className="w-full border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Years of Experience</label>
                            <input
                                type="number"
                                value={hero.stats.experience}
                                onChange={(e) => setHero({ ...hero, stats: { ...hero.stats, experience: parseInt(e.target.value) || 0 } })}
                                className="w-full border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Background Image */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 space-y-6">
                <h2 className="text-lg font-bold text-slate-900">Background Image</h2>

                {/* Hidden file input */}
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleImageUpload}
                    accept="image/*,.ico,.svg,.avif,.heic,.heif,.jfif,.tif,.tiff"
                    className="hidden"
                />

                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Image URL</label>
                    <div className="flex gap-3">
                        <input
                            type="text"
                            value={hero.backgroundImage}
                            onChange={(e) => setHero({ ...hero, backgroundImage: e.target.value })}
                            className="flex-1 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="https://example.com/image.jpg"
                        />
                        <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
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
                    imageUrl={hero.backgroundImage}
                    position={hero.imagePosition}
                    label="Hero Image Focus"
                    description="preview bawah ni ikut bentuk hero section di landing page, tapi dikecilkan untuk editor."
                    previewViewportWidth={1280}
                    previewFrameClassName="overflow-hidden rounded-xl border border-slate-200 bg-slate-900"
                    previewContent={(
                        <section className="relative flex min-h-[860px] w-full items-center justify-center overflow-hidden py-20">
                            <div className="absolute inset-0 z-0 bg-slate-900">
                                <img
                                    src={hero.backgroundImage}
                                    alt="Hero preview"
                                    className="h-full w-full object-cover"
                                    style={resolveImagePresentationStyle({
                                        imagePosition: hero.imagePosition,
                                        imageScale: hero.imageScale,
                                        imageOpacity: hero.imageOpacity,
                                        imageBlur: hero.imageBlur,
                                    })}
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/80 to-slate-900/60" />
                            </div>

                            <div className="container relative z-10 mx-auto flex flex-col items-center justify-center px-4 text-center md:px-6">
                                <div className="flex max-w-4xl flex-col items-center">
                                    <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-blue-400/30 bg-blue-500/20 px-4 py-2 text-sm font-medium text-blue-300 backdrop-blur-md">
                                        <span className="relative flex h-2.5 w-2.5">
                                            <span className="absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
                                            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-blue-500" />
                                        </span>
                                        {hero.badge}
                                    </div>

                                    <h1 className="mb-8 text-5xl font-black leading-tight tracking-tight text-white md:text-7xl">
                                        {hero.title} <br />
                                        <span className="bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
                                            {hero.subtitle}
                                        </span>
                                    </h1>

                                    <p className="mb-12 max-w-3xl text-lg font-light leading-relaxed text-slate-300 md:text-2xl">
                                        {hero.description}
                                    </p>

                                    <div className="mb-20 flex w-full flex-col justify-center gap-4 sm:w-auto sm:flex-row">
                                        <div className="inline-flex items-center justify-center rounded-full bg-blue-600 px-10 py-4 text-lg font-semibold text-white shadow-xl shadow-blue-500/30">
                                            {hero.primaryButtonText}
                                        </div>
                                        <div className="inline-flex items-center justify-center rounded-full border border-white/20 bg-white/10 px-10 py-4 text-lg font-medium text-white backdrop-blur-md">
                                            {hero.secondaryButtonText}
                                        </div>
                                    </div>

                                    <div className="grid w-full max-w-2xl grid-cols-2 gap-12 border-t border-white/10 pt-10">
                                        <div className="flex flex-col items-center text-center">
                                            <span className="mb-3 text-4xl font-black text-white md:text-5xl">
                                                {hero.stats.patients.toLocaleString()}+
                                            </span>
                                            <p className="text-sm font-semibold uppercase tracking-widest text-slate-400">Patients Treated</p>
                                        </div>
                                        <div className="flex flex-col items-center text-center">
                                            <span className="mb-3 text-4xl font-black text-white md:text-5xl">
                                                {hero.stats.experience}+
                                            </span>
                                            <p className="text-sm font-semibold uppercase tracking-widest text-slate-400">Years of Experience</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </section>
                    )}
                    zoomValue={heroImageScale}
                    onZoomChange={(imageScale) => setHero({ ...hero, imageScale })}
                    opacityValue={heroImageOpacity}
                    onOpacityChange={(imageOpacity) => setHero({ ...hero, imageOpacity })}
                    blurValue={heroImageBlur}
                    onBlurChange={(imageBlur) => setHero({ ...hero, imageBlur })}
                    onChange={(imagePosition) => setHero({ ...hero, imagePosition })}
                />
            </div>

        </div>
    );
}
