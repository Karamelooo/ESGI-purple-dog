import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";

export default async function AdminPage() {
    const session = await auth();

    if (!session?.user || session.user.role !== 'ADMIN') {
        redirect('/');
    }

    const users = await prisma.user.findMany({
        orderBy: { createdAt: 'desc' },
    });

    const ads = await prisma.ad.findMany({
        include: { user: true, category: true },
        orderBy: { createdAt: 'desc' },
    });

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
                <div className="bg-white px-4 py-2 rounded-lg shadow text-sm">
                    Connecté en tant que <span className="font-bold text-primary">{session.user.role}</span>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <h2 className="text-xl font-bold mb-4 text-gray-800">Utilisateurs ({users.length})</h2>
                    <div className="overflow-x-auto">
                        <table className="min-w-full text-sm">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-4 py-3 text-left">Email</th>
                                    <th className="px-4 py-3 text-left">Role</th>
                                    <th className="px-4 py-3 text-left">Date</th>
                                    <th className="px-4 py-3 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {users.map((user) => (
                                    <tr key={user.id} className="hover:bg-gray-50">
                                        <td className="px-4 py-3 font-medium">{user.email}</td>
                                        <td className="px-4 py-3">
                                            <span className={`px-2 py-1 rounded-full text-xs font-bold ${user.role === 'ADMIN' ? 'bg-red-100 text-red-700' :
                                                user.role === 'PRO' ? 'bg-purple-100 text-purple-700' :
                                                    'bg-green-100 text-green-700'
                                                }`}>
                                                {user.role}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-gray-500">{new Date(user.createdAt).toLocaleDateString()}</td>
                                        <td className="px-4 py-3 text-right">
                                            <button className="text-blue-600 hover:text-blue-800 font-medium">Modifier</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <h2 className="text-xl font-bold mb-4 text-gray-800">Annonces ({ads.length})</h2>
                    <div className="space-y-4">
                        {ads.length === 0 && <p className="text-gray-500 italic">Aucune annonce pour le moment.</p>}
                        {ads.map((ad) => (
                            <div key={ad.id} className="flex justify-between items-start border-b border-gray-100 pb-3 last:border-0">
                                <div>
                                    <h3 className="font-semibold text-gray-900">{ad.title}</h3>
                                    <p className="text-sm text-gray-500">Par {ad.user.name || ad.user.email} • {ad.price} €</p>
                                </div>
                                <div className="flex gap-2">
                                    <span className={`px-2 py-1 rounded text-xs font-bold ${ad.status === 'ACTIVE' ? 'bg-green-100 text-green-700' :
                                        ad.status === 'REJECTED' ? 'bg-red-100 text-red-700' :
                                            'bg-yellow-100 text-yellow-700'
                                        }`}>
                                        {ad.status}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
