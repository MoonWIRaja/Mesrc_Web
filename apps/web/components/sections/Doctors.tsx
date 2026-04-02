"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";
import { Doctor } from "@/lib/data/store";
import {
    type CarouselApi,
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from "@/components/ui/carousel";
import { resolveImagePresentationStyle } from "@/lib/image-position";

export function Doctors() {
    const [doctors, setDoctors] = useState<Doctor[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [api, setApi] = useState<CarouselApi>();
    const [isHovered, setIsHovered] = useState(false);

    useEffect(() => {
        const fetchDoctors = async () => {
            try {
                const res = await fetch("/api/data?section=doctors");
                const data = await res.json();
                if (data.data) {
                    // Only show active doctors
                    setDoctors(data.data.filter((d: Doctor) => d.isActive));
                }
            } catch (error) {
                console.error("Failed to load doctors:", error);
            }
            setIsLoading(false);
        };
        fetchDoctors();
    }, []);

    // Autoplay logic (5 seconds)
    useEffect(() => {
        if (!api || isHovered || isModalOpen) return;

        const autoplayInterval = setInterval(() => {
            api.scrollNext();
        }, 5000);

        return () => clearInterval(autoplayInterval);
    }, [api, isHovered, isModalOpen]);

    if (isLoading) {
        return (
            <section id="doctors" className="py-24 bg-white">
                <div className="container mx-auto px-4 md:px-6 flex justify-center">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                </div>
            </section>
        );
    }

    if (doctors.length === 0) {
        return null;
    }

    const shouldUseThreeColumnLayout = doctors.length >= 5;
    const itemClassName = shouldUseThreeColumnLayout
        ? "flex h-auto md:basis-1/2 lg:basis-1/3"
        : "flex h-auto md:basis-1/2 lg:basis-1/2";

    return (
        <section id="doctors" className="py-24 bg-white">
            <div className="container mx-auto px-4 md:px-6">

                {/* Header */}
                <div className="flex flex-col items-center justify-center text-center gap-6 mb-16">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5 }}
                        className="w-full"
                    >
                        <h2 className="text-blue-600 font-bold tracking-wide uppercase text-sm mb-3">Our Doctor</h2>
                        <h3 className="text-3xl md:text-4xl font-bold text-slate-900 leading-tight">
                            Our Specialists
                        </h3>
                    </motion.div>
                </div>

                {/* Doctor Carousel with Navigation */}
                <div
                    className="relative"
                    onMouseEnter={() => setIsHovered(true)}
                    onMouseLeave={() => setIsHovered(false)}
                >
                    <Carousel
                        setApi={setApi}
                        opts={{ align: "start", loop: doctors.length > 1 }}
                        className="w-full"
                    >
                        <CarouselContent className="items-stretch">
                            {doctors.map((doctor) => (
                                <CarouselItem key={doctor.id} className={itemClassName}>
                                    <div
                                        className="group flex h-full w-full flex-col overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm transition-all duration-300 sm:flex-row hover:shadow-xl"
                                    >
                                        {/* Image */}
                                        <div className="relative h-96 shrink-0 overflow-hidden bg-slate-100 sm:h-auto sm:min-h-full sm:w-2/5">
                                            <img
                                                src={doctor.image}
                                                alt={doctor.name}
                                                className="absolute inset-0 w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
                                                style={resolveImagePresentationStyle({
                                                    imagePosition: doctor.imagePosition,
                                                    imageScale: doctor.imageScale,
                                                    imageOpacity: doctor.imageOpacity,
                                                    imageBlur: doctor.imageBlur,
                                                })}
                                            />
                                        </div>

                                        {/* Info */}
                                        <div className="flex grow flex-col p-6">
                                            <h4 className="mb-2 min-h-[5.5rem] line-clamp-3 text-xl font-bold text-slate-900 transition-colors group-hover:text-blue-600">
                                                {doctor.name}
                                            </h4>
                                            <p className="mb-4 min-h-[2.5rem] text-sm font-medium text-blue-600">
                                                {doctor.specialty}
                                            </p>

                                            <div className="mb-6 min-h-[5.5rem] space-y-2 text-sm text-slate-600">
                                                <p className="flex justify-between border-b border-slate-50 pb-2">
                                                    <span className="text-slate-400">Qualifications:</span>
                                                    <span className="font-medium text-right max-w-[60%]">{doctor.qualifications}</span>
                                                </p>
                                                <p className="flex justify-between border-b border-slate-50 pb-2">
                                                    <span className="text-slate-400">Experience:</span>
                                                    <span className="font-medium text-right">{doctor.experience}+ years</span>
                                                </p>
                                            </div>

                                            <Dialog onOpenChange={setIsModalOpen}>
                                                <DialogTrigger asChild>
                                                    <button
                                                        className="mt-auto block w-full rounded-xl border border-slate-100 bg-slate-50 py-3 text-center font-semibold text-blue-600 transition-colors hover:border-transparent hover:bg-blue-600 hover:text-white"
                                                    >
                                                        Learn More
                                                    </button>
                                                </DialogTrigger>
                                                <DialogContent className="w-[90vw] max-w-[90vw] sm:max-w-[90vw] md:max-w-[90vw] max-h-[95vh] p-0 overflow-hidden bg-white">
                                                    <DialogHeader className="sr-only">
                                                        <DialogTitle>{doctor.name} - Profile</DialogTitle>
                                                        <DialogDescription>Detailed profile of {doctor.name}</DialogDescription>
                                                    </DialogHeader>
                                                    <div className="flex flex-col md:flex-row h-full max-h-[90vh]">
                                                        {/* Image Side */}
                                                        <div className="relative h-80 w-full shrink-0 md:h-auto md:w-1/2">
                                                            <img
                                                                src={doctor.image}
                                                                alt={doctor.name}
                                                                className="w-full h-full object-cover object-top"
                                                                style={resolveImagePresentationStyle({
                                                                    imagePosition: doctor.imagePosition,
                                                                    imageScale: doctor.imageScale,
                                                                    imageOpacity: doctor.imageOpacity,
                                                                    imageBlur: doctor.imageBlur,
                                                                })}
                                                            />
                                                        </div>
                                                        {/* Scrollable Content Side */}
                                                        <div className="w-full md:w-1/2 p-6 md:p-8 flex flex-col h-full overflow-y-auto">
                                                            <h4 className="text-3xl font-bold text-slate-900 mb-2">
                                                                {doctor.name}
                                                            </h4>
                                                            <p className="text-blue-600 font-semibold text-lg mb-6">
                                                                {doctor.specialty}
                                                            </p>

                                                            <div className="space-y-4 mb-8 text-base text-slate-600 border-y border-slate-100 py-6">
                                                                <div className="flex justify-between items-center">
                                                                    <span className="text-slate-400">Qualifications</span>
                                                                    <span className="font-semibold text-slate-900 text-right">{doctor.qualifications}</span>
                                                                </div>
                                                                <div className="flex justify-between items-center">
                                                                    <span className="text-slate-400">Experience</span>
                                                                    <span className="font-semibold text-slate-900 text-right">{doctor.experience}+ years</span>
                                                                </div>
                                                            </div>

                                                            <div className="grow">
                                                                <h5 className="font-bold text-slate-900 mb-3 uppercase tracking-wider text-sm">About Doctor</h5>
                                                                <p className="text-slate-600 leading-relaxed">
                                                                    {doctor.bio}
                                                                </p>
                                                            </div>

                                                            <div className="mt-8 pt-6 border-t border-slate-100">
                                                                <DialogTrigger asChild>
                                                                    <button className="w-full flex items-center justify-center bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold py-3 rounded-xl transition-colors">
                                                                        Close
                                                                    </button>
                                                                </DialogTrigger>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </DialogContent>
                                            </Dialog>
                                        </div>
                                    </div>
                                </CarouselItem>
                            ))}
                        </CarouselContent>
                        <div className="flex items-center justify-center gap-4 mt-8">
                            <CarouselPrevious className="static translate-y-0 h-12 w-12 bg-slate-100 hover:bg-blue-600 hover:text-white text-slate-600 border-slate-200 transition-all" />
                            <CarouselNext className="static translate-y-0 h-12 w-12 bg-slate-100 hover:bg-blue-600 hover:text-white text-slate-600 border-slate-200 transition-all" />
                        </div>
                    </Carousel>
                </div>

            </div>
        </section>
    );
}
