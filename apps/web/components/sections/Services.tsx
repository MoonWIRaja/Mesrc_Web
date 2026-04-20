"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    type CarouselApi,
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from "@/components/ui/carousel";
import { Service } from "@/lib/data/store";
import { resolveImagePresentationStyle } from "@/lib/image-position";

export function Services() {
    const [services, setServices] = useState<Service[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [api, setApi] = useState<CarouselApi>();
    const [isHovered, setIsHovered] = useState(false);

    // Fetch services from API
    useEffect(() => {
        const fetchServices = async () => {
            try {
                const res = await fetch("/api/data?section=services");
                const data = await res.json();
                if (data.data) {
                    // Only show active services, sorted by order
                    const activeServices = data.data
                        .filter((s: Service) => s.isActive)
                        .sort((a: Service, b: Service) => (a.order || 0) - (b.order || 0));
                    setServices(activeServices);
                }
            } catch (error) {
                console.error("Failed to load services:", error);
            }
            setIsLoading(false);
        };
        fetchServices();
    }, []);

    // Autoplay logic (5 seconds)
    useEffect(() => {
        if (!api || isHovered || isModalOpen || services.length === 0) return;

        const autoplayInterval = setInterval(() => {
            api.scrollNext();
        }, 5000);

        return () => clearInterval(autoplayInterval);
    }, [api, isHovered, isModalOpen, services.length]);

    if (isLoading) {
        return (
            <section id="services" className="py-24 bg-slate-50">
                <div className="container mx-auto px-4 md:px-6 flex justify-center">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                </div>
            </section>
        );
    }

    if (services.length === 0) {
        return null;
    }

    const shouldUseThreeColumnLayout = services.length >= 5;
    const itemClassName = shouldUseThreeColumnLayout
        ? "flex h-auto md:basis-1/2 lg:basis-1/3"
        : "flex h-auto md:basis-1/2 lg:basis-1/2";

    return (
        <section id="services" className="py-24 bg-slate-50">
            <div className="container mx-auto px-4 md:px-6">

                {/* Header */}
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5 }}
                    >
                        <h2 className="text-blue-600 font-bold tracking-wide uppercase text-sm mb-3">Services & Treatments</h2>
                        <h3 className="text-3xl md:text-5xl font-bold text-slate-900 leading-tight mb-6">
                            Comprehensive Eye Services
                        </h3>
                        <p className="text-slate-600 text-lg leading-relaxed">
                            From basic check-ups to complex surgeries, we provide a full spectrum of eye care
                            with technology and expertise you can trust.
                        </p>
                    </motion.div>
                </div>

                {/* Services Carousel with Navigation */}
                <div
                    className="relative"
                    onMouseEnter={() => setIsHovered(true)}
                    onMouseLeave={() => setIsHovered(false)}
                >
                    <Carousel
                        setApi={setApi}
                        opts={{ align: "start", loop: services.length > 1 }}
                        className="w-full"
                    >
                        <CarouselContent className="items-stretch">
                            {services.map((service) => (
                                <CarouselItem key={service.id} className={itemClassName}>
                                    <div
                                        className="group flex h-full w-full flex-col overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm transition-all duration-300 sm:flex-row hover:shadow-xl"
                                    >
                                        {/* Image */}
                                        <div className="relative h-56 shrink-0 overflow-hidden bg-slate-100 sm:h-auto sm:min-h-full sm:w-2/5">
                                            <img
                                                src={service.image}
                                                alt={service.title}
                                                className="absolute inset-0 w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
                                                onError={(e) => {
                                                    (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1589820760086-1eb8a55ed93d?q=80&w=800&auto=format&fit=crop";
                                                }}
                                                style={resolveImagePresentationStyle({
                                                    imagePosition: service.imagePosition,
                                                    imageScale: service.imageScale,
                                                    imageOpacity: service.imageOpacity,
                                                    imageBlur: service.imageBlur,
                                                })}
                                            />
                                        </div>

                                        {/* Info */}
                                        <div className="flex grow flex-col p-6 md:p-8">
                                            <h4 className="mb-3 min-h-[3.5rem] text-xl font-bold leading-tight text-slate-900 transition-colors group-hover:text-blue-600">
                                                {service.title}
                                            </h4>
                                            <p className="mb-6 line-clamp-4 min-h-[6rem] text-sm font-semibold leading-6 text-blue-600">
                                                {service.description}
                                            </p>

                                            <div className="mt-auto flex flex-col gap-3 border-t border-slate-50 pt-4">
                                                <Dialog onOpenChange={setIsModalOpen}>
                                                    <DialogTrigger asChild>
                                                        <button className="block w-full text-center bg-white border-2 border-slate-200 hover:border-blue-600 hover:text-blue-600 font-semibold py-2.5 rounded-xl transition-all">
                                                            Learn More
                                                        </button>
                                                    </DialogTrigger>
                                                    <DialogContent className="w-[90vw] max-w-[90vw] sm:max-w-[90vw] md:max-w-[90vw] p-0 overflow-hidden bg-white rounded-3xl">
                                                        <div className="flex flex-col md:flex-row h-full max-h-[90vh]">
                                                            {/* Image Section */}
                                                            <div className="relative w-full md:w-1/2 h-48 md:h-auto bg-slate-100 shrink-0">
                                                                <img
                                                                    src={service.image}
                                                                    alt={service.title}
                                                                    className="absolute inset-0 w-full h-full object-cover object-center"
                                                                    onError={(e) => {
                                                                        (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1589820760086-1eb8a55ed93d?q=80&w=800&auto=format&fit=crop";
                                                                    }}
                                                                    style={resolveImagePresentationStyle({
                                                                        imagePosition: service.imagePosition,
                                                                        imageScale: service.imageScale,
                                                                        imageOpacity: service.imageOpacity,
                                                                        imageBlur: service.imageBlur,
                                                                    })}
                                                                />
                                                                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent md:bg-none" />
                                                            </div>

                                                            {/* Content Section */}
                                                            <div className="w-full md:w-1/2 p-6 md:p-10 lg:p-12 overflow-y-auto">
                                                                <DialogHeader className="mb-6 text-left">
                                                                    <h4 className="text-blue-600 font-bold uppercase tracking-wider text-sm mb-1">Service Details</h4>
                                                                    <DialogTitle className="text-2xl md:text-3xl font-bold text-slate-900 mb-2">
                                                                        {service.title}
                                                                    </DialogTitle>
                                                                    <DialogDescription className="text-base text-slate-600">
                                                                        {service.description}
                                                                    </DialogDescription>
                                                                </DialogHeader>

                                                                <div className="space-y-6">
                                                                    <div>
                                                                        <h4 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                                                                            About Treatment
                                                                        </h4>
                                                                        {service.details ? (
                                                                            <ul className="space-y-2">
                                                                                {service.details.split("\n").filter(line => line.trim()).map((point, i) => (
                                                                                    <li key={i} className="flex items-start gap-2 text-slate-600 leading-relaxed">
                                                                                        <span className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 shrink-0" />
                                                                                        {point.trim()}
                                                                                    </li>
                                                                                ))}
                                                                            </ul>
                                                                        ) : (
                                                                            <p className="text-slate-600 leading-relaxed">No treatment details available.</p>
                                                                        )}
                                                                    </div>

                                                                    <div className="pt-6 border-t border-slate-100 mt-auto">
                                                                        <DialogTrigger asChild>
                                                                            <button className="flex items-center justify-center w-full bg-slate-100 hover:bg-slate-200 text-slate-700 py-4 rounded-xl font-semibold transition-all">
                                                                                Close
                                                                            </button>
                                                                        </DialogTrigger>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </DialogContent>
                                                </Dialog>
                                            </div>
                                        </div>
                                    </div>
                                </CarouselItem>
                            ))}
                        </CarouselContent>
                        <div className="flex items-center justify-center gap-4 mt-8">
                            <CarouselPrevious className="static translate-y-0 h-12 w-12 bg-white hover:bg-blue-600 hover:text-white text-slate-600 border-slate-200 shadow-md transition-all" />
                            <CarouselNext className="static translate-y-0 h-12 w-12 bg-white hover:bg-blue-600 hover:text-white text-slate-600 border-slate-200 shadow-md transition-all" />
                        </div>
                    </Carousel>
                </div>

            </div>
        </section>
    );
}
