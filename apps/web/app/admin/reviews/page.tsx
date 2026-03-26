"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Plus, Trash2, Eye, EyeOff, Star, Save, Loader2, RefreshCw } from "lucide-react";
import { DEFAULT_REVIEWS_SETTINGS } from "@/lib/data/defaults";

interface Review {
    id: string;
    name: string;
    rating: number;
    text: string;
    date: string;
    isActive: boolean;
}

interface ReviewsSettings {
    subtitle: string;
    title: string;
    description: string;
}

export default function ReviewsAdminPage() {
    const [reviews, setReviews] = useState<Review[]>([]);
    const [settings, setSettings] = useState<ReviewsSettings>({
        ...DEFAULT_REVIEWS_SETTINGS
    });
    const [isAdding, setIsAdding] = useState(false);
    const [editForm, setEditForm] = useState<Partial<Review>>({ rating: 5 });
    const [message, setMessage] = useState({ type: "", text: "" });
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setIsLoading(true);
        try {
            const res = await fetch("/api/data?section=reviews");
            const data = await res.json();
            if (data.data) {
                setReviews(data.data.reviews || []);
                setSettings(data.data.settings || settings);
            }
        } catch (error) {
            console.error("Failed to load reviews:", error);
        }
        setIsLoading(false);
    };

    const handleSave = async () => {
        setIsSaving(true);
        setMessage({ type: "", text: "" });

        try {
            const res = await fetch("/api/data?section=reviews", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ reviews, settings }),
            });
            const data = await res.json();

            if (data.success) {
                setMessage({ type: "success", text: "Reviews settings saved! Landing page will now show these changes." });
            } else {
                throw new Error(data.error);
            }
        } catch (error) {
            setMessage({ type: "error", text: "Failed to save reviews settings." });
        } finally {
            setIsSaving(false);
        }
        setTimeout(() => setMessage({ type: "", text: "" }), 5000);
    };

    const handleAdd = () => {
        const newReview: Review = {
            id: Date.now().toString(),
            name: editForm.name || "Anonymous",
            rating: editForm.rating || 5,
            text: editForm.text || "",
            date: editForm.date || new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
            isActive: true,
        };
        setReviews([newReview, ...reviews]);
        setIsAdding(false);
        setEditForm({ rating: 5 });
        setMessage({ type: "success", text: "Review added successfully!" });
        setTimeout(() => setMessage({ type: "", text: "" }), 3000);
    };

    const handleDelete = (id: string) => {
        if (confirm("Are you sure you want to delete this review?")) {
            setReviews(reviews.filter(r => r.id !== id));
            setMessage({ type: "success", text: "Review deleted successfully!" });
            setTimeout(() => setMessage({ type: "", text: "" }), 3000);
        }
    };

    const toggleActive = async (id: string) => {
        // Update local state first for immediate feedback
        setReviews(reviews.map(r => r.id === id ? { ...r, isActive: !r.isActive } : r));
        
        // Auto-save to database
        try {
            const res = await fetch("/api/data?section=reviews", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    reviews: reviews.map(r => r.id === id ? { ...r, isActive: !r.isActive } : r),
                    settings: settings
                }),
            });
            
            const data = await res.json();
            if (data.success) {
                setMessage({ 
                    type: "success", 
                    text: `Review ${reviews.find(r => r.id === id)?.isActive ? 'hidden' : 'shown'}! Refresh landing page to see changes.` 
                });
                setTimeout(() => setMessage({ type: "", text: "" }), 5000);
            }
        } catch (error) {
            console.error("Failed to save review status:", error);
            setMessage({ type: "error", text: "Failed to save changes. Please try again." });
            setTimeout(() => setMessage({ type: "", text: "" }), 5000);
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-slate-900">Reviews</h1>
                    <p className="text-slate-500 mt-1">Manage reviews and section settings - changes appear on landing page after saving</p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={loadData}
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
                                Save All Changes
                            </>
                        )}
                    </button>
                </div>
            </div>

            {/* Message */}
            {message.text && (
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                    className={`p-4 rounded-xl ${message.type === "success" ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-red-50 text-red-700 border border-red-200"}`}>
                    {message.text}
                </motion.div>
            )}

            {/* Section Settings */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200">
                <h3 className="text-lg font-bold text-slate-900 mb-4">Section Settings</h3>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Subtitle</label>
                        <input
                            type="text"
                            value={settings.subtitle}
                            onChange={(e) => setSettings({ ...settings, subtitle: e.target.value })}
                            className="w-full border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Title</label>
                        <input
                            type="text"
                            value={settings.title}
                            onChange={(e) => setSettings({ ...settings, title: e.target.value })}
                            className="w-full border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Description</label>
                        <textarea
                            value={settings.description}
                            onChange={(e) => setSettings({ ...settings, description: e.target.value })}
                            rows={3}
                            className="w-full border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                        />
                    </div>
                </div>
            </div>

            {/* Add New Button */}
            {!isAdding && (
                <button
                    onClick={() => { setIsAdding(true); setEditForm({ rating: 5 }); }}
                    className="inline-flex items-center gap-2 border border-dashed border-slate-300 hover:border-blue-400 hover:bg-blue-50 text-slate-600 hover:text-blue-600 font-medium px-6 py-4 rounded-xl transition-colors w-full justify-center"
                >
                    <Plus className="w-5 h-5" />
                    Add New Review
                </button>
            )}

            {/* Add New Form */}
            {isAdding && (
                <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
                    className="bg-blue-50 border border-blue-200 rounded-2xl p-6 space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-bold text-slate-900">Add New Review</h3>
                        <button onClick={() => setIsAdding(false)} className="text-slate-500 hover:text-slate-700">✕</button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Customer Name</label>
                            <input type="text" value={editForm.name || ""}
                                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                                className="w-full border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Date</label>
                            <input type="text" value={editForm.date || ""}
                                onChange={(e) => setEditForm({ ...editForm, date: e.target.value })}
                                className="w-full border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="14 Feb 2026" />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Rating</label>
                        <div className="flex gap-2">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button key={star} type="button"
                                    onClick={() => setEditForm({ ...editForm, rating: star })}
                                    className="focus:outline-none transition-transform hover:scale-110">
                                    <Star size={28} fill={star <= (editForm.rating || 5) ? "#eab308" : "none"} color={star <= (editForm.rating || 5) ? "#eab308" : "#cbd5e1"} />
                                </button>
                            ))}
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Review Text</label>
                        <textarea value={editForm.text || ""}
                            onChange={(e) => setEditForm({ ...editForm, text: e.target.value })}
                            rows={3} className="w-full border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
                    </div>
                    <div className="flex justify-end gap-3">
                        <button onClick={() => setIsAdding(false)} className="px-4 py-2 border border-slate-200 rounded-xl hover:bg-slate-50">Cancel</button>
                        <button onClick={handleAdd} className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700">Add Review</button>
                    </div>
                </motion.div>
            )}

            {/* Reviews List */}
            <div className="space-y-4">
                {reviews.map((review) => (
                    <motion.div key={review.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                        className={`bg-white rounded-2xl p-6 shadow-sm border ${review.isActive ? "border-slate-100" : "border-slate-200 opacity-60"}`}>
                        <div className="flex items-start justify-between">
                            <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="flex gap-0.5">
                                        {[...Array(5)].map((_, i) => (
                                            <Star key={i} size={16} fill={i < review.rating ? "#eab308" : "none"} color={i < review.rating ? "#eab308" : "#cbd5e1"} />
                                        ))}
                                    </div>
                                    {!review.isActive && (
                                        <span className="text-xs bg-slate-200 text-slate-600 px-2 py-0.5 rounded-full">Hidden</span>
                                    )}
                                </div>
                                <p className="text-slate-700 mb-3">"{review.text}"</p>
                                <div className="flex items-center gap-2 text-sm text-slate-500">
                                    <span className="font-medium text-slate-900">{review.name}</span>
                                    <span>•</span>
                                    <span>{review.date}</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 ml-4">
                                <button onClick={() => toggleActive(review.id)} className="p-2 rounded-lg hover:bg-slate-100 text-slate-500">
                                    {review.isActive ? <Eye size={18} /> : <EyeOff size={18} />}
                                </button>
                                <button onClick={() => handleDelete(review.id)} className="p-2 rounded-lg hover:bg-red-50 text-red-500">
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
