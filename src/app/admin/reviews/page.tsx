
import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import { Star } from "lucide-react";

export default async function AdminReviewsPage() {
    const session = await auth();
    if (!session?.user || session.user.role !== 'ADMIN') redirect('/');

    const reviews = await prisma.review.findMany({
        include: { author: true, target: true },
        orderBy: { createdAt: 'desc' }
    });

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-900">Avis Clients</h1>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <table className="min-w-full text-sm">
                    <thead className="bg-gray-50 border-b border-gray-100">
                        <tr>
                            <th className="px-6 py-4 text-left">Auteur</th>
                            <th className="px-6 py-4 text-left">Destinataire</th>
                            <th className="px-6 py-4 text-left">Note</th>
                            <th className="px-6 py-4 text-left">Commentaire</th>
                            <th className="px-6 py-4 text-right">Date</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {reviews.length === 0 && (
                            <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-500">Aucun avis pour le moment.</td></tr>
                        )}
                        {reviews.map((review) => (
                            <tr key={review.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 font-medium">{review.author.name || review.author.email}</td>
                                <td className="px-6 py-4">{review.target.name || review.target.email}</td>
                                <td className="px-6 py-4 flex items-center text-yellow-500 font-bold">
                                    {review.rating} <Star size={14} className="ml-1 fill-current" />
                                </td>
                                <td className="px-6 py-4 text-gray-600 max-w-xs truncate">{review.comment}</td>
                                <td className="px-6 py-4 text-right text-gray-400">{new Date(review.createdAt).toLocaleDateString()}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
