
import prisma from '@/lib/prisma'
import { auth } from '@/auth'
import { PricingWrapper } from './pricing-wrapper'
import { redirect } from 'next/navigation'

export default async function PricingPage() {
    const session = await auth()

    let plans = await prisma.subscriptionPlan.findMany({
        orderBy: { price: 'asc' }
    })

    // Logic: If user is PRO, we might want to hide the "Particulier" plan if it's strictly for individuals.
    // The requirement says: "propose seulement le forfais pro (pas besoin d'afficher le forfais particulier)"
    if (session?.user?.role === 'PRO') {
        plans = plans.filter(p => p.name !== 'PARTICULIER' && p.price > 0);
    }
    // If not PRO (e.g. unauthenticated or USER), maybe we show everything? 
    // Or if USERs are auto-assigned, maybe they don't even see this page often.
    // Let's assume for public visitors we show all to showcase offering, but for logged in PROs we filter.

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="p-4">
                <h1 className="text-3xl font-bold text-center mb-10 mt-10">Choisissez votre forfait</h1>
            </div>

            <div className="max-w-6xl mx-auto px-4 pb-20">
                {/* Client component wrapper for interactivity */}
                <PricingWrapper plans={plans} />
            </div>
        </div>
    )
}
