'use client'

import { useActionState } from 'react'
import { buyNow } from '@/lib/actions-bid'
import { Button } from '@/components/ui/button'

export function BuyButton({ adId, price }: { adId: number, price: number }) {
    const actionWithId = buyNow.bind(null, adId);
    // @ts-ignore
    const [state, formAction, isPending] = useActionState(actionWithId, null);

    return (
        <form action={formAction} className="mt-6">
            <Button type="submit" disabled={isPending} className="w-full text-lg py-6 bg-green-600 hover:bg-green-700 font-bold">
                {isPending ? 'Traitement...' : `Acheter maintenant (${price} €)`}
            </Button>
            {state?.message && (
                <p className={`text-sm font-bold mt-2 text-center ${state.message.includes('confirmé') ? 'text-green-600' : 'text-red-600'}`}>
                    {state.message}
                </p>
            )}
        </form>
    )
}
