import { NextRequest, NextResponse } from "next/server";
import {
    DEFAULT_GALLERY_SETTINGS,
    DEFAULT_REVIEWS_SETTINGS,
} from "@/lib/data/defaults";
import {
    getSiteData,
    updateHero,
    updateAbout,
    updateDoctors,
    updateServices,
    updatePromotions,
    updateReviews,
    updateGallery,
    updateContact,
    updateNavbar,
    updateCeoMessage,
    updateVideoShowcase,
    HeroData,
    AboutData,
    Doctor,
    Service,
    Promotion,
    Review,
    GalleryData,
    ContactData,
    NavbarSettings,
    CeoMessageData,
    VideoShowcaseData,
} from "@/lib/data/store";

// GET - Fetch all site data or specific section
export async function GET(request: NextRequest) {
    const section = request.nextUrl.searchParams.get("section");

    try {
        const data = await getSiteData();

        if (section && section in data) {
            const sectionData = data[section as keyof typeof data];
            console.log(`GET ${section}:`, sectionData);
            
            // For reviews, return both reviews array and settings
            if (section === "reviews") {
                return NextResponse.json({ 
                    data: {
                        reviews: sectionData,
                        settings: DEFAULT_REVIEWS_SETTINGS
                    }
                });
            }
            
            // For gallery, return gallery object with posts and settings
            if (section === "gallery") {
                const galleryData = sectionData as GalleryData;
                return NextResponse.json({
                    data: galleryData || {
                        posts: [],
                        settings: DEFAULT_GALLERY_SETTINGS
                    }
                });
            }
            
            return NextResponse.json({ data: sectionData });
        }

        return NextResponse.json({ data });
    } catch (error) {
        console.error("Error fetching data:", error);
        return NextResponse.json({ error: "Failed to fetch data" }, { status: 500 });
    }
}

// POST - Update specific section
export async function POST(request: NextRequest) {
    const section = request.nextUrl.searchParams.get("section");

    if (!section) {
        return NextResponse.json({ error: "Section parameter required" }, { status: 400 });
    }

    try {
        const body = await request.json();

        switch (section) {
            case "hero":
                await updateHero(body as HeroData);
                break;
            case "about":
                await updateAbout(body as AboutData);
                break;
            case "doctors":
                await updateDoctors(body as Doctor[]);
                break;
            case "services":
                await updateServices(body as Service[]);
                break;
            case "promotions":
                await updatePromotions(body as Promotion[]);
                break;
            case "reviews":
                // Reviews now has { reviews: Review[], settings: ReviewsSettings }
                console.log("Saving reviews:", body);
                await updateReviews(body as { reviews: Review[], settings: any });
                console.log("Reviews saved successfully");
                break;
            case "gallery":
                console.log("Saving gallery:", body);
                // Handle both array (old) and object with posts/settings (new)
                if (body && typeof body === 'object' && body.posts) {
                    await updateGallery(body as GalleryData);
                } else if (Array.isArray(body)) {
                    await updateGallery(body);
                }
                console.log("Gallery saved successfully");
                break;
            case "contact":
                await updateContact(body as ContactData);
                break;
            case "navbar":
                await updateNavbar(body as NavbarSettings);
                break;
            case "ceomessage":
                await updateCeoMessage(body as CeoMessageData);
                break;
            case "videoShowcase":
                await updateVideoShowcase(body as VideoShowcaseData);
                break;
            default:
                return NextResponse.json({ error: "Invalid section" }, { status: 400 });
        }

        const updatedData = await getSiteData();
        return NextResponse.json({ success: true, data: updatedData });
    } catch (error) {
        console.error("Error updating data:", error);
        return NextResponse.json({ error: "Failed to update data" }, { status: 500 });
    }
}
