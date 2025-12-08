'use client'

import { useActionState } from 'react'
import { placeBid } from '@/lib/actions-bid'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export function BidForm({ adId, currentPrice }: { adId: number, currentPrice: number }) {
    const minBid = currentPrice + 10;
    // Wrap action to modify arguments
    const actionWithId = placeBid.bind(null, adId);

    // @ts-ignore - simplistic state handling for demo
    const [state, formAction, isPending] = useActionState(actionWithId, null);

    return (
        <form action={formAction} className="bg-gray-50 p-4 rounded-xl border border-gray-200 mt-6">
            <h3 className="font-bold text-gray-900 mb-2">Placer une enchère</h3>
            <div className="flex gap-4 items-end">
                <div className="flex-1 space-y-1">
                    <Label htmlFor="amount" className="text-xs text-gray-500">Montant (€) - Min {minBid} €</Label>
                    <Input
                        id="amount"
                        name="amount"
                        type="number"
                        min={minBid}
                        defaultValue={minBid}
                        className="bg-white"
                        required
                    />
                </div>
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
