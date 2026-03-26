"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Save, Loader2, RefreshCw, Upload } from "lucide-react";
import { AboutData } from "@/lib/data/store";
import { DEFAULT_ABOUT_DATA } from "@/lib/data/defaults";
import { ImagePositionField } from "@/components/admin/ImagePositionField";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Award, CheckCircle2, ShieldCheck } from "lucide-react";
import {
    resolveImageBlur,
    resolveImageOpacity,
    resolveImagePresentationStyle,
    resolveImageScale,
} from "@/lib/image-position";

const initialSettings: AboutData = DEFAULT_ABOUT_DATA;

export default function AboutAdminPage() {
    const [settings, setSettings] = useState<AboutData>(initialSettings);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [message, setMessage] = useState({ type: "", text: "" });
    const fileInputRef = useRef<HTMLInputElement>(null);
    const aboutImageScale = resolveImageScale(settings.imageScale);
    const aboutImageOpacity = resolveImageOpacity(settings.imageOpacity);
    const aboutImageBlur = resolveImageBlur(settings.imageBlur);

    // Load about data from API on mount
    useEffect(() => {
        loadAboutData();
    }, []);

    const loadAboutData = async () => {
        setIsLoading(true);
        try {
            const res = await fetch("/api/data?section=about");
            const data = await res.json();
            if (data.data) {
                // Ensure accreditationItems exists with default values
                const loadedData = {
                    ...initialSettings,
                    ...data.data,
                    accreditationItems: data.data.accreditationItems || initialSettings.accreditationItems
                };
                setSettings(loadedData);
            }
        } catch (error) {
            console.error("Failed to load about data:", error);
        }
        setIsLoading(false);
    };

    const handleSave = async () => {
        setIsSaving(true);
        setMessage({ type: "", text: "" });

        try {
            const res = await fetch("/api/data?section=about", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(settings),
            });
            const data = await res.json();

            if (data.success) {
                setMessage({ type: "success", text: "About section saved! Landing page will now show this content." });
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

            const data = await res.json();

            if (data.success) {
                setSettings({ ...settings, image: data.url });
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

    const updateAccreditationItem = (index: number, field: string, value: string) => {
        const newItems = [...settings.accreditationItems];
        newItems[index] = { ...newItems[index], [field as keyof typeof newItems[0]]: value } as typeof newItems[0];
        setSettings({ ...settings, accreditationItems: newItems });
    };

    const addAccreditationItem = () => {
        setSettings({
            ...settings,
            accreditationItems: [
                ...settings.accreditationItems,
                { title: "New Award", subtitle: "Year", icon: "award" }
            ]
        });
    };

    const removeAccreditationItem = (index: number) => {
        const newItems = settings.accreditationItems.filter((_, i) => i !== index);
        setSettings({ ...settings, accreditationItems: newItems });
    };

    const renderFormattedContent = (content: string, baseClassName: string) => {
        const lines = content
            .split(/\r?\n/)
            .map((line) => line.trim())
            .filter(Boolean);

        if (lines.length === 0) {
            return <p className={baseClassName}>{content}</p>;
        }

        const isNumberedList = lines.length > 1 && lines.every((line) => /^\d+[\.\)]\s*/.test(line));

        if (isNumberedList) {
            return (
                <ol className={`${baseClassName} list-decimal space-y-2 pl-5`}>
                    {lines.map((line, index) => (
                        <li key={`${line}-${index}`}>
                            {line.replace(/^\d+[\.\)]\s*/, "")}
                        </li>
                    ))}
                </ol>
            );
        }

        return (
            <div className="space-y-2">
                {lines.map((line, index) => (
                    <p key={`${line}-${index}`} className={baseClassName}>
                        {line}
                    </p>
                ))}
            </div>
        );
    };

    const previewData: AboutData = {
        ...initialSettings,
        ...settings,
        accreditationItems: settings.accreditationItems?.length
            ? settings.accreditationItems
            : initialSettings.accreditationItems,
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
                    <h1 className="text-2xl md:text-3xl font-bold text-slate-900">About Section</h1>
                    <p className="text-slate-500 mt-1">Configure the about section - changes appear on landing page</p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={loadAboutData}
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

            {/* Hidden file input */}
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageUpload}
                accept="image/jpeg,image/png,image/webp,image/gif"
                className="hidden"
            />

            {/* Badge & Title */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 space-y-6">
                    <h2 className="text-lg font-bold text-slate-900">Header</h2>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Badge Text</label>
                            <input
                                type="text"
                                value={settings.badge}
                                onChange={(e) => setSettings({ ...settings, badge: e.target.value })}
                                className="w-full border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div className="grid grid-cols-1 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">Main Title</label>
                                <input
                                    type="text"
                                    value={settings.titleMain}
                                    onChange={(e) => setSettings({ ...settings, titleMain: e.target.value })}
                                    className="w-full border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="e.g., Melaka Eye"
                                />
                            </div>
                            <div className="flex items-center gap-3">
                                <label className="text-sm font-medium text-slate-700">Main Title Color:</label>
                                <input
                                    type="color"
                                    value={settings.titleMainColor}
                                    onChange={(e) => setSettings({ ...settings, titleMainColor: e.target.value })}
                                    className="w-10 h-10 rounded-lg border border-slate-200 cursor-pointer"
                                />
                                <span className="text-sm text-slate-500">{settings.titleMainColor}</span>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">Sub Title</label>
                                <input
                                    type="text"
                                    value={settings.titleSub}
                                    onChange={(e) => setSettings({ ...settings, titleSub: e.target.value })}
                                    className="w-full border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="e.g., Specialist And Refractive Centre"
                                />
                            </div>
                            <div className="flex items-center gap-3">
                                <label className="text-sm font-medium text-slate-700">Sub Title Color:</label>
                                <input
                                    type="color"
                                    value={settings.titleSubColor}
                                    onChange={(e) => setSettings({ ...settings, titleSubColor: e.target.value })}
                                    className="w-10 h-10 rounded-lg border border-slate-200 cursor-pointer"
                                />
                                <span className="text-sm text-slate-500">{settings.titleSubColor}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Image */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 space-y-6">
                    <h2 className="text-lg font-bold text-slate-900">Image</h2>
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
                            imageUrl={settings.image}
                            position={settings.imagePosition}
                            label="About Image Focus"
                            previewViewportWidth={1280}
                            previewFrameClassName="overflow-hidden rounded-xl border border-slate-200 bg-white"
                            previewContent={(
                                <section className="bg-white py-24">
                                    <div className="container mx-auto px-4 md:px-6">
                                        <div className="grid grid-cols-1 gap-16 items-center lg:grid-cols-2">
                                            <div className="relative h-[500px] w-full overflow-hidden rounded-2xl bg-slate-200 md:h-[600px]">
                                                <img
                                                    src={previewData.image}
                                                    alt="About preview"
                                                    className="h-full w-full object-cover"
                                                    style={resolveImagePresentationStyle({
                                                        imagePosition: previewData.imagePosition,
                                                        imageScale: previewData.imageScale,
                                                        imageOpacity: previewData.imageOpacity,
                                                        imageBlur: previewData.imageBlur,
                                                    })}
                                                />
                                                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent" />
                                            </div>

                                            <div>
                                                <Badge variant="outline" className="mb-4 bg-blue-50 px-3 py-1 text-blue-600 border-blue-200">
                                                    {previewData.badge}
                                                </Badge>
                                                <h2 className="mb-6 text-3xl font-bold leading-tight text-slate-900 md:text-5xl">
                                                    <span style={{ color: previewData.titleMainColor || "#000000" }}>
                                                        {previewData.titleMain || initialSettings.titleMain}
                                                    </span>{" "}
                                                    <br />
                                                    <span style={{ color: previewData.titleSubColor || "#2563eb" }}>
                                                        {previewData.titleSub || initialSettings.titleSub}
                                                    </span>
                                                </h2>

                                                <Tabs defaultValue="sejarah" className="mt-8 w-full">
                                                    <TabsList className="mb-8 grid w-full grid-cols-3 rounded-xl bg-slate-100 p-1">
                                                        <TabsTrigger value="sejarah" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">
                                                            History
                                                        </TabsTrigger>
                                                        <TabsTrigger value="misi" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">
                                                            Mission & Vision
                                                        </TabsTrigger>
                                                        <TabsTrigger value="akreditasi" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">
                                                            Accreditation
                                                        </TabsTrigger>
                                                    </TabsList>

                                                    <TabsContent value="sejarah" className="space-y-4 text-slate-600">
                                                        <p className="text-lg leading-relaxed">{previewData.history}</p>
                                                    </TabsContent>

                                                    <TabsContent value="misi" className="space-y-6 text-slate-600">
                                                        <div>
                                                            <h4 className="mb-2 flex items-center gap-2 text-lg font-bold text-slate-900">
                                                                <CheckCircle2 className="text-blue-500" size={20} /> Our Mission
                                                            </h4>
                                                            {renderFormattedContent(previewData.mission, "leading-relaxed pl-7")}
                                                        </div>
                                                        <div>
                                                            <h4 className="mb-2 flex items-center gap-2 text-lg font-bold text-slate-900">
                                                                <CheckCircle2 className="text-blue-500" size={20} /> Our Vision
                                                            </h4>
                                                            {renderFormattedContent(previewData.vision, "leading-relaxed pl-7")}
                                                        </div>
                                                    </TabsContent>

                                                    <TabsContent value="akreditasi" className="space-y-4 text-slate-600">
                                                        <p className="mb-6 leading-relaxed">{previewData.accreditation}</p>
                                                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                                            {previewData.accreditationItems.map((item, index) => (
                                                                <div key={`${item.title}-${index}`} className="flex items-start gap-3 rounded-xl border border-slate-100 bg-slate-50 p-4">
                                                                    {item.icon === "award" ? (
                                                                        <Award className="shrink-0 text-amber-500" size={24} />
                                                                    ) : (
                                                                        <ShieldCheck className="shrink-0 text-emerald-500" size={24} />
                                                                    )}
                                                                    <div>
                                                                        <h5 className="font-semibold text-slate-900">{item.title}</h5>
                                                                        <span className="text-sm text-slate-500">{item.subtitle}</span>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </TabsContent>
                                                </Tabs>

                                                <div className="mt-10 border-t border-slate-100 pt-8">
                                                    <div className="text-center">
                                                        <p className="font-bold text-slate-900">{previewData.directorName}</p>
                                                        <p className="text-sm text-slate-500">{previewData.directorTitle}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </section>
                            )}
                            zoomValue={aboutImageScale}
                            onZoomChange={(imageScale) => setSettings({ ...settings, imageScale })}
                            opacityValue={aboutImageOpacity}
                            onOpacityChange={(imageOpacity) => setSettings({ ...settings, imageOpacity })}
                            blurValue={aboutImageBlur}
                            onBlurChange={(imageBlur) => setSettings({ ...settings, imageBlur })}
                            onChange={(imagePosition) => setSettings({ ...settings, imagePosition })}
                        />
                    </div>
                </div>
            </div>

            {/* History */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 space-y-6">
                <h2 className="text-lg font-bold text-slate-900">History</h2>
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">History Content</label>
                    <textarea
                        value={settings.history}
                        onChange={(e) => setSettings({ ...settings, history: e.target.value })}
                        rows={4}
                        className="w-full border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    />
                </div>
            </div>

            {/* Mission & Vision */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 space-y-6">
                    <h2 className="text-lg font-bold text-slate-900">Mission</h2>
                    <div>
                        <textarea
                            value={settings.mission}
                            onChange={(e) => setSettings({ ...settings, mission: e.target.value })}
                            rows={4}
                            className="w-full border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                        />
                    </div>
                </div>

                <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 space-y-6">
                    <h2 className="text-lg font-bold text-slate-900">Vision</h2>
                    <div>
                        <textarea
                            value={settings.vision}
                            onChange={(e) => setSettings({ ...settings, vision: e.target.value })}
                            rows={4}
                            className="w-full border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                        />
                    </div>
                </div>
            </div>

            {/* Accreditation */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 space-y-6">
                <div className="flex items-center justify-between">
                    <h2 className="text-lg font-bold text-slate-900">Accreditation</h2>
                    <button
                        type="button"
                        onClick={addAccreditationItem}
                        className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 font-medium"
                    >
                        + Add Award
                    </button>
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Introduction Text</label>
                    <textarea
                        value={settings.accreditation}
                        onChange={(e) => setSettings({ ...settings, accreditation: e.target.value })}
                        rows={2}
                        className="w-full border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    />
                </div>
                <div className="space-y-4">
                    {settings.accreditationItems.map((item, index) => (
                        <div key={index} className="flex gap-3 items-start p-4 bg-slate-50 rounded-xl">
                            <select
                                value={item.icon}
                                onChange={(e) => updateAccreditationItem(index, "icon", e.target.value)}
                                className="border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="award">Award</option>
                                <option value="shield">Shield</option>
                            </select>
                            <input
                                type="text"
                                value={item.title}
                                onChange={(e) => updateAccreditationItem(index, "title", e.target.value)}
                                placeholder="Award Title"
                                className="flex-1 border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <input
                                type="text"
                                value={item.subtitle}
                                onChange={(e) => updateAccreditationItem(index, "subtitle", e.target.value)}
                                placeholder="Subtitle"
                                className="w-32 border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <button
                                type="button"
                                onClick={() => removeAccreditationItem(index)}
                                className="text-red-500 hover:text-red-700 p-2"
                            >
                                ✕
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            {/* Director */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 space-y-6">
                <h2 className="text-lg font-bold text-slate-900">Chief Medical Director</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Name</label>
                        <input
                            type="text"
                            value={settings.directorName}
                            onChange={(e) => setSettings({ ...settings, directorName: e.target.value })}
                            className="w-full border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Title</label>
                        <input
                            type="text"
                            value={settings.directorTitle}
                            onChange={(e) => setSettings({ ...settings, directorTitle: e.target.value })}
                            className="w-full border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
