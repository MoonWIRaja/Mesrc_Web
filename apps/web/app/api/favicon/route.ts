import { NextResponse } from "next/server";
import { getSiteData } from "@/lib/data/store";

function escapeXml(value: string): string {
    return value
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll("\"", "&quot;")
        .replaceAll("'", "&apos;");
}

export async function GET() {
    try {
        const data = await getSiteData();
        const logoUrl = data.navbar?.logoUrl?.trim() || "";
        const brandName = data.navbar?.footerBrandName || data.navbar?.brandName || "MESRC";
        const brandInitial = escapeXml((brandName.trim().charAt(0) || "M").toUpperCase());

        const svg = logoUrl
            ? `
<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64">
  <rect width="64" height="64" rx="12" fill="#0f172a"/>
  <image href="${escapeXml(logoUrl)}" x="5" y="5" width="54" height="54" preserveAspectRatio="xMidYMid meet"/>
</svg>`
            : `
<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64">
  <rect width="64" height="64" rx="12" fill="#2563eb"/>
  <text x="50%" y="53%" text-anchor="middle" dominant-baseline="middle" fill="#ffffff" font-family="Arial, sans-serif" font-size="30" font-weight="700">${brandInitial}</text>
</svg>`;

        return new NextResponse(svg, {
            headers: {
                "Content-Type": "image/svg+xml; charset=utf-8",
                "Cache-Control": "no-store, max-age=0",
            },
        });
    } catch (error) {
        console.error("Failed to build favicon:", error);

        const fallbackSvg = `
<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64">
  <rect width="64" height="64" rx="12" fill="#2563eb"/>
  <text x="50%" y="53%" text-anchor="middle" dominant-baseline="middle" fill="#ffffff" font-family="Arial, sans-serif" font-size="30" font-weight="700">M</text>
</svg>`;

        return new NextResponse(fallbackSvg, {
            headers: {
                "Content-Type": "image/svg+xml; charset=utf-8",
                "Cache-Control": "no-store, max-age=0",
            },
        });
    }
}
