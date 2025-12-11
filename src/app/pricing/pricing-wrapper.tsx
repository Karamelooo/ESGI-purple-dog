'use client'

import { PricingCards } from '@/components/pricing-cards'
import { useTransition } from 'react'
import { selectPlan } from './actions'
import { toast } from 'sonner'

import { useRouter } from 'next/navigation'

export function PricingWrapper({ plans }: { plans: any[] }) {
    const [isPending, startTransition] = useTransition()
    const router = useRouter()

    const handleSelectPlan = (planId: number) => {
        startTransition(async () => {
            try {
                const res = await selectPlan(planId)
                if (res && res.success) {
                    router.push(res.redirectUrl)
                }
            } catch (error) {
                toast.error("Une erreur est survenue")
            }
        })
    }

    return (
        <PricingCards
            plans={plans}
            onSelectPlan={handleSelectPlan}
            isLoading={isPending}
        />
    )
}
