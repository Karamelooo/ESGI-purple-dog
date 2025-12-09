// src/components/NotificationBell.tsx (Code complet mis à jour)
'use client';

import { useEffect, useState, useCallback } from 'react';
import { fetchUserNotifications, markNotificationsAsRead } from '@/lib/actions-dashboard-pro'; 
import Link from 'next/link';

// Icône de cloche simplifiée
const BellIcon = () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path></svg>
);

export default function NotificationBell() {
    // Les notifications stockées
    const [notifications, setNotifications] = useState<any[]>([]);
    // Le nombre de notifications non lues (pour le badge rouge)
    const [unreadCount, setUnreadCount] = useState<number>(0);
    // État du menu déroulant (ouvert/fermé)
    const [isOpen, setIsOpen] = useState(false);

    // Fonction stable pour charger les données
    const loadNotifications = useCallback(async () => {
        const result = await fetchUserNotifications();
        if (result.data) {
            setNotifications(result.data);
            setUnreadCount(result.unreadCount ?? 0); 
        }
    }, []);

    // 1. Chargement initial des notifications (au montage du composant)
    useEffect(() => {
        loadNotifications();
        // Le polling (rechargement périodique) peut être ajouté ici si besoin
    }, [loadNotifications]);
    
    // 2. Marquage comme lu lorsque le menu s'ouvre
    useEffect(() => {
        // Déclenche l'action si le panneau vient d'être ouvert (isOpen=true)
        // ET qu'il y avait des notifications non lues (unreadCount > 0)
        if (isOpen && unreadCount > 0) {
            const markAllAsRead = async () => {
                await markNotificationsAsRead();
                
                // 💡 Mise à jour de l'état local pour réagir immédiatement dans l'interface
                setUnreadCount(0); 
                // Mettre à jour la liste pour retirer le style "non lu"
                setNotifications(prev => prev.map(notif => ({ ...notif, read: true })));
            };

            markAllAsRead();
        }
    }, [isOpen, unreadCount]); 

    return (
        <div className="relative">
            <button
                // Bascule l'état d'ouverture, déclenchant l'effet secondaire markAsRead
                onClick={() => setIsOpen(!isOpen)}
                className="p-2 rounded-full hover:bg-gray-100 relative focus:outline-none"
                aria-label="Notifications"
            >
                <BellIcon />
                {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-red-100 transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">
                        {unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <div 
                    className="absolute right-0 mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-xl z-50"
                    // Gérer la fermeture lorsque l'on clique à l'extérieur (optional)
                    onBlur={() => setTimeout(() => setIsOpen(false), 100)} 
                    tabIndex={-1}
                >
                    <div className="py-2 text-center border-b font-semibold text-gray-700">
                        Notifications Récentes ({unreadCount} non lue{unreadCount > 1 ? 's' : ''})
                    </div>
                    {notifications.length === 0 ? (
                        <p className="p-4 text-gray-500 text-sm">Aucune notification récente.</p>
                    ) : (
                        notifications.map(notif => (
                            <Link 
                                key={notif.id} 
                                href={notif.link || '/dashboard/pro'}
                                // Le style dépend de notif.read, mis à jour par l'effet de bord
                                className={`block p-3 text-sm hover:bg-gray-50 ${notif.read ? 'text-gray-500' : 'text-gray-900 font-medium bg-blue-50'}`}
                                onClick={() => setIsOpen(false)} 
                            >
                                {notif.message}
                                <span className="block text-xs text-gray-400 mt-0.5">{new Date(notif.createdAt).toLocaleTimeString('fr-FR')}</span>
                            </Link>
                        ))
                    )}
                    
                    <div className="py-2 text-center border-t">
                        <Link href="/dashboard/pro/notifications" className="text-blue-600 hover:text-blue-800 text-sm">
                            Voir tout
                        </Link>
                    </div>
                </div>
            )}
        </div>
    );
}