// src/lib/actions-dashboard.ts
'use server';

import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client"; 



// 1. Définir le "Payload" (les champs inclus dans la requête)
const bidSelectPayload = {
    ad: {
        select: {
            id: true,
            title: true,
            price: true,
            status: true,
            type: true,
            endDate: true,
            buyerId: true, // Ajout de buyerId pour la vérification du statut 'Gagné'
            bids: {
                orderBy: { amount: 'desc' },
                take: 1,
                select: {
                    amount: true,
                    userId: true
                }
            }
        }
    },
    amount: true,
    adId: true,
} satisfies Prisma.BidSelect;

// 2. Déduire le type exact de l'élément de la liste
type BidRecord = Prisma.BidGetPayload<{ select: typeof bidSelectPayload }>;


/**
 * Récupère toutes les annonces sur lesquelles l'utilisateur Pro connecté a enchéri.
 */
export async function fetchUserBids() {
    
    // 1. Vérification et identification de l'utilisateur
    const session = await auth();

    if (!session?.user || !session.user.id) {
        return { error: "Non authentifié" };
    }
    
    const userId = Number(session.user.id);

    // 2. Requête Prisma : Trouver les annonces liées aux bids de cet utilisateur
    const userBids = await prisma.bid.findMany({
        where: { userId: userId },
        distinct: ['adId'],
        select: bidSelectPayload, // Utilisation du payload typé
        orderBy: {
            createdAt: 'desc',
        }
    });

    // 3. Traitement des données pour la vue (Le type BidRecord est maintenant connu)
    const processedBids = userBids.map((bidRecord: BidRecord) => { // 💡 Typage explicite ici
        const ad = bidRecord.ad;
        const highestBid = ad.bids[0];
        const isWinning = ad.status === 'ACTIVE' && highestBid?.userId === userId;
        
        // Détermination du statut clair pour l'affichage
        let finalStatus: string;
        
        if (ad.status === 'SOLD') {
            finalStatus = ad.buyerId === userId ? 'Gagné (Achat Finalisé)' : 'Perdu (Vendu à un autre)';
        } else if (ad.status === 'EXPIRED') {
            finalStatus = 'Perdu (Expiré)';
        } else if (ad.status === 'ACTIVE') {
            finalStatus = isWinning ? 'En cours (Meilleur offre)' : 'En cours (Surenchéri)';
        } else {
            finalStatus = ad.status;
        }

        return {
            adId: ad.id,
            title: ad.title,
            currentPrice: ad.price,
            // Pour être précis, on prend l'enchère la plus haute de L'UTILISATEUR, 
            // bien que dans ce cas, le 'distinct: ['adId']' nous donne l'une de ses enchères, 
            // mais l'idée est de montrer le montant de l'enchère gagnante si c'est la sienne.
            winningBid: highestBid?.amount, // Le montant réel de la meilleure enchère globale
            status: finalStatus,
            endDate: ad.endDate,
        };
    });

    return { data: processedBids, error: null };
}