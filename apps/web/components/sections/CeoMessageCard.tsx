"use client";

import { Quote } from "lucide-react";
import { type CeoMessageData } from "@/lib/data/store";
import {
    resolveImageBlur,
    resolveImageOpacity,
    resolveImagePosition,
    resolveImageScale,
} from "@/lib/image-position";

interface CeoMessageCardProps {
    data: CeoMessageData;
    imageUrl: string;
}

export function CeoMessageCard({ data, imageUrl }: CeoMessageCardProps) {
    const resolvedPosition = resolveImagePosition(data.imagePosition);

    return (
        <div className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5">
                <div className="lg:col-span-2 relative h-[400px] min-h-[400px] overflow-hidden bg-slate-100 md:h-full">
                    <img
                        src={imageUrl}
                        alt="Dr. CEO"
                        className="absolute inset-0 h-full w-full object-contain object-center"
                        style={{
                            objectPosition: resolvedPosition,
                            scale: `${resolveImageScale(data.imageScale)}`,
                            transformOrigin: resolvedPosition,
                            opacity: resolveImageOpacity(data.imageOpacity),
                            filter: `blur(${resolveImageBlur(data.imageBlur)}px)`,
                        }}
                    />
                    <div className="absolute inset-0 bg-blue-900/10 mix-blend-multiply" />
                </div>
                <div className="lg:col-span-3 p-8 md:p-12 lg:p-16 flex flex-col justify-center relative">
                    <Quote className="absolute top-8 left-8 text-blue-100 rotate-180" size={120} />
                    <div className="relative z-10">
                        <h3 className="text-2xl md:text-3xl text-slate-800 font-medium leading-relaxed mb-8 italic">
                            "{data.message}"
                        </h3>
                        <div className="flex flex-col gap-1">
                            <h4 className="text-xl font-bold text-blue-600">{data.name}</h4>
                            <p className="text-slate-500 font-medium">{data.title}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
