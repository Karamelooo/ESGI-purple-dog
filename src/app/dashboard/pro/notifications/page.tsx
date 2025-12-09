// src/app/dashboard/pro/notifications/page.tsx
import { fetchUserNotifications } from "@/lib/actions-dashboard-pro"; // Utilisez votre fichier d'actions
import Link from "next/link";

// Fonction pour formater la date (vous l'avez déjà dans un fichier utils, sinon réutilisez celle-ci)
function formatDateTime(dateString: string | Date | null | undefined): string {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "Date invalide";
    return new Intl.DateTimeFormat('fr-FR', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric', 
        hour: '2-digit', 
        minute: '2-digit' 
    }).format(date);
}


export default async function AllNotificationsPage() {
    // Récupérer toutes les notifications (sans limite)
    const result = await fetchUserNotifications(100); 
    const notifications = result.data || [];
    const error = result.error;

    if (error) {
        return <div className="p-4 text-red-600 border border-red-300">Erreur de chargement : {error}</div>;
    }

    return (
        <div className="p-4 bg-white rounded-lg shadow-md">
            <h1 className="text-3xl font-bold mb-6 text-gray-800">Toutes mes Notifications 🔔</h1>
            
            {notifications.length === 0 ? (
                <div className="text-center py-10 border rounded-lg bg-gray-50">
                    <p className="text-lg text-gray-500">Vous n'avez aucune notification.</p>
                    <Link href="/dashboard/pro" className="mt-4 inline-block text-blue-600 hover:text-blue-800">
                        Retour au Dashboard
                    </Link>
                </div>
            ) : (
                <div className="space-y-4">
                    {notifications.map((notif) => (
                        <Link 
                            key={notif.id} 
                            href={notif.link || '#'}
                            className={`flex items-start p-4 rounded-lg transition duration-200 ${
                                notif.read ? 'bg-gray-50 text-gray-600 hover:bg-gray-100' : 'bg-blue-50 text-gray-900 font-medium border border-blue-200 hover:bg-blue-100'
                            }`}
                        >
                            <div className={`flex-shrink-0 w-2 h-2 rounded-full mt-2 mr-3 ${notif.read ? 'bg-gray-400' : 'bg-red-500'}`} />
                            <div className="flex-1">
                                <p className="text-sm">{notif.message}</p>
                                <span className="block text-xs text-gray-400 mt-1">
                                    {formatDateTime(notif.createdAt)}
                                    {!notif.read && <span className="ml-2 text-red-500 font-semibold">(Non lue)</span>}
                                </span>
                            </div>
                            {notif.link && <span className="text-xs text-blue-500 ml-4 flex-shrink-0 pt-1">Aller</span>}
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}