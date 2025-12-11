export const dynamic = "force-dynamic";
export const revalidate = 0;

import { fetchAdOffers } from "@/lib/actions-dashboard-user";
import { notFound } from "next/navigation";
import Link from "next/link";

// =================================================================
// FONCTION UTILITAIRE DE FORMATAGE
// =================================================================
function formatDateTime(date: Date | string): string {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleString('fr-FR', {
        year: 'numeric', month: 'short', day: 'numeric', 
        hour: '2-digit', minute: '2-digit'
    });
}

// =================================================================
// COMPOSANT PRINCIPAL DE LA PAGE DYNAMIQUE
// =================================================================
export default async function AdManagementPage({ params }: { params: { adId: string } }) {
    const { adId: adIdString } = await params; 
    const adId = Number(adIdString);

    if (isNaN(adId) || adId <= 0) {
        notFound();
    }

    // --- Appel server action pour récupérer les offres ---
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

    const { title, offers } = data; 

    return (
        <div className="mx-auto max-w-6xl">
            <div className="p-6 bg-white rounded-xl shadow-lg">
                <h1 className="text-3xl font-bold mb-2 text-gray-800">
                    Gestion de l'Annonce : {title}
                </h1>
                <p className="text-gray-500 mb-6">ID Annonce: {adId}</p>

                <Link href="/dashboard/user/ads" className="mb-4 inline-block text-blue-600 hover:text-blue-800 font-medium">
                    &larr; Retour à Mes Annonces
                </Link>

                <div className="space-y-10 mt-6">
                    {/* SECTION OFFRES */}
                    <section>
                        <h2 className="text-2xl font-bold text-gray-700 mb-4 border-b pb-2">
                            Offres Reçues ({offers.length})
                        </h2>
                        {offers.length === 0 ? (
                            <p className="p-4 border rounded-md bg-gray-50 text-gray-500">
                                Aucune offre n'a encore été soumise pour cet objet.
                            </p>
                        ) : (
                            <div className="space-y-3">
                                {offers.map((offer, index) => (
                                    <div key={offer.id} className={`p-4 rounded-lg flex justify-between items-center transition-shadow ${
                                        index === 0 ? 'bg-green-50 border-2 border-green-300 shadow-md' : 'bg-white border border-gray-200'
                                    }`}>
                                        <div className="flex flex-col">
                                            <p className="font-medium text-gray-800">
                                                {offer.amount} €
                                            </p>
                                            <p className="text-sm text-gray-600 mt-1">
                                                Par : **{offer.user.name}** ({offer.user.role}) {offer.isAutoBid && '(Auto-Enchère)'}
                                            </p>
                                        </div>
                                        <p className="text-gray-500">
                                            {formatDateTime(offer.createdAt)}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </section>

                    {/* SECTION MESSAGES temporaire */}
                    <section>
                        <h2 className="text-2xl font-bold text-gray-700 mb-4 border-b pb-2">
                            Questions et Messages
                        </h2>
                        <div className="p-4 border rounded-md bg-gray-50 text-gray-500">
                            Les messages ne sont pas encore disponibles.
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
}
