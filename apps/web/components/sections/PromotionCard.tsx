import { ArrowRight } from "lucide-react";
import { resolveImagePresentationStyle } from "@/lib/image-position";
import { cn } from "@/lib/utils";

export interface PromotionCardData {
    title: string;
    description: string;
    image: string;
    imagePosition?: string;
    imageScale?: number;
    imageOpacity?: number;
    imageBlur?: number;
}

interface PromotionCardProps {
    promo: PromotionCardData;
    className?: string;
    ctaHref?: string;
}

export function PromotionCard({ promo, className, ctaHref }: PromotionCardProps) {
    const ctaClasses = "mt-auto flex items-center justify-center gap-2 bg-slate-900 text-white w-full py-4 rounded-xl font-semibold transition-colors duration-300";
    const ctaContent = (
        <>
            Grab This Promo
            <ArrowRight size={18} />
        </>
    );

    return (
        <div className={cn("bg-white rounded-3xl overflow-hidden shadow-2xl relative group flex flex-col w-full h-full", className)}>
            <div className="relative shrink-0 aspect-[4/5] overflow-hidden border-b border-slate-100 bg-slate-100">
                <img
                    src={promo.image}
                    alt={promo.title}
                    className="absolute inset-0 h-full w-full object-contain transition-transform duration-700 group-hover:scale-105"
                    style={resolveImagePresentationStyle(promo)}
                />
            </div>
            <div className="p-8 flex flex-col grow">
                <h3 className="text-2xl font-bold text-slate-900 mb-4">{promo.title}</h3>
                {promo.description && (
                    <ul className="space-y-2 mb-8">
                        {promo.description.split("\n").filter((line) => line.trim()).map((point, i) => (
                            <li key={i} className="flex items-start gap-2 text-slate-600">
                                <span className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-1.5 shrink-0" />
                                {point.trim()}
                            </li>
                        ))}
                    </ul>
                )}
                {ctaHref ? (
                    <a
                        href={ctaHref}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`${ctaClasses} hover:bg-blue-600`}
                    >
                        {ctaContent}
                    </a>
                ) : (
                    <div className={ctaClasses}>
                        {ctaContent}
                    </div>
                )}
            </div>
        </div>
    );
}
