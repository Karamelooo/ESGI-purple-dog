
import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import { Users, Package, CreditCard, AlertCircle } from "lucide-react";

export default async function AdminPage() {
    const session = await auth();

    if (!session?.user || session.user.role !== 'ADMIN') {
        redirect('/');
    }

    const [
        totalUsers,
        totalAds,
        activeAds,
        pendingAds,
        recentUsers
    ] = await Promise.all([
        prisma.user.count(),
        prisma.ad.count(),
        prisma.ad.count({ where: { status: 'ACTIVE' } }),
        prisma.ad.count({ where: { status: 'PENDING' } }),
        prisma.user.findMany({
            take: 5,
            orderBy: { createdAt: 'desc' },
            include: { ads: { select: { id: true } } }
        })
    ]);

    const stats = [
        { label: "Utilisateurs Inscrits", value: totalUsers, icon: Users, color: "text-blue-600", bg: "bg-blue-100" },
        { label: "Total Annonces", value: totalAds, icon: Package, color: "text-purple-600", bg: "bg-purple-100" },
        { label: "Annonces Actives", value: activeAds, icon: AlertCircle, color: "text-green-600", bg: "bg-green-100" },
        { label: "En Attente", value: pendingAds, icon: AlertCircle, color: "text-yellow-600", bg: "bg-yellow-100" },
    ];

    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-bold text-gray-900">Vue d'ensemble</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat) => (
                    <div key={stat.label} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center">
                        <div className={`p-4 rounded-full ${stat.bg} mr-4`}>
                            <stat.icon className={`w-6 h-6 ${stat.color}`} />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 font-medium">{stat.label}</p>
                            <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100">
                    <h2 className="text-lg font-bold text-gray-800">Derniers Inscrits</h2>
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left font-medium text-gray-500">Email</th>
                                <th className="px-6 py-3 text-left font-medium text-gray-500">Role</th>
                                <th className="px-6 py-3 text-left font-medium text-gray-500">Date</th>
                                <th className="px-6 py-3 text-right font-medium text-gray-500">Annonces</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {recentUsers.map((user) => (
                                <tr key={user.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4">{user.email}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${user.role === 'ADMIN' ? 'bg-red-100 text-red-700' :
                                                user.role === 'PRO' ? 'bg-purple-100 text-purple-700' :
                                                    'bg-green-100 text-green-700'
                                            }`}>
                                            {user.role}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-gray-500">{new Date(user.createdAt).toLocaleDateString()}</td>
                                    <td className="px-6 py-4 text-right">{user.ads.length}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
