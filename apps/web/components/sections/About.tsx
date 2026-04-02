"use client";

import { motion } from "framer-motion";
import { CheckCircle2, Award, ShieldCheck } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useEffect, useState } from "react";
import { DEFAULT_ABOUT_DATA } from "@/lib/data/defaults";
import { resolveImagePresentationStyle } from "@/lib/image-position";

interface AboutData {
    badge: string;
    title: string;
    titleMain: string;
    titleSub: string;
    titleMainColor: string;
    titleSubColor: string;
    image: string;
    imagePosition?: string;
    imageScale?: number;
    imageOpacity?: number;
    imageBlur?: number;
    history: string;
    mission: string;
    vision: string;
    accreditation: string;
    accreditationItems: {
        title: string;
        subtitle: string;
        icon: string;
    }[];
    directorName: string;
    directorTitle: string;
}

export function About() {
    const [about, setAbout] = useState<AboutData | null>(null);

    useEffect(() => {
        fetch("/api/data?section=about")
            .then(res => res.json())
            .then(data => {
                if (data.data) {
                    setAbout(data.data);
                }
            })
            .catch(console.error);
    }, []);

    const data = about || DEFAULT_ABOUT_DATA;

    const renderFormattedContent = (content: string, baseClassName: string) => {
        const lines = content
            .split(/\r?\n/)
            .map((line) => line.trim())
            .filter(Boolean);

        if (lines.length === 0) {
            return <p className={baseClassName}>{content}</p>;
        }

        const isNumberedList = lines.length > 1 && lines.every((line) => /^\d+[\.\)]\s*/.test(line));

        if (isNumberedList) {
            return (
                <ol className={`${baseClassName} list-decimal space-y-2 pl-5`}>
                    {lines.map((line, index) => (
                        <li key={`${line}-${index}`}>
                            {line.replace(/^\d+[\.\)]\s*/, "")}
                        </li>
                    ))}
                </ol>
            );
        }

        return (
            <div className="space-y-2">
                {lines.map((line, index) => (
                    <p key={`${line}-${index}`} className={baseClassName}>
                        {line}
                    </p>
                ))}
            </div>
        );
    };

    return (
        <section id="about" className="py-24 bg-white">
            <div className="container mx-auto px-4 md:px-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true, margin: "-100px" }}
                        transition={{ duration: 0.6 }}
                        className="relative h-[500px] md:h-[600px] w-full rounded-2xl overflow-hidden group"
                    >
                        <div className="absolute inset-0 bg-slate-200">
                            <img
                                src={data.image}
                                alt="Eye Specialist Center Facility"
                                className="object-cover w-full h-full transition-transform duration-700 group-hover:scale-105"
                                style={resolveImagePresentationStyle({
                                    imagePosition: data.imagePosition,
                                    imageScale: data.imageScale,
                                    imageOpacity: data.imageOpacity,
                                    imageBlur: data.imageBlur,
                                })}
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent" />
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, x: 30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true, margin: "-100px" }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                    >
                        <Badge variant="outline" className="text-blue-600 border-blue-200 bg-blue-50 mb-4 px-3 py-1">
                            {data.badge}
                        </Badge>
                        <h2
                            className="text-3xl md:text-5xl font-normal text-slate-900 mb-6 leading-tight"
                            style={{ fontFamily: '"Times New Roman", Times, serif' }}
                        >
                            <span style={{ color: data.titleMainColor || '#000000' }}>{data.titleMain || "Melaka Eye"}</span> <br />
                            <span style={{ color: data.titleSubColor || '#2563eb' }}>{data.titleSub || "Specialist And Refractive Centre"}</span>
                        </h2>

                        <Tabs defaultValue="sejarah" className="w-full mt-8">
                            <TabsList className="grid w-full grid-cols-3 mb-8 bg-slate-100 p-1 rounded-xl">
                                <TabsTrigger value="sejarah" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">History</TabsTrigger>
                                <TabsTrigger value="misi" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">Mission & Vision</TabsTrigger>
                                <TabsTrigger value="akreditasi" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">Accreditation</TabsTrigger>
                            </TabsList>

                            <TabsContent value="sejarah" className="text-slate-600 space-y-4">
                                <p className="leading-relaxed text-lg">{data.history}</p>
                            </TabsContent>

                            <TabsContent value="misi" className="text-slate-600 space-y-6">
                                <div>
                                    <h4 className="font-bold text-slate-900 text-lg flex items-center gap-2 mb-2">
                                        <CheckCircle2 className="text-blue-500" size={20} /> Our Mission
                                    </h4>
                                    {renderFormattedContent(data.mission, "leading-relaxed pl-7")}
                                </div>
                                <div>
                                    <h4 className="font-bold text-slate-900 text-lg flex items-center gap-2 mb-2">
                                        <CheckCircle2 className="text-blue-500" size={20} /> Our Vision
                                    </h4>
                                    {renderFormattedContent(data.vision, "leading-relaxed pl-7")}
                                </div>
                            </TabsContent>

                            <TabsContent value="akreditasi" className="text-slate-600 space-y-4">
                                <p className="leading-relaxed mb-6">{data.accreditation}</p>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {(data.accreditationItems || []).map((item: any, index: number) => (
                                        <div key={index} className="flex items-start gap-3 p-4 rounded-xl border border-slate-100 bg-slate-50">
                                            {item.icon === "award" ? (
                                                <Award className="text-amber-500 shrink-0" size={24} />
                                            ) : (
                                                <ShieldCheck className="text-emerald-500 shrink-0" size={24} />
                                            )}
                                            <div>
                                                <h5 className="font-semibold text-slate-900">{item.title}</h5>
                                                <span className="text-sm text-slate-500">{item.subtitle}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </TabsContent>
                        </Tabs>

                        <div className="mt-10 pt-8 border-t border-slate-100">
                            <div className="text-center">
                                <p className="font-bold text-slate-900">{data.directorName}</p>
                                <p className="text-sm text-slate-500">{data.directorTitle}</p>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
