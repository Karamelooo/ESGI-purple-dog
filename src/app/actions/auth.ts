'use server';

import { signIn } from '@/auth';
import { AuthError } from 'next-auth';

export async function login(prevState: string | undefined, formData: FormData) {
    try {
        await signIn('credentials', formData);
    } catch (error) {
        if (error instanceof AuthError) {
            switch (error.type) {
                case 'CallbackRouteError':
                    // The error message from `authorize` (e.g. "Compte bloqué") is often wrapped
                    // We might need to inspect `error.cause` or just return a generic message if we can't extract it easily.
                    // For now, let's try to see if we can get the specific error.
                    if (error.cause?.err?.message) {
                        return error.cause.err.message;
                    }
                    return 'Identifiants invalides.';
                case 'CredentialsSignin':
                    return 'Identifiants invalides.';
                default:
                    return 'Une erreur est survenue.';
            }
        }
        // If we threw a simple Error in authorize, it might come through differently depending on NextAuth version.
        // However, usually `signIn` throws, so we rethrow if it's not an AuthError (like redirect)

        // In NextAuth v5, redirects are thrown as errors, so we must rethrow them.
        // The check `isRedirectError` from `next/dist/client/components/redirect` is internal but we can check digest.
        // Or simpler: just `throw error` if it's not an AuthError, but we need to catch the "Compte bloqué".

        // Actually, when we throw new Error("Compte bloqué") in authorize, it typically results in a CallbackRouteError or similar in the flow.
        // Let's print the error for debugging if needed, but for now we will try to return a string.

        const errorMessage = (error as Error).message;
        if (errorMessage.includes("Compte bloqué")) {
            return "Votre compte est bloqué. Veuillez contacter l'administrateur.";
        }

        // Valid redirects throw an error in Next.js Server Actions, so we must rethrow them
        if (errorMessage === "NEXT_REDIRECT") {
            throw error;
        }

        throw error;
    }
}
