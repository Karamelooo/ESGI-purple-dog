import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function MyAdsPage() {
  const session = await auth();
  if (!session?.user) redirect("/auth/signin");

  const userId = parseInt(session.user.id!);

  const ads = await prisma.ad.findMany({
    where: { userId: userId },
    orderBy: { createdAt: "desc" },
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return "bg-green-100 text-green-800";
      case "SOLD":
        return "bg-blue-100 text-blue-800";
      case "PENDING":
        return "bg-yellow-100 text-yellow-800";
      case "REJECTED":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-purple-900">Mes annonces</h1>
        <Link href="/deposer-une-annonce">
          <Button>Créer une annonce</Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {ads.length === 0 && (
          <p className="text-gray-500 col-span-full">
            Vous n'avez aucune annonce.
          </p>
        )}
        {ads.map((ad) => {
          const firstImage =
            Array.isArray(ad.images) && ad.images.length > 0
              ? ad.images[0]
              : `https://placehold.co/400x300?text=${encodeURIComponent(ad.title)}`;

          return (
            <Card key={ad.id} className="hover:shadow-md transition">
              <CardHeader className="flex flex-row justify-between items-start space-y-0 pb-2">
                <CardTitle className="text-lg font-bold truncate pr-4">
                  {ad.title}
                </CardTitle>
                <span
                  className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                    ad.status
                  )}`}
                >
                  {ad.status}
                </span>
              </CardHeader>
              <CardContent>
                <div className="aspect-video bg-gray-200 mb-4 rounded overflow-hidden">
                  <img
                    src={firstImage}
                    className="object-cover w-full h-full"
                    alt={ad.title}
                  />
                </div>
                <div className="flex justify-between text-sm">
                  <span>
                    {ad.type === "AUCTION" ? "Enchère" : "Vente directe"}
                  </span>
                  <span className="font-bold">{ad.price} €</span>
                </div>
                <div className="mt-2 text-xs text-gray-500">
                  Publié le: {new Date(ad.createdAt).toLocaleDateString()}
                </div>
              </CardContent>
              <CardFooter className="flex justify-end gap-2">
                {ad.status === 'SOLD' ? (
                  <>
                    <Link href={`/ad/${ad.id}`}>
                      <Button variant="ghost" size="sm">
                        Voir
                      </Button>
                    </Link>
                    <Link href={`/dashboard/ads/management/${ad.id}`}>
                      <Button variant="default" size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">
                        Gérer vente
                      </Button>
                    </Link>
                  </>
                ) : ad.type === 'AUCTION' ? (
                  <Link href={`/ad/${ad.id}`}>
                    <Button variant="outline" size="sm">
                      Voir
                    </Button>
                  </Link>
                ) : (
                  <>
                    <Link href={`/ad/${ad.id}`}>
                      <Button variant="ghost" size="sm">
                        Voir
                      </Button>
                    </Link>
                    <Link href={`/ad/${ad.id}/edit`}>
                      <Button variant="outline" size="sm">
                        Modifier
                      </Button>
                    </Link>
                  </>
                )}
              </CardFooter>
            </Card>
          );
        })}
      </div>
    </div >
  );
}
