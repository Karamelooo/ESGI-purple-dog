// src/components/FeedbackForm.tsx
'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { submitFeedback } from '@/lib/actions-feedback';
import { useState, useEffect } from 'react';

// État initial
const initialState = {
    success: false,
    message: '',
};

// --- Composant Submit Button ---
function SubmitButton() {
    const { pending } = useFormStatus();
    return (
        <button 
            type="submit" 
            disabled={pending}
            className="w-full bg-purple-700 text-white py-2.5 rounded-lg font-semibold hover:bg-purple-800 transition-colors disabled:opacity-50"
        >
            {pending ? "Envoi en cours..." : "Soumettre mon avis"}
        </button>
    );
}

// --- Composant NPS Rating (1 à 10) ---
function NpsRating({ currentNps, setCurrentNps }: { 
    currentNps: number | null, 
    setCurrentNps: (n: number | null) => void 
}) {
    const scores = Array.from({ length: 10 }, (_, i) => i + 1);

    return (
        <div className="space-y-2">
            <p className="font-medium text-gray-700">Note NPS (1 à 10) :</p>
            <div className="flex justify-between items-center text-xs text-gray-500 mb-1">
                <span className="w-1/3 text-left">1 - Insatisfait</span>
                <span className="w-1/3 text-center"></span>
                <span className="w-1/3 text-right">10 - Très satisfait</span>
            </div>
            <div className="flex justify-between space-x-0.5">
                {scores.map(score => (
                    <div 
                        key={score}
                        className={`
                            flex-1 text-center py-2 border rounded-md cursor-pointer transition-all duration-150
                            ${currentNps === score 
                                ? 'bg-indigo-600 text-white border-indigo-600 font-bold shadow-lg' 
                                : 'bg-white hover:bg-gray-100 text-gray-800 border-gray-300'
                            }
                        `}
                        onClick={() => setCurrentNps(score)}
                    >
                        {score}
                    </div>
                ))}
            </div>
            <input type="hidden" name="npsScore" value={currentNps || ''} />
        </div>
    );
}

// --- Composant Star Rating (1 à 5) ---
function StarRating({ currentRating, setCurrentRating }: { 
    currentRating: number | null, 
    setCurrentRating: (n: number | null) => void 
}) {
    const [hover, setHover] = useState<number | null>(null);
    const stars = Array.from({ length: 5 }, (_, i) => i + 1);

    // Icône étoile simple (SVG)
    const StarIcon = ({ filled, onClick, onHoverIn, onHoverOut }: any) => (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill={filled ? "currentColor" : "none"}
            stroke={filled ? "currentColor" : "currentColor"}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={`w-8 h-8 cursor-pointer transition-colors duration-200 ${
                filled ? 'text-yellow-500' : 'text-gray-300'
            }`}
            onClick={onClick}
            onMouseEnter={onHoverIn}
            onMouseLeave={onHoverOut}
        >
             <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
        </svg>
    );

    return (
        <div className="space-y-2">
            <p className="font-medium text-gray-700">Note générale (1 à 5 étoiles) :</p>
            <div className="flex space-x-1">
                {stars.map((star) => (
                    <StarIcon
                        key={star}
                        filled={(currentRating || hover || 0) >= star}
                        onClick={() => setCurrentRating(star)}
                        onHoverIn={() => setHover(star)}
                        onHoverOut={() => setHover(currentRating)}
                    />
                ))}
            </div>
            <input type="hidden" name="rating" value={currentRating || ''} />
        </div>
    );
}


// --- Composant principal du formulaire ---
export default function FeedbackForm() {
    const [state, dispatch] = useFormState(submitFeedback, initialState);
    const [starRating, setStarRating] = useState<number | null>(null);
    const [npsScore, setNpsScore] = useState<number | null>(null);

    // Réinitialise l'état local après succès
    useEffect(() => {
        if (state.success) {
            setStarRating(null);
            setNpsScore(null);
        }
    }, [state.success]);

    return (
        <div className="p-6 bg-white rounded-xl shadow-lg border border-gray-100 max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold mb-4 text-gray-800">Donner votre avis sur la plateforme</h2>
            <p className="text-gray-600 mb-6">Vos retours nous aident à améliorer votre expérience.</p>

            <form action={dispatch} className="space-y-6">
                
                <StarRating currentRating={starRating} setCurrentRating={setStarRating} />

                <NpsRating currentNps={npsScore} setCurrentNps={setNpsScore} />

                <div className="space-y-2">
                    <label htmlFor="comment" className="font-medium text-gray-700">Commentaires et Suggestions (Optionnel) :</label>
                    <textarea
                        id="comment"
                        name="comment"
                        rows={3}
                        placeholder="Qu'avez-vous aimé ou qu'aimeriez-vous voir amélioré ?"
                        className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-purple-500 border-gray-300 resize-none"
                    />
                </div>lll

                <SubmitButton />

                {/* Message de statut */}
                {state.message && (
                    <div className={`p-3 rounded-lg text-sm font-medium ${state.success ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {state.message}
                    </div>
                )}
            </form>
        </div>
    );
}