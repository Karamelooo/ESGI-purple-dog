import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { redirect } from "next/navigation";
import Link from "next/link";
import { PayButton } from "@/components/pay-button";
import { Countdown } from "@/components/countdown";

export default async function PurchasesPage() {
  const session = await auth();
  if (!session?.user) redirect("/auth/signin");

  const userId = parseInt(session.user.id!);

  const purchasedAds = await prisma.ad.findMany({
    where: { buyerId: userId, status: "SOLD" },
    include: {
      bids: { where: { userId: userId }, orderBy: { amount: "desc" }, take: 1 },
    },
  });

  const activeBids = await prisma.bid.findMany({
    where: {
      userId: userId,
      ad: { status: { in: ["ACTIVE", "PENDING"] }, type: "AUCTION" },
    },
    include: { ad: true },
    orderBy: { createdAt: "desc" },
    distinct: ["adId"], // Show each ad only once
  });

  const reservedAds = await prisma.ad.findMany({
    where: {
      reservedById: userId,
      reservedUntil: { gt: new Date() },
      status: { not: "SOLD" },
    },
  });

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8 text-purple-900">
        Mes Achats & Enchères
      </h1>

      <Tabs defaultValue="purchases">
        <TabsList className="mb-4">
          <TabsTrigger value="cart">
            Mon Panier ({reservedAds.length})
          </TabsTrigger>
          <TabsTrigger value="purchases">Mes Achats</TabsTrigger>
          <TabsTrigger value="bids">Mes Enchères en cours</TabsTrigger>
        </TabsList>

        <TabsContent value="cart">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {reservedAds.length === 0 && (
              <p className="text-gray-500 col-span-full">
                Votre panier est vide.
              </p>
            )}
            {reservedAds.map((ad) => (
              <Card
                key={ad.id}
                className="hover:shadow-md transition border-purple-500 border-2"
              >
                <CardHeader>
                  <CardTitle className="text-lg">{ad.title}</CardTitle>
                  <div className="text-xs text-red-500 font-bold animate-pulse flex gap-1">
                    Réservé encore :
                    {ad.reservedUntil && (
                      <Countdown targetDate={ad.reservedUntil} />
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="aspect-video bg-gray-200 mb-2 relative overflow-hidden rounded">
                    <img
                      src={`https://placehold.co/400x300?text=${encodeURIComponent(
                        ad.title
                      )}`}
                      className="object-cover w-full h-full"
                      alt={ad.title}
                    />
                  </div>
                  <div className="flex justify-between items-center mb-4">
                    <span className="font-bold text-lg">{ad.price} €</span>
                  </div>
                  <PayButton adId={ad.id} price={ad.price ?? 0} />
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="purchases">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {purchasedAds.length === 0 && (
              <p className="text-gray-500 col-span-full">
                Aucun achat effectué.
              </p>
            )}
            {purchasedAds.map((ad) => (
              <Link href={`/ad/${ad.id}`} key={ad.id}>
                <Card className="hover:shadow-md transition">
                  <CardHeader>
                    <CardTitle className="text-lg">{ad.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="aspect-video bg-gray-200 mb-2 relative overflow-hidden rounded">
                      <img
                        src={`https://placehold.co/400x300?text=${encodeURIComponent(
                          ad.title
                        )}`}
                        className="object-cover w-full h-full"
                        alt={ad.title}
                      />
                    </div>
                    <p className="font-bold text-green-600">Acheté</p>
                    <p>Prix: {ad.price || ad.bids[0]?.amount + " €"}</p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="bids">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {activeBids.length === 0 && (
              <p className="text-gray-500 col-span-full">
                Aucune enchère en cours.
              </p>
            )}
            {activeBids.map((bid) => (
              <Link href={`/ad/${bid.ad.id}`} key={bid.id}>
                <Card className="hover:shadow-md transition">
                  <CardHeader>
                    <CardTitle className="text-lg">{bid.ad.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="aspect-video bg-gray-200 mb-2 relative overflow-hidden rounded">
                      <img
                        src={`https://placehold.co/400x300?text=${encodeURIComponent(
                          bid.ad.title
                        )}`}
                        className="object-cover w-full h-full"
                        alt={bid.ad.title}
                      />
                    </div>
                    <p className="font-semibold text-purple-700">
                      Votre offre: {bid.amount} €
                    </p>
                    <p className="text-sm text-gray-500">
                      Fin:{" "}
                      {bid.ad.endDate
                        ? new Date(bid.ad.endDate).toLocaleDateString()
                        : "N/A"}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
