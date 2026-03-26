import { Hero } from "@/components/sections/Hero";
import { About } from "@/components/sections/About";
import { CeoMessage } from "@/components/sections/CeoMessage";
import { Doctors } from "@/components/sections/Doctors";
import { Services } from "@/components/sections/Services";
import { Promotions } from "@/components/sections/Promotions";
import { VideoShowcase } from "@/components/sections/VideoShowcase";
import { Reviews } from "@/components/sections/Reviews";
import { Gallery } from "@/components/sections/Gallery";
import { Contact } from "@/components/sections/Contact";

export default function Home() {
  return (
    <div className="flex flex-col w-full">
      <Hero />
      <About />
      <CeoMessage />
      <Doctors />
      <Services />
      <Promotions />
      <VideoShowcase />
      <Reviews />
      <Gallery />
      <Contact />
    </div>
  );
}
