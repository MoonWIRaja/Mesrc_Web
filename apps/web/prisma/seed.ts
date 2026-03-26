import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
    console.log("Starting seed...");

    // Create default admin user
    const hashedPassword = await bcrypt.hash("Admin123", 10);

    const admin = await prisma.admin.upsert({
        where: { email: "admin@eyespecialist.com" },
        update: {},
        create: {
            email: "admin@eyespecialist.com",
            password: hashedPassword,
            name: "Admin",
            role: "admin",
        },
    });

    console.log("Created admin user:", admin.email);

    // Create default site settings
    const settings = await prisma.siteSettings.upsert({
        where: { id: "default-settings" },
        update: {},
        create: {
            id: "default-settings",
            heroTitle: "Your Eyes",
            heroSubtitle: "Our Priority",
            heroDescription: "Explore the world with clearer vision. We offer world-class eye medical expertise using the latest technology by certified doctors.",
            heroBadgeText: "Trusted Eye Care Center",
            heroBackgroundImage: "https://images.unsplash.com/photo-1579684385127-1ef15d508118?q=80&w=2000&auto=format&fit=crop",
            patientsCount: 10000,
            yearsExperience: 15,
            phone: "+60 3-1234 5678",
            email: "info@eyespecialist.com",
            address: "Jalan Medan Tengah 1, Seksyen 4, 40000 Shah Alam, Selangor",
            whatsappNumber: "+60123456789",
            facebookUrl: "https://facebook.com/eyespecialistcenter",
            instagramUrl: "https://instagram.com/eyespecialistcenter",
            tiktokUrl: "https://tiktok.com/@eyespecialistcenter",
            youtubeUrl: "https://youtube.com/@eyespecialistcenter",
            footerDescription: "Eye Specialist Center is the leading eye care center in Malaysia providing comprehensive eye care services.",
            copyrightText: "© 2024 Eye Specialist Center. All rights reserved.",
            directorName: "Dr. Ahmad Faisal",
            directorTitle: "Chief Medical Director",
        },
    });

    console.log("Created site settings");

    // Create sample doctors
    const doctors = await Promise.all([
        prisma.doctor.upsert({
            where: { id: "doctor-1" },
            update: {},
            create: {
                id: "doctor-1",
                name: "Dr. Ahmad Faisal",
                specialty: "LASIK & Refractive Surgery",
                description: "Experienced LASIK surgeon with over 15 years of experience in refractive surgery.",
                qualifications: "MBBS, FRCS (Ophth), Fellowship in Refractive Surgery",
                experience: "15+ years",
                order: 1,
            },
        }),
        prisma.doctor.upsert({
            where: { id: "doctor-2" },
            update: {},
            create: {
                id: "doctor-2",
                name: "Dr. Lim Wei Ming",
                specialty: "Cataract & Glaucoma",
                description: "Cataract and glaucoma specialist with advanced surgical expertise.",
                qualifications: "MBBS, MMed (Ophth), Fellowship in Glaucoma",
                experience: "12+ years",
                order: 2,
            },
        }),
        prisma.doctor.upsert({
            where: { id: "doctor-3" },
            update: {},
            create: {
                id: "doctor-3",
                name: "Dr. Siti Nurhaliza",
                specialty: "Pediatric Ophthalmology",
                description: "Dedicated pediatric eye specialist treating children's vision problems.",
                qualifications: "MBBS, FRCS (Ophth), Fellowship in Pediatric Ophthalmology",
                experience: "10+ years",
                order: 3,
            },
        }),
    ]);

    console.log("Created doctors:", doctors.length);

    // Create sample services
    const services = await Promise.all([
        prisma.service.upsert({
            where: { id: "service-1" },
            update: {},
            create: {
                id: "service-1",
                title: "LASIK Surgery",
                description: "Advanced laser vision correction for freedom from glasses and contact lenses.",
                icon: "Eye",
                features: JSON.stringify(["Blade-free technology", "Quick recovery", "Permanent results"]),
                order: 1,
            },
        }),
        prisma.service.upsert({
            where: { id: "service-2" },
            update: {},
            create: {
                id: "service-2",
                title: "Cataract Surgery",
                description: "Modern cataract removal with premium lens implant options.",
                icon: "Scan",
                features: JSON.stringify(["Minimally invasive", "Premium IOL options", "Same-day procedure"]),
                order: 2,
            },
        }),
        prisma.service.upsert({
            where: { id: "service-3" },
            update: {},
            create: {
                id: "service-3",
                title: "Glaucoma Treatment",
                description: "Comprehensive glaucoma management and surgical treatment.",
                icon: "Activity",
                features: JSON.stringify(["Early detection", "Laser treatment", "Surgical options"]),
                order: 3,
            },
        }),
    ]);

    console.log("Created services:", services.length);

    console.log("Seed completed!");
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });