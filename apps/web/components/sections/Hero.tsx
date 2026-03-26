"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import CountUp from "react-countup";
import Link from "next/link";
import { ArrowRight, Calendar, Loader2 } from "lucide-react";
import { HeroData } from "@/lib/data/store";
import { DEFAULT_HERO_DATA } from "@/lib/data/defaults";
import { resolveImagePresentationStyle } from "@/lib/image-position";

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.15,
            delayChildren: 0.2,
        },
    },
};

const itemVariants = {
    hidden: { opacity: 0, y: 40 },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.8,
            ease: [0.16, 1, 0.3, 1] as const
        }
    },
};

const defaultHero: HeroData = DEFAULT_HERO_DATA;

export function Hero() {
    const [hero, setHero] = useState<HeroData | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Fetch hero data from API
    useEffect(() => {
        const fetchHeroData = async () => {
            try {
                const res = await fetch("/api/data?section=hero");
                const data = await res.json();
                if (data.data) {
                    setHero(data.data);
                } else {
                    setHero(defaultHero);
                }
            } catch (error) {
                console.error("Failed to load hero data, using defaults:", error);
                setHero(defaultHero);
            }
            // Minimum loading display time to ensure user sees it
            setTimeout(() => setIsLoading(false), 800);
        };
        fetchHeroData();
    }, []);

    // Use hero data or fallback to default
    const heroData = hero || defaultHero;
    const resolveAnchorHref = (href: string | undefined, fallback: string) => {
        if (!href) return fallback;
        return href.startsWith("#") ? `/${href}` : href;
    };
    const primaryHref = resolveAnchorHref(heroData.primaryButtonLink, "/#appointment");
    const secondaryHref = resolveAnchorHref(heroData.secondaryButtonLink, "/#about");

    // Show loading state while fetching data
    if (isLoading) {
        return (
            <section id="hero" className="relative w-full min-h-screen flex items-center justify-center overflow-hidden py-20 bg-slate-900">
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/80 to-slate-900/60" />
                <div className="relative z-10 flex flex-col items-center justify-center">
                    {/* Snow Ball Loading Spinner */}
                    <div className="snow-ball-spinner">
                        <div className="snow-ball"></div>
                        <div className="snow-ball"></div>
                        <div className="snow-ball"></div>
                        <div className="snow-ball"></div>
                        <div className="snow-ball"></div>
                    </div>
                    <style jsx>{`
                        .snow-ball-spinner {
                            position: relative;
                            width: 60px;
                            height: 60px;
                        }
                        .snow-ball {
                            position: absolute;
                            width: 10px;
                            height: 10px;
                            background: #3b82f6;
                            border-radius: 50%;
                            animation: snow-fall 1.2s ease-in-out infinite;
                        }
                        .snow-ball:nth-child(1) { left: 0; animation-delay: 0s; }
                        .snow-ball:nth-child(2) { left: 12px; animation-delay: 0.2s; }
                        .snow-ball:nth-child(3) { left: 25px; animation-delay: 0.4s; }
                        .snow-ball:nth-child(4) { left: 38px; animation-delay: 0.6s; }
                        .snow-ball:nth-child(5) { left: 50px; animation-delay: 0.8s; }
                        @keyframes snow-fall {
                            0%, 100% { 
                                top: 0; 
                                opacity: 0;
                                transform: scale(0.5);
                            }
                            20% {
                                opacity: 1;
                                transform: scale(1);
                            }
                            80% {
                                opacity: 1;
                                transform: scale(1);
                            }
                            100% { 
                                top: 50px; 
                                opacity: 0;
                                transform: scale(0.5);
                            }
                        }
                    `}</style>
                </div>
            </section>
        );
    }

    return (
        <section id="hero" className="relative w-full min-h-screen flex items-center justify-center overflow-hidden py-20">
            {/* Background Image & Overlay */}
            <div className="absolute inset-0 z-0 bg-slate-900">
                <img
                    src={heroData.backgroundImage}
                    alt="Hero background"
                    className="h-full w-full object-cover"
                    style={resolveImagePresentationStyle({
                        imagePosition: heroData.imagePosition,
                        imageScale: heroData.imageScale,
                        imageOpacity: heroData.imageOpacity,
                        imageBlur: heroData.imageBlur,
                    })}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/80 to-slate-900/60" />
            </div>

            <div className="container relative z-10 mx-auto px-4 md:px-6 flex flex-col items-center justify-center text-center">
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="max-w-4xl flex flex-col items-center"
                >
                    {/* Badge */}
                    <motion.div
                        variants={itemVariants}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-sm font-medium mb-8 backdrop-blur-md"
                    >
                        <span className="relative flex h-2.5 w-2.5">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-blue-500"></span>
                        </span>
                        {heroData.badge}
                    </motion.div>

                    {/* Heading */}
                    <motion.h1
                        variants={itemVariants}
                        className="text-5xl md:text-7xl lg:text-8xl font-black text-white leading-tight mb-8 tracking-tight"
                    >
                        {heroData.title} <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">
                            {heroData.subtitle}
                        </span>
                    </motion.h1>

                    <motion.p
                        variants={itemVariants}
                        className="text-lg md:text-2xl text-slate-300 mb-12 max-w-3xl leading-relaxed font-light"
                    >
                        {heroData.description}
                    </motion.p>

                    {/* CTAs */}
                    <motion.div
                        variants={itemVariants}
                        className="flex flex-col sm:flex-row gap-4 mb-20 w-full sm:w-auto justify-center"
                    >
                        <Link
                            href={primaryHref}
                            className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-10 py-4 rounded-full text-lg font-semibold transition-all shadow-xl shadow-blue-500/30 hover:shadow-blue-500/50 hover:-translate-y-1"
                        >
                            <Calendar size={20} />
                            {heroData.primaryButtonText}
                        </Link>
                        <Link
                            href={secondaryHref}
                            className="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white border border-white/20 px-10 py-4 rounded-full text-lg font-medium transition-all backdrop-blur-md hover:-translate-y-1"
                        >
                            {heroData.secondaryButtonText}
                            <ArrowRight size={20} />
                        </Link>
                    </motion.div>

                    {/* Stats */}
                    <motion.div
                        variants={itemVariants}
                        className="grid grid-cols-2 gap-12 pt-10 border-t border-white/10 w-full max-w-2xl justify-center"
                    >
                        <div className="flex flex-col items-center text-center">
                            <div className="flex items-center gap-2 text-blue-400 mb-3 hover:scale-110 transition-transform cursor-default">
                                <span className="text-4xl md:text-5xl font-black text-white">
                                    <CountUp end={heroData.stats.patients} duration={2.5} separator="," />+
                                </span>
                            </div>
                            <p className="text-sm text-slate-400 font-semibold uppercase tracking-widest">Patients Treated</p>
                        </div>
                        <div className="flex flex-col items-center text-center">
                            <div className="flex items-center gap-2 text-blue-400 mb-3 hover:scale-110 transition-transform cursor-default">
                                <span className="text-4xl md:text-5xl font-black text-white">
                                    <CountUp end={heroData.stats.experience} duration={2.5} />+
                                </span>
                            </div>
                            <p className="text-sm text-slate-400 font-semibold uppercase tracking-widest">Years of Experience</p>
                        </div>
                    </motion.div>
                </motion.div>
            </div>

        </section>
    );
}
