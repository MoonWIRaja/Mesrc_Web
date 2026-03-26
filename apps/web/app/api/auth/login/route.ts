import { NextRequest, NextResponse } from "next/server";
import { generateToken, verifyPassword } from "@/lib/auth";
import { getAdminAuth } from "@/lib/data/store";

export async function POST(request: NextRequest) {
    try {
        const { email, password } = await request.json();

        if (!email || !password) {
            return NextResponse.json(
                { error: "Email and password are required" },
                { status: 400 }
            );
        }

        const admin = await getAdminAuth();
        const isEmailMatch = admin.email.toLowerCase() === email.toLowerCase();
        const isPasswordMatch = await verifyPassword(password, admin.passwordHash);
        if (isEmailMatch && isPasswordMatch) {
            const token = generateToken({
                userId: admin.id,
                email: admin.email,
                role: admin.role,
            });

            return NextResponse.json({
                token,
                user: {
                    id: admin.id,
                    email: admin.email,
                    name: admin.name,
                    role: admin.role,
                },
            });
        }

        return NextResponse.json(
            { error: "Invalid credentials" },
            { status: 401 }
        );
    } catch (error) {
        console.error("Login error:", error);
        return NextResponse.json(
            { error: "An error occurred during login" },
            { status: 500 }
        );
    }
}
