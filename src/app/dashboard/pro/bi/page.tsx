import { fetchUserBids } from "@/lib/actions-dashboard-pro"; // Ou actions-dashboard-pro si c'est votre nom de fichier
import Link from "next/link";

function formatDateFrench(dateString: string | Date | null | undefined): string {
    if (!dateString) return "Date inconnue";
    
    // Convertit la chaîne ou l'objet Date en objet Date
    const date = new Date(dateString);

    // Vérifie si la date est valide
    if (isNaN(date.getTime())) return "Date invalide";

    // Utilisation de l'API native de JavaScript Intl.DateTimeFormat
    const options: Intl.DateTimeFormatOptions = { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric', 
        hour: '2-digit', 
        minute: '2-digit' 
    };

    // Formatage en français
    return new Intl.DateTimeFormat('fr-FR', options).format(date);
}


export default async function ProBidsPage() {
    
    // 1. Récupération des données via le Server Action
    const { data, error } = await fetchUserBids();

    if (error) {
        return <div className="p-4 text-red-600 border border-red-300">Erreur de chargement : {error}</div>;
    }

    if (!data || data.length === 0) {
        return (
            <div className="p-4 text-gray-700">
                <h1 className="text-2xl font-bold mb-4">Mes achats et enchères</h1>
                <p>Vous n'avez encore placé aucune enchère.</p>
            </div>
        );
    }

    return (
        <div className="p-4">
            <h1 className="text-2xl font-bold mb-6">Mes achats et enchères</h1>

            <div className="overflow-x-auto bg-white border border-gray-200 rounded-lg">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs text-gray-500 uppercase tracking-wider">Annonce</th>
                            <th className="px-6 py-3 text-left text-xs text-gray-500 uppercase tracking-wider">Votre meilleure offre</th>
                            <th className="px-6 py-3 text-left text-xs text-gray-500 uppercase tracking-wider">Prix actuel / gagnant</th>
                            <th className="px-6 py-3 text-left text-xs text-gray-500 uppercase tracking-wider">Statut</th>
                            <th className="px-6 py-3 text-left text-xs text-gray-500 uppercase tracking-wider">Fin de l'enchère</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {data.map((item) => (
                            <tr key={item.adId} className="hover:bg-gray-50">
                                <td className="px-6 py-4 text-sm font-medium text-blue-600">
                                    <Link href={`/ad/${item.adId}`}>{item.title}</Link>
                                </td>

                                <td className="px-6 py-4 text-sm text-gray-900">
                                    {item.winningBid ? `${item.winningBid} €` : "N/A"}
                                </td>

                                <td className="px-6 py-4 text-sm text-gray-500">
                                    {item.currentPrice} €
                                </td>

                                <td className="px-6 py-4 text-sm">
                                    <span
                                        className={`inline-flex px-2 text-xs font-semibold leading-5 rounded-full ${
                                            item.status.includes("Meilleur offre")
                                                ? "bg-green-100 text-green-800"
                                                : item.status.includes("Gagné")
                                                ? "bg-green-600 text-white"
                                                : item.status.includes("Perdu")
                                                ? "bg-red-100 text-red-800"
                                                : "bg-yellow-100 text-yellow-800"
                                        }`}
                                    >
                                        {item.status}
                                    </span>
                                </td>

                                <td className="px-6 py-4 text-sm text-gray-500">
                                    {/* Appel à la fonction corrigée */}
                                    {formatDateFrench(item.endDate)} 
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}