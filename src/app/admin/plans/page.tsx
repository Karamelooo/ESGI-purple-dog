import prisma from '@/lib/prisma'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default async function AdminPlansPage() {
    const plans = await prisma.subscriptionPlan.findMany({
        orderBy: { price: 'asc' }
    })

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold">Gestion des Forfaits</h1>
                <Link href="/admin/plans/new">
                    <Button>+ Nouveau forfait</Button>
                </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {plans.map((plan) => (
                    <Card key={plan.id}>
                        <CardHeader>
                            <CardTitle>{plan.name}</CardTitle>
                            <CardDescription>
                                {plan.price === 0 ? 'Gratuit' : `${plan.price}€ / mois`}
                                {plan.trialPeriodDays > 0 && <span className="block text-green-600 mt-1">{plan.trialPeriodDays}j essai</span>}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ul className="list-disc list-inside text-sm text-muted-foreground mb-4">
                                {plan.features.slice(0, 3).map((f: string, i: number) => <li key={i}>{f}</li>)}
                                {plan.features.length > 3 && <li>...</li>}
                            </ul>
                            <Link href={`/admin/plans/${plan.id}`}>
                                <Button variant="outline" className="w-full">Modifier</Button>
                            </Link>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    )
}
