export const dynamic = "force-dynamic";
export const revalidate = 0;

import { fetchAdOffers } from "@/lib/actions-dashboard-user";
import { notFound } from "next/navigation";
import Link from "next/link";
import DeliveryActions from "@/components/dashboard/delivery-actions";


function formatDateTime(date: Date | string): string {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleString('fr-FR', {
        year: 'numeric', month: 'short', day: 'numeric',
        hour: '2-digit', minute: '2-digit'
    });
}


export default async function AdManagementPage({ params }: { params: { adId: string } }) {
    const { adId: adIdString } = await params;
    const adId = Number(adIdString);

    if (isNaN(adId) || adId <= 0) {
        notFound();
    }


    const result = await fetchAdOffers(adId);
    const data = result.data;
    const error = result.error;

    if (error) {
        return (
            <div className="p-4 text-red-600 border border-red-300">
                Erreur lors de la récupération des offres : {error}
            </div>
        );
    }

    if (!data) {
        notFound();
    }

    // ... (existing imports)

    const { title, status, soldDetails } = data;

    return (
        <div className="mx-auto max-w-6xl">
            <div className="p-6 bg-white rounded-xl shadow-lg">
                <div className="flex justify-between items-start">
                    <div>
                        <h1 className="text-3xl font-bold mb-2 text-gray-800">
                            Gestion de l'Annonce : {title}
                        </h1>
                        <p className="text-gray-500 mb-6">ID Annonce: {adId}</p>
                    </div>
                    <div className="px-4 py-2 bg-gray-100 rounded-lg">
                        <span className="text-sm font-semibold text-gray-600 uppercase">Statut : </span>
                        <span className={`font-bold ${status === 'SOLD' ? 'text-blue-600' : 'text-gray-800'}`}>
                            {status === 'SOLD' ? 'VENDU' : status}
                        </span>
                    </div>
                </div>

                <Link href="/dashboard/ads" className="mb-8 inline-block text-blue-600 hover:text-blue-800 font-medium">
                    &larr; Retour à Mes Annonces
                </Link>

                {/* SECTION LOGISTIQUE (SI VENDU) */}
                {status === 'SOLD' && soldDetails && (
                    <section className="mb-10 border border-blue-100 rounded-xl overflow-hidden shadow-sm">
                        <div className="bg-blue-50 px-6 py-4 border-b border-blue-100">
                            <h2 className="text-xl font-bold text-blue-900">📦 Détails de la vente & Livraison</h2>
                        </div>
                        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div>
                                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Acheteur</h3>
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <p className="font-medium text-lg text-gray-900">{soldDetails.buyerName || 'Utilisateur inconnu'}</p>
                                    <p className="text-gray-500 text-sm">L'acheteur a réglé la commande.</p>
                                </div>
                            </div>

                            <div>
                                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Adresse de Livraison</h3>
                                {soldDetails.delivery ? (
                                    <div className="bg-gray-50 p-4 rounded-lg text-gray-700">
                                        <p className="font-medium">{soldDetails.delivery.address}</p>
                                        <p>{soldDetails.delivery.zipCode} {soldDetails.delivery.city}</p>
                                        {soldDetails.delivery.phone && <p className="mt-2 text-sm text-gray-500">Tél: {soldDetails.delivery.phone}</p>}
                                        <p className="mt-2 text-sm text-indigo-600 font-medium">Transporteur: {soldDetails.delivery.carrier}</p>
                                    </div>
                                ) : (
                                    <p className="text-red-500">Aucune information de livraison disponible.</p>
                                )}
                            </div>
                        </div>

                        {/* COMPOSANT ACTIONS LIVRAISON (CLIENT) */}
                        <div className="px-6 pb-6">
                            {soldDetails.delivery && (
                                <DeliveryActions
                                    adId={adId}
                                    initialStatus={soldDetails.delivery.status}
                                    initialTracking={soldDetails.delivery.trackingNumber}
                                />
                            )}
                        </div>
                    </section>
                )}
            </div>
        </div >
    );
}
