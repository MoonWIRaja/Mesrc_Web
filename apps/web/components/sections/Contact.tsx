"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format } from "date-fns";
import { MapPin, Phone, Clock, MessageCircle } from "lucide-react";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useContactSettings, type ContactSettings } from "@/hooks/useContactSettings";
import { TimePicker } from "@/components/ui/time-picker";
import { DatetimePicker } from "@/components/ui/datetime-picker";
import { DEFAULT_NAVBAR_SETTINGS } from "@/lib/data/defaults";

interface NavbarBrandSettings {
    brandName?: string;
    footerBrandName?: string;
}

// Form Schema Validation
const formSchema = z.object({
    name: z.string().min(3, { message: "Full name is required (min 3 letters)." }),
    phone: z.string().min(10, { message: "Invalid phone number." }),
    email: z.string().email({ message: "Please enter a valid email." }),
    date: z.string().min(1, { message: "Please select an appointment date." }),
    time: z.string().min(1, { message: "Please select an appointment time." }),
    message: z.string().optional(),
});

export function Contact() {
    const [whatsappNumber, setWhatsappNumber] = useState("60123456789");
    const [brandName, setBrandName] = useState(DEFAULT_NAVBAR_SETTINGS.footerBrandName);
    const [contactData, setContactData] = useState<ContactSettings | null>(null);
    const { settings } = useContactSettings();
    
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            phone: "",
            email: "",
            date: "",
            time: "",
            message: "",
        },
    });

    // Update WhatsApp number and contact data when settings load
    useEffect(() => {
        if (settings) {
            setWhatsappNumber(settings.whatsappNumber.replace(/[+\s-]/g, ""));
            setContactData(settings);
        }
    }, [settings]);

    useEffect(() => {
        const fetchBrandSettings = async () => {
            try {
                const res = await fetch("/api/data?section=navbar");
                const data = await res.json();
                const navbar = data.data as NavbarBrandSettings | undefined;
                if (navbar) {
                    setBrandName(navbar.footerBrandName || navbar.brandName || DEFAULT_NAVBAR_SETTINGS.footerBrandName);
                }
            } catch (error) {
                console.error("Failed to load navbar settings:", error);
            }
        };

        fetchBrandSettings();
    }, []);

    function onSubmit(values: z.infer<typeof formSchema>) {
        // Generates WhatsApp Link
        const text = `Hello ${brandName}, I am interested in booking an appointment:
Name: ${values.name}
Phone No.: ${values.phone}
Email: ${values.email}
Date: ${values.date}
Time: ${values.time}
Message: ${values.message || 'None'}`;

        const encodedText = encodeURIComponent(text);
        window.open(`https://wa.me/${whatsappNumber}?text=${encodedText}`, "_blank");
    }

    const parseDateValue = (value: string) => {
        if (!value) return undefined;
        const [year, month, day] = value.split("-").map(Number);
        if (!year || !month || !day) return undefined;
        return new Date(year, month - 1, day);
    };

    return (
        <section id="contact" className="py-24 bg-white relative">
            <div className="container mx-auto px-4 md:px-6">

                <div className="text-center max-w-3xl mx-auto mb-16">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5 }}
                    >
                        <h2 className="text-blue-600 font-bold tracking-wide uppercase text-sm mb-3">Contact Us</h2>
                        <h3 id="appointment" className="text-3xl md:text-5xl font-bold text-slate-900 leading-tight mb-6 scroll-mt-32">
                            Schedule Your Appointment
                        </h3>
                        <p className="text-slate-600 text-lg leading-relaxed">
                            Take the first step to treat your vision today. Fill out the form below
                            and our staff will contact you to confirm the slot.
                        </p>
                    </motion.div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8">

                    {/* Booking Form Side */}
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="bg-slate-50 border border-slate-100 p-8 rounded-3xl shadow-sm"
                    >
                        <h4 className="text-2xl font-bold text-slate-900 mb-6">Registration Form</h4>
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <FormField
                                        control={form.control}
                                        name="name"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Full Name *</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="John Doe" className="bg-white" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="phone"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Phone No. *</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="012-3456789" className="bg-white" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <FormField
                                    control={form.control}
                                    name="email"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Email *</FormLabel>
                                            <FormControl>
                                                <Input placeholder="ali@email.com" type="email" className="bg-white" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <FormField
                                        control={form.control}
                                        name="date"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Date *</FormLabel>
                                                <FormControl>
                                                    <DatetimePicker
                                                        value={parseDateValue(field.value)}
                                                        onChange={(date) => field.onChange(date ? format(date, "yyyy-MM-dd") : "")}
                                                        placeholder="Pick a date"
                                                        showTimeSelect={false}
                                                        minDate={new Date()}
                                                        className="bg-white"
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="time"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Time *</FormLabel>
                                                <FormControl>
                                                    <TimePicker value={field.value} onChange={field.onChange} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <FormField
                                    control={form.control}
                                    name="message"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Note / Message (Optional)</FormLabel>
                                            <FormControl>
                                                <Textarea
                                                    placeholder="Briefly explain your eye problem..."
                                                    className="resize-none bg-white min-h-[280px]"
                                                    rows={10}
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <button
                                    type="submit"
                                    className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-xl font-bold text-lg transition-colors"
                                >
                                    <MessageCircle size={20} />
                                    Submit Request via WhatsApp
                                </button>
                            </form>
                        </Form>
                    </motion.div>

                    {/* Contact Info & Map Side */}
                    <motion.div
                        initial={{ opacity: 0, x: 30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: 0.4 }}
                        className="flex flex-col gap-8"
                    >
                        {/* Info Cards */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="bg-blue-50 border border-blue-100 p-6 rounded-2xl">
                                <div className="bg-blue-600 text-white w-12 h-12 flex flex-center rounded-xl items-center justify-center mb-4">
                                    <Phone size={24} />
                                </div>
                                <h5 className="font-bold text-slate-900 mb-1">Call Our Hotline</h5>
                                <p className="text-slate-600 font-medium">{contactData?.hotlineNumber || contactData?.phone || "+60 3-1234 5678"}</p>
                                <p className="text-sm text-slate-500 mt-2">Recommended for emergencies</p>
                            </div>

                            <div className="bg-amber-50 border border-amber-100 p-6 rounded-2xl">
                                <div className="bg-amber-500 text-white w-12 h-12 flex flex-center rounded-xl items-center justify-center mb-4">
                                    <Clock size={24} />
                                </div>
                                <h5 className="font-bold text-slate-900 mb-1">Operating Hours</h5>
                                <div className="space-y-1 text-sm">
                                    {contactData?.weeklyHours && Object.entries(contactData.weeklyHours).map(([day, hours]) => (
                                        <div key={day} className="flex justify-between">
                                            <span className="font-medium text-slate-700 capitalize">{day}</span>
                                            <span className="text-slate-600">
                                                {hours.isOpen
                                                    ? `${hours.openTime} - ${hours.closeTime}`
                                                    : "Closed"}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="bg-slate-50 border border-slate-100 p-6 rounded-2xl">
                            <div className="bg-slate-900 text-white w-12 h-12 flex flex-center rounded-xl items-center justify-center mb-4">
                                <MapPin size={24} />
                            </div>
                            <h5 className="font-bold text-slate-900 mb-1">Our Location</h5>
                            <p className="text-slate-600 font-medium mb-1">{contactData?.locationName || "KL Eye Medical Tower"}</p>
                            <p className="text-sm text-slate-500 leading-relaxed mb-4 whitespace-pre-line">
                                {contactData?.locationAddress || "Level 4, Cemerlang Building,\n123 Jalan Ampang, 50450 Kuala Lumpur."}
                            </p>

                            <div className="w-full h-48 rounded-xl overflow-hidden bg-slate-200">
                                {contactData?.googleMapsUrl ? (
                                    <iframe
                                        src={contactData.googleMapsUrl}
                                        width="100%"
                                        height="100%"
                                        style={{ border: 0 }}
                                        allowFullScreen={false}
                                        loading="lazy"
                                        referrerPolicy="no-referrer-when-downgrade"
                                        title="Google Maps Lokasi"
                                    ></iframe>
                                ) : (
                                    <iframe
                                        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15935.158782013897!2d101.698007!3d3.159325!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31cc37d3faabd6at%3A0xc1fcc4f3eafaaf0!2sKuala%20Lumpur%20City%20Centre%2C%20Kuala%20Lumpur!5e0!3m2!1sen!2smy!4v1703666505672!5m2!1sen!2smy"
                                        width="100%"
                                        height="100%"
                                        style={{ border: 0 }}
                                        allowFullScreen={false}
                                        loading="lazy"
                                        referrerPolicy="no-referrer-when-downgrade"
                                        title="Google Maps Lokasi"
                                    ></iframe>
                                )}
                            </div>
                        </div>
                    </motion.div>
                </div>

            </div>
        </section>
    );
}
