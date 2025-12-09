'use server';

import { auth } from "@/auth";
import prisma from "@/lib/prisma"; 

/**
 * Récupère les enchères de l'utilisateur avec les détails de l'annonce.
 */
export async function fetchUserBids() {
   
    const session = await auth();

    if (!session?.user || !session.user.id) {
        return { error: "Non authentifié", data: null };
    }

    const userId = Number(session.user.id);

    try {
        const bids = await prisma.bid.findMany({
            where: { userId: userId },
            select: {
                ad: {
                    select: {
                        id: true,
                        title: true,
                        endDate: true,
                        bids: {
                            orderBy: { amount: 'desc' },
                            take: 1,
                        }
                    }
                },
                amount: true,
            },
            orderBy: { createdAt: 'desc' },
        });

        const data = bids.map(bid => {
            const currentPrice = bid.ad.bids[0]?.amount ?? bid.ad.id;
            
            let status = "En cours";
            if (bid.ad.bids[0]?.amount === bid.amount) {
                status = "En cours (Meilleure offre)";
            } 

            return {
                adId: bid.ad.id,
                title: bid.ad.title,
                endDate: bid.ad.endDate,
                winningBid: bid.amount,
                currentPrice: currentPrice,
                status: status,
            };
        });

        return { data: data, error: null };

    } catch (e) {
        console.error("Erreur lors de la récupération des enchères:", e);
        return { error: "Erreur serveur lors de la récupération des données.", data: null };
    }
}


export async function fetchUserNotifications(limit: number = 10) {
    // ❌ Suppression de la directive ici
    // 'use server';
    
    const session = await auth();

    if (!session?.user || !session.user.id) {
        return { error: "Non authentifié" };
    }
    
    const userId = Number(session.user.id);

    try {
        const notifications = await prisma.notification.findMany({
            where: { userId: userId },
            orderBy: { createdAt: 'desc' },
            take: limit,
        });

        const unreadCount = await prisma.notification.count({
            where: { userId: userId, read: false },
        });

        return { data: notifications, unreadCount: unreadCount, error: null };
        
    } catch (e) {
        console.error("Erreur lors de la récupération des notifications:", e);
        return { error: "Erreur serveur lors de la récupération des données." };
    }
}


export async function markNotificationsAsRead(notificationIds: number[] | null = null) {
    
    const session = await auth();

    if (!session?.user || !session.user.id) {
        return { success: false, error: "Non authentifié" };
    }
    
    const userId = Number(session.user.id);
    
    let whereCondition: any = { userId: userId, read: false };

    if (notificationIds && notificationIds.length > 0) {
        whereCondition = {
            ...whereCondition,
            id: { in: notificationIds },
        };
    }

    try {
        const result = await prisma.notification.updateMany({
            where: whereCondition,
            data: { read: true },
        });

        return { success: true, count: result.count, error: null };

    } catch (e) {
        console.error("Erreur lors du marquage des notifications comme lues:", e);
        return { success: false, error: "Erreur serveur lors de la mise à jour." };
    }
}