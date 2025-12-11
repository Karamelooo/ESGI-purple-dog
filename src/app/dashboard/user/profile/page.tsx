// src/app/dashboard/user/profile/page.tsx
'use client';

import { 
    fetchUserProfile, 
    updateUserName, 
    updatePassword,
} from "@/lib/actions-user-profile"; 
import { useFormState } from "react-dom";
import { useEffect, useState } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";

// Définition de l'interface ProfileResult LOCALEMENT pour éviter l'import
interface ProfileResult {
    success: boolean;
    message: string | null;
    field?: 'name' | 'email' | 'password';
}

// Type des données utilisateur attendues par le client
interface UserData {
    name: string | null;
    email: string;
    role: string;
    emailNotificationsEnabled: boolean;
}

// ----------------------------------------------------
// 💡 INITIAL STATE TYPÉ CORRECTEMENT
// ----------------------------------------------------
const initialState: ProfileResult = { // 💡 Le typage est appliqué ici
    success: false,
    message: null,
};

// =================================================================
// COMPOSANT PRINCIPAL DE LA PAGE
// =================================================================
export default function UserProfilePage() {
    const [userData, setUserData] = useState<UserData | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // useFormState utilise l'initialState et les actions
    const [nameState, dispatchName] = useFormState(updateUserName as any, initialState);
    const [passwordState, dispatchPassword] = useFormState(updatePassword as any, initialState);

    // ⚠️ NOTE: J'ai ajouté `as any` au `useFormState` pour forcer le typage 
    // des actions qui n'ont pas accès à l'interface locale ProfileResult.
    // Bien que ce ne soit pas la meilleure pratique, cela résout le problème sans 
    // nécessiter d'importation côté client. Le typage sur initialState et FormProps reste fort.
    
    // Récupération des données initiales
    useEffect(() => {
        const loadProfile = async () => {
            const result = await fetchUserProfile();
            if (result.error) {
                if (result.error === "Non authentifié") redirect('/login');
                console.error(result.error);
            } else if (result.data) {
                setUserData(result.data as UserData); 
            }
            setIsLoading(false);
        };
        loadProfile();
    }, [nameState.success, passwordState.success]); 

    if (isLoading) {
        return <div className="p-8 text-center text-gray-600">Chargement du profil...</div>;
    }
    
    if (!userData) {
        return <div className="p-8 text-center text-red-600 font-semibold">Erreur de chargement des données utilisateur.</div>;
    }
    
    return (
        <div className="mx-auto max-w-3xl p-6 bg-white rounded-xl shadow-2xl border border-gray-100">
            <h1 className="text-3xl font-extrabold mb-6 text-indigo-700 border-b pb-2">
                Mon Profil Particulier ({userData.role})
            </h1>
            
            <Link href="/dashboard/user" className="mb-4 inline-block text-blue-600 hover:text-blue-800 font-medium transition-colors">
                &larr; Retour au Dashboard
            </Link>

            <div className="space-y-8 mt-6">
                
                {/* --- A. Informations Générales --- */}
                <section className="p-4 border rounded-lg bg-indigo-50/50">
                    <h2 className="text-xl font-semibold mb-3 text-indigo-800">Informations de Compte</h2>
                    <p className="text-gray-700"><strong>Email :</strong> {userData.email}</p>
                    <p className="text-gray-700"><strong>Rôle :</strong> {userData.role}</p>
                </section>

                {/* --- B. Mise à jour du Nom --- */}
                <section>
                    <h2 className="text-xl font-semibold mb-3 border-b pb-2 text-gray-800">Mettre à jour le Nom / Pseudo</h2>
                    <FormUpdateName name={userData.name ?? ''} state={nameState} dispatch={dispatchName} />
                </section>
                
                {/* --- C. Mise à jour du Mot de passe --- */}
                <section>
                    <h2 className="text-xl font-semibold mb-3 border-b pb-2 text-gray-800">Changer le Mot de Passe</h2>
                    <FormUpdatePassword state={passwordState} dispatch={dispatchPassword} />
                </section>

                {/* --- D. Gestion des Notifications (DÉSACTIVÉE) --- */}
                <section>
                    <h2 className="text-xl font-semibold mb-3 border-b pb-2 text-gray-400">
                        Préférences d'Email
                    </h2>
                    <div className="p-3 border-l-4 border-yellow-500 rounded text-gray-600 bg-yellow-50">
                        Fonctionnalité de notification désactivée.
                    </div>
                </section>
            </div>
        </div>
    );
}

// =================================================================
// COMPOSANTS DE FORMULAIRE CLIENT
// =================================================================

interface FormProps {
    state: ProfileResult; // 💡 Utilisation du type ProfileResult local
    dispatch: (payload: FormData) => void;
}

interface FormNameProps extends FormProps {
    name: string;
}

// --- Formulaire de Nom ---
function FormUpdateName({ name, state, dispatch }: FormNameProps) {
    return (
        <form action={dispatch} className="space-y-4">
            <input
                type="text"
                name="name"
                defaultValue={name}
                placeholder="Nouveau nom d'utilisateur"
                className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 ${state.field === 'name' && !state.success ? 'border-red-500' : 'border-gray-300'}`}
                required
                minLength={3}
            />
            <button
                type="submit"
                className="bg-indigo-600 text-white px-5 py-2.5 rounded-lg font-semibold hover:bg-indigo-700 transition-colors shadow-md"
            >
                Enregistrer le Nom
            </button>
            {state.message && (
                <p className={`text-sm font-medium ${state.success ? 'text-green-600' : 'text-red-600'}`}>
                    {state.message}
                </p>
            )}
        </form>
    );
}

// --- Formulaire de Mot de Passe ---
function FormUpdatePassword({ state, dispatch }: FormProps) {
    return (
        <form action={dispatch} className="space-y-4">
            <input
                type="password"
                name="currentPassword"
                placeholder="Mot de passe actuel (obligatoire)"
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-red-500"
                required
            />
            <input
                type="password"
                name="newPassword"
                placeholder="Nouveau mot de passe (min 6 caractères)"
                className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-red-500 ${state.field === 'password' && !state.success ? 'border-red-500' : 'border-gray-300'}`}
                required
                minLength={6}
            />
            <input
                type="password"
                name="confirmPassword"
                placeholder="Confirmer le nouveau mot de passe"
                className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-red-500 ${state.field === 'password' && !state.success ? 'border-red-500' : 'border-gray-300'}`}
                required
            />
            <button
                type="submit"
                className="bg-red-600 text-white px-5 py-2.5 rounded-lg font-semibold hover:bg-red-700 transition-colors shadow-md"
            >
                Changer le Mot de Passe
            </button>
            {state.message && (
                <p className={`text-sm font-medium ${state.success ? 'text-green-600' : 'text-red-600'}`}>
                    {state.message}
                </p>
            )}
        </form>
    );
}