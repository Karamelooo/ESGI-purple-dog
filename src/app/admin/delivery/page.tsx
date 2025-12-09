
import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import { Truck } from "lucide-react";

export default async function AdminDeliveryPage() {
    const session = await auth();
    if (!session?.user || session.user.role !== 'ADMIN') redirect('/');

    const deliveries = await prisma.delivery.findMany({
        include: { ad: { include: { user: true, buyer: true } } },
        orderBy: { createdAt: 'desc' }
    });

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-900">Suivi des Livraisons</h1>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <table className="min-w-full text-sm">
                    <thead className="bg-gray-50 border-b border-gray-100">
                        <tr>
                            <th className="px-6 py-4 text-left">Annonce</th>
                            <th className="px-6 py-4 text-left">Vendeur</th>
                            <th className="px-6 py-4 text-left">Acheteur</th>
                            <th className="px-6 py-4 text-left">Transporteur</th>
                            <th className="px-6 py-4 text-left">Statut</th>
                            <th className="px-6 py-4 text-right">Suivi</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {deliveries.length === 0 && (
                            <tr><td colSpan={6} className="px-6 py-8 text-center text-gray-500">Aucune livraison en cours.</td></tr>
                        )}
                        {deliveries.map((d) => (
                            <tr key={d.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 font-medium">{d.ad.title}</td>
                                <td className="px-6 py-4">{d.ad.user.name || d.ad.user.email}</td>
                                <td className="px-6 py-4">{d.ad.buyer?.name || d.ad.buyer?.email || '-'}</td>
                                <td className="px-6 py-4">{d.carrier || 'N/A'}</td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${d.status === 'DELIVERED' ? 'bg-green-100 text-green-700' :
                                            d.status === 'SHIPPED' ? 'bg-blue-100 text-blue-700' :
                                                'bg-yellow-100 text-yellow-700'
                                        }`}>
                                        {d.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right font-mono text-xs">{d.trackingNumber || '-'}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
