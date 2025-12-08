import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function UserDashboardPage() {
    const session = await auth();
    const ads = await prisma.ad.findMany({
        where: { userId: Number(session?.user?.id) },
        orderBy: { createdAt: 'desc' }
    });

    const adCount = ads.length;

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-900">Mon Espace Particulier</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-gray-500">Mes Annonces En Ligne</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">{adCount}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-gray-500">Achats</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">0</div>
                    </CardContent>
                </Card>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-bold mb-4">Mes Annonces</h2>
                {ads.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                        Vous n'avez pas encore d'annonces.
                        <Link href="/deposer-une-annonce" className="block mt-4">
                            <Button>Déposer une annonce</Button>
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {ads.map((ad) => (
                            <div key={ad.id} className="flex justify-between items-center border-b pb-4 last:border-0 last:pb-0">
                                <div>
                                    <h3 className="font-bold">{ad.title}</h3>
                                    <p className="text-sm text-gray-500">{new Date(ad.createdAt).toLocaleDateString()} - {ad.status}</p>
                                </div>
                                <Link href={`/ad/${ad.id}`}>
                                    <Button variant="outline" size="sm">Voir</Button>
                                </Link>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
