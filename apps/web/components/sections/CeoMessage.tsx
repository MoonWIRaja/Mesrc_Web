"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { DEFAULT_CEO_MESSAGE_DATA } from "@/lib/data/defaults";
import { type CeoMessageData } from "@/lib/data/store";
import { CeoMessageCard } from "@/components/sections/CeoMessageCard";

const defaultCeoMessage: CeoMessageData = DEFAULT_CEO_MESSAGE_DATA;

export function CeoMessage() {
    const [ceoMessage, setCeoMessage] = useState<CeoMessageData | null>(null);
    const [cacheBreaker, setCacheBreaker] = useState<string>("");
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        setIsLoading(true);
        fetch("/api/data?section=ceoMessage")
            .then(res => res.json())
            .then(data => {
                if (data.data) {
                    setCeoMessage(data.data);
                    // Add timestamp when data is loaded to bust cache
                    setCacheBreaker(`?t=${Date.now()}`);
                }
            })
            .catch(console.error)
            .finally(() => {
                setIsLoading(false);
            });
    }, []);

    // Show loading skeleton while fetching data
    if (isLoading) {
        return (
            <section className="py-24 bg-slate-50 overflow-hidden">
                <div className="container mx-auto px-4 md:px-6">
                    <div className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5">
                            <div className="lg:col-span-2 relative h-[400px] md:h-full min-h-[400px] bg-slate-200 animate-pulse" />
                            <div className="lg:col-span-3 p-8 md:p-12 lg:p-16 flex flex-col justify-center">
                                <div className="h-8 bg-slate-200 rounded animate-pulse mb-4 w-3/4" />
                                <div className="h-4 bg-slate-200 rounded animate-pulse mb-2" />
                                <div className="h-4 bg-slate-200 rounded animate-pulse mb-2" />
                                <div className="h-4 bg-slate-200 rounded animate-pulse mb-8 w-1/2" />
                                <div className="h-6 bg-slate-200 rounded animate-pulse w-1/3" />
                                <div className="h-4 bg-slate-200 rounded animate-pulse mt-2 w-1/4" />
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        );
    }

    const data = ceoMessage || defaultCeoMessage;

    // Helper function to add cache-busting to image URLs
    const getImageUrl = (url: string) => {
        if (!url) return url;
        // Add timestamp to prevent browser caching - only when cacheBreaker is set
        if (!cacheBreaker) return url;
        const separator = url.includes("?") ? "&" : "?";
        return `${url}${separator}${cacheBreaker}`;
    };

    return (
        <section className="py-24 bg-slate-50 overflow-hidden">
            <div className="container mx-auto px-4 md:px-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                >
                    <CeoMessageCard data={data} imageUrl={getImageUrl(data.image)} />
                </motion.div>
            </div>
        </section>
    );
}
