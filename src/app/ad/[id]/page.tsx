import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import { BidForm } from "@/components/bid-form";
import { BuyButton } from "@/components/buy-button";
// Badge fallback if not exists
function StatusBadge({ status }: { status: string }) {
    let color = 'bg-gray-100 text-gray-800';
    if (status === 'ACTIVE') color = 'bg-green-100 text-green-800';
    if (status === 'SOLD') color = 'bg-blue-100 text-blue-800';
    if (status === 'EXPIRED') color = 'bg-red-100 text-red-800';

    return <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${color}`}>{status}</span>
}

export default async function AdPage({ params }: { params: { id: string } }) {
    // Next.js 15+ params are async, likely 16 too. Wait, params is object in 14. 
    // In Next 15 params is promise. Let's await it to be safe or treat as sync if we know version.
    // Given Next 16.0.7 (beta), it's definitely async.
    const { id } = await params;
    const session = await auth();

    const ad = await prisma.ad.findUnique({
        where: { id: Number(id) },
        include: {
            user: true,
            category: true,
            bids: { orderBy: { amount: 'desc' } }
        }
    });

    if (!ad) notFound();

    const isPro = session?.user?.role === 'PRO';
    const isOwner = session?.user?.id === ad.user.id.toString();

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                {/* Images Section (Mock) */}
                <div className="space-y-4">
                    <div className="bg-gray-100 rounded-xl aspect-square flex items-center justify-center overflow-hidden">
                        <img
                            src={`https://placehold.co/600x600?text=${encodeURIComponent(ad.title)}`}
                            alt={ad.title}
                            className="w-full h-full object-cover"
                        />
                    </div>
                </div>

                {/* Details Section */}
                <div>
                    <div className="flex justify-between items-start mb-4">
                        <StatusBadge status={ad.status} />
                        <span className="text-sm text-gray-500">
                            Publié le {new Date(ad.startDate).toLocaleDateString()}
                        </span>
                    </div>

                    <h1 className="text-4xl font-bold text-gray-900 mb-2">{ad.title}</h1>
                    <p className="text-xl font-medium text-purple-700 mb-6">
                        {ad.type === 'AUCTION' ? `Enchère en cours : ${ad.price ?? 0} €` : `${ad.price ?? 0} €`}
                    </p>

                    <div className="prose max-w-none text-gray-600 mb-8">
                        <p className="whitespace-pre-line">{ad.description}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm text-gray-500 mb-8">
                        <div>
                            <span className="font-bold block text-gray-900">Catégorie</span>
                            {ad.category.name}
                        </div>
                        <div>
                            <span className="font-bold block text-gray-900">Vendeur</span>
                            {ad.user.name || ad.user.email} {ad.user.companyName && `(${ad.user.companyName})`}
                        </div>
                        {ad.dimensions && (
                            <div>
                                <span className="font-bold block text-gray-900">Dimensions</span>
                                {ad.dimensions}
                            </div>
                        )}
                        {ad.weight && (
                            <div>
                                <span className="font-bold block text-gray-900">Poids</span>
                                {ad.weight} kg
                            </div>
                        )}
                    </div>

                    {/* Actions */}
                    <div className="border-t border-gray-200 pt-6">
                        {ad.status === 'ACTIVE' ? (
                            <>
                                {ad.type === 'SALE' && (
                                    isPro ? <BuyButton adId={ad.id} price={ad.price ?? 0} /> : (
                                        !session?.user ? <p className="text-center text-gray-500">Connectez-vous pour acheter</p> :
                                            !isOwner && <p className="text-center text-red-500">Seuls les pros peuvent acheter</p>
                                    )
                                )}

                                {ad.type === 'AUCTION' && (
                                    <>
                                        {isPro ? <BidForm adId={ad.id} currentPrice={ad.price ?? 0} /> : (
                                            !session?.user ? <p className="text-center text-gray-500">Connectez-vous pour enchérir</p> :
                                                !isOwner && <p className="text-center text-red-500">Seuls les pros peuvent enchérir</p>
                                        )}

                                        {/* Bids History */}
                                        <div className="mt-8">
                                            <h3 className="font-bold text-gray-900 mb-4">Historique des enchères ({ad.bids.length})</h3>
                                            <div className="space-y-2 max-h-60 overflow-y-auto">
                                                {ad.bids.map((bid) => (
                                                    <div key={bid.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                                                        <span className="font-bold">{bid.amount} €</span>
                                                        <span className="text-xs text-gray-500">
                                                            {new Date(bid.createdAt).toLocaleString()}
                                                        </span>
                                                    </div>
                                                ))}
                                                {ad.bids.length === 0 && <p className="text-gray-500 italic">Aucune enchère pour le moment.</p>}
                                            </div>
                                        </div>
                                    </>
                                )}
                            </>
                        ) : (
                            <div className="bg-gray-100 p-6 rounded-xl text-center">
                                <h3 className="text-xl font-bold text-gray-800">
                                    {ad.status === 'SOLD' ? 'VENDU' : 'Annonce Terminée'}
                                </h3>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
