import { Suspense } from "react";
import type { Metadata } from "next";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import HeroSection from "@/components/public/HeroSection";
import VisionSection from "@/components/public/VisionSection";
import PillarsSection from "@/components/public/PillarsSection";
import RoadmapSection from "@/components/public/RoadmapSection";
import EventsSection from "@/components/public/EventsSection";
import OpportunitiesSection from "@/components/public/OpportunitiesSection";
import SponsorsSection from "@/components/public/SponsorsSection";

export const metadata: Metadata = {
  title: "OMSP — Organization of Marine Science Professionals",
  description:
    "Building a strong network of marine science students and professionals, engaged in ocean sustainability and community impact.",
};

// Revalidate homepage data every 10 minutes
export const revalidate = 600;

function SectionLoader() {
  return (
    <div className="py-24 flex items-center justify-center">
      <div className="w-6 h-6 rounded-full border-2 border-teal-500/30 border-t-teal-500 animate-spin" />
    </div>
  );
}

export default function HomePage() {
  return (
    <>
      <Header />
      <main>
        <HeroSection />
        <VisionSection />
        <PillarsSection />
        <RoadmapSection />
        <Suspense fallback={<SectionLoader />}>
          <EventsSection />
        </Suspense>
        <Suspense fallback={<SectionLoader />}>
          <OpportunitiesSection />
        </Suspense>
        <Suspense fallback={<SectionLoader />}>
          <SponsorsSection />
        </Suspense>
      </main>
      <Footer />
    </>
  );
}
