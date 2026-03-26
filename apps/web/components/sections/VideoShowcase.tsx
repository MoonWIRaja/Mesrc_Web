"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Play, Loader2, X } from "lucide-react";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";

interface VideoShowcaseData {
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

export function VideoShowcase() {
    const [settings, setSettings] = useState<VideoShowcaseData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedVideoIndex, setSelectedVideoIndex] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const sectionRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const res = await fetch("/api/data?section=videoShowcase");
                const data = await res.json();
                if (data.data) {
                    setSettings(data.data);
                    // Random video on mount
                    if (data.data.videoIds && data.data.videoIds.length > 1) {
                        setSelectedVideoIndex(Math.floor(Math.random() * data.data.videoIds.length));
                    }
                }
            } catch (error) {
                console.error("Failed to load video settings:", error);
            }
            setIsLoading(false);
        };
        fetchSettings();
    }, []);

    // Auto-play when section is in viewport
    useEffect(() => {
        if (!settings?.autoPlay || !sectionRef.current) return;

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting && !isPlaying) {
                        setIsPlaying(true);
                    }
                });
            },
            { threshold: 0.3 } // Play when 30% of section is visible
        );

        observer.observe(sectionRef.current);

        return () => observer.disconnect();
    }, [settings?.autoPlay, isPlaying]);

    if (isLoading) {
        return (
            <section className="py-24 bg-white">
                <div className="container mx-auto px-4 md:px-6 flex justify-center">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                </div>
            </section>
        );
    }

    if (!settings || !settings.isActive || !settings.videoIds || settings.videoIds.length === 0) {
        return null;
    }

    const currentVideoId = settings.videoIds[selectedVideoIndex] || settings.videoIds[0];

    return (
        <section className="py-24 bg-white">
            <div className="container mx-auto px-4 md:px-6">
                <div className="text-center max-w-3xl mx-auto mb-12">
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
                    </motion.div>
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="max-w-5xl mx-auto relative rounded-3xl overflow-hidden shadow-2xl group"
                    ref={sectionRef}
                >
                    {settings?.autoPlay && isPlaying ? (
                        /* Auto-play mode - show iframe directly (unmuted, browser may block) */
                        <div className="aspect-video w-full bg-slate-900">
                            <iframe
                                width="100%"
                                height="100%"
                                src={`https://www.youtube.com/embed/${currentVideoId}?autoplay=1&mute=0&rel=0&loop=1&playlist=${currentVideoId}&controls=1&showinfo=0&modestbranding=1`}
                                title="YouTube video player"
                                frameBorder="0"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                allowFullScreen
                            />
                        </div>
                    ) : (
                        /* Manual play mode - show thumbnail with play button */
                        <>
                            <img
                                src={settings.thumbnailUrl || "https://images.unsplash.com/photo-1551076805-e1869043e560?q=80&w=1200&auto=format&fit=crop"}
                                alt="Virtual Facility Tour"
                                className="w-full h-[400px] md:h-[600px] object-cover transition-transform duration-700 group-hover:scale-105"
                            />
                            <div className="absolute inset-0 bg-slate-900/40 flex items-center justify-center transition-opacity duration-300 group-hover:bg-slate-900/50">
                                <Dialog>
                                    <DialogTrigger asChild>
                                        <button className="relative flex items-center justify-center w-24 h-24 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors shadow-xl group/btn hover:scale-110 duration-300">
                                            <div className="absolute inset-0 bg-blue-600 rounded-full animate-ping opacity-40"></div>
                                            <Play size={40} className="ml-2" />
                                        </button>
                                    </DialogTrigger>
                                    <DialogContent className="max-w-4xl bg-black border-none p-0 overflow-hidden">
                                        <div className="aspect-video w-full bg-slate-900 flex items-center justify-center relative">
                                            <button
                                                onClick={() => setIsPlaying(false)}
                                                className="absolute top-4 right-4 z-50 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 transition-colors"
                                            >
                                                <X size={24} />
                                            </button>
                                            {currentVideoId ? (
                                                <iframe
                                                    width="100%"
                                                    height="100%"
                                                    src={`https://www.youtube.com/embed/${currentVideoId}?autoplay=1&mute=0&rel=0&loop=1&playlist=${currentVideoId}`}
                                                    title="YouTube video player"
                                                    frameBorder="0"
                                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                                    referrerPolicy="strict-origin-when-cross-origin"
                                                    allowFullScreen
                                                ></iframe>
                                            ) : (
                                                <div className="text-white">No video configured. Please add YouTube video URLs in the admin panel.</div>
                                            )}
                                        </div>
                                    </DialogContent>
                                </Dialog>
                            </div>
                        </>
                    )}
                </motion.div>
            </div>
        </section>
    );
}
