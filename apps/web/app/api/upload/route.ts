import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const file = formData.get("file") as File | null;

        if (!file) {
            return NextResponse.json(
                { error: "No file uploaded" },
                { status: 400 }
            );
        }

        // Some browsers/files upload with inconsistent MIME types.
        // Accept image MIME broadly and keep extension fallback.
        const allowedTypes = new Set([
            "image/jpeg",
            "image/jpg",
            "image/pjpeg",
            "image/png",
            "image/webp",
            "image/gif",
            "image/svg+xml",
            "image/x-icon",
            "image/vnd.microsoft.icon",
            "image/avif",
            "image/bmp",
            "image/tiff",
            "image/heic",
            "image/heif",
        ]);
        const allowedExtensions = new Set([
            "jpg",
            "jpeg",
            "jfif",
            "png",
            "webp",
            "gif",
            "svg",
            "ico",
            "avif",
            "bmp",
            "tif",
            "tiff",
            "heic",
            "heif",
        ]);
        const ext = (file.name.split(".").pop() || "").toLowerCase();
        const isImageMime = file.type ? file.type.startsWith("image/") : false;
        const isAllowedType = file.type ? allowedTypes.has(file.type) : false;
        const isAllowedExtension = allowedExtensions.has(ext);
        const unknownBrowserType = file.type === "";
        const genericBinaryType = file.type === "application/octet-stream";

        if (!isImageMime && !isAllowedType && !isAllowedExtension && !unknownBrowserType && !genericBinaryType) {
            return NextResponse.json(
                { error: "Invalid file type. Please upload an image file (JPG, PNG, WebP, GIF, SVG, ICO, AVIF, BMP, TIFF, HEIC)." },
                { status: 400 }
            );
        }

        const maxUploadMb = Number(process.env.UPLOAD_MAX_MB || 50);
        const maxUploadBytes = maxUploadMb * 1024 * 1024;

        // Validate file size
        if (file.size > maxUploadBytes) {
            return NextResponse.json(
                { error: `File too large. Maximum size is ${maxUploadMb}MB.` },
                { status: 400 }
            );
        }

        // Generate unique filename
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Get original extension
        const timestamp = Date.now();
        const randomSuffix = Math.random().toString(36).substring(2, 8);
        const extensionFromMime: Record<string, string> = {
            "image/jpeg": "jpg",
            "image/jpg": "jpg",
            "image/pjpeg": "jpg",
            "image/png": "png",
            "image/webp": "webp",
            "image/gif": "gif",
            "image/svg+xml": "svg",
            "image/x-icon": "ico",
            "image/vnd.microsoft.icon": "ico",
            "image/avif": "avif",
            "image/bmp": "bmp",
            "image/tiff": "tiff",
            "image/heic": "heic",
            "image/heif": "heif",
        };
        const finalExt = ext || extensionFromMime[file.type] || "jpg";
        const filename = `image-${timestamp}-${randomSuffix}.${finalExt}`;

        // Upload directory
        const uploadDir = path.join(process.cwd(), "public", "uploads");

        // Create directory if it doesn't exist
        await mkdir(uploadDir, { recursive: true });

        // Save file
        const filePath = path.join(uploadDir, filename);
        await writeFile(filePath, buffer);

        // Return the public URL
        const publicUrl = `/uploads/${filename}`;

        return NextResponse.json({
            success: true,
            url: publicUrl,
            filename: filename,
        });
    } catch (error) {
        console.error("Upload error:", error);
        return NextResponse.json(
            { error: "Failed to upload file" },
            { status: 500 }
        );
    }
}
