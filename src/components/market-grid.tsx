import Link from "next/link";
import { Ad, User } from "@prisma/client";
import { Clock, ShoppingBag } from "lucide-react";
import { FavoriteButton } from "@/components/ui/favorite-button";

interface MarketGridProps {
  ads: (Ad & { user: User } & { favoritedBy?: { id: number }[] })[];
}

export function MarketGrid({ ads }: MarketGridProps) {
  if (ads.length === 0) {
    return (
      <div className="col-span-full py-20 text-center bg-gray-50 rounded-lg">
        <h3 className="text-xl  text-gray-500">Aucun résultat trouvé.</h3>
        <p className="text-gray-400 mt-2">Essayez de modifier vos filtres.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
      {ads.map((ad) => {
        const image =
          ad.images && ad.images.length > 0
            ? ad.images[0]
            : `https://placehold.co/500x500?text=${encodeURIComponent(
                ad.title
              )}`;

        return (
          <Link key={ad.id} href={`/ad/${ad.id}`} className="group block">
            <div className="relative aspect-square overflow-hidden bg-gray-100 mb-4">
              {/* Image */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={image}
                alt={ad.title}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />

              {/* Badge */}
              <div className="absolute top-4 left-4 bg-white/90 backdrop-blur px-3 py-1 text-xs font-bold uppercase tracking-widest text-gray-900 flex items-center gap-2">
                {ad.type === "AUCTION" ? (
                  <>
                    <Clock className="w-3 h-3" /> Enchère
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-3 h-3" /> Vente
                  </>
                )}
              </div>

              {/* Status Overlay if Sold */}
              {ad.status === "SOLD" && (
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-white  text-xl tracking-widest">
                  Vendu
                </div>
              )}

              {/* Favorite Button */}
              <div className="absolute top-4 right-4 z-10">
                <FavoriteButton
                  adId={ad.id}
                  initialIsFavorite={
                    "favoritedBy" in ad &&
                    Array.isArray(ad.favoritedBy) &&
                    ad.favoritedBy.length > 0
                  }
                />
              </div>
            </div>

            <div className="space-y-1">
              <h3 className="text-lg  text-gray-900 group-hover:text-purple-800 transition-colors truncate">
                {ad.title}
              </h3>
              <p className="text-sm text-gray-500">
                Par {ad.user.name || ad.user.companyName || "Anonyme"}
              </p>
              <p className="text-xl font-light text-gray-900 mt-2">
                {new Intl.NumberFormat("fr-FR", {
                  style: "currency",
                  currency: "EUR",
                }).format(ad.price ?? 0)}
              </p>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
