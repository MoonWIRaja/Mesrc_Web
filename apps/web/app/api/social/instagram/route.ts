import { NextRequest, NextResponse } from "next/server";

/**
 * Instagram Graph API Integration
 * 
 * Prerequisites:
 * 1. Create a Meta Developer App at https://developers.facebook.com/
 * 2. Add Instagram Basic Display API product
 * 3. Add Instagram Graph API product
 * 4. Get App ID and App Secret
 * 5. Set up OAuth redirect URI
 * 
 * Add to .env:
 * INSTAGRAM_APP_ID=your_app_id
 * INSTAGRAM_APP_SECRET=your_app_secret
 * INSTAGRAM_REDIRECT_URI=http://localhost:3000/api/social/instagram/callback
 */

const INSTAGRAM_APP_ID = process.env.INSTAGRAM_APP_ID || "";
const INSTAGRAM_APP_SECRET = process.env.INSTAGRAM_APP_SECRET || "";
const REDIRECT_URI = process.env.INSTAGRAM_REDIRECT_URI || "http://localhost:3000/api/social/instagram/callback";

// Store tokens in memory (use database in production)
let storedTokens: {
    accessToken: string;
    refreshToken: string;
    expiresAt: number;
    userId: string;
} | null = null;

// Step 1: Generate OAuth URL
export async function GET(request: NextRequest) {
    const action = request.nextUrl.searchParams.get("action");

    if (action === "connect") {
        // Generate OAuth URL for user to authorize
        const scope = "user_profile,user_media";
        const authUrl = `https://api.instagram.com/oauth/authorize?client_id=${INSTAGRAM_APP_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&scope=${scope}&response_type=code`;

        return NextResponse.json({ authUrl });
    }

    if (action === "posts") {
        // Fetch posts from Instagram
        if (!storedTokens) {
            return NextResponse.json({ error: "Not connected to Instagram" }, { status: 401 });
        }

        try {
            const response = await fetch(
                `https://graph.instagram.com/me/media?fields=id,caption,media_type,media_url,thumbnail_url,permalink,timestamp&access_token=${storedTokens.accessToken}`
            );

            const data = await response.json();

            if (data.error) {
                return NextResponse.json({ error: data.error.message }, { status: 400 });
            }

            // Transform to our format
            const posts = data.data?.map((post: any) => ({
                id: post.id,
                platform: "instagram",
                type: post.media_type === "VIDEO" ? "video" : "image",
                image: post.media_url || post.thumbnail_url,
                thumbnail: post.thumbnail_url || post.media_url,
                caption: post.caption || "",
                link: post.permalink,
                likes: 0, // Basic Display API doesn't provide likes
                views: "0",
                comments: 0,
                shares: 0,
                date: post.timestamp?.split("T")[0] || new Date().toISOString().split("T")[0],
                isActive: true,
            })) || [];

            return NextResponse.json({ posts });
        } catch (error) {
            console.error("Instagram API error:", error);
            return NextResponse.json({ error: "Failed to fetch posts" }, { status: 500 });
        }
    }

    if (action === "status") {
        return NextResponse.json({
            connected: !!storedTokens,
            userId: storedTokens?.userId || null,
        });
    }

    if (action === "disconnect") {
        storedTokens = null;
        return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
}

// Step 2: Exchange code for token (handled by callback)
export async function POST(request: NextRequest) {
    const { code } = await request.json();

    if (!code) {
        return NextResponse.json({ error: "Authorization code required" }, { status: 400 });
    }

    try {
        // Exchange code for short-lived token
        const tokenResponse = await fetch("https://api.instagram.com/oauth/access_token", {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: new URLSearchParams({
                client_id: INSTAGRAM_APP_ID,
                client_secret: INSTAGRAM_APP_SECRET,
                grant_type: "authorization_code",
                redirect_uri: REDIRECT_URI,
                code,
            }),
        });

        const tokenData = await tokenResponse.json();

        if (tokenData.error) {
            return NextResponse.json({ error: tokenData.error_message || tokenData.error }, { status: 400 });
        }

        // Exchange for long-lived token
        const longLivedResponse = await fetch(
            `https://graph.instagram.com/access_token?grant_type=ig_exchange_token&client_secret=${INSTAGRAM_APP_SECRET}&access_token=${tokenData.access_token}`
        );

        const longLivedData = await longLivedResponse.json();

        // Store tokens
        storedTokens = {
            accessToken: longLivedData.access_token || tokenData.access_token,
            refreshToken: "",
            expiresAt: Date.now() + (longLivedData.expires_in || 5184000) * 1000, // ~60 days
            userId: tokenData.user_id,
        };

        return NextResponse.json({
            success: true,
            userId: tokenData.user_id,
            message: "Instagram connected successfully!"
        });
    } catch (error) {
        console.error("Instagram token exchange error:", error);
        return NextResponse.json({ error: "Failed to connect Instagram" }, { status: 500 });
    }
}