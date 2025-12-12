import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function ProDashboardPage() {
  const session = await auth();
  const ads = await prisma.ad.findMany({
    where: { userId: Number(session?.user?.id) },
    orderBy: { createdAt: "desc" },
  });

  const adCount = ads.length;
  // Mock sales calculation
  const soldAds = ads.filter((a) => a.status === "SOLD");
  const salesTotal = soldAds.reduce((sum, ad) => sum + (ad.price ?? 0), 0);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">
        Tableau de bord professionnel
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Annonces totales
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{adCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Ventes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{salesTotal} €</div>
            <p className="text-xs text-gray-500">{soldAds.length} ventes</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Note vendeur
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">4.8/5</div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link href="/dashboard/pro/market" className="block">
          <Card className="hover:border-purple-500 transition-colors cursor-pointer h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                🏢 Accéder au marché professionnel
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-500 mb-4">
                Parcourez les annonces disponibles et trouvez les meilleures
                opportunités pour votre activité.
              </p>
              <Button className="w-full">Voir le marché</Button>
            </CardContent>
          </Card>
        </Link>
        {/* Add more quick actions here if needed */}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-bold mb-4">Mes annonces</h2>
        {ads.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            Aucune activité récente.
            <Link href="/deposer-une-annonce" className="block mt-4">
              <Button>Déposer une annonce</Button>
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left">Titre</th>
                  <th className="px-4 py-3 text-left">Prix</th>
                  <th className="px-4 py-3 text-left">Type</th>
                  <th className="px-4 py-3 text-left">Statut</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {ads.map((ad) => (
                  <tr key={ad.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium">{ad.title}</td>
                    <td className="px-4 py-3">{ad.price ?? 0} €</td>
                    <td className="px-4 py-3 uppercase text-xs font-bold text-gray-500">
                      {ad.type === "AUCTION" ? "Enchère" : "Vente"}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-bold ${ad.status === "ACTIVE"
                          ? "bg-green-100 text-green-700"
                          : ad.status === "SOLD"
                            ? "bg-blue-100 text-blue-700"
                            : "bg-red-100 text-red-700"
                          }`}
                      >
                        {ad.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      {ad.status === 'SOLD' ? (
                        <Link href={`/dashboard/ads/management/${ad.id}`}>
                          <Button variant="default" size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">
                            Gérer vente
                          </Button>
                        </Link>
                      ) : (
                        <Link href={`/ad/${ad.id}`}>
                          <Button variant="ghost" size="sm">
                            Gérer / Voir
                          </Button>
                        </Link>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
