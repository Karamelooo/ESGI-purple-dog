import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { MarketGrid } from "@/components/market-grid";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function FavoritesPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const ads = (await prisma.ad.findMany({
    where: {
      favoritedBy: {
        some: {
          id: Number(session.user.id),
        },
      },
    },
    include: {
      user: true,
      favoritedBy: {
        where: {
          id: Number(session.user.id),
        },
        select: {
          id: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  })) as any; // Cast to any to bypass strict type check for now, as we know user is included

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Mes Favoris</h1>
      {ads.length > 0 ? (
        <MarketGrid ads={ads} />
      ) : (
        <div className="bg-white p-12 rounded-xl shadow-sm border border-gray-200 text-center">
          <div className="mx-auto w-16 h-16 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mb-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
            </svg>
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">
            Aucun favori pour le moment
          </h3>
          <p className="text-gray-500 max-w-sm mx-auto mb-6">
            Parcourez le marché pour trouver des annonces qui vous intéressent.
          </p>
        </div>
      )}
    </div>
  );
}
