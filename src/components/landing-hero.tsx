"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { Ad } from "@prisma/client";

interface LandingHeroProps {
  ads: (Ad & { user: { name: string | null; companyName: string | null } })[];
}

export function LandingHero({ ads }: LandingHeroProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % ads.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [ads.length]);

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + ads.length) % ads.length);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % ads.length);
  };

  if (ads.length === 0) {
    return (
      <div className="h-[600px] w-full flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-3xl  text-gray-400 mb-4">
            Aucune pièce d&apos;exception pour le moment.
          </h2>
          <Link href="/deposer-une-annonce">
            <Button variant="outline">Soyez le premier à vendre</Button>
          </Link>
        </div>
      </div>
    );
  }

  const currentAd = ads[currentIndex];
  // Fallback image handling
  const heroImage =
    currentAd.images && currentAd.images.length > 0
      ? currentAd.images[0]
      : `https://placehold.co/1200x800/2a1b3d/ffffff?text=${encodeURIComponent(
          currentAd.title
        )}`;

  return (
    <section className="relative w-full h-[85vh] min-h-[600px] overflow-hidden bg-white text-gray-900">
      <div className="container mx-auto h-full px-4 flex flex-col md:flex-row items-center">
        {/* Left Content (Text) */}
        <div className="w-full md:w-1/2 z-10 flex flex-col justify-center space-y-8 pl-4 md:pl-12">
          <div className="space-y-4 animate-in slide-in-from-left duration-700 fade-in">
            <span className="inline-block py-1 px-3 border border-gray-300 text-xs tracking-[0.2em] uppercase font-semibold text-gray-500">
              Sélection Purple Dog
            </span>
            <h1 className="text-5xl md:text-7xl  leading-tight">
              {currentAd.title}
            </h1>
            <p className="text-xl text-gray-600 max-w-md line-clamp-3">
              {currentAd.description}
            </p>
            <div className="flex items-center gap-6 pt-4">
              <div className="flex flex-col">
                <span className="text-xs uppercase tracking-widest text-gray-400 text-left">
                  {currentAd.type === "AUCTION" ? " enchère actuelle" : "Prix"}
                </span>
                <span className="text-3xl font-light">
                  {new Intl.NumberFormat("fr-FR", {
                    style: "currency",
                    currency: "EUR",
                  }).format(currentAd.price ?? 0)}
                </span>
              </div>
              <Link href={`/ad/${currentAd.id}`}>
                <Button
                  size="lg"
                  className="rounded-none bg-gray-900 text-white hover:bg-purple-900 transition-colors px-8 py-6 text-lg"
                >
                  Voir les détails <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Right Content (Image) */}
        <div className="absolute top-0 right-0 w-full md:w-[60%] h-full">
          <div className="relative w-full h-full">
            <Image
              src={heroImage}
              alt={currentAd.title}
              fill
              className="object-cover object-center"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-r from-white via-white/50 to-transparent w-1/2" />
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="absolute bottom-12 left-12 md:left-24 flex gap-4 z-20">
        <Button
          variant="outline"
          size="icon"
          onClick={handlePrev}
          className="rounded-full border-gray-300 hover:bg-gray-100 hover:text-black bg-white/50 backdrop-blur-sm"
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={handleNext}
          className="rounded-full border-gray-300 hover:bg-gray-100 hover:text-black bg-white/50 backdrop-blur-sm"
        >
          <ChevronRight className="h-5 w-5" />
        </Button>
      </div>

      {/* Progress Bar */}
      <div className="absolute bottom-0 left-0 w-full h-1 bg-gray-100">
        <div
          className="h-full bg-purple-900 transition-all duration-500 ease-out"
          style={{ width: `${((currentIndex + 1) / ads.length) * 100}%` }}
        />
      </div>
    </section>
  );
}
