"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
    Image,
    Users,
    Briefcase,
    Tag,
    MessageSquare,
    MapPin,
    Eye,
    TrendingUp,
    Calendar,
    ArrowRight,
} from "lucide-react";

interface DashboardStats {
    doctors: number;
    services: number;
    promotions: number;
    reviews: number;
}

export default function AdminDashboard() {
    const [stats, setStats] = useState<DashboardStats>({
        doctors: 0,
        services: 0,
        promotions: 0,
        reviews: 0,
    });
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // For now, just set dummy data
        // In production, this would fetch from API
        setStats({
            doctors: 5,
            services: 8,
            promotions: 3,
            reviews: 12,
        });
        setIsLoading(false);
    }, []);

    const quickLinks = [
        { name: "Edit Hero Section", href: "/admin/hero", icon: Image, color: "bg-blue-500" },
        { name: "Manage Services", href: "/admin/services", icon: Briefcase, color: "bg-emerald-500" },
        { name: "Manage Doctors", href: "/admin/doctors", icon: Users, color: "bg-purple-500" },
        { name: "View Reviews", href: "/admin/reviews", icon: MessageSquare, color: "bg-amber-500" },
    ];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-slate-900">Dashboard</h1>
                    <p className="text-slate-500 mt-1">Welcome to MESRC Admin Panel</p>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-500">
                    <Calendar size={16} />
                    <span>{new Date().toLocaleDateString("en-MY", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</span>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100"
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-slate-500">Total Doctors</p>
                            <p className="text-3xl font-bold text-slate-900 mt-1">{stats.doctors}</p>
                        </div>
                        <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                            <Users className="text-blue-600" size={24} />
                        </div>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100"
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-slate-500">Services</p>
                            <p className="text-3xl font-bold text-slate-900 mt-1">{stats.services}</p>
                        </div>
                        <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center">
                            <Briefcase className="text-emerald-600" size={24} />
                        </div>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100"
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-slate-500">Promotions</p>
                            <p className="text-3xl font-bold text-slate-900 mt-1">{stats.promotions}</p>
                        </div>
                        <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center">
                            <Tag className="text-purple-600" size={24} />
                        </div>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100"
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-slate-500">Reviews</p>
                            <p className="text-3xl font-bold text-slate-900 mt-1">{stats.reviews}</p>
                        </div>
                        <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center">
                            <MessageSquare className="text-amber-600" size={24} />
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Quick Links */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100"
            >
                <h2 className="text-lg font-bold text-slate-900 mb-4">Quick Actions</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {quickLinks.map((link) => (
                        <Link
                            key={link.name}
                            href={link.href}
                            className="flex items-center gap-4 p-4 rounded-xl border border-slate-100 hover:border-blue-200 hover:bg-blue-50/50 transition-all group"
                        >
                            <div className={`w-10 h-10 rounded-lg ${link.color} flex items-center justify-center`}>
                                <link.icon className="text-white" size={20} />
                            </div>
                            <div className="flex-1">
                                <p className="font-medium text-slate-900">{link.name}</p>
                            </div>
                            <ArrowRight className="text-slate-400 group-hover:text-blue-500 transition-colors" size={18} />
                        </Link>
                    ))}
                </div>
            </motion.div>

            {/* Info Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="bg-gradient-to-br from-blue-600 to-cyan-500 rounded-2xl p-6 text-white"
                >
                    <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                            <Eye size={24} />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold">Landing Page</h3>
                            <p className="text-blue-100 mt-1 text-sm">
                                View your live website to see the changes you've made.
                            </p>
                            <Link
                                href="/"
                                className="inline-flex items-center gap-2 mt-4 text-sm font-medium bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-colors"
                            >
                                Visit Website
                                <ArrowRight size={16} />
                            </Link>
                        </div>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 }}
                    className="bg-slate-900 rounded-2xl p-6 text-white"
                >
                    <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center">
                            <TrendingUp size={24} />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold">Need Help?</h3>
                            <p className="text-slate-400 mt-1 text-sm">
                                Check the documentation or contact support for assistance.
                            </p>
                            <button className="inline-flex items-center gap-2 mt-4 text-sm font-medium bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg transition-colors">
                                View Guide
                                <ArrowRight size={16} />
                            </button>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
