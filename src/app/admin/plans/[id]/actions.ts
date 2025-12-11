'use server'

import prisma from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

export async function updatePlan(formData: FormData) {
    const id = formData.get('id') as string
    const name = formData.get('name') as string
    const price = parseFloat(formData.get('price') as string)
    const trialPeriodDays = parseInt(formData.get('trialPeriodDays') as string) || 0
    const features = (formData.get('features') as string).split('\n').filter(f => f.trim() !== '')

    let limits = {}
    try {
        limits = JSON.parse(formData.get('limits') as string)
    } catch (e) {
        // ignore invalid json for now or defaults
    }

    if (id) {
        await prisma.subscriptionPlan.update({
            where: { id: parseInt(id) },
            data: {
                name,
                price,
                trialPeriodDays,
                features,
                limits
            }
        })
    } else {
        await prisma.subscriptionPlan.create({
            data: {
                name,
                price,
                trialPeriodDays,
                features,
                limits
            }
        })
    }

    revalidatePath('/admin/plans')
    redirect('/admin/plans')
}
