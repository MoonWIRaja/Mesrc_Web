import { NextRequest, NextResponse } from "next/server";

interface YouTubeVideo {
    id: string;
    title: string;
    thumbnail: string;
    publishedAt: string;
    description: string;
}

export async function GET(request: NextRequest) {
    const profileUrl = request.nextUrl.searchParams.get("profileUrl");
    const apiKey = request.nextUrl.searchParams.get("apiKey");

    if (!profileUrl) {
        return NextResponse.json({ error: "Profile URL is required" }, { status: 400 });
    }

    if (!apiKey) {
        return NextResponse.json({ error: "YouTube API key is required" }, { status: 400 });
    }

    try {
        // Extract channel ID from profile URL
        const channelId = await extractChannelId(profileUrl, apiKey);

        if (!channelId) {
            return NextResponse.json({ error: "Could not extract channel ID from URL" }, { status: 400 });
        }

        // Fetch videos from the channel
        const videos = await fetchChannelVideos(channelId, apiKey);

        return NextResponse.json({
            success: true,
            videos,
            count: videos.length
        });
    } catch (error: any) {
        console.error("Error fetching YouTube videos:", error);
        return NextResponse.json({
            error: error.message || "Failed to fetch videos from YouTube"
        }, { status: 500 });
    }
}

async function extractChannelId(url: string, apiKey: string): Promise<string | null> {
    // Handle different YouTube URL formats
    let channelId = null;

    // Try to extract from various URL patterns
    const patterns = [
        /youtube\.com\/(user|channel)\/([a-zA-Z0-9_-]+)/,
        /youtube\.com\/@([a-zA-Z0-9_-]+)/,
        /youtube\.com\/c\/([a-zA-Z0-9_-]+)/,
    ];

    for (const pattern of patterns) {
        const match = url.match(pattern);
        if (match) {
            const identifier = match[2] ? match[2] : match[1];

            if (identifier) { // Check if identifier is not undefined
                if (url && url.includes('/channel/')) {
                    // Already a channel ID
                    channelId = identifier;
                } else {
                    // Need to resolve to channel ID
                    channelId = await resolveToChannelId(identifier, apiKey, url && url.includes('@') ? 'handle' : 'custom');
                }
                break;
            }
        }
    }

    // If no match found in URL patterns, try as a handle
    if (!channelId && url) {
        channelId = await resolveToChannelId(url, apiKey, 'handle');
    }

    return channelId;
}

async function resolveToChannelId(identifier: string, apiKey: string, type: 'handle' | 'custom'): Promise<string | null> {
    try {
        const searchUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(identifier)}&type=channel&key=${apiKey}`;
        const response = await fetch(searchUrl);
        const data = await response.json();

        if (data.items && data.items.length > 0) {
            return data.items[0].snippet.channelId;
        }
    } catch (error) {
        console.error('Error resolving channel ID:', error);
    }

    return null;
}

async function fetchChannelVideos(channelId: string, apiKey: string): Promise<YouTubeVideo[]> {
    try {
        // First, get the uploads playlist ID
        const channelResponse = await fetch(
            `https://www.googleapis.com/youtube/v3/channels?part=contentDetails&id=${channelId}&key=${apiKey}`
        );
        const channelData = await channelResponse.json();

        if (!channelData.items || channelData.items.length === 0) {
            throw new Error("Channel not found");
        }

        const uploadsPlaylistId = channelData.items[0].contentDetails.relatedPlaylists.uploads;

        if (!uploadsPlaylistId) {
            throw new Error("No uploads playlist found for this channel");
        }

        // Get videos from the uploads playlist
        const playlistResponse = await fetch(
            `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet,contentDetails&playlistId=${uploadsPlaylistId}&maxResults=50&key=${apiKey}`
        );
        const playlistData = await playlistResponse.json();

        if (!playlistData.items) {
            throw new Error("No videos found in the channel");
        }

        // Process the video data
        const videos: YouTubeVideo[] = [];

        for (const item of playlistData.items) {
            const snippet = item.snippet;
            const videoId = item.contentDetails?.videoId;

            if (videoId && snippet) {
                videos.push({
                    id: videoId,
                    title: snippet.title || "Untitled Video",
                    thumbnail: snippet.thumbnails?.high?.url || snippet.thumbnails?.default?.url || "",
                    publishedAt: snippet.publishedAt || "",
                    description: snippet.description || ""
                });
            }
        }

        return videos;
    } catch (error) {
        console.error("Error fetching channel videos:", error);
        throw error;
    }
}