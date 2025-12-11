// src/lib/actions-user-profile.ts
'use server';

import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs"; 

// 💡 L'interface n'est PAS exportée
interface ProfileResult {
    success: boolean;
    message: string | null;
    field?: 'name' | 'email' | 'password';
}

// ----------------------------------------------------
// 1. fetchUserProfile
// ----------------------------------------------------
export async function fetchUserProfile() {
    const session = await auth();
    // ... (code inchangé) ...
    if (!session?.user || !session.user.id) {
        return { data: null, error: "Non authentifié" };
    }
    const userId = Number(session.user.id);

    try {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { name: true, email: true, role: true }
        });

        if (!user) {
            return { data: null, error: "Utilisateur introuvable" };
        }
        
        const profileData = {
            ...user,
            emailNotificationsEnabled: false, 
        }

        return { data: profileData, error: null };

    } catch (e) {
        console.error("Erreur lors de la récupération du profil:", e);
        return { data: null, error: "Erreur serveur lors de la récupération des données." };
    }
}

// ----------------------------------------------------
// 2. updateUserName
// ----------------------------------------------------
export async function updateUserName(
    prevState: ProfileResult,
    formData: FormData
): Promise<ProfileResult> {
    // ... (code inchangé) ...
    const session = await auth();
    if (!session?.user || !session.user.id) {
        return { success: false, message: "Non authentifié" };
    }
    const userId = Number(session.user.id);
    const newName = formData.get('name') as string;

    if (!newName || newName.length < 3) {
        return { success: false, message: "Le nom doit contenir au moins 3 caractères.", field: 'name' };
    }

    try {
        await prisma.user.update({
            where: { id: userId },
            data: { name: newName },
        });

        revalidatePath('/dashboard/user/profile');
        
        return { success: true, message: "Nom mis à jour avec succès." };
    } catch (e) {
        console.error("Erreur mise à jour nom:", e);
        return { success: false, message: "Erreur serveur lors de la mise à jour du nom." };
    }
}

// ----------------------------------------------------
// 3. updatePassword
// ----------------------------------------------------
export async function updatePassword(
    prevState: ProfileResult,
    formData: FormData
): Promise<ProfileResult> {
    // ... (code inchangé) ...
    const session = await auth();
    if (!session?.user || !session.user.id) {
        return { success: false, message: "Non authentifié" };
    }
    const userId = Number(session.user.id);
    const currentPassword = formData.get('currentPassword') as string;
    const newPassword = formData.get('newPassword') as string;
    const confirmPassword = formData.get('confirmPassword') as string;

    if (newPassword.length < 6) {
        return { success: false, message: "Le nouveau mot de passe doit contenir au moins 6 caractères.", field: 'password' };
    }
    if (newPassword !== confirmPassword) {
        return { success: false, message: "Le nouveau mot de passe et la confirmation ne correspondent pas.", field: 'password' };
    }

    try {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { password: true, email: true } 
        });

        if (!user || !user.password) {
             if (currentPassword) {
                 return { success: false, message: "Ancien mot de passe non requis, mais spécifié.", field: 'password' };
             }
        } else {
            const passwordMatch = await bcrypt.compare(currentPassword, user.password);
            if (!passwordMatch) {
                return { success: false, message: "Ancien mot de passe incorrect.", field: 'password' };
            }
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        await prisma.user.update({
            where: { id: userId },
            data: { password: hashedPassword },
        });

        revalidatePath('/dashboard/user/profile');

        return { success: true, message: "Mot de passe mis à jour avec succès. Veuillez vous reconnecter." };
    } catch (e) {
        console.error("Erreur mise à jour MP:", e);
        return { success: false, message: "Erreur serveur lors de la mise à jour du mot de passe." };
    }
}