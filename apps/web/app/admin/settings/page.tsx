"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Save, Loader2, Lock, User, Building2, Upload } from "lucide-react";
import { NavbarSettings } from "@/lib/data/store";
import { DEFAULT_NAVBAR_SETTINGS } from "@/lib/data/defaults";

interface AdminUser {
    id: string;
    name: string;
    email: string;
    role: string;
}

const initialAdmin: AdminUser = {
    id: "1",
    name: "Admin",
    email: "admin@eyespecialist.com",
    role: "admin",
};

export default function SettingsAdminPage() {
    const [admin, setAdmin] = useState<AdminUser>(initialAdmin);
    const [navbarSettings, setNavbarSettings] = useState<NavbarSettings>({
        ...DEFAULT_NAVBAR_SETTINGS,
    });
    const [passwords, setPasswords] = useState({ current: "", new: "", confirm: "" });
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isSavingAccount, setIsSavingAccount] = useState(false);
    const [isUploadingLogo, setIsUploadingLogo] = useState(false);
    const [isChangingPassword, setIsChangingPassword] = useState(false);
    const [message, setMessage] = useState({ type: "", text: "" });
    const logoInputRef = useRef<HTMLInputElement>(null);

    // Load settings from API
    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = async () => {
        setIsLoading(true);
        try {
            // Load admin account settings
            const adminRes = await fetch("/api/auth/admin");
            const adminData = await adminRes.json();
            if (adminData.user) {
                setAdmin(adminData.user);
            }

            // Load navbar settings
            const navbarRes = await fetch("/api/data?section=navbar");
            const navbarData = await navbarRes.json();
            if (navbarData.data) {
                setNavbarSettings({
                    brandName: navbarData.data.brandName || DEFAULT_NAVBAR_SETTINGS.brandName,
                    logoUrl: navbarData.data.logoUrl || "",
                    footerBrandName: navbarData.data.footerBrandName || navbarData.data.brandName || DEFAULT_NAVBAR_SETTINGS.footerBrandName,
                    footerDescription: navbarData.data.footerDescription || DEFAULT_NAVBAR_SETTINGS.footerDescription,
                    copyrightText: navbarData.data.copyrightText || DEFAULT_NAVBAR_SETTINGS.copyrightText,
                });
            }
        } catch (error) {
            console.error("Failed to load settings:", error);
        }
        setIsLoading(false);
    };

    const handleSaveAccount = async () => {
        setIsSavingAccount(true);
        setMessage({ type: "", text: "" });

        try {
            const res = await fetch("/api/auth/admin", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: admin.name,
                    email: admin.email,
                }),
            });

            const data = await res.json();

            if (!res.ok || !data.success) {
                throw new Error(data.error || "Failed to save account");
            }

            setAdmin(data.user);

            const storedUserRaw = localStorage.getItem("adminUser");
            const storedUser = storedUserRaw ? JSON.parse(storedUserRaw) : {};
            localStorage.setItem("adminUser", JSON.stringify({ ...storedUser, ...data.user }));

            setMessage({ type: "success", text: "Account settings updated. Login now uses this email." });
        } catch (error) {
            const errorText = error instanceof Error ? error.message : "Failed to save account settings.";
            setMessage({ type: "error", text: errorText });
        } finally {
            setIsSavingAccount(false);
        }
        setTimeout(() => setMessage({ type: "", text: "" }), 5000);
    };

    const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploadingLogo(true);
        try {
            const formData = new FormData();
            formData.append("file", file);

            const res = await fetch("/api/upload", {
                method: "POST",
                body: formData,
            });
            const data = await res.json();

            if (!data.success) {
                throw new Error(data.error || "Failed upload");
            }

            setNavbarSettings((prev) => ({ ...prev, logoUrl: data.url }));
            setMessage({ type: "success", text: "Logo uploaded. Click Save Settings to publish logo and favicon." });
        } catch (error) {
            console.error("Failed to upload logo:", error);
            setMessage({ type: "error", text: "Failed to upload logo." });
        } finally {
            setIsUploadingLogo(false);
            e.target.value = "";
            setTimeout(() => setMessage({ type: "", text: "" }), 4000);
        }
    };

    const handleSaveSettings = async () => {
        setIsSaving(true);
        setMessage({ type: "", text: "" });

        try {
            // Save navbar settings
            const res = await fetch("/api/data?section=navbar", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(navbarSettings),
            });
            const data = await res.json();

            if (data.success) {
                setMessage({ type: "success", text: "Settings saved successfully! Navbar, footer, logo and favicon are updated." });
            } else {
                throw new Error("Failed to save settings");
            }
        } catch {
            setMessage({ type: "error", text: "Failed to save settings." });
        } finally {
            setIsSaving(false);
        }
        setTimeout(() => setMessage({ type: "", text: "" }), 5000);
    };

    const handleChangePassword = async () => {
        if (!passwords.current) {
            setMessage({ type: "error", text: "Current password is required!" });
            return;
        }
        if (passwords.new !== passwords.confirm) {
            setMessage({ type: "error", text: "New passwords do not match!" });
            return;
        }
        if (passwords.new.length < 6) {
            setMessage({ type: "error", text: "Password must be at least 6 characters!" });
            return;
        }

        setIsChangingPassword(true);
        try {
            const res = await fetch("/api/auth/admin", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    currentPassword: passwords.current,
                    newPassword: passwords.new,
                }),
            });

            const data = await res.json();

            if (!res.ok || !data.success) {
                throw new Error(data.error || "Failed to change password");
            }

            setMessage({ type: "success", text: "Password changed successfully! Login now uses the new password." });
            setPasswords({ current: "", new: "", confirm: "" });
        } catch (error) {
            const errorText = error instanceof Error ? error.message : "Failed to change password.";
            setMessage({ type: "error", text: errorText });
        } finally {
            setIsChangingPassword(false);
        }
        setTimeout(() => setMessage({ type: "", text: "" }), 3000);
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-slate-900">Settings</h1>
                    <p className="text-slate-500 mt-1">Manage your account and site settings</p>
                </div>
            </div>

            {/* Message */}
            {message.text && (
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                    className={`p-4 rounded-xl ${message.type === "success" ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-red-50 text-red-700 border border-red-200"}`}>
                    {message.text}
                </motion.div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Account Settings */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 space-y-6">
                    <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                                <User className="text-blue-600" size={20} />
                            </div>
                            <h2 className="text-lg font-bold text-slate-900">Account Settings</h2>
                        </div>
                        <button
                            onClick={handleSaveAccount}
                            disabled={isSavingAccount}
                            className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold px-4 py-2.5 rounded-xl transition-colors disabled:opacity-70"
                        >
                            {isSavingAccount ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <Save className="w-4 h-4" />
                                    Save Account
                                </>
                            )}
                        </button>
                    </div>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Name</label>
                            <input type="text" value={admin.name}
                                onChange={(e) => setAdmin({ ...admin, name: e.target.value })}
                                className="w-full border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Email</label>
                            <input type="email" value={admin.email}
                                onChange={(e) => setAdmin({ ...admin, email: e.target.value })}
                                className="w-full border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Role</label>
                            <input type="text" value={admin.role} disabled
                                className="w-full border border-slate-200 rounded-xl px-4 py-3 bg-slate-50 text-slate-500" />
                        </div>
                    </div>
                </div>

                {/* Change Password */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 space-y-6">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
                            <Lock className="text-amber-600" size={20} />
                        </div>
                        <h2 className="text-lg font-bold text-slate-900">Change Password</h2>
                    </div>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Current Password</label>
                            <input type="password" value={passwords.current}
                                onChange={(e) => setPasswords({ ...passwords, current: e.target.value })}
                                className="w-full border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">New Password</label>
                            <input type="password" value={passwords.new}
                                onChange={(e) => setPasswords({ ...passwords, new: e.target.value })}
                                className="w-full border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Confirm New Password</label>
                            <input type="password" value={passwords.confirm}
                                onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
                                className="w-full border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                        </div>
                        <button onClick={handleChangePassword} disabled={isChangingPassword}
                            className="w-full bg-slate-900 hover:bg-slate-800 text-white font-semibold py-3 rounded-xl transition-colors disabled:opacity-70">
                            {isChangingPassword ? "Changing..." : "Change Password"}
                        </button>
                    </div>
                </div>
            </div>

            {/* Branding Settings */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 space-y-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center">
                            <Building2 className="text-indigo-600" size={20} />
                        </div>
                        <h2 className="text-lg font-bold text-slate-900">Branding Settings</h2>
                    </div>
                    <button onClick={handleSaveSettings} disabled={isSaving}
                        className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-xl transition-colors disabled:opacity-70">
                        {isSaving ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                Saving...
                            </>
                        ) : (
                            <>
                                <Save className="w-5 h-5" />
                                Save Settings
                            </>
                        )}
                    </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Brand Name</label>
                        <input type="text" value={navbarSettings.brandName}
                            onChange={(e) => setNavbarSettings({ ...navbarSettings, brandName: e.target.value })}
                            className="w-full border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder={DEFAULT_NAVBAR_SETTINGS.brandName} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Logo URL</label>
                        <div className="flex gap-2">
                            <input type="text" value={navbarSettings.logoUrl}
                                onChange={(e) => setNavbarSettings({ ...navbarSettings, logoUrl: e.target.value })}
                                className="w-full border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="https://example.com/logo.png" />
                            <button
                                type="button"
                                onClick={() => logoInputRef.current?.click()}
                                disabled={isUploadingLogo}
                                className="inline-flex items-center gap-2 px-4 py-3 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-medium transition-colors disabled:opacity-70 whitespace-nowrap"
                            >
                                {isUploadingLogo ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Uploading...
                                    </>
                                ) : (
                                    <>
                                        <Upload className="w-4 h-4" />
                                        Upload Logo
                                    </>
                                )}
                            </button>
                        </div>
                        <input
                            ref={logoInputRef}
                            type="file"
                            accept="image/png,image/jpeg,image/webp,image/svg+xml,image/x-icon"
                            onChange={handleLogoUpload}
                            className="hidden"
                        />
                        <p className="text-xs text-slate-500 mt-1">Logo ini juga akan digunakan sebagai favicon selepas Save Settings.</p>
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Footer Brand Name</label>
                        <input type="text" value={navbarSettings.footerBrandName}
                            onChange={(e) => setNavbarSettings({ ...navbarSettings, footerBrandName: e.target.value })}
                            className="w-full border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder={DEFAULT_NAVBAR_SETTINGS.footerBrandName} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Copyright Text</label>
                        <input type="text" value={navbarSettings.copyrightText}
                            onChange={(e) => setNavbarSettings({ ...navbarSettings, copyrightText: e.target.value })}
                            className="w-full border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder={DEFAULT_NAVBAR_SETTINGS.copyrightText} />
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Footer Description</label>
                    <textarea value={navbarSettings.footerDescription}
                        onChange={(e) => setNavbarSettings({ ...navbarSettings, footerDescription: e.target.value })}
                        rows={3} className="w-full border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
                </div>
                {/* Logo Preview */}
                {navbarSettings.logoUrl && (
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Logo Preview</label>
                        <div className="h-32 w-auto rounded-xl border border-slate-200 overflow-hidden bg-slate-50">
                            <img
                                src={navbarSettings.logoUrl}
                                alt="Logo Preview"
                                className="h-full w-auto object-contain"
                                onError={(e) => {
                                    (e.target as HTMLImageElement).style.display = 'none';
                                }}
                            />
                        </div>
                    </div>
                )}
                {/* Live Preview */}
                <div className="p-4 bg-slate-50 rounded-xl">
                    <label className="block text-sm font-medium text-slate-700 mb-2">Preview</label>
                    <div className="space-y-4">
                        <div className="flex items-center gap-2">
                            {navbarSettings.logoUrl ? (
                                <img src={navbarSettings.logoUrl} alt="Logo" className="h-8 w-auto" />
                            ) : (
                                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                                    <span className="text-white font-bold text-sm">E</span>
                                </div>
                            )}
                            <span className="font-bold text-slate-900">{navbarSettings.brandName}</span>
                        </div>
                        <div className="border-t border-slate-200 pt-3">
                            <div className="font-bold text-slate-900 text-sm">{navbarSettings.footerBrandName}</div>
                            <p className="text-xs text-slate-600 mt-1">{navbarSettings.footerDescription}</p>
                            <p className="text-xs text-slate-500 mt-2">{navbarSettings.copyrightText}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
