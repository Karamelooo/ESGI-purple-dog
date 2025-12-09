'use client'

import { useActionState } from 'react'
import { placeBid } from '@/lib/actions-bid'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

import { getRequiredIncrement } from '@/lib/actions-rules'; 

export function BidForm({ adId, currentPrice }: { adId: number, currentPrice: number }) {
    
    const requiredIncrement = getRequiredIncrement(currentPrice);
    const minBid = currentPrice + requiredIncrement;

    
    const [state, formAction, isPending] = useActionState(placeBid, null); 

    return (
        <form action={formAction} className="bg-gray-50 p-4 rounded-xl border border-gray-200 mt-6">
            <h3 className="font-bold text-gray-900 mb-2">Placer une enchère</h3>
            <div className="flex gap-4 items-end">
                <div className="flex-1 space-y-1">
                    {/* 💡 CORRECTION DE L'AFFICHAGE : Afficher l'incrément correct */}
                    <Label htmlFor="amount" className="text-xs text-gray-500">
                        Montant (€) - Min {minBid} € (Palier : {requiredIncrement} €)
                    </Label>
                    <Input
                        id="amount"
                        name="amount" // Reste 'amount'
                        type="number"
                        min={minBid}
                        defaultValue={minBid}
                        className="bg-white"
                        required
                    />
                </div>
                
                {/* 💡 CORRECTION: AJOUT DE L'ID DE L'ANNONCE EN CHAMPS CACHÉ */}
                <input type="hidden" name="adId" value={adId} />

                <Button type="submit" disabled={isPending} className="bg-purple-700 hover:bg-purple-800">
                    {isPending ? '...' : 'Enchérir'}
                </Button>
            </div>
            {state?.message && (
                <p className={`text-sm font-bold mt-2 ${state.message.includes('succès') ? 'text-green-600' : 'text-red-600'}`}>
                    {state.message}
                </p>
            )}
        </form>
    )
}

