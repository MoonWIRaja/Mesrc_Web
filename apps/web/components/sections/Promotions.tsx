"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Clock, Tag, Loader2 } from "lucide-react";
import {
    type CarouselApi,
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from "@/components/ui/carousel";
import { useContactSettings } from "@/hooks/useContactSettings";
import { PromotionCard } from "@/components/sections/PromotionCard";

interface Promotion {
    id: string;
    title: string;
    description: string;
    image: string;
    imagePosition?: string;
    imageScale?: number;
    imageOpacity?: number;
    imageBlur?: number;
    whatsappMessage: string;
    startDate: string;
    endDate: string;
    isActive: boolean;
}

export function Promotions() {
    const [promotions, setPromotions] = useState<Promotion[]>([]);
    const [api, setApi] = useState<CarouselApi>();
    const [currentPromoIndex, setCurrentPromoIndex] = useState(0);
    const [isHovered, setIsHovered] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const { settings: contactSettings } = useContactSettings();

    // Fetch promotions from API
    useEffect(() => {
        const fetchPromotions = async () => {
            try {
                const res = await fetch("/api/data?section=promotions");
                const data = await res.json();
                if (data.data) {
                    const now = new Date().getTime();
                    const activePromotions = data.data
                        .filter((p: Promotion) => {
                            const startDate = new Date(p.startDate).getTime();
                            const endDate = new Date(p.endDate).getTime();
                            return p.isActive && startDate <= now && endDate >= now;
                        })
                        .sort((a: Promotion, b: Promotion) => new Date(a.endDate).getTime() - new Date(b.endDate).getTime());
                    setPromotions(activePromotions);
                }
            } catch (error) {
                console.error("Failed to load promotions:", error);
            }
            setIsLoading(false);
        };
        fetchPromotions();
    }, []);

    const [timeLeft, setTimeLeft] = useState({
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0,
    });
    const [mounted, setMounted] = useState(false);

    // Track active slide index
    useEffect(() => {
        if (!api) return;

        setCurrentPromoIndex(api.selectedScrollSnap());

        api.on("select", () => {
            setCurrentPromoIndex(api.selectedScrollSnap());
        });
    }, [api]);

    // Timer logic based on the current promo
    useEffect(() => {
        setMounted(true);
        const interval = setInterval(() => {
            const now = new Date().getTime();
            const currentPromoDate = promotions[currentPromoIndex]?.endDate || 0;
            const difference = new Date(currentPromoDate).getTime() - now;

            if (difference > 0) {
                setTimeLeft({
                    days: Math.floor(difference / (1000 * 60 * 60 * 24)),
                    hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
                    minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
                    seconds: Math.floor((difference % (1000 * 60)) / 1000),
                });
            } else {
                setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [currentPromoIndex, promotions]);

    // Autoplay logic (20s)
    useEffect(() => {
        if (!api || isHovered || promotions.length === 0) return;

        const autoplayInterval = setInterval(() => {
            api.scrollNext();
        }, 20000);

        return () => clearInterval(autoplayInterval);
    }, [api, isHovered, promotions.length]);

    if (isLoading) {
        return (
            <section id="promotions" className="py-24 bg-blue-600">
                <div className="container mx-auto px-4 md:px-6 flex justify-center">
                    <Loader2 className="w-8 h-8 animate-spin text-white" />
                </div>
            </section>
        );
    }

    return (
        <section id="promotions" className="py-24 bg-blue-600 relative overflow-hidden">
            {/* Background Patterns */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-10 pointer-events-none">
                <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-white blur-3xl"></div>
                <div className="absolute -bottom-24 -left-24 w-96 h-96 rounded-full bg-cyan-300 blur-3xl"></div>
            </div>

            <div className="container relative z-10 mx-auto px-4 md:px-6">

                <div className="flex flex-col lg:flex-row gap-12 lg:items-center mb-16">
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5 }}
                        className="flex-1 text-white"
                    >
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 backdrop-blur-sm mb-6">
                            <Tag size={16} className="text-yellow-300" />
                            <span className="text-sm font-semibold tracking-wide">Exclusive Website Offer</span>
                        </div>
                        <h2 className="text-4xl md:text-5xl font-bold leading-tight mb-6">
                            Our Promos <br /> For You
                        </h2>
                        <p className="text-blue-100 text-lg max-w-lg mb-8">
                            Don't miss the chance to get world-class treatments at more affordable prices. Limited promotions while slots last!
                        </p>

                        {/* Countdown Timer - Show even if no promotions */}
                        {mounted && promotions.length > 0 && (
                            <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 bg-white/10 p-4 sm:p-5 rounded-2xl border border-white/20 backdrop-blur-md w-full sm:w-fit">
                                <div className="flex items-center gap-2 sm:gap-3 sm:pr-4 sm:border-r border-blue-400/30">
                                    <Clock className="text-yellow-300" size={24} />
                                    <span className="font-medium text-xs sm:text-sm text-blue-100 uppercase tracking-wider">Ends In</span>
                                </div>
                                <div className="flex gap-2 sm:gap-4 text-center">
                                    <div className="flex flex-col">
                                        <span className="text-xl sm:text-3xl font-bold font-mono">{String(timeLeft.days).padStart(2, '0')}</span>
                                        <span className="text-[9px] sm:text-[10px] uppercase tracking-widest text-blue-200">Days</span>
                                    </div>
                                    <span className="text-xl sm:text-2xl font-bold mt-0.5 sm:mt-1 opacity-50">:</span>
                                    <div className="flex flex-col">
                                        <span className="text-xl sm:text-3xl font-bold font-mono">{String(timeLeft.hours).padStart(2, '0')}</span>
                                        <span className="text-[9px] sm:text-[10px] uppercase tracking-widest text-blue-200">Hours</span>
                                    </div>
                                    <span className="text-xl sm:text-2xl font-bold mt-0.5 sm:mt-1 opacity-50">:</span>
                                    <div className="flex flex-col">
                                        <span className="text-xl sm:text-3xl font-bold font-mono">{String(timeLeft.minutes).padStart(2, '0')}</span>
                                        <span className="text-[9px] sm:text-[10px] uppercase tracking-widest text-blue-200">Min</span>
                                    </div>
                                    <span className="text-xl sm:text-2xl font-bold mt-0.5 sm:mt-1 opacity-50">:</span>
                                    <div className="flex flex-col text-yellow-300">
                                        <span className="text-xl sm:text-3xl font-bold font-mono">{String(timeLeft.seconds).padStart(2, '0')}</span>
                                        <span className="text-[9px] sm:text-[10px] uppercase tracking-widest">Sec</span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </motion.div>

                    {/* Carousel */}
                    <motion.div
                        initial={{ opacity: 0, x: 30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="mx-auto w-full max-w-[22rem] flex-1 sm:max-w-[25rem] lg:max-w-[28rem]"
                    >
                        {promotions.length === 0 ? (
                            <div className="bg-white rounded-3xl overflow-hidden shadow-2xl h-[500px] flex items-center justify-center">
                                <div className="text-center p-8">
                                    <Tag className="w-20 h-20 mx-auto mb-6 text-blue-200" />
                                    <h3 className="text-3xl font-bold text-slate-900 mb-3">Coming Soon</h3>
                                    <p className="text-slate-600 text-lg">
                                        We're preparing exciting promotions for you. Stay tuned!
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <Carousel
                                setApi={setApi}
                                opts={{ align: "start", loop: true }}
                                className="w-full h-full"
                                onMouseEnter={() => setIsHovered(true)}
                                onMouseLeave={() => setIsHovered(false)}
                            >
                                <CarouselContent className="items-stretch">
                                    {promotions.map((promo) => (
                                        <CarouselItem key={promo.id} className="md:basis-full lg:basis-full flex h-auto">
                                            <PromotionCard
                                                promo={promo}
                                                ctaHref={contactSettings?.whatsappNumber ? `https://wa.me/${contactSettings.whatsappNumber.replace(/[\s\-\+]/g, "")}?text=${encodeURIComponent(promo.whatsappMessage || "Hi, I'm interested in this promotion.")}` : "#"}
                                            />
                                        </CarouselItem>
                                    ))}
                                </CarouselContent>
                                <div className="hidden sm:flex items-center justify-end gap-2 mt-6">
                                    <CarouselPrevious className="static translate-y-0 h-12 w-12 bg-white/10 hover:bg-white text-white hover:text-blue-600 border-white/20 transition-all" />
                                    <CarouselNext className="static translate-y-0 h-12 w-12 bg-white/10 hover:bg-white text-white hover:text-blue-600 border-white/20 transition-all" />
                                </div>
                            </Carousel>
                        )}
                    </motion.div>
                </div>

            </div>
        </section>
    );
}
