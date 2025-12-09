
import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import { MoreHorizontal, ExternalLink } from "lucide-react";
import Link from "next/link";
// import { Button } from "@/components/ui/button"; // Optional

export default async function AdminAdsPage() {
    const session = await auth();

    if (!session?.user || session.user.role !== 'ADMIN') {
        redirect('/');
    }

    const ads = await prisma.ad.findMany({
        include: { user: true, category: true, _count: { select: { bids: true } } },
        orderBy: { createdAt: 'desc' },
    });

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-900">Gestion des Annonces</h1>
                <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-sm font-medium">
                    {ads.length} annonces
                </span>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                        <thead className="bg-gray-50 border-b border-gray-100">
                            <tr>
                                <th className="px-6 py-4 text-left font-medium text-gray-500">Titre</th>
                                <th className="px-6 py-4 text-left font-medium text-gray-500">Vendeur</th>
                                <th className="px-6 py-4 text-left font-medium text-gray-500">Type</th>
                                <th className="px-6 py-4 text-left font-medium text-gray-500">Prix</th>
                                <th className="px-6 py-4 text-left font-medium text-gray-500">Statut</th>
                                <th className="px-6 py-4 text-right font-medium text-gray-500">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {ads.map((ad) => (
                                <tr key={ad.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4">
                                        <div className="font-medium text-gray-900 max-w-xs truncate" title={ad.title}>{ad.title}</div>
                                        <div className="text-xs text-gray-400 mt-1">{ad.category.name}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-gray-900">{ad.user.name || ad.user.email}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded text-xs font-bold border ${ad.type === 'AUCTION'
                                            ? 'bg-orange-50 text-orange-700 border-orange-200'
                                            : 'bg-blue-50 text-blue-700 border-blue-200'
                                            }`}>
                                            {ad.type === 'AUCTION' ? 'Enchère' : 'Vente'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 font-medium">
                                        {ad.price} €
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${ad.status === 'ACTIVE' ? 'bg-green-100 text-green-700' :
                                            ad.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' :
                                                ad.status === 'SOLD' ? 'bg-blue-100 text-blue-700' :
                                                    'bg-red-100 text-red-700'
                                            }`}>
                                            {ad.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <Link href={`/ad/${ad.id}`} className="text-blue-600 hover:text-blue-800 hover:underline text-xs mr-3">
                                            Voir
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
