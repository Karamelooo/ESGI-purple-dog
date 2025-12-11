'use server'

import { auth } from '@/auth'
import prisma from '@/lib/prisma'
import { redirect } from 'next/navigation'

export async function selectPlan(planId: number) {
    const session = await auth()
    if (!session || !session.user || !session.user.email) {
        throw new Error('Not authenticated')
    }

    const plan = await prisma.subscriptionPlan.findUnique({ where: { id: planId } })
    if (!plan) throw new Error('Plan not found')

    if (plan.price === 0) {
        await prisma.user.update({
            where: { email: session.user.email },
            data: {
                planId: plan.id,
                subscriptionStatus: 'active'
            }
        })
    } else {
        const isTrial = plan.trialPeriodDays > 0;

        await prisma.user.update({
            where: { email: session.user.email },
            data: {
                planId: plan.id,
                subscriptionStatus: isTrial ? 'trialing' : 'active',
                subscriptionEndDate: isTrial ? new Date(Date.now() + plan.trialPeriodDays * 24 * 60 * 60 * 1000) : undefined
            }
        })
    }

    return { success: true, redirectUrl: '/dashboard/pro' }
}
