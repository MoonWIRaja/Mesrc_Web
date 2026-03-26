"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Plus, Pencil, Trash2, Save, X, Eye, EyeOff, Loader2, RefreshCw, Upload } from "lucide-react";
import { Doctor } from "@/lib/data/store";
import { ImagePositionField } from "@/components/admin/ImagePositionField";
import {
    resolveImageBlur,
    resolveImageOpacity,
    resolveImagePresentationStyle,
    resolveImageScale,
} from "@/lib/image-position";

export default function DoctorsAdminPage() {
    const [doctors, setDoctors] = useState<Doctor[]>([]);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [isAdding, setIsAdding] = useState(false);
    const [editForm, setEditForm] = useState<Partial<Doctor>>({});
    const [message, setMessage] = useState({ type: "", text: "" });
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadMode, setUploadMode] = useState<"add" | "edit" | null>(null);
    const imageInputRef = useRef<HTMLInputElement>(null);

    // Load doctors from API
    useEffect(() => {
        loadDoctors();
    }, []);

    const loadDoctors = async () => {
        setIsLoading(true);
        try {
            const res = await fetch("/api/data?section=doctors");
            const data = await res.json();
            if (data.data) {
                setDoctors(data.data);
            }
        } catch (error) {
            console.error("Failed to load doctors:", error);
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
            setUploadMode(null);
            setTimeout(() => setMessage({ type: "", text: "" }), 3000);
        }
    };

    const openImageUpload = (mode: "add" | "edit") => {
        setUploadMode(mode);
        imageInputRef.current?.click();
    };

    const handleSaveAll = async () => {
        setIsSaving(true);
        setMessage({ type: "", text: "" });

        try {
            const res = await fetch("/api/data?section=doctors", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(doctors),
            });
            const data = await res.json();

            if (data.success) {
                setMessage({ type: "success", text: "All doctors saved! Landing page will now show these changes." });
            } else {
                throw new Error(data.error);
            }
        } catch (error) {
            setMessage({ type: "error", text: "Failed to save doctors." });
        } finally {
            setIsSaving(false);
        }
        setTimeout(() => setMessage({ type: "", text: "" }), 5000);
    };

    const handleEdit = (doctor: Doctor) => {
        setEditingId(doctor.id);
        setEditForm({ ...doctor });
    };

    const handleSaveEdit = () => {
        if (editingId && editForm) {
            setDoctors(doctors.map(d =>
                d.id === editingId ? { ...d, ...editForm } as Doctor : d
            ));
            setMessage({ type: "success", text: "Doctor updated locally. Click 'Save All Changes' to publish." });
        }
        setEditingId(null);
        setEditForm({});
        setTimeout(() => setMessage({ type: "", text: "" }), 3000);
    };

    const handleAdd = () => {
        const newDoctor: Doctor = {
            id: Date.now().toString(),
            name: editForm.name || "New Doctor",
            specialty: editForm.specialty || "",
            qualifications: editForm.qualifications || "",
            experience: editForm.experience || 0,
            image: editForm.image || "",
            imagePosition: editForm.imagePosition,
            imageScale: editForm.imageScale,
            imageOpacity: editForm.imageOpacity,
            imageBlur: editForm.imageBlur,
            bio: editForm.bio || "",
            isActive: true,
        };
        setDoctors([...doctors, newDoctor]);
        setIsAdding(false);
        setEditForm({});
        setMessage({ type: "success", text: "Doctor added locally. Click 'Save All Changes' to publish." });
        setTimeout(() => setMessage({ type: "", text: "" }), 3000);
    };

    const handleDelete = (id: string) => {
        if (confirm("Are you sure you want to delete this doctor?")) {
            setDoctors(doctors.filter(d => d.id !== id));
            setMessage({ type: "success", text: "Doctor removed locally. Click 'Save All Changes' to publish." });
            setTimeout(() => setMessage({ type: "", text: "" }), 3000);
        }
    };

    const toggleActive = (id: string) => {
        setDoctors(doctors.map(d =>
            d.id === id ? { ...d, isActive: !d.isActive } : d
        ));
    };

    const previewDoctor = {
        name: editForm.name || "Doctor Name",
        specialty: editForm.specialty || "Ophthalmology Specialist",
        qualifications: editForm.qualifications || "MD, MMED (Ophthalmology)",
        experience: editForm.experience || 0,
        bio: editForm.bio || "Doctor biography preview.",
        image: editForm.image || "",
        imagePosition: editForm.imagePosition,
        imageScale: editForm.imageScale,
        imageOpacity: editForm.imageOpacity,
        imageBlur: editForm.imageBlur,
    };
    const doctorImageScale = resolveImageScale(editForm.imageScale);
    const doctorImageOpacity = resolveImageOpacity(editForm.imageOpacity);
    const doctorImageBlur = resolveImageBlur(editForm.imageBlur);
    const doctorPreviewContent = (
        <div className="bg-white p-6">
            <div className="group flex h-full w-full flex-col overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm sm:flex-row">
                <div className="relative h-64 shrink-0 overflow-hidden bg-slate-100 sm:h-auto sm:min-h-full sm:w-2/5">
                    <img
                        src={previewDoctor.image}
                        alt={previewDoctor.name}
                        className="absolute inset-0 h-full w-full object-cover"
                        style={resolveImagePresentationStyle(previewDoctor)}
                    />
                </div>

                <div className="flex grow flex-col p-6">
                    <h4 className="mb-2 min-h-[5.5rem] line-clamp-3 text-xl font-bold text-slate-900">
                        {previewDoctor.name}
                    </h4>
                    <p className="mb-4 min-h-[2.5rem] text-sm font-medium text-blue-600">
                        {previewDoctor.specialty}
                    </p>

                    <div className="mb-6 min-h-[5.5rem] space-y-2 text-sm text-slate-600">
                        <p className="flex justify-between border-b border-slate-50 pb-2">
                            <span className="text-slate-400">Qualifications:</span>
                            <span className="max-w-[60%] text-right font-medium">{previewDoctor.qualifications}</span>
                        </p>
                        <p className="flex justify-between border-b border-slate-50 pb-2">
                            <span className="text-slate-400">Experience:</span>
                            <span className="text-right font-medium">{previewDoctor.experience}+ years</span>
                        </p>
                    </div>

                    <div className="mt-auto rounded-xl border border-slate-100 bg-slate-50 py-3 text-center font-semibold text-blue-600">
                        Learn More
                    </div>
                </div>
            </div>
        </div>
    );

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
                    <h1 className="text-2xl md:text-3xl font-bold text-slate-900">Doctors</h1>
                    <p className="text-slate-500 mt-1">Manage doctors - changes appear on landing page after saving</p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={loadDoctors}
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
                onChange={(e) => {
                    handleImageUpload(e);
                    // Reset the input value so the same file can be selected again
                    e.target.value = "";
                }}
                accept="image/jpeg,image/png,image/webp,image/gif"
                className="hidden"
            />

            {/* Add New Button */}
            {!isAdding && (
                <button
                    onClick={() => { setIsAdding(true); setEditForm({}); }}
                    className="inline-flex items-center gap-2 border border-dashed border-slate-300 hover:border-blue-400 hover:bg-blue-50 text-slate-600 hover:text-blue-600 font-medium px-6 py-4 rounded-xl transition-colors w-full justify-center"
                >
                    <Plus className="w-5 h-5" />
                    Add New Doctor
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
                        <h3 className="text-lg font-bold text-slate-900">Add New Doctor</h3>
                        <button onClick={() => setIsAdding(false)} className="text-slate-500 hover:text-slate-700">
                            <X size={20} />
                        </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Name</label>
                            <input
                                type="text"
                                value={editForm.name || ""}
                                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                                className="w-full border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Specialty</label>
                            <input
                                type="text"
                                value={editForm.specialty || ""}
                                onChange={(e) => setEditForm({ ...editForm, specialty: e.target.value })}
                                className="w-full border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Qualifications</label>
                            <input
                                type="text"
                                value={editForm.qualifications || ""}
                                onChange={(e) => setEditForm({ ...editForm, qualifications: e.target.value })}
                                className="w-full border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Experience (years)</label>
                            <input
                                type="number"
                                value={editForm.experience || ""}
                                onChange={(e) => setEditForm({ ...editForm, experience: parseInt(e.target.value) || 0 })}
                                className="w-full border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="e.g., 15"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Bio</label>
                        <textarea
                            value={editForm.bio || ""}
                            onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
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
                                onClick={() => openImageUpload("add")}
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
                            label="Doctor Image Focus"
                            description="preview bawah ni ikut bentuk card doctor di landing page, tapi dikecilkan untuk editor."
                            previewViewportWidth={760}
                            previewFrameClassName="overflow-hidden rounded-xl border border-slate-200 bg-white"
                            previewContent={doctorPreviewContent}
                            zoomValue={doctorImageScale}
                            onZoomChange={(imageScale) => setEditForm({ ...editForm, imageScale })}
                            opacityValue={doctorImageOpacity}
                            onOpacityChange={(imageOpacity) => setEditForm({ ...editForm, imageOpacity })}
                            blurValue={doctorImageBlur}
                            onBlurChange={(imageBlur) => setEditForm({ ...editForm, imageBlur })}
                            onChange={(imagePosition) => setEditForm({ ...editForm, imagePosition })}
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
                            Add Doctor
                        </button>
                    </div>
                </motion.div>
            )}

            {/* Doctors List */}
            <div className="space-y-4">
                {doctors.map((doctor) => (
                    <motion.div
                        key={doctor.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`bg-white rounded-2xl overflow-hidden shadow-sm border ${doctor.isActive ? "border-slate-100" : "border-slate-200 opacity-60"}`}
                    >
                        {editingId === doctor.id ? (
                            <div className="p-6 space-y-4">
                                <div className="grid grid-cols-1 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2">Name</label>
                                        <input
                                            type="text"
                                            value={editForm.name || ""}
                                            onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                                            className="w-full border border-slate-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2">Specialty</label>
                                        <input
                                            type="text"
                                            value={editForm.specialty || ""}
                                            onChange={(e) => setEditForm({ ...editForm, specialty: e.target.value })}
                                            className="w-full border border-slate-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2">Experience (years)</label>
                                        <input
                                            type="number"
                                            value={editForm.experience || 0}
                                            onChange={(e) => setEditForm({ ...editForm, experience: parseInt(e.target.value) || 0 })}
                                            className="w-full border border-slate-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2">Image</label>
                                        <div className="flex gap-2">
                                            <input
                                                type="text"
                                                value={editForm.image || ""}
                                                onChange={(e) => setEditForm({ ...editForm, image: e.target.value })}
                                                className="flex-1 border border-slate-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => openImageUpload("edit")}
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
                                        label="Doctor Image Focus"
                                        description="preview bawah ni ikut bentuk card doctor di landing page, tapi dikecilkan untuk editor."
                                        previewViewportWidth={760}
                                        previewFrameClassName="overflow-hidden rounded-xl border border-slate-200 bg-white"
                                        previewContent={doctorPreviewContent}
                                        zoomValue={doctorImageScale}
                                        onZoomChange={(imageScale) => setEditForm({ ...editForm, imageScale })}
                                        opacityValue={doctorImageOpacity}
                                        onOpacityChange={(imageOpacity) => setEditForm({ ...editForm, imageOpacity })}
                                        blurValue={doctorImageBlur}
                                        onBlurChange={(imageBlur) => setEditForm({ ...editForm, imageBlur })}
                                        onChange={(imagePosition) => setEditForm({ ...editForm, imagePosition })}
                                    />
                                </div>
                                <div className="flex justify-end gap-2">
                                    <button
                                        onClick={() => { setEditingId(null); setEditForm({}); }}
                                        className="px-3 py-1.5 text-sm border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleSaveEdit}
                                        className="inline-flex items-center gap-1 px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                    >
                                        <Save size={14} />
                                        Save
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="group flex h-full w-full flex-col sm:flex-row">
                                <div className="relative h-56 shrink-0 overflow-hidden bg-slate-100 sm:h-auto sm:min-h-full sm:w-2/5">
                                    {doctor.image ? (
                                        <img
                                            src={doctor.image}
                                            alt={doctor.name}
                                            className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                                            style={resolveImagePresentationStyle(doctor)}
                                        />
                                    ) : (
                                        <div className="flex h-full w-full items-center justify-center text-slate-400">
                                            No Image
                                        </div>
                                    )}
                                    {!doctor.isActive && (
                                        <div className="absolute right-3 top-3 rounded-full bg-slate-800/70 px-2 py-1 text-xs text-white">
                                            Hidden
                                        </div>
                                    )}
                                </div>
                                <div className="flex grow flex-col p-6 md:p-8">
                                    <div className="mb-3">
                                        <h3 className="min-h-[3.5rem] text-xl font-bold leading-tight text-slate-900">{doctor.name}</h3>
                                    </div>
                                    <p className="mb-6 line-clamp-4 min-h-[6rem] text-sm font-semibold leading-6 text-blue-600">{doctor.specialty}</p>
                                    <div className="mb-6 rounded-xl bg-slate-50 p-4">
                                        <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-500">Doctor Details</p>
                                        <ul className="space-y-2">
                                            <li className="flex items-start gap-2 text-sm text-slate-600">
                                                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-600" />
                                                <span><span className="font-medium text-slate-700">Qualifications:</span> {doctor.qualifications}</span>
                                            </li>
                                            <li className="flex items-start gap-2 text-sm text-slate-600">
                                                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-600" />
                                                <span><span className="font-medium text-slate-700">Experience:</span> {doctor.experience}+ years</span>
                                            </li>
                                        </ul>
                                    </div>
                                    <div className="mt-auto flex items-center justify-end gap-2 border-t border-slate-50 pt-4">
                                        <button
                                            onClick={() => toggleActive(doctor.id)}
                                            className="p-2 rounded-lg hover:bg-slate-100 text-slate-500"
                                            title={doctor.isActive ? "Hide" : "Show"}
                                        >
                                            {doctor.isActive ? <Eye size={18} /> : <EyeOff size={18} />}
                                        </button>
                                        <button
                                            onClick={() => handleEdit(doctor)}
                                            className="p-2 rounded-lg hover:bg-slate-100 text-slate-500"
                                        >
                                            <Pencil size={18} />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(doctor.id)}
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
