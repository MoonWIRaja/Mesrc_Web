"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Plus, Pencil, Trash2, Save, X, Eye, EyeOff, Loader2, RefreshCw, Upload } from "lucide-react";
import { Service } from "@/lib/data/store";
import { ImagePositionField } from "@/components/admin/ImagePositionField";
import {
    resolveImageBlur,
    resolveImageOpacity,
    resolveImagePresentationStyle,
    resolveImageScale,
} from "@/lib/image-position";

export default function ServicesAdminPage() {
    const [services, setServices] = useState<Service[]>([]);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [isAdding, setIsAdding] = useState(false);
    const [editForm, setEditForm] = useState<Partial<Service>>({});
    const [message, setMessage] = useState({ type: "", text: "" });
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const imageInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        loadServices();
    }, []);

    const loadServices = async () => {
        setIsLoading(true);
        try {
            const res = await fetch("/api/data?section=services");
            const data = await res.json();
            if (data.data) {
                setServices(data.data);
            }
        } catch (error) {
            console.error("Failed to load services:", error);
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
            const res = await fetch("/api/data?section=services", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(services),
            });
            const data = await res.json();

            if (data.success) {
                setMessage({ type: "success", text: "All services saved! Landing page will now show these changes." });
            } else {
                throw new Error(data.error);
            }
        } catch (error) {
            setMessage({ type: "error", text: "Failed to save services." });
        } finally {
            setIsSaving(false);
        }
        setTimeout(() => setMessage({ type: "", text: "" }), 5000);
    };

    const handleEdit = (service: Service) => {
        setEditingId(service.id);
        setEditForm({ ...service, details: service.details || "" });
    };

    const handleSaveEdit = () => {
        if (editingId && editForm) {
            setServices(services.map(s =>
                s.id === editingId ? { ...s, ...editForm } as Service : s
            ));
            setMessage({ type: "success", text: "Service updated locally. Click 'Save All Changes' to publish." });
        }
        setEditingId(null);
        setEditForm({});
        setTimeout(() => setMessage({ type: "", text: "" }), 3000);
    };

    const handleAdd = () => {
        const newService: Service = {
            id: Date.now().toString(),
            title: editForm.title || "New Service",
            description: editForm.description || "",
            details: editForm.details || "",
            price: editForm.price || "",
            icon: editForm.icon || "Activity",
            image: editForm.image || "",
            imagePosition: editForm.imagePosition,
            imageScale: editForm.imageScale,
            imageOpacity: editForm.imageOpacity,
            imageBlur: editForm.imageBlur,
            features: editForm.features || [],
            order: services.length + 1,
            isActive: true,
        };
        setServices([...services, newService]);
        setIsAdding(false);
        setEditForm({});
        setMessage({ type: "success", text: "Service added locally. Click 'Save All Changes' to publish." });
        setTimeout(() => setMessage({ type: "", text: "" }), 3000);
    };

    const handleDelete = (id: string) => {
        if (confirm("Are you sure you want to delete this service?")) {
            setServices(services.filter(s => s.id !== id));
            setMessage({ type: "success", text: "Service removed locally. Click 'Save All Changes' to publish." });
            setTimeout(() => setMessage({ type: "", text: "" }), 3000);
        }
    };

    const toggleActive = (id: string) => {
        setServices(services.map(s =>
            s.id === id ? { ...s, isActive: !s.isActive } : s
        ));
    };

    const previewService = {
        title: editForm.title || "Service Title",
        description: editForm.description || "Service description preview for the card layout.",
        image: editForm.image || "",
        imagePosition: editForm.imagePosition,
        imageScale: editForm.imageScale,
        imageOpacity: editForm.imageOpacity,
        imageBlur: editForm.imageBlur,
    };
    const serviceImageScale = resolveImageScale(editForm.imageScale);
    const serviceImageOpacity = resolveImageOpacity(editForm.imageOpacity);
    const serviceImageBlur = resolveImageBlur(editForm.imageBlur);

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
                    <h1 className="text-2xl md:text-3xl font-bold text-slate-900">Services</h1>
                    <p className="text-slate-500 mt-1">Manage services - changes appear on landing page after saving</p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={loadServices}
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
                    onClick={() => { setIsAdding(true); setEditForm({ details: "" }); }}
                    className="inline-flex items-center gap-2 border border-dashed border-slate-300 hover:border-blue-400 hover:bg-blue-50 text-slate-600 hover:text-blue-600 font-medium px-6 py-4 rounded-xl transition-colors w-full justify-center"
                >
                    <Plus className="w-5 h-5" />
                    Add New Service
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
                        <h3 className="text-lg font-bold text-slate-900">Add New Service</h3>
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
                        <label className="block text-sm font-medium text-slate-700 mb-2">Description</label>
                        <textarea
                            value={editForm.description || ""}
                            onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                            rows={2}
                            className="w-full border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
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
                            label="Service Image Focus"
                            description="preview bawah ni ikut bentuk card service di landing page, tapi dikecilkan untuk editor."
                            previewViewportWidth={760}
                            previewFrameClassName="overflow-hidden rounded-xl border border-slate-200 bg-white"
                            previewContent={(
                                <div className="bg-slate-50 p-6">
                                    <div className="group flex h-full w-full flex-col overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm sm:flex-row">
                                        <div className="relative h-56 shrink-0 overflow-hidden bg-slate-100 sm:h-auto sm:min-h-full sm:w-2/5">
                                            <img
                                                src={previewService.image}
                                                alt={previewService.title}
                                                className="absolute inset-0 h-full w-full object-cover"
                                                style={resolveImagePresentationStyle(previewService)}
                                            />
                                        </div>

                                        <div className="flex grow flex-col p-6 md:p-8">
                                            <h4 className="mb-3 min-h-[3.5rem] text-xl font-bold leading-tight text-slate-900">
                                                {previewService.title}
                                            </h4>
                                            <p className="mb-6 line-clamp-4 min-h-[6rem] text-sm font-semibold leading-6 text-blue-600">
                                                {previewService.description}
                                            </p>

                                            <div className="mt-auto flex flex-col gap-3 border-t border-slate-50 pt-4">
                                                <div className="w-full rounded-xl border-2 border-slate-200 py-2.5 text-center font-semibold text-slate-700">
                                                    Learn More
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                            zoomValue={serviceImageScale}
                            onZoomChange={(imageScale) => setEditForm({ ...editForm, imageScale })}
                            opacityValue={serviceImageOpacity}
                            onOpacityChange={(imageOpacity) => setEditForm({ ...editForm, imageOpacity })}
                            blurValue={serviceImageBlur}
                            onBlurChange={(imageBlur) => setEditForm({ ...editForm, imageBlur })}
                            onChange={(imagePosition) => setEditForm({ ...editForm, imagePosition })}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">About Treatment (one per line)</label>
                        <textarea
                            value={(editForm.details || "").split("\n").join("\n")}
                            onChange={(e) => setEditForm({ ...editForm, details: e.target.value })}
                            rows={5}
                            className="w-full border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                            placeholder="Treatment point 1&#10;Treatment point 2&#10;Treatment point 3"
                        />
                    </div>
                    <div className="flex justify-end gap-3">
                        <button
                            onClick={() => setIsAdding(false)}
                            className="px-4 py-2 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleAdd}
                            className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
                        >
                            Add Service
                        </button>
                    </div>
                </motion.div>
            )}

            {/* Services List */}
            <div className="space-y-4">
                {services.map((service) => (
                    <motion.div
                        key={service.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`overflow-hidden rounded-2xl bg-white shadow-sm border ${service.isActive ? "border-slate-100" : "border-slate-200 opacity-60"}`}
                    >
                        {editingId === service.id ? (
                            <div className="space-y-4 p-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2">Title</label>
                                        <input
                                            type="text"
                                            value={editForm.title || ""}
                                            onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                                            className="w-full border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">Description</label>
                                    <textarea
                                        value={editForm.description || ""}
                                        onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                                        rows={2}
                                        className="w-full border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">Image</label>
                                    <div className="flex gap-2">
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
                                            className="inline-flex items-center gap-2 border border-slate-200 hover:bg-slate-50 text-slate-700 px-3 py-2 rounded-xl transition-colors disabled:opacity-70"
                                        >
                                            {isUploading ? (
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                            ) : (
                                                <Upload className="w-4 h-4" />
                                            )}
                                        </button>
                                    </div>
                                </div>
                                <ImagePositionField
                                    imageUrl={editForm.image}
                                    position={editForm.imagePosition}
                                    label="Service Image Focus"
                                    description="preview bawah ni ikut bentuk card service di landing page, tapi dikecilkan untuk editor."
                                    previewViewportWidth={760}
                                    previewFrameClassName="overflow-hidden rounded-xl border border-slate-200 bg-white"
                                    previewContent={(
                                        <div className="bg-slate-50 p-6">
                                            <div className="group flex h-full w-full flex-col overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm sm:flex-row">
                                                <div className="relative h-56 shrink-0 overflow-hidden bg-slate-100 sm:h-auto sm:min-h-full sm:w-2/5">
                                                    <img
                                                        src={previewService.image}
                                                        alt={previewService.title}
                                                        className="absolute inset-0 h-full w-full object-cover"
                                                        style={resolveImagePresentationStyle(previewService)}
                                                    />
                                                </div>

                                                <div className="flex grow flex-col p-6 md:p-8">
                                                    <h4 className="mb-3 min-h-[3.5rem] text-xl font-bold leading-tight text-slate-900">
                                                        {previewService.title}
                                                    </h4>
                                                    <p className="mb-6 line-clamp-4 min-h-[6rem] text-sm font-semibold leading-6 text-blue-600">
                                                        {previewService.description}
                                                    </p>

                                                    <div className="mt-auto flex flex-col gap-3 border-t border-slate-50 pt-4">
                                                        <div className="w-full rounded-xl border-2 border-slate-200 py-2.5 text-center font-semibold text-slate-700">
                                                            Learn More
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                    zoomValue={serviceImageScale}
                                    onZoomChange={(imageScale) => setEditForm({ ...editForm, imageScale })}
                                    opacityValue={serviceImageOpacity}
                                    onOpacityChange={(imageOpacity) => setEditForm({ ...editForm, imageOpacity })}
                                    blurValue={serviceImageBlur}
                                    onBlurChange={(imageBlur) => setEditForm({ ...editForm, imageBlur })}
                                    onChange={(imagePosition) => setEditForm({ ...editForm, imagePosition })}
                                />
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">About Treatment (one per line)</label>
                                    <textarea
                                        value={(editForm.details || "").split("\n").join("\n")}
                                        onChange={(e) => setEditForm({ ...editForm, details: e.target.value })}
                                        rows={5}
                                        className="w-full border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                                        placeholder="Treatment point 1&#10;Treatment point 2&#10;Treatment point 3"
                                    />
                                </div>
                                <div className="flex justify-end gap-3">
                                    <button
                                        onClick={() => { setEditingId(null); setEditForm({}); }}
                                        className="px-4 py-2 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleSaveEdit}
                                        className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
                                    >
                                        <Save size={16} />
                                        Save
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="group flex h-full w-full flex-col sm:flex-row">
                                <div className="relative h-56 shrink-0 overflow-hidden bg-slate-100 sm:h-auto sm:min-h-full sm:w-2/5">
                                    {service.image ? (
                                        <img
                                            src={service.image}
                                            alt={service.title}
                                            className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                                            style={resolveImagePresentationStyle(service)}
                                        />
                                    ) : (
                                        <div className="flex h-full w-full items-center justify-center text-slate-400">
                                            No Image
                                        </div>
                                    )}
                                    {!service.isActive && (
                                        <div className="absolute right-3 top-3 rounded-full bg-slate-800/70 px-2 py-1 text-xs text-white">
                                            Hidden
                                        </div>
                                    )}
                                </div>
                                <div className="flex grow flex-col p-6 md:p-8">
                                    <div className="mb-3">
                                        <h3 className="min-h-[3.5rem] text-xl font-bold leading-tight text-slate-900">{service.title}</h3>
                                    </div>
                                    <p className="mb-6 line-clamp-4 min-h-[6rem] text-sm font-semibold leading-6 text-blue-600">{service.description}</p>
                                    {service.details && (
                                        <div className="mb-6 rounded-xl bg-slate-50 p-4">
                                            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-500">About Treatment</p>
                                            <ul className="space-y-2">
                                                {service.details.split("\n").filter(line => line.trim()).map((point, i) => (
                                                    <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                                                        <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-600" />
                                                        {point.trim()}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                    <div className="mt-auto flex items-center justify-end gap-2 border-t border-slate-50 pt-4">
                                        <button
                                            onClick={() => toggleActive(service.id)}
                                            className="p-2 rounded-lg hover:bg-slate-100 text-slate-500"
                                            title={service.isActive ? "Hide" : "Show"}
                                        >
                                            {service.isActive ? <Eye size={18} /> : <EyeOff size={18} />}
                                        </button>
                                        <button
                                            onClick={() => handleEdit(service)}
                                            className="p-2 rounded-lg hover:bg-slate-100 text-slate-500"
                                        >
                                            <Pencil size={18} />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(service.id)}
                                            className="p-2 rounded-lg hover:bg-red-50 text-red-500"
                                        >
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
