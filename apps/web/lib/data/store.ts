// Centralized data store for the application
// This simulates a database - in production, replace with actual DB

import { promises as fs } from "fs";
import path from "path";
import { hashPassword, verifyPassword } from "@/lib/auth";
import {
    DEFAULT_ABOUT_DATA,
    DEFAULT_CEO_MESSAGE_DATA,
    DEFAULT_CONTACT_DATA,
    DEFAULT_DOCTORS,
    DEFAULT_GALLERY_DATA,
    DEFAULT_HERO_DATA,
    DEFAULT_NAVBAR_SETTINGS,
    DEFAULT_PROMOTIONS,
    DEFAULT_REVIEWS,
    DEFAULT_SERVICES,
    DEFAULT_VIDEO_SHOWCASE_DATA,
} from "@/lib/data/defaults";

const DATA_DIR = path.join(process.cwd(), "data");
const DATA_FILE = path.join(DATA_DIR, "site-data.json");
const DEFAULT_ADMIN_EMAIL = "admin@eyespecialist.com";
const DEFAULT_ADMIN_PASSWORD = "Admin123";
const DEFAULT_ADMIN_NAME = "Admin";
const DEFAULT_ADMIN_ROLE = "admin";

// Types
export interface HeroData {
    title: string;
    subtitle: string;
    description: string;
    badge: string;
    primaryButtonText: string;
    primaryButtonLink: string;
    secondaryButtonText: string;
    secondaryButtonLink: string;
    backgroundImage: string;
    imagePosition?: string;
    imageScale?: number;
    imageOpacity?: number;
    imageBlur?: number;
    stats: {
        patients: number;
        experience: number;
    };
}

export interface AboutData {
    badge: string;
    title: string;
    titleMain: string;
    titleSub: string;
    titleMainColor: string;
    titleSubColor: string;
    image: string;
    imagePosition?: string;
    imageScale?: number;
    imageOpacity?: number;
    imageBlur?: number;
    history: string;
    mission: string;
    vision: string;
    accreditation: string;
    accreditationItems: {
        title: string;
        subtitle: string;
        icon: string;
    }[];
    directorName: string;
    directorTitle: string;
}

export interface Doctor {
    id: string;
    name: string;
    specialty: string;
    qualifications: string;
    experience: number;
    image: string;
    imagePosition?: string;
    imageScale?: number;
    imageOpacity?: number;
    imageBlur?: number;
    bio: string;
    isActive: boolean;
}

export interface Service {
    id: string;
    title: string;
    description: string;
    details: string;
    price: string;
    icon: string;
    image: string;
    imagePosition?: string;
    imageScale?: number;
    imageOpacity?: number;
    imageBlur?: number;
    features: string[];
    isActive: boolean;
    order: number;
}

export interface Promotion {
    id: string;
    title: string;
    description: string;
    image: string;
    imagePosition?: string;
    imageScale?: number;
    imageOpacity?: number;
    imageBlur?: number;
    discount: string;
    tags: string[];
    startDate: string;
    endDate: string;
    whatsappMessage?: string;
    isActive: boolean;
}

export interface Review {
    id: string;
    name: string;
    rating: number;
    text: string;
    date: string;
    isActive: boolean;
}

export interface GallerySettings {
    subtitle: string;
    title: string;
    description: string;
    elfsightWidgetId: string;
    tiktokUrl: string;
    instagramUrl: string;
    facebookUrl: string;
}

export interface GalleryData {
    posts: GalleryPost[];
    settings: GallerySettings;
}

export interface GalleryPost {
    id: string;
    platform: "instagram" | "tiktok" | "facebook";
    type: "image" | "video";
    image: string;
    thumbnail: string;
    caption: string;
    link: string;
    likes: number;
    views: string;
    comments: number;
    shares: number;
    date: string;
    isActive: boolean;
}

export interface ReviewsSettings {
    subtitle: string;
    title: string;
    description: string;
}

export interface ReviewsData {
    reviews: Review[];
    settings: ReviewsSettings;
}

export interface ContactData {
    phone: string;
    whatsapp: string;
    email: string;
    address: string;
    operatingHours: {
        weekdays: string;
        weekends: string;
    };
    socialMedia: {
        instagram: string;
        facebook: string;
        tiktok: string;
    };
}

export interface CeoMessageData {
    image: string;
    imagePosition?: string;
    imageScale?: number;
    imageOpacity?: number;
    imageBlur?: number;
    message: string;
    name: string;
    title: string;
}

export interface NavbarSettings {
    brandName: string;
    logoUrl: string;
    footerBrandName: string;
    footerDescription: string;
    copyrightText: string;
}

export interface VideoShowcaseData {
    title: string;
    subtitle: string;
    description: string;
    videoIds: string[];
    youtubeProfileUrl: string;
    youtubeApiKey: string;
    thumbnailUrl: string;
    autoPlay: boolean;
    isActive: boolean;
}

export interface AdminAuthData {
    id: string;
    name: string;
    email: string;
    role: string;
    passwordHash: string;
}

export interface SiteData {
    hero: HeroData;
    about: AboutData;
    ceoMessage: CeoMessageData;
    doctors: Doctor[];
    services: Service[];
    promotions: Promotion[];
    reviews: Review[];
    gallery: GalleryData;
    contact: ContactData;
    navbar: NavbarSettings;
    videoShowcase: VideoShowcaseData;
    adminAuth: AdminAuthData;
}

// Default data
const defaultData: SiteData = {
    hero: DEFAULT_HERO_DATA,
    about: DEFAULT_ABOUT_DATA,
    ceoMessage: DEFAULT_CEO_MESSAGE_DATA,
    doctors: DEFAULT_DOCTORS,
    services: DEFAULT_SERVICES,
    promotions: DEFAULT_PROMOTIONS,
    reviews: DEFAULT_REVIEWS,
    gallery: DEFAULT_GALLERY_DATA,
    contact: DEFAULT_CONTACT_DATA,
    navbar: DEFAULT_NAVBAR_SETTINGS,
    videoShowcase: DEFAULT_VIDEO_SHOWCASE_DATA,
    adminAuth: {
        id: "admin-1",
        name: DEFAULT_ADMIN_NAME,
        email: DEFAULT_ADMIN_EMAIL,
        role: DEFAULT_ADMIN_ROLE,
        // Seeded on first load via getSiteData if empty.
        passwordHash: "",
    },
};

// Initialize data directory and file
async function initializeDataStore(): Promise<void> {
    try {
        await fs.mkdir(DATA_DIR, { recursive: true });
        try {
            await fs.access(DATA_FILE);
        } catch {
            await fs.writeFile(DATA_FILE, JSON.stringify(defaultData, null, 2));
        }
    } catch (error) {
        console.error("Error initializing data store:", error);
    }
}

// Get all site data
export async function getSiteData(): Promise<SiteData> {
    await initializeDataStore();
    try {
        const raw = await fs.readFile(DATA_FILE, "utf-8");
        const parsed = JSON.parse(raw) as Partial<SiteData>;

        const merged = {
            ...defaultData,
            ...parsed,
            adminAuth: {
                ...defaultData.adminAuth,
                ...(parsed.adminAuth || {}),
            },
        } as SiteData;

        if (!merged.adminAuth.passwordHash) {
            merged.adminAuth.passwordHash = await hashPassword(DEFAULT_ADMIN_PASSWORD);
            await saveSiteData(merged);
        }

        return merged;
    } catch {
        return {
            ...defaultData,
            adminAuth: {
                ...defaultData.adminAuth,
                passwordHash: await hashPassword(DEFAULT_ADMIN_PASSWORD),
            },
        };
    }
}

// Save all site data
export async function saveSiteData(data: SiteData): Promise<void> {
    await initializeDataStore();
    await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2));
}

// Update specific section
export async function updateHero(hero: HeroData): Promise<SiteData> {
    const data = await getSiteData();
    data.hero = hero;
    await saveSiteData(data);
    return data;
}

export async function updateAbout(about: AboutData): Promise<SiteData> {
    const data = await getSiteData();
    data.about = about;
    await saveSiteData(data);
    return data;
}

export async function updateDoctors(doctors: Doctor[]): Promise<SiteData> {
    const data = await getSiteData();
    data.doctors = doctors;
    await saveSiteData(data);
    return data;
}

export async function updateServices(services: Service[]): Promise<SiteData> {
    const data = await getSiteData();
    data.services = services;
    await saveSiteData(data);
    return data;
}

export async function updatePromotions(promotions: Promotion[]): Promise<SiteData> {
    const data = await getSiteData();
    data.promotions = promotions;
    await saveSiteData(data);
    return data;
}

export async function updateReviews(reviewsData: ReviewsData): Promise<SiteData> {
    const data = await getSiteData();
    console.log("Current reviews:", data.reviews?.length || 0);
    console.log("New reviews:", reviewsData.reviews?.length || 0);
    
    if (reviewsData.reviews && Array.isArray(reviewsData.reviews)) {
        data.reviews = reviewsData.reviews;
        console.log("Reviews updated, saving to file...");
        await saveSiteData(data);
        console.log("Reviews saved to file successfully");
    }
    
    return data;
}

export async function updateGallery(gallery: GalleryData | GalleryPost[]): Promise<SiteData> {
    const data = await getSiteData();
    // Handle both old format (array) and new format (object with posts/settings)
    if (Array.isArray(gallery)) {
        data.gallery = { ...data.gallery, posts: gallery };
    } else {
        data.gallery = gallery;
    }
    await saveSiteData(data);
    return data;
}

export async function updateContact(contact: ContactData): Promise<SiteData> {
    const data = await getSiteData();
    data.contact = contact;
    await saveSiteData(data);
    return data;
}

export async function updateNavbar(navbar: NavbarSettings): Promise<SiteData> {
    const data = await getSiteData();
    data.navbar = navbar;
    await saveSiteData(data);
    return data;
}

export async function updateVideoShowcase(videoShowcase: VideoShowcaseData): Promise<SiteData> {
    const data = await getSiteData();
    data.videoShowcase = videoShowcase;
    await saveSiteData(data);
    return data;
}

export async function updateCeoMessage(ceoMessage: CeoMessageData): Promise<SiteData> {
    const data = await getSiteData();
    data.ceoMessage = ceoMessage;
    await saveSiteData(data);
    return data;
}

export async function getAdminAuth(): Promise<AdminAuthData> {
    const data = await getSiteData();
    return data.adminAuth;
}

export async function updateAdminProfile(profile: { name: string; email: string }): Promise<SiteData> {
    const data = await getSiteData();
    data.adminAuth = {
        ...data.adminAuth,
        name: profile.name.trim(),
        email: profile.email.trim().toLowerCase(),
    };
    await saveSiteData(data);
    return data;
}

export async function updateAdminPassword(currentPassword: string, newPassword: string): Promise<SiteData> {
    const data = await getSiteData();
    const isCurrentValid = await verifyPassword(currentPassword, data.adminAuth.passwordHash);

    if (!isCurrentValid) {
        throw new Error("Current password is incorrect");
    }

    data.adminAuth = {
        ...data.adminAuth,
        passwordHash: await hashPassword(newPassword),
    };
    await saveSiteData(data);
    return data;
}
