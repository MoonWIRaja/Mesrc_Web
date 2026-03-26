"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Plus, Pencil, Trash2, Save, X, Eye, EyeOff, Calendar, Loader2, RefreshCw, Upload, Clock } from "lucide-react";
import { DatetimePicker } from "@/components/ui/datetime-picker";
import { ImagePositionField } from "@/components/admin/ImagePositionField";
import { PromotionCard } from "@/components/sections/PromotionCard";
import {
    resolveImageBlur,
    resolveImageOpacity,
    resolveImagePresentationStyle,
    resolveImageScale,
} from "@/lib/image-position";
import "@/styles/datepicker.css";

interface Promotion {
    id: string;
    title: string;
    description: string;
    image: string;
    imagePosition?: string;
    imageScale?: number;
    imageOpacity?: number;
    imageBlur?: number;
    discount: string;
    tags: string[];
    whatsappMessage: string;
    startDate: string;
    endDate: string;
    isActive: boolean;
}

export default function PromotionsAdminPage() {
    const [promotions, setPromotions] = useState<Promotion[]>([]);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [isAdding, setIsAdding] = useState(false);
    const [editForm, setEditForm] = useState<Partial<Promotion>>({});
    const [message, setMessage] = useState({ type: "", text: "" });
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const imageInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        loadPromotions();
    }, []);

    const loadPromotions = async () => {
        setIsLoading(true);
        try {
            const res = await fetch("/api/data?section=promotions");
            const data = await res.json();
            if (data.data) {
                setPromotions(data.data);
            }
        } catch (error) {
            console.error("Failed to load promotions:", error);
        }
        setIsLoading(false);
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
                setEditForm({ ...editForm, image: data.url });
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

    const handleSaveAll = async () => {
        setIsSaving(true);
        setMessage({ type: "", text: "" });

        try {
            const res = await fetch("/api/data?section=promotions", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(promotions),
            });
            const data = await res.json();

            if (data.success) {
                setMessage({ type: "success", text: "All promotions saved! Landing page will now show these changes." });
            } else {
                throw new Error(data.error);
            }
        } catch (error) {
            setMessage({ type: "error", text: "Failed to save promotions." });
        } finally {
            setIsSaving(false);
        }
        setTimeout(() => setMessage({ type: "", text: "" }), 5000);
    };

    const handleEdit = (promotion: Promotion) => {
        setEditingId(promotion.id);
        setEditForm({ ...promotion, tags: promotion.tags || [] });
    };

    const handleSave = () => {
        if (editingId && editForm) {
            setPromotions(promotions.map(p =>
                p.id === editingId ? { ...p, ...editForm } as Promotion : p
            ));
            setMessage({ type: "success", text: "Promotion updated successfully!" });
        }
        setEditingId(null);
        setEditForm({});
        setTimeout(() => setMessage({ type: "", text: "" }), 3000);
    };

    const handleAdd = () => {
        const newPromotion: Promotion = {
            id: Date.now().toString(),
            title: editForm.title || "New Promotion",
            description: editForm.description || "",
            image: editForm.image || "",
            imagePosition: editForm.imagePosition,
            imageScale: editForm.imageScale,
            imageOpacity: editForm.imageOpacity,
            imageBlur: editForm.imageBlur,
            discount: editForm.discount || "Discount",
            tags: editForm.tags || [],
            whatsappMessage: editForm.whatsappMessage || "Hi, I'm interested in this promotion.",
            startDate: editForm.startDate || new Date().toISOString(),
            endDate: editForm.endDate || new Date(Date.now() + 30 * 24 * 60 * 1000).toISOString(),
            isActive: true,
        };
        setPromotions([...promotions, newPromotion]);
        setIsAdding(false);
        setEditForm({});
        setMessage({ type: "success", text: "Promotion added successfully!" });
        setTimeout(() => setMessage({ type: "", text: "" }), 3000);
    };

    const handleDelete = (id: string) => {
        if (confirm("Are you sure you want to delete this promotion?")) {
            setPromotions(promotions.filter(p => p.id !== id));
            setMessage({ type: "success", text: "Promotion deleted successfully!" });
            setTimeout(() => setMessage({ type: "", text: "" }), 3000);
        }
    };

    const toggleActive = (id: string) => {
        setPromotions(promotions.map(p =>
            p.id === id ? { ...p, isActive: !p.isActive } : p
        ));
    };

    const isExpired = (endDate: string) => {
        return new Date(endDate) < new Date();
    };

    const previewPromotion = {
        title: editForm.title || "Promotion Title",
        description: editForm.description || "Promotion details preview for the landing page card.",
        image: editForm.image || "",
        imagePosition: editForm.imagePosition,
        imageScale: editForm.imageScale,
        imageOpacity: editForm.imageOpacity,
        imageBlur: editForm.imageBlur,
    };
    const promotionImageScale = resolveImageScale(editForm.imageScale);
    const promotionImageOpacity = resolveImageOpacity(editForm.imageOpacity);
    const promotionImageBlur = resolveImageBlur(editForm.imageBlur);
    const promotionPreviewContent = (
        <div className="bg-blue-600 p-6">
            <div className="mx-auto w-[28rem]">
                <PromotionCard promo={previewPromotion} />
            </div>
        </div>
    );

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-slate-900">Promotions</h1>
                    <p className="text-slate-500 mt-1">Manage promotions and special offers - changes appear on landing page after saving</p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={loadPromotions}
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
                                Save All Changes
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

            {/* Hidden file input for image upload */}
            <input
                type="file"
                ref={imageInputRef}
                onChange={handleImageUpload}
                accept="image/jpeg,image/png,image/webp,image/gif"
                className="hidden"
            />

            {/* Add New Button */}
            {!isAdding && (
                <button
                    onClick={() => { setIsAdding(true); setEditForm({ tags: [] }); }}
                    className="inline-flex items-center gap-2 border border-dashed border-slate-300 hover:border-blue-400 hover:bg-blue-50 text-slate-600 hover:text-blue-600 font-medium px-6 py-4 rounded-xl transition-colors w-full justify-center"
                >
                    <Plus className="w-5 h-5" />
                    Add New Promotion
                </button>
            )}

            {/* Add New Form */}
            {isAdding && (
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-blue-50 border border-blue-200 rounded-2xl p-6 space-y-4"
                >
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-bold text-slate-900">Add New Promotion</h3>
                        <button onClick={() => setIsAdding(false)} className="text-slate-500 hover:text-slate-700">
                            <X size={20} />
                        </button>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Title</label>
                        <input
                            type="text"
                            value={editForm.title || ""}
                            onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                            className="w-full border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Description (one per line)</label>
                        <textarea
                            value={editForm.description || ""}
                            onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                            rows={4}
                            className="w-full border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                            placeholder="Benefit point 1&#10;Benefit point 2&#10;Benefit point 3"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Image</label>
                        <div className="flex gap-3">
                            <input
                                type="text"
                                value={editForm.image || ""}
                                onChange={(e) => setEditForm({ ...editForm, image: e.target.value })}
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
                        <ImagePositionField
                            imageUrl={editForm.image}
                            position={editForm.imagePosition}
                            label="Promotion Image Focus"
                            description="preview bawah ni ikut bentuk card promotion di landing page, tapi dikecilkan untuk editor."
                            previewViewportWidth={496}
                            previewFrameClassName="overflow-hidden rounded-xl border border-slate-200 bg-blue-600"
                            previewContent={promotionPreviewContent}
                            zoomValue={promotionImageScale}
                            onZoomChange={(imageScale) => setEditForm({ ...editForm, imageScale })}
                            opacityValue={promotionImageOpacity}
                            onOpacityChange={(imageOpacity) => setEditForm({ ...editForm, imageOpacity })}
                            blurValue={promotionImageBlur}
                            onBlurChange={(imageBlur) => setEditForm({ ...editForm, imageBlur })}
                            onChange={(imagePosition) => setEditForm({ ...editForm, imagePosition })}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Start Date & Time</label>
                        <DatetimePicker
                            value={editForm.startDate ? new Date(editForm.startDate) : undefined}
                            onChange={(date) => setEditForm({ ...editForm, startDate: date?.toISOString() || "" })}
                            placeholder="Select start date & time"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">End Date & Time</label>
                        <DatetimePicker
                            value={editForm.endDate ? new Date(editForm.endDate) : undefined}
                            onChange={(date) => setEditForm({ ...editForm, endDate: date?.toISOString() || "" })}
                            placeholder="Select end date & time"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">WhatsApp Message</label>
                        <input
                            type="text"
                            value={editForm.whatsappMessage || ""}
                            onChange={(e) => setEditForm({ ...editForm, whatsappMessage: e.target.value })}
                            className="w-full border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Hi, I'm interested in this promotion..."
                        />
                        <p className="text-xs text-slate-500 mt-1">This message will be pre-filled when users click the WhatsApp button</p>
                    </div>
                    <div className="flex justify-end gap-3">
                        <button onClick={() => setIsAdding(false)} className="px-4 py-2 border border-slate-200 rounded-xl hover:bg-slate-50">Cancel</button>
                        <button onClick={handleAdd} className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700">Add Promotion</button>
                    </div>
                </motion.div>
            )}

            {/* Promotions List */}
            <div className="space-y-4">
                {promotions.map((promotion) => (
                    <motion.div
                        key={promotion.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`bg-white rounded-2xl overflow-hidden shadow-sm border ${promotion.isActive ? "border-slate-100" : "border-slate-200 opacity-60"}`}
                    >
                        {editingId === promotion.id ? (
                            <div className="p-4 space-y-3">
                                <div className="flex items-center justify-between">
                                    <h3 className="font-bold text-slate-900">Edit Promotion</h3>
                                    <button onClick={() => { setEditingId(null); setEditForm({}); }} className="text-slate-500 hover:text-slate-700">
                                        <X size={18} />
                                    </button>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Title</label>
                                    <input
                                        type="text"
                                        value={editForm.title || ""}
                                        onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                                        className="w-full border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Description (one per line)</label>
                                    <textarea
                                        value={editForm.description || ""}
                                        onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                                        rows={3}
                                        className="w-full border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                                        placeholder="Benefit point 1&#10;Benefit point 2&#10;Benefit point 3"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Image</label>
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            value={editForm.image || ""}
                                            onChange={(e) => setEditForm({ ...editForm, image: e.target.value })}
                                            className="flex-1 border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => imageInputRef.current?.click()}
                                            disabled={isUploading}
                                            className="inline-flex items-center gap-2 border border-slate-200 hover:bg-slate-50 text-slate-700 px-3 py-2 rounded-xl transition-colors disabled:opacity-70"
                                        >
                                            {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                                        </button>
                                    </div>
                                </div>
                                <ImagePositionField
                                    imageUrl={editForm.image}
                                    position={editForm.imagePosition}
                                    label="Promotion Image Focus"
                                    description="preview bawah ni ikut bentuk card promotion di landing page, tapi dikecilkan untuk editor."
                                    previewViewportWidth={496}
                                    previewFrameClassName="overflow-hidden rounded-xl border border-slate-200 bg-blue-600"
                                    previewContent={promotionPreviewContent}
                                    zoomValue={promotionImageScale}
                                    onZoomChange={(imageScale) => setEditForm({ ...editForm, imageScale })}
                                    opacityValue={promotionImageOpacity}
                                    onOpacityChange={(imageOpacity) => setEditForm({ ...editForm, imageOpacity })}
                                    blurValue={promotionImageBlur}
                                    onBlurChange={(imageBlur) => setEditForm({ ...editForm, imageBlur })}
                                    onChange={(imagePosition) => setEditForm({ ...editForm, imagePosition })}
                                />
                                <div className="space-y-2">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Start Date & Time</label>
                                        <DatetimePicker
                                            value={editForm.startDate ? new Date(editForm.startDate) : undefined}
                                            onChange={(date) => setEditForm({ ...editForm, startDate: date?.toISOString() || "" })}
                                            placeholder="Select start date & time"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">End Date & Time</label>
                                        <DatetimePicker
                                            value={editForm.endDate ? new Date(editForm.endDate) : undefined}
                                            onChange={(date) => setEditForm({ ...editForm, endDate: date?.toISOString() || "" })}
                                            placeholder="Select end date & time"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">WhatsApp Message</label>
                                    <input
                                        type="text"
                                        value={editForm.whatsappMessage || ""}
                                        onChange={(e) => setEditForm({ ...editForm, whatsappMessage: e.target.value })}
                                        className="w-full border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => { setEditingId(null); setEditForm({}); }}
                                        className="flex-1 px-3 py-2 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={() => {
                                            if (editingId && editForm) {
                                                setPromotions(promotions.map(p =>
                                                    p.id === editingId ? { ...p, ...editForm } as Promotion : p
                                                ));
                                                setMessage({ type: "success", text: "Promotion updated locally. Click 'Save All Changes' to publish." });
                                                setEditingId(null);
                                                setEditForm({});
                                                setTimeout(() => setMessage({ type: "", text: "" }), 3000);
                                            }
                                        }}
                                        className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                    >
                                        Save
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="group flex h-full w-full flex-col sm:flex-row">
                                <div className="relative h-56 shrink-0 overflow-hidden bg-slate-100 sm:h-auto sm:min-h-full sm:w-2/5">
                                    {promotion.image ? (
                                        <img
                                            src={promotion.image}
                                            alt={promotion.title}
                                            className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                                            style={resolveImagePresentationStyle(promotion)}
                                        />
                                    ) : (
                                        <div className="flex h-full w-full items-center justify-center text-slate-400">
                                            No Image
                                        </div>
                                    )}
                                    {isExpired(promotion.endDate) && (
                                        <div className="absolute right-3 top-3 rounded-full bg-red-500 px-2 py-1 text-xs text-white">
                                            Expired
                                        </div>
                                    )}
                                    {!promotion.isActive && !isExpired(promotion.endDate) && (
                                        <div className="absolute right-3 top-3 rounded-full bg-slate-800/70 px-2 py-1 text-xs text-white">
                                            Hidden
                                        </div>
                                    )}
                                </div>
                                <div className="flex grow flex-col p-6 md:p-8">
                                    <div className="mb-3">
                                        <h3 className="min-h-[3.5rem] text-xl font-bold leading-tight text-slate-900">{promotion.title}</h3>
                                    </div>
                                    <p className="mb-6 line-clamp-4 min-h-[6rem] text-sm font-semibold leading-6 text-blue-600">
                                        {promotion.description.split("\n").filter(line => line.trim()).join(" ")}
                                    </p>
                                    <div className="mb-6 rounded-xl bg-slate-50 p-4">
                                        <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-500">Promotion Schedule</p>
                                        <ul className="space-y-2">
                                            <li className="flex items-start gap-2 text-sm text-slate-600">
                                                <Clock size={14} className="mt-0.5 shrink-0 text-blue-600" />
                                                <span><span className="font-medium text-slate-700">Start:</span> {new Date(promotion.startDate).toLocaleDateString("en-MY")}</span>
                                            </li>
                                            <li className="flex items-start gap-2 text-sm text-slate-600">
                                                <Calendar size={14} className="mt-0.5 shrink-0 text-blue-600" />
                                                <span><span className="font-medium text-slate-700">End:</span> {new Date(promotion.endDate).toLocaleDateString("en-MY")}</span>
                                            </li>
                                        </ul>
                                    </div>
                                    <div className="mt-auto flex items-center justify-end gap-2 border-t border-slate-50 pt-4">
                                        <button onClick={() => toggleActive(promotion.id)} className="p-2 rounded-lg hover:bg-slate-100 text-slate-500">
                                            {promotion.isActive ? <Eye size={18} /> : <EyeOff size={18} />}
                                        </button>
                                        <button onClick={() => handleEdit(promotion)} className="p-2 rounded-lg hover:bg-slate-100 text-slate-500">
                                            <Pencil size={18} />
                                        </button>
                                        <button onClick={() => handleDelete(promotion.id)} className="p-2 rounded-lg hover:bg-red-50 text-red-500">
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
