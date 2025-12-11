import { fetchUserAds } from "@/lib/actions-dashboard-user"; 
import Link from "next/link";
import { Button } from "@/components/ui/button"; 
import { EyeIcon, SettingsIcon, PlusIcon } from "lucide-react"; 

// Fonction utilitaire pour formater la date de fin
function formatDate(dateString: Date | null | undefined): string {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR');
}

// Fonction pour déterminer la couleur du statut
function getStatusClasses(status: string): string {
    switch (status) {
        case 'ACTIVE':
            return 'bg-green-100 text-green-800';
        case 'SOLD':
            return 'bg-blue-100 text-blue-800';
        case 'Terminé (Non Clôturé)':
            return 'bg-red-100 text-red-800';
        default:
            return 'bg-yellow-100 text-yellow-800';
    }
}

export default async function UserAdsPage() {
    const result = await fetchUserAds();
    const ads = result.data || [];
    const error = result.error;

    if (error) {
        return (
            <div className="p-4 text-red-600 border border-red-300">
                Erreur de chargement des annonces : {error}
            </div>
        );
    }

    return (
        <div className="mx-auto max-w-6xl"> 
            <div className="p-6 bg-white rounded-xl shadow-lg"> 
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold text-gray-800">
                        Mes annonces en ligne ({ads.length})
                    </h1>
                    <Link href="/deposer-une-annonce">
                        <Button className="bg-purple-600 hover:bg-purple-700 text-white font-medium flex items-center space-x-1">
                            <PlusIcon className="w-4 h-4" />
                            <span>Nouvelle annonce</span>
                        </Button>
                    </Link>
                </div>

                {ads.length === 0 ? (
                    <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50">
                        <p className="text-lg text-gray-500 mb-4 font-semibold">
                            Aucune annonce en vente pour le moment.
                        </p>
                        <Link href="/deposer-une-annonce">
                            <Button variant="outline">Déposer votre première annonce</Button>
                        </Link>
                    </div>
                ) : (
                    <div className="overflow-x-auto border border-gray-200 rounded-lg"> 
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Image</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Titre</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Prix</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Type</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Statut</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Fin</th>
                                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-100">
                                {ads.map((ad) => (
                                    <tr key={ad.id} className="hover:bg-gray-50">
                                        <td className="px-4 py-2">
                                            <div className="h-12 w-12 rounded-lg overflow-hidden bg-gray-100 border">
                                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                                <img
                                                    src={ad.thumbnail || `https://placehold.co/100x100?text=${encodeURIComponent(ad.title)}`}
                                                    alt={ad.title}
                                                    className="h-full w-full object-cover"
                                                />
                                            </div>
                                        </td>
                                        <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                                            {ad.title}
                                        </td>
                                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-700 font-bold">
                                            {ad.displayPrice} €
                                        </td>
                                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                                            {ad.type === 'AUCTION' ? 'Enchère' : 'Vente directe'}
                                        </td>
                                        <td className="px-4 py-2 whitespace-nowrap">
                                            <span className={`px-2 py-0.5 inline-flex text-xs leading-5 font-medium rounded-full ${getStatusClasses(ad.displayStatus)}`}>
                                                {ad.displayStatus}
                                            </span>
                                        </td>
                                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                                            {ad.type === 'AUCTION' ? formatDate(ad.endDate) : 'N/A'}
                                        </td>
                                        <td className="px-4 py-2 whitespace-nowrap text-center text-sm font-medium space-x-2">

                                            {/* Vue publique */}
                                            <Link href={`/ad/${ad.id}`}>
                                                <Button variant="ghost" size="icon" title="Voir l'annonce" className="text-blue-600 hover:text-blue-800 h-8 w-8">
                                                    <EyeIcon className="h-4 w-4" />
                                                </Button>
                                            </Link>

                                            {/* LIEN CORRIGÉ VERS LE DYNAMIQUE */}

<Link href={`/dashboard/user/ads/management/${ad.id}`}> 
    <Button variant="ghost" size="icon" title="Gérer les offres" className="text-indigo-600 hover:text-indigo-800 h-8 w-8">
        <SettingsIcon className="h-4 w-4" />
    </Button>
</Link>


                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
