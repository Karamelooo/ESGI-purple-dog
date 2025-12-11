'use client';

import { useActionState } from 'react';
import { login } from '@/app/actions/auth';
import { AlertCircle } from 'lucide-react';

export default function LoginForm() {
    const [errorMessage, formAction, isPending] = useActionState(login, undefined);

    return (
        <form className="mt-8 space-y-6" action={formAction}>
            {errorMessage && (
                <div className="bg-red-50 border border-red-200 rounded-md p-4 flex items-center gap-3 text-red-700">
                    <AlertCircle size={20} />
                    <p className="text-sm font-medium">{errorMessage}</p>
                </div>
            )}

            <div className="rounded-md shadow-sm -space-y-px">
                <div className="mb-4">
                    <label htmlFor="email-address" className="sr-only">
                        Adresse mail
                    </label>
                    <input
                        id="email-address"
                        name="email"
                        type="email"
                        autoComplete="email"
                        required
                        className="appearance-none rounded-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm"
                        placeholder="Adresse mail"
                    />
                </div>
                <div>
                    <label htmlFor="password" className="sr-only">
                        Mot de passe
                    </label>
                    <input
                        id="password"
                        name="password"
                        type="password"
                        autoComplete="current-password"
                        required
                        className="appearance-none rounded-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm"
                        placeholder="Mot de passe"
                    />
                </div>
            </div>

            <div>
                <button
                    type="submit"
                    disabled={isPending}
                    className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isPending ? 'Connexion en cours...' : 'Se connecter'}
                </button>
            </div>
        </form>
    );
}
