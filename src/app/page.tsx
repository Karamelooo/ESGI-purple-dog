import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import prisma from "@/lib/prisma";

export default async function Home() {
  const latestAds = await prisma.ad.findMany({
    take: 5,
    orderBy: { createdAt: "desc" },
    include: { user: true },
  });

  return (
    <div>
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-purple-800 to-indigo-900 text-white py-20 px-4 text-center">
        <div className="container mx-auto max-w-4xl">
          <h1 className="text-4xl md:text-6xl font-extrabold mb-6 leading-tight">
            Vendez vos objets d&apos;exception en toute confiance
          </h1>
          <p className="text-lg md:text-2xl text-purple-100 mb-10 max-w-2xl mx-auto">
            La plateforme de référence pour les particuliers et professionnels
            du marché de l&apos;art.
          </p>
          <div className="flex justify-center gap-4">
            <Link href="/register">
              <Button
                size="lg"
                className="bg-white text-purple-900 hover:bg-gray-100 font-bold text-lg px-8"
              >
                Commencer à vendre
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Objects (Dynamic) */}
      <div className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
          Dernières Annonces
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
          {latestAds.map((ad) => (
            <Link key={ad.id} href={`/ad/${ad.id}`}>
              <div className="group cursor-pointer">
                <div className="bg-gray-200 rounded-xl aspect-square mb-4 overflow-hidden relative">
                  <img
                    src={`https://placehold.co/400x400?text=${encodeURIComponent(
                      ad.title
                    )}`}
                    alt={ad.title}
                    className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
                  />
                  {ad.status === "SOLD" && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center font-bold text-white uppercase tracking-widest">
                      VENDU
                    </div>
                  )}
                  {ad.status !== "SOLD" &&
                    ad.reservedUntil &&
                    new Date(ad.reservedUntil) > new Date() && (
                      <div className="absolute inset-0 bg-orange-500/50 flex items-center justify-center font-bold text-white uppercase tracking-widest">
                        EN PANIER
                      </div>
                    )}
                </div>
                <h3 className="font-bold text-lg truncate">{ad.title}</h3>
                <p className="text-purple-700 font-bold">{ad.price ?? 0} €</p>
                <p className="text-xs text-gray-500 uppercase">
                  {ad.type === "AUCTION" ? "Enchère" : "Vente directe"}
                </p>
              </div>
            </Link>
          ))}
          {latestAds.length === 0 && (
            <div className="col-span-full text-center py-12 text-gray-500">
              Aucune annonce pour le moment. Soyez le premier !
            </div>
          )}
        </div>
      </div>

      {/* Categories Grid (5x2) */}
      <section className="bg-gray-50 py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">
            Nos Catégories
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {[
              "Bijoux & Montres",
              "Meubles Anciens",
              "Art & Tableaux",
              "Collection",
              "Vins & Spiritueux",
              "Instruments",
              "Livres Anciens",
              "Mode & Luxe",
              "Horlogerie",
              "Sculptures",
            ].map((cat) => (
              <Card
                key={cat}
                className="hover:shadow-lg transition-shadow cursor-pointer border-none shadow-sm"
              >
                <CardContent className="flex items-center justify-center h-32 p-4 text-center">
                  <span className="font-semibold text-purple-900">{cat}</span>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 text-center max-w-3xl">
          <h2 className="text-3xl font-bold text-purple-900 mb-6">
            Pourquoi Purple Dog ?
          </h2>
          <p className="text-xl text-gray-600 leading-relaxed">
            Purple Dog est LA plateforme pour vendre mieux vos objets de valeurs
            à des tiers de confiance. Nous connectons des particuliers
            souhaitant vendre des biens d&apos;exception avec un réseau certifié
            d&apos;acheteurs professionnels. Simplicité, sécurité et
            transparence.
          </p>
        </div>
      </section>

      {/* Newsletter */}
      <section className="bg-purple-900 text-white py-16">
        <div className="container mx-auto px-4 text-center max-w-xl">
          <h2 className="text-2xl font-bold mb-4">Restez informé</h2>
          <p className="mb-8 text-purple-200">
            Recevez les dernières tendances et objets d&apos;exception.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="email"
              placeholder="Votre email"
              className="flex-1 px-4 py-3 rounded-lg text-gray-900 focus:outline-none"
            />
            <Button size="lg" variant="secondary" className="font-bold">
              S&apos;inscrire
            </Button>
          </div>
        </div>
      </section>

      {/* Footer Mock */}
      <footer className="bg-gray-900 text-gray-400 py-12 text-center text-sm">
        <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex gap-6">
            <Link href="#" className="hover:text-white">
              Mentions Légales
            </Link>
            <Link href="#" className="hover:text-white">
              Qui Sommes-Nous ?
            </Link>
          </div>
          <Button
            variant="outline"
            className="border-gray-600 text-gray-300 hover:text-white hover:border-white"
          >
            Nous contacter
          </Button>
        </div>
      </footer>
    </div>
  );
}
