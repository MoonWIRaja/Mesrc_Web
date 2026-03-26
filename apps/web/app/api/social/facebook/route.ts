import { NextRequest, NextResponse } from "next/server";

/**
 * Facebook Graph API Integration
 * 
 * Prerequisites:
 * 1. Create a Meta Developer App at https://developers.facebook.com/
 * 2. Add Facebook Login product
 * 3. Get App ID and App Secret
 * 4. Set up OAuth redirect URI
 * 5. Request pages_read_engagement and instagram_basic permissions
 * 
 * Add to .env:
 * FACEBOOK_APP_ID=your_app_id
 * FACEBOOK_APP_SECRET=your_app_secret
 * FACEBOOK_REDIRECT_URI=http://localhost:3000/api/social/facebook/callback
 */

const FACEBOOK_APP_ID = process.env.FACEBOOK_APP_ID || "";
const FACEBOOK_APP_SECRET = process.env.FACEBOOK_APP_SECRET || "";
const REDIRECT_URI = process.env.FACEBOOK_REDIRECT_URI || "http://localhost:3000/api/social/facebook/callback";

let storedTokens: {
    accessToken: string;
    pageId: string;
    expiresAt: number;
} | null = null;

export async function GET(request: NextRequest) {
    const action = request.nextUrl.searchParams.get("action");

    if (action === "connect") {
        const scope = "pages_read_engagement,pages_show_list,instagram_basic";
        const authUrl = `https://www.facebook.com/v18.0/dialog/oauth?client_id=${FACEBOOK_APP_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&scope=${scope}&response_type=code`;

        return NextResponse.json({ authUrl });
    }

    if (action === "posts") {
        if (!storedTokens) {
            return NextResponse.json({ error: "Not connected to Facebook" }, { status: 401 });
        }

        try {
            // Get page posts
            const response = await fetch(
                `https://graph.facebook.com/v18.0/${storedTokens.pageId}/posts?fields=id,message,attachments,created_time,permalink_url&access_token=${storedTokens.accessToken}`
            );

            const data = await response.json();

            if (data.error) {
                return NextResponse.json({ error: data.error.message }, { status: 400 });
            }

            const posts = data.data?.map((post: any) => ({
                id: post.id,
                platform: "facebook",
                type: post.attachments?.data?.[0]?.media_type === "video" ? "video" : "image",
                image: post.attachments?.data?.[0]?.media?.image?.src || "",
                thumbnail: post.attachments?.data?.[0]?.media?.image?.src || "",
                caption: post.message || "",
                link: post.permalink_url,
                likes: 0,
                views: "0",
                comments: 0,
                shares: 0,
                date: post.created_time?.split("T")[0] || new Date().toISOString().split("T")[0],
                isActive: true,
            })) || [];

            return NextResponse.json({ posts });
        } catch (error) {
            console.error("Facebook API error:", error);
            return NextResponse.json({ error: "Failed to fetch posts" }, { status: 500 });
        }
    }

    if (action === "status") {
        return NextResponse.json({
            connected: !!storedTokens,
            pageId: storedTokens?.pageId || null,
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
        // Exchange code for short-lived token
        const tokenResponse = await fetch(
            `https://graph.facebook.com/v18.0/oauth/access_token?client_id=${FACEBOOK_APP_ID}&client_secret=${FACEBOOK_APP_SECRET}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&code=${code}`
        );

        const tokenData = await tokenResponse.json();

        if (tokenData.error) {
            return NextResponse.json({ error: tokenData.error.message }, { status: 400 });
        }

        // Exchange for long-lived token
        const longLivedResponse = await fetch(
            `https://graph.facebook.com/v18.0/oauth/access_token?grant_type=fb_exchange_token&client_id=${FACEBOOK_APP_ID}&client_secret=${FACEBOOK_APP_SECRET}&fb_exchange_token=${tokenData.access_token}`
        );

        const longLivedData = await longLivedResponse.json();

        // Get user's pages
        const pagesResponse = await fetch(
            `https://graph.facebook.com/v18.0/me/accounts?access_token=${longLivedData.access_token}`
        );

        const pagesData = await pagesResponse.json();

        if (pagesData.data?.length > 0) {
            const page = pagesData.data[0];
            storedTokens = {
                accessToken: page.access_token,
                pageId: page.id,
                expiresAt: Date.now() + (longLivedData.expires_in || 5184000) * 1000,
            };
        }

        return NextResponse.json({
            success: true,
            message: "Facebook connected successfully!",
        });
    } catch (error) {
        console.error("Facebook token exchange error:", error);
        return NextResponse.json({ error: "Failed to connect Facebook" }, { status: 500 });
    }
}