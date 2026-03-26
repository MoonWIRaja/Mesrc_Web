import { NextRequest, NextResponse } from "next/server";

/**
 * TikTok for Developers API Integration
 * 
 * Prerequisites:
 * 1. Create a TikTok Developer App at https://developers.tiktok.com/
 * 2. Get Client Key and Client Secret
 * 3. Set up OAuth redirect URI
 * 4. Request user.info.basic and video.list permissions
 * 
 * Add to .env:
 * TIKTOK_CLIENT_KEY=your_client_key
 * TIKTOK_CLIENT_SECRET=your_client_secret
 * TIKTOK_REDIRECT_URI=http://localhost:3000/api/social/tiktok/callback
 */

const TIKTOK_CLIENT_KEY = process.env.TIKTOK_CLIENT_KEY || "";
const TIKTOK_CLIENT_SECRET = process.env.TIKTOK_CLIENT_SECRET || "";
const REDIRECT_URI = process.env.TIKTOK_REDIRECT_URI || "http://localhost:3000/api/social/tiktok/callback";

let storedTokens: {
    accessToken: string;
    refreshToken: string;
    expiresAt: number;
    openId: string;
} | null = null;

export async function GET(request: NextRequest) {
    const action = request.nextUrl.searchParams.get("action");

    if (action === "connect") {
        const scope = "user.info.basic,video.list";
        const authUrl = `https://www.tiktok.com/v2/auth/authorize/?client_key=${TIKTOK_CLIENT_KEY}&scope=${scope}&response_type=code&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&state=random_state`;

        return NextResponse.json({ authUrl });
    }

    if (action === "posts") {
        if (!storedTokens) {
            return NextResponse.json({ error: "Not connected to TikTok" }, { status: 401 });
        }

        try {
            const response = await fetch(
                `https://open-api.tiktok.com/video/list/?access_token=${storedTokens.accessToken}&open_id=${storedTokens.openId}&max_count=20`
            );

            const data = await response.json();

            if (data.error?.code !== 0) {
                return NextResponse.json({ error: data.error?.message || "Failed to fetch videos" }, { status: 400 });
            }

            const posts = data.data?.video_list?.map((video: any) => ({
                id: video.id,
                platform: "tiktok",
                type: "video",
                image: video.cover_image_url || video.poster_url,
                thumbnail: video.cover_image_url || video.poster_url,
                caption: video.title || "",
                link: video.share_url || `https://www.tiktok.com/@user/video/${video.id}`,
                likes: video.stats?.like_count || 0,
                views: video.stats?.play_count?.toString() || "0",
                comments: video.stats?.comment_count || 0,
                shares: video.stats?.share_count || 0,
                date: video.create_time ? new Date(video.create_time * 1000).toISOString().split("T")[0] : new Date().toISOString().split("T")[0],
                isActive: true,
            })) || [];

            return NextResponse.json({ posts });
        } catch (error) {
            console.error("TikTok API error:", error);
            return NextResponse.json({ error: "Failed to fetch posts" }, { status: 500 });
        }
    }

    if (action === "status") {
        return NextResponse.json({
            connected: !!storedTokens,
            openId: storedTokens?.openId || null,
        });
    }

    if (action === "disconnect") {
        storedTokens = null;
        return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
}

export async function POST(request: NextRequest) {
    const { code } = await request.json();

    if (!code) {
        return NextResponse.json({ error: "Authorization code required" }, { status: 400 });
    }

    try {
        // Exchange code for token
        const tokenResponse = await fetch("https://open-api.tiktok.com/oauth/token/", {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: new URLSearchParams({
                client_key: TIKTOK_CLIENT_KEY,
                client_secret: TIKTOK_CLIENT_SECRET,
                code,
                grant_type: "authorization_code",
                redirect_uri: REDIRECT_URI,
            }),
        });

        const tokenData = await tokenResponse.json();

        if (tokenData.error) {
            return NextResponse.json({ error: tokenData.error_description || tokenData.error }, { status: 400 });
        }

        // Store tokens
        storedTokens = {
            accessToken: tokenData.access_token,
            refreshToken: tokenData.refresh_token,
            expiresAt: Date.now() + tokenData.expires_in * 1000,
            openId: tokenData.open_id,
        };

        return NextResponse.json({
            success: true,
            openId: tokenData.open_id,
            message: "TikTok connected successfully!",
        });
    } catch (error) {
        console.error("TikTok token exchange error:", error);
        return NextResponse.json({ error: "Failed to connect TikTok" }, { status: 500 });
    }
}