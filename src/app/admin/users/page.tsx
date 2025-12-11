
import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import UserActions from "@/components/admin/UserActions";

export default async function AdminUsersPage() {
    const session = await auth();

    if (!session?.user || session.user.role !== 'ADMIN') {
        redirect('/');
    }

    const users = await prisma.user.findMany({
        orderBy: { createdAt: 'desc' },
        include: {
            _count: { select: { ads: true } },
            plan: true
        }
    });

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-900">Gestion des Utilisateurs</h1>
                <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-sm font-medium">
                    {users.length} utilisateurs
                </span>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                        <thead className="bg-gray-50 border-b border-gray-100">
                            <tr>
                                <th className="px-6 py-4 text-left font-medium text-gray-500">Info</th>
                                <th className="px-6 py-4 text-left font-medium text-gray-500">Statut</th>
                                <th className="px-6 py-4 text-left font-medium text-gray-500">Rôle</th>
                                <th className="px-6 py-4 text-left font-medium text-gray-500">Forfait</th>
                                <th className="px-6 py-4 text-right font-medium text-gray-500">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {users.map((user) => (
                                <tr key={user.id} className={`hover:bg-gray-50 ${user.isBlocked ? 'bg-red-50' : ''}`}>
                                    <td className="px-6 py-4">
                                        <div className="font-medium text-gray-900">{user.name || "Sans nom"}</div>
                                        <div className="text-gray-500">{user.email}</div>
                                        <div className="text-xs text-gray-400 mt-1">
                                            Inscrit le {new Date(user.createdAt).toLocaleDateString()}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        {user.isBlocked ? (
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                                Bloqué
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                Actif
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded text-xs font-bold ${user.role === 'ADMIN' ? 'bg-purple-100 text-purple-700' :
                                            user.role === 'PRO' ? 'bg-blue-100 text-blue-700' :
                                                'bg-gray-100 text-gray-700'
                                            }`}>
                                            {user.role}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        {user.plan ? (
                                            <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-indigo-50 text-indigo-700">
                                                {user.plan.name}
                                            </span>
                                        ) : (
                                            <span className="text-gray-400 text-xs">-</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <UserActions user={user} />
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
