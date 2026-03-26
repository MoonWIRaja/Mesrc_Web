"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Save, Loader2, RefreshCw, Youtube, Plus, Trash2 } from "lucide-react";

interface VideoSettings {
    title: string;
    subtitle: string;
    description: string;
    videoIds: string[];
    youtubeProfileUrl: string;
    youtubeApiKey: string;
    thumbnailUrl: string;
    autoPlay: boolean;
    isActive: boolean;
}

export default function VideoAdminPage() {
    const [settings, setSettings] = useState<VideoSettings>({
        title: "Get to Know Eye Specialist Center",
        subtitle: "Watch Video",
        description: "Take a virtual tour of our medical facility and see for yourself how we provide world-class treatment to every patient.",
        videoIds: [],
        youtubeProfileUrl: "",
        youtubeApiKey: "",
        thumbnailUrl: "",
        autoPlay: false,
        isActive: true,
    });
    const [message, setMessage] = useState({ type: "", text: "" });
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [newVideoUrl, setNewVideoUrl] = useState("");

    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = async () => {
        setIsLoading(true);
        try {
            const res = await fetch("/api/data?section=videoShowcase");
            const data = await res.json();
            if (data.data) {
                setSettings(data.data);
            }
        } catch (error) {
            console.error("Failed to load video settings:", error);
        }
        setIsLoading(false);
    };

    const handleSave = async () => {
        setIsSaving(true);
        setMessage({ type: "", text: "" });

        try {
            const res = await fetch("/api/data?section=videoShowcase", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(settings),
            });
            const data = await res.json();

            if (data.success) {
                setMessage({ type: "success", text: "Video settings saved! Landing page will now show these changes." });
            } else {
                throw new Error(data.error);
            }
        } catch (error) {
            setMessage({ type: "error", text: "Failed to save video settings." });
        } finally {
            setIsSaving(false);
        }
        setTimeout(() => setMessage({ type: "", text: "" }), 5000);
    };

    const extractVideoId = (url: string): string => {
        const patterns = [
            /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/,
            /youtube\.com\/embed\/([^&\s]+)/,
            /youtube\.com\/v\/([^&\s]+)/,
        ];

        for (const pattern of patterns) {
            const match = url.match(pattern);
            if (match && match[1]) return match[1];
        }
        return url;
    };

    const handleAddVideo = () => {
        const videoId = extractVideoId(newVideoUrl);
        if (videoId && !settings.videoIds.includes(videoId)) {
            setSettings({
                ...settings,
                videoIds: [...settings.videoIds, videoId],
                thumbnailUrl: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
            });
            setNewVideoUrl("");
            setMessage({ type: "success", text: "Video added!" });
            setTimeout(() => setMessage({ type: "", text: "" }), 3000);
        }
    };

    const handleRemoveVideo = (index: number) => {
        const newVideoIds = settings.videoIds.filter((_, i) => i !== index);
        setSettings({
            ...settings,
            videoIds: newVideoIds,
            thumbnailUrl: newVideoIds.length > 0 ? `https://img.youtube.com/vi/${newVideoIds[0]}/maxresdefault.jpg` : "",
        });
    };

    const handleProfileUrlChange = (url: string) => {
        setSettings({ ...settings, youtubeProfileUrl: url });
        // Note: Without YouTube API, we can't auto-fetch videos from profile
        // Admin needs to manually add video URLs
    };

    const fetchVideosFromProfile = async () => {
        if (!settings.youtubeProfileUrl || !settings.youtubeApiKey) {
            setMessage({ type: "error", text: "Please enter both YouTube Profile URL and API key." });
            return;
        }

        try {
            setMessage({ type: "success", text: "Fetching videos from YouTube profile..." });

            const response = await fetch(`/api/youtube?profileUrl=${encodeURIComponent(settings.youtubeProfileUrl || '')}&apiKey=${encodeURIComponent(settings.youtubeApiKey || '')}`);
            const data = await response.json();

            if (data.success) {
                // Add the fetched videos to the current list, avoiding duplicates
                const currentVideoIds = settings.videoIds || [];
                const newVideoIds = [...new Set([...currentVideoIds, ...data.videos.map((video: any) => video.id)])];

                setSettings({
                    ...settings,
                    videoIds: newVideoIds
                });

                setMessage({
                    type: "success",
                    text: `Successfully fetched ${data.count} videos from your profile. Total videos in showcase: ${newVideoIds.length}.`
                });
            } else {
                setMessage({ type: "error", text: `Error: ${data.error || 'Failed to fetch videos'}` });
            }
        } catch (error: any) {
            console.error("Error fetching videos from YouTube:", error);
            setMessage({ type: "error", text: `Error fetching videos: ${error.message || 'An unknown error occurred'}` });
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
                    <h1 className="text-2xl md:text-3xl font-bold text-slate-900">Video Showcase</h1>
                    <p className="text-slate-500 mt-1">Manage video settings - changes appear on landing page after saving</p>
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
                                Save Changes
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

            {/* Settings Form */}
            <div className="bg-white rounded-2xl p-6 space-y-6 border border-slate-200">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">YouTube Profile URL (Optional)</label>
                        <input
                            type="text"
                            value={settings.youtubeProfileUrl}
                            onChange={(e) => setSettings({ ...settings, youtubeProfileUrl: e.target.value })}
                            className="w-full border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="https://www.youtube.com/@yourchannel"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">YouTube API Key (Optional)</label>
                        <div className="flex gap-2">
                            <input
                                type="password"
                                value={settings.youtubeApiKey}
                                onChange={(e) => setSettings({ ...settings, youtubeApiKey: e.target.value })}
                                className="flex-1 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Enter your YouTube Data API key"
                            />
                        </div>
                        <p className="text-xs text-slate-500 mt-1">
                            🔑 <strong>How to get API key:</strong> Go to Google Cloud Console → Create project → Enable YouTube Data API v3 → Create credentials.
                        </p>
                    </div>

                    <div className="flex gap-3">
                        <button
                            onClick={fetchVideosFromProfile}
                            disabled={!settings.youtubeProfileUrl || !settings.youtubeApiKey}
                            className="inline-flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white font-medium px-4 py-3 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <Youtube className="w-4 h-4" />
                            Fetch Videos from Profile
                        </button>

                        <a
                            href={settings.youtubeProfileUrl || '#'}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 border border-slate-200 hover:bg-slate-50 text-slate-700 font-medium px-4 py-3 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            onClick={(e) => {
                                if (!settings.youtubeProfileUrl) {
                                    e.preventDefault();
                                }
                            }}
                        >
                            <Youtube className="w-4 h-4" />
                            Visit Channel
                        </a>
                    </div>

                    <p className="text-xs text-slate-500">
                        ℹ️ <strong>Note:</strong> With API key, system will auto-fetch all videos from your profile. Without API key, you can manually add videos by copying URLs from your YouTube profile.
                    </p>
                </div>

                {/* Video URLs */}
                <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                        <Youtube className="inline w-4 h-4 mr-1" />
                        Add YouTube Videos (Manual)
                    </label>
                    <div className="flex gap-2 mb-4">
                        <div className="relative flex-1">
                            <Youtube className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                            <input
                                type="text"
                                value={newVideoUrl}
                                onChange={(e) => setNewVideoUrl(e.target.value)}
                                onKeyPress={(e) => e.key === "Enter" && handleAddVideo()}
                                className="w-full border border-slate-200 rounded-xl pl-12 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Paste YouTube URL and press Enter..."
                            />
                        </div>
                        <button
                            onClick={handleAddVideo}
                            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-3 rounded-xl transition-colors"
                        >
                            <Plus className="w-5 h-5" />
                            Add
                        </button>
                    </div>
                    <p className="text-xs text-slate-600 mb-4">
                        💡 <strong>Tip:</strong> Copy URL dari YouTube video dan paste di atas. System akan auto-extract video ID.
                    </p>

                    {/* Video List */}
                    {settings.videoIds && settings.videoIds.length > 0 && (
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-slate-700">Added Videos ({settings.videoIds.length})</label>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {settings.videoIds.map((videoId, index) => (
                                    <div key={videoId} className="flex items-center gap-3 bg-slate-50 rounded-xl p-3 border border-slate-200">
                                        <img
                                            src={`https://img.youtube.com/vi/${videoId}/default.jpg`}
                                            alt="Video thumbnail"
                                            className="w-20 h-14 object-cover rounded-lg"
                                        />
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-slate-900 truncate">Video {index + 1}</p>
                                            <p className="text-xs text-slate-500 truncate">{videoId}</p>
                                        </div>
                                        <button
                                            onClick={() => handleRemoveVideo(index)}
                                            className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {settings.thumbnailUrl && (
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Main Thumbnail Preview</label>
                        <div
                            className="w-full max-w-md h-48 rounded-xl bg-cover bg-center border border-slate-200"
                            style={{ backgroundImage: `url(${settings.thumbnailUrl})` }}
                        />
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex items-center gap-3">
                        <input
                            type="checkbox"
                            id="autoPlay"
                            checked={settings.autoPlay}
                            onChange={(e) => setSettings({ ...settings, autoPlay: e.target.checked })}
                            className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                        />
                        <label htmlFor="autoPlay" className="text-sm font-medium text-slate-700">
                            Auto-play first video when page loads
                        </label>
                    </div>
                    <div className="flex items-center gap-3">
                        <input
                            type="checkbox"
                            id="isActive"
                            checked={settings.isActive}
                            onChange={(e) => setSettings({ ...settings, isActive: e.target.checked })}
                            className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                        />
                        <label htmlFor="isActive" className="text-sm font-medium text-slate-700">
                            Show video section on landing page
                        </label>
                    </div>
                </div>
            </div>

            {/* Preview */}
            <div className="bg-blue-50 rounded-2xl p-6 border border-blue-200">
                <h3 className="text-lg font-bold text-slate-900 mb-4">Preview</h3>
                <div className="space-y-4">
                    <div className="text-center">
                        <p className="text-blue-600 font-bold text-sm uppercase mb-2">{settings.subtitle}</p>
                        <h3 className="text-2xl font-bold text-slate-900 mb-3">{settings.title}</h3>
                        <p className="text-slate-600">{settings.description}</p>
                    </div>
                    {settings.videoIds && settings.videoIds.length > 0 && (
                        <div className="aspect-video bg-slate-900 rounded-xl overflow-hidden">
                            <iframe
                                width="100%"
                                height="100%"
                                src={`https://www.youtube.com/embed/${settings.videoIds[0]}`}
                                title="Preview"
                                frameBorder="0"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                            />
                        </div>
                    )}
                    <div className="flex items-center gap-4 text-sm text-slate-600">
                        <span className={`px-3 py-1 rounded-full ${settings.autoPlay ? "bg-green-100 text-green-700" : "bg-slate-200 text-slate-600"}`}>
                            Auto-play: {settings.autoPlay ? "On" : "Off"}
                        </span>
                        <span className={`px-3 py-1 rounded-full ${settings.isActive ? "bg-green-100 text-green-700" : "bg-slate-200 text-slate-600"}`}>
                            Status: {settings.isActive ? "Active" : "Hidden"}
                        </span>
                        <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-700">
                            Videos: {settings.videoIds ? settings.videoIds.length : 0}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}
