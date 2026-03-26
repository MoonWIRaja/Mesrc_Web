import type { Metadata } from "next";
import Script from "next/script";
import localFont from "next/font/local";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { WhatsAppFloatingButton } from "@/components/layout/WhatsAppFloatingButton";
import { getSiteData } from "@/lib/data/store";
import "./globals.css";

export const dynamic = "force-dynamic";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
});

export async function generateMetadata(): Promise<Metadata> {
  let logoUrl = "";
  let siteName = "Eye Specialist Center";
  try {
    const data = await getSiteData();
    logoUrl = data.navbar?.logoUrl?.trim() || "";
    siteName = data.navbar?.footerBrandName || data.navbar?.brandName || siteName;
  } catch (error) {
    console.error("Failed to load site metadata settings:", error);
  }
  const faviconUrl = logoUrl
    ? `${logoUrl}${logoUrl.includes("?") ? "&" : "?"}favicon=1`
    : "/api/favicon";

  return {
    title: siteName,
    description: `${siteName} offers world-class eye treatments such as Lasik surgery, Cataracts, Glaucoma, and more.`,
    icons: {
      icon: faviconUrl,
      shortcut: faviconUrl,
      apple: faviconUrl,
    },
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        {process.env.NODE_ENV === "development" && (
          <Script
            src="//unpkg.com/react-grab/dist/index.global.js"
            crossOrigin="anonymous"
            strategy="beforeInteractive"
          />
        )}
        {process.env.NODE_ENV === "development" && (
          <Script
            src="//unpkg.com/@react-grab/claude-code/dist/client.global.js"
            strategy="lazyOnload"
          />
        )}
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col`}>
        <Navbar />
        <main className="flex-grow">
          {children}
        </main>
        <Footer />

        {/* Floating WhatsApp Button */}
        <WhatsAppFloatingButton />
      </body>
    </html>
  );
}
