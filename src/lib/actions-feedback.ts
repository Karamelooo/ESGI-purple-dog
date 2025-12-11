// src/lib/actions-feedback.ts
'use server';

import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

interface FeedbackResult {
    success: boolean;
    message: string;
}

const initialState: FeedbackResult = {
    success: false,
    message: '',
};

// 💡 FONCTION D'ENVOI D'EMAIL SIMULÉE 
// REMPLACER CECI par votre véritable fonction d'envoi d'email (via Nodemailer, Resend, etc.)
async function sendFeedbackEmail(feedbackData: any, user: any) {
    console.log(`--- NOUVEAU FEEDBACK ENVOYÉ PAR EMAIL ---`);
    console.log(`De: ${user.email} (ID: ${user.id} / Nom: ${user.name})`);
    console.log(`Note Étoiles: ${feedbackData.rating || 'N/A'}`);
    console.log(`Note NPS: ${feedbackData.npsScore || 'N/A'}`);
    console.log(`Commentaire: ${feedbackData.comment || 'Aucun commentaire fourni'}`);
    console.log(`-------------------------------------------`);
    
    // Simuler le temps de traitement de l'email
    await new Promise(resolve => setTimeout(resolve, 500)); 
    
    return { success: true }; 
}


export async function submitFeedback(
    prevState: FeedbackResult,
    formData: FormData
): Promise<FeedbackResult> {
    const session = await auth();

    if (!session?.user || !session.user.id || !session.user.email) {
        return { success: false, message: "Erreur: Non authentifié." };
    }
    
    // Restriction au rôle 'user' (Particulier)
    if (session.user.role === 'PRO') {
         return { success: false, message: "Cette fonctionnalité est réservée aux comptes Particuliers." };
    }

    const userId = Number(session.user.id);
    const ratingStr = formData.get('rating') as string;
    const npsScoreStr = formData.get('npsScore') as string;
    const comment = formData.get('comment') as string;

    const rating = ratingStr ? parseInt(ratingStr) : null;
    const npsScore = npsScoreStr ? parseInt(npsScoreStr) : null;
    
    // Validation minimale
    if (!rating && !npsScore && (!comment || comment.length < 5)) {
         return { success: false, message: "Veuillez donner au moins une note ou un commentaire détaillé (minimum 5 caractères)." };
    }

    try {
        const feedbackData = { rating, npsScore, comment };
        const userDetails = { id: userId, email: session.user.email, name: session.user.name };

        // Envoi des données (simulé)
        await sendFeedbackEmail(feedbackData, userDetails);
        
        revalidatePath('/dashboard/user');

        return { success: true, message: "Merci pour votre avis ! Nous l'avons bien reçu par email." };
    } catch (e) {
        console.error("Erreur lors de la soumission du feedback:", e);
        return { success: false, message: "Erreur serveur lors de la soumission de l'avis. Veuillez réessayer." };
    }
}