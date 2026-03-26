import { NextRequest, NextResponse } from "next/server";
import { getAdminAuth, updateAdminPassword, updateAdminProfile } from "@/lib/data/store";

export async function GET() {
    try {
        const admin = await getAdminAuth();
        return NextResponse.json({
            user: {
                id: admin.id,
                name: admin.name,
                email: admin.email,
                role: admin.role,
            },
        });
    } catch (error) {
        console.error("Failed to load admin settings:", error);
        return NextResponse.json({ error: "Failed to load admin settings" }, { status: 500 });
    }
}

export async function PATCH(request: NextRequest) {
    try {
        const { name, email } = await request.json();

        if (!name || !email) {
            return NextResponse.json({ error: "Name and email are required" }, { status: 400 });
        }

        const normalizedName = String(name).trim();
        const normalizedEmail = String(email).trim().toLowerCase();
        if (!normalizedName) {
            return NextResponse.json({ error: "Name is required" }, { status: 400 });
        }
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailPattern.test(normalizedEmail)) {
            return NextResponse.json({ error: "Invalid email format" }, { status: 400 });
        }

        const updated = await updateAdminProfile({
            name: normalizedName,
            email: normalizedEmail,
        });

        return NextResponse.json({
            success: true,
            user: {
                id: updated.adminAuth.id,
                name: updated.adminAuth.name,
                email: updated.adminAuth.email,
                role: updated.adminAuth.role,
            },
        });
    } catch (error) {
        console.error("Failed to update admin profile:", error);
        return NextResponse.json({ error: "Failed to update admin profile" }, { status: 500 });
    }
}

export async function PUT(request: NextRequest) {
    try {
        const { currentPassword, newPassword } = await request.json();

        if (!currentPassword || !newPassword) {
            return NextResponse.json(
                { error: "Current password and new password are required" },
                { status: 400 }
            );
        }

        const trimmedNewPassword = String(newPassword).trim();
        if (trimmedNewPassword.length < 6) {
            return NextResponse.json(
                { error: "Password must be at least 6 characters" },
                { status: 400 }
            );
        }

        const updated = await updateAdminPassword(String(currentPassword), trimmedNewPassword);

        return NextResponse.json({
            success: true,
            user: {
                id: updated.adminAuth.id,
                name: updated.adminAuth.name,
                email: updated.adminAuth.email,
                role: updated.adminAuth.role,
            },
        });
    } catch (error) {
        if (error instanceof Error && error.message === "Current password is incorrect") {
            return NextResponse.json({ error: error.message }, { status: 400 });
        }

        console.error("Failed to update admin password:", error);
        return NextResponse.json({ error: "Failed to update password" }, { status: 500 });
    }
}
