'use server';

import { auth } from "@/auth";
import prisma from "@/lib/prisma";
// Nous gardons l'import de base, mais nous n'utilisons plus les types de modèles individuels
import { Prisma } from '@prisma/client';

// ----------------------------------------------------
// DÉFINITION DES TYPES MANUELS (POUR ÉVITER LES ERREURS DE TYPAGE PRISMA)
// ----------------------------------------------------

// Types précis des données de retour pour chaque requête (remplace Prisma.XXXGetPayload)

interface AdQueryResult {
    id: number;
    title: string;
    type: 'AUCTION' | 'SALE';
    price: number | null;
    status: 'DRAFT' | 'PENDING' | 'ACTIVE' | 'REJECTED' | 'SOLD' | 'EXPIRED';
    createdAt: Date;
    endDate: Date | null;
    images?: string[];
}

interface PurchaseQueryResult {
    id: number;
    title: string;
    type: 'AUCTION' | 'SALE';
    price: number | null;
    createdAt: Date;
    bids: { amount: number }[];
    user: { name: string | null } | null;
}

interface UserDetails {
    id: number;
    name: string | null;
    role: 'USER' | 'PRO' | 'ADMIN';
}

interface BidQueryResult {
    id: number;
    amount: number;
    createdAt: Date;
    user: { name: string | null, role: 'USER' | 'PRO' | 'ADMIN' };
    isAutoBid: boolean;
}

interface MessageQueryResult {
    id: number;
    content: string;
    createdAt: Date;
    user: UserDetails;
}


// Interfaces utilisées par les composants
interface AdOffer {
    id: number;
    amount: number;
    createdAt: Date;
    user: {
        name: string | null;
        role: string;
    };
    isAutoBid: boolean;
}

interface AdMessage {
    id: number;
    content: string;
    createdAt: Date;
    user: UserDetails;
}

interface AdOffersResult {
    title: string;
    status?: string;
    offers: AdOffer[];
    messages: AdMessage[];
    soldDetails?: any; // To avoid circular ref with local interface, or define SoldDetails outside. Defining outside is better.
}

interface SoldDetails {
    buyerName: string | null;
    delivery: {
        status: string;
        carrier: string | null;
        trackingNumber: string | null;
        address: string | null;
        city: string | null;
        zipCode: string | null;
        phone: string | null;
    } | null;
}


// ----------------------------------------------------
// 1. fetchUserAds (Récupérer les annonces de l'utilisateur)
// ----------------------------------------------------

export async function fetchUserAds() {
    const session = await auth();

    if (!session?.user || !session.user.id) {
        return { error: "Non authentifié", data: null };
    }

    const userId = Number(session.user.id);

    try {
        const ads = await prisma.ad.findMany({
            where: { userId: userId },
            select: {
                id: true,
                title: true,
                type: true,
                price: true,
                status: true,
                createdAt: true,
                endDate: true,
                images: true,
            },
            orderBy: { createdAt: 'desc' },
        }) as AdQueryResult[]; // Cast for type safety

        const data = ads.map((ad) => ({
            ...ad,
            displayStatus: ad.type === 'AUCTION' && ad.status === 'ACTIVE' && ad.endDate && new Date(ad.endDate) < new Date()
                ? 'Terminé (Non Clôturé)'
                : ad.status,
            displayPrice: ad.price?.toFixed(2) ?? 'N/A',
            thumbnail: ad.images && ad.images.length > 0 ? ad.images[0] : null,
        }));

        return { data: data, error: null };

    } catch (e) {
        console.error("Erreur lors de la récupération des annonces:", e);
        return { error: "Erreur serveur lors de la récupération des données.", data: null };
    }
}


// ----------------------------------------------------
// 2. fetchUserPurchases (Récupérer les achats de l'utilisateur)
// ----------------------------------------------------

export async function fetchUserPurchases() {
    const session = await auth();

    if (!session?.user || !session.user.id) {
        return { error: "Non authentifié", data: null };
    }

    const userIdFilter = Number(session.user.id);

    try {
        const purchases = await prisma.ad.findMany({
            where: {
                buyerId: userIdFilter,
                status: 'SOLD',
            },
            select: {
                id: true,
                title: true,
                type: true,
                price: true,
                createdAt: true,
                bids: {
                    orderBy: { amount: 'desc' },
                    take: 1,
                    select: { amount: true }
                },
                user: {
                    select: { name: true }
                }
            },
            orderBy: { createdAt: 'desc' },
        }) as PurchaseQueryResult[]; // Cast for type safety

        const data = purchases.map((p) => {
            const finalPrice = p.type === 'AUCTION' && p.bids.length > 0
                ? p.bids[0].amount
                : p.price ?? 0;

            return {
                adId: p.id,
                title: p.title,
                type: p.type,
                sellerName: p.user?.name ?? 'Vendeur inconnu',
                finalPrice: finalPrice.toFixed(2),
                purchaseDate: p.createdAt,
            };
        });

        return { data: data, error: null };

    } catch (e) {
        console.error("Erreur lors de la récupération des achats:", e);
        return { error: "Erreur serveur lors de la récupération des données.", data: null };
    }
}


// ----------------------------------------------------
// 3. fetchAdOffers (Récupérer les offres et messages pour une annonce)
// ----------------------------------------------------

// 3. fetchAdOffers (Récupérer les offres et messages pour une annonce)
// ----------------------------------------------------

export async function fetchAdOffers(adId: number): Promise<{ data: AdOffersResult | null; error: string | null }> {
    const session = await auth();

    if (!session?.user || !session.user.id) {
        return { error: "Non authentifié", data: null };
    }

    const currentUserId = Number(session.user.id);

    if (isNaN(adId) || adId <= 0) {
        return { error: "ID d'annonce invalide.", data: null };
    }

    // Interface updates (inline or at top) for Buyer/Delivery
    // Moved SoldDetails to top scope for cleaner code


    try {
        interface AdWithDetails {
            userId: number;
            title: string;
            status: string;
            buyer?: { name: string | null } | null;
            delivery?: {
                status: string;
                carrier: string | null;
                trackingNumber: string | null;
                address: string | null;
                city: string | null;
                zipCode: string | null;
                phone: string | null;
            } | null;
        }

        const ad = await prisma.ad.findUnique({
            where: { id: adId },
            select: {
                userId: true,
                title: true,
                status: true,
                buyer: { select: { name: true } },
                delivery: {
                    select: {
                        status: true,
                        carrier: true,
                        trackingNumber: true,
                        address: true,
                        city: true,
                        zipCode: true,
                        phone: true
                    }
                }
            }
        }) as unknown as AdWithDetails;
        if (!ad || ad.userId !== currentUserId) {
            return { error: "Annonce introuvable ou vous n'êtes pas le propriétaire.", data: null };
        }

        // ... (existing offers fetch) ...
        const offers = await prisma.bid.findMany({
            where: { adId: adId },
            select: {
                id: true,
                amount: true,
                createdAt: true,
                user: {
                    select: { name: true, role: true }
                },
                isAutoBid: true,
            },
            orderBy: { amount: 'desc' },
        }) as BidQueryResult[];

        // ... (existing messages fetch) ...
        const messagesQuery = (await (prisma as any).message.findMany({
            where: { adId: adId },
            select: {
                id: true,
                content: true,
                createdAt: true,
                user: {
                    select: { id: true, name: true, role: true }
                }
            },
            orderBy: { createdAt: 'asc' },
        })) as MessageQueryResult[];

        // ... (mapping) ...
        const offersData: AdOffer[] = offers.map((offer) => ({
            id: offer.id,
            amount: offer.amount,
            createdAt: offer.createdAt,
            isAutoBid: offer.isAutoBid,
            user: {
                name: offer.user.name,
                role: offer.user.role
            }
        }));

        const messagesData: AdMessage[] = messagesQuery.map((msg) => ({
            id: msg.id,
            content: msg.content,
            createdAt: msg.createdAt,
            user: {
                id: msg.user.id,
                name: msg.user.name,
                role: msg.user.role
            }
        }));

        // Sold Details construction
        let soldDetails: SoldDetails | null = null;
        if (ad.status === 'SOLD' && ad.buyer) {
            soldDetails = {
                buyerName: ad.buyer.name,
                delivery: ad.delivery ? {
                    status: ad.delivery.status,
                    carrier: ad.delivery.carrier,
                    trackingNumber: ad.delivery.trackingNumber,
                    address: ad.delivery.address,
                    city: ad.delivery.city,
                    zipCode: ad.delivery.zipCode,
                    phone: ad.delivery.phone
                } : null
            };
        }

        return {
            data: {
                title: ad.title,
                status: ad.status,
                offers: offersData,
                messages: messagesData,
                soldDetails: soldDetails
            },
            error: null
        };

    } catch (e) {
        console.error("Erreur lors de la récupération des offres et messages:", e);
        return { error: "Erreur serveur lors de la récupération des données d'offres (BDD).", data: null };
    }
}


// ----------------------------------------------------
// 4. fetchUserNotifications (Récupérer les notifications de l'utilisateur)
// ----------------------------------------------------

export async function fetchUserNotifications(limit: number = 10) {
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


// ----------------------------------------------------
// 5. markNotificationsAsRead (Marquer les notifications comme lues)
// ----------------------------------------------------

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


// ----------------------------------------------------
// 6. updateDeliveryStatus (Seller updates delivery)
// ----------------------------------------------------

export async function updateDeliveryStatus(adId: number, trackingNumber: string) {
    const session = await auth();
    if (!session?.user || !session.user.id) {
        return { success: false, error: "Non authentifié" };
    }
    const userId = Number(session.user.id);

    try {
        const ad = await prisma.ad.findUnique({
            where: { id: adId },
            include: { delivery: true }
        });

        if (!ad || ad.userId !== userId) {
            return { success: false, error: "Non autorisé" };
        }

        if (!ad.delivery) {
            return { success: false, error: "Aucune livraison associée." };
        }

        await prisma.delivery.update({
            where: { adId: adId },
            data: {
                status: 'SENT',
                trackingNumber: trackingNumber
            }
        });

        return { success: true };
    } catch (e) {
        console.error("Error updating delivery:", e);
        return { success: false, error: "Erreur serveur." };
    }
}