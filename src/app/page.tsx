import Link from "next/link";
import prisma from "@/lib/prisma";
import { LandingHero } from "@/components/landing-hero";
import { CategoryGrid } from "@/components/category-grid";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic"; // Ensure fresh data

export default async function Home() {
  // 1. Fetch "Star" Ads for Hero (High price or newest)
  const heroAds = await prisma.ad.findMany({
    where: {
      status: "ACTIVE",
      images: { isEmpty: false }, // Only ads with images
    },
    take: 5,
    orderBy: { price: "desc" }, // Most expensive items first
    include: { user: true },
  });

  // 2. Fetch Categories for Bento Grid
  const categories = await prisma.category.findMany({
    take: 10,
    orderBy: { ads: { _count: "desc" } }, // Most popular categories
  });

  return (
    <main className="bg-white min-h-screen">
      {/* Dynamic Hero Section */}
      <LandingHero ads={heroAds} />

      {/* Categories Bento Grid */}
      <CategoryGrid categories={categories} />

      {/* Sell CTA Section */}
      <section className="py-24 bg-gray-50 border-t border-gray-100">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            <div className="lg:w-1/2 relative h-[500px] w-full overflow-hidden">
              <div className="absolute inset-0 bg-linear-to-tr from-slate-900 to-slate-800 flex items-center justify-center p-8">
                <div className="text-white font-light text-5xl md:text-6xl tracking-tighter leading-tight">
                  VENDRE <br />
                  <span className="font-bold text-purple-400">
                    VALORISER
                  </span>{" "}
                  <br />
                  TRANSMETTRE
                </div>
              </div>
            </div>
            <div className="lg:w-1/2 space-y-8">
              <span className="text-purple-700 font-semibold tracking-widest text-sm uppercase">
                Pour les vendeurs
              </span>
              <h2 className="text-4xl md:text-5xl text-gray-900 leading-tight">
                Sublimez vos biens d&apos;exception.
              </h2>
              <p className="text-xl text-gray-600 leading-relaxed font-light">
                Proposez vos articles à une audience sélective. Avec notre
                présentation commerciale haut de gamme, chaque objet raconte une
                histoire et trouve son acquéreur idéal au juste prix.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 py-4">
                <div className="space-y-2">
                  <h4 className="font-bold text-gray-900 text-lg">
                    Mise en avant Premium
                  </h4>
                  <p className="text-gray-500">
                    Un affichage professionnel pour capter l&apos;attention.
                  </p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-bold text-gray-900 text-lg">
                    Audience Qualifiée
                  </h4>
                  <p className="text-gray-500">
                    Connectez-vous directement avec des acheteurs sérieux.
                  </p>
                </div>
              </div>
              <Link href="/deposer-une-annonce">
                <Button
                  size="lg"
                  className="bg-black hover:bg-gray-800 text-white rounded-none px-8 py-6 text-lg w-full sm:w-auto shadow-lg hover:shadow-xl transition-all"
                >
                  Déposer une annonce maintenant
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Value Proposition / About (Static but styled) */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
            <div className="space-y-6">
              <span className="text-purple-700 font-semibold tracking-widest text-sm uppercase">
                L&apos;excellence avant tout
              </span>
              <h2 className="text-4xl md:text-5xl  text-gray-900 leading-tight">
                L&apos;art de la vente, <br />
                <span className="italic text-gray-400">réinventé.</span>
              </h2>
              <p className="text-xl text-gray-600 leading-relaxed font-light">
                Purple Dog n&apos;est pas une simple marketplace. C&apos;est un
                écrin pour vos objets d&apos;exception. Nous repensons la
                relation entre vendeurs particuliers et acheteurs professionnels
                à travers une expérience fluide, transparente et sécurisée.
              </p>
              <div className="pt-4">
                <Link href="/register">
                  <Button
                    size="lg"
                    className="bg-purple-900 hover:bg-purple-800 text-white rounded-none px-8 py-6 text-lg"
                  >
                    Commencer l&apos;expérience
                  </Button>
                </Link>
              </div>
            </div>
            <div className="relative h-[500px] w-full bg-gray-100 rounded-none overflow-hidden">
              {/* Decorative abstract shape or image could go here */}
              <div className="absolute inset-0 bg-gradient-to-br from-purple-50 to-indigo-100 flex items-center justify-center">
                <div className="w-64 h-64 border border-purple-200 rounded-full flex items-center justify-center">
                  <div className="w-48 h-48 border border-purple-300 rounded-full" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter (Minimalist) */}
      <section className="py-24 bg-gray-900 text-white">
        <div className="container mx-auto px-4 text-center max-w-2xl">
          <h2 className="text-3xl  mb-6">Ne manquez aucune pièce rare</h2>
          <p className="text-gray-400 mb-10 font-light text-lg">
            Inscrivez-vous à notre newsletter privée pour recevoir une sélection
            hebdomadaire.
          </p>
          <div className="flex flex-col sm:flex-row gap-0 border-b border-gray-700 pb-2">
            <input
              type="email"
              placeholder="Votre adresse email"
              className="flex-1 bg-transparent border-none text-white placeholder-gray-600 focus:outline-none focus:ring-0 px-4 py-3"
            />
            <Button
              variant="ghost"
              className="text-white hover:text-purple-200 uppercase tracking-widest text-sm font-semibold"
            >
              S&apos;inscrire
            </Button>
          </div>
        </div>
      </section>
      <footer />
    </main>
  );
}
