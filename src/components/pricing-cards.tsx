'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Check } from 'lucide-react'

interface Plan {
    id: number
    name: string
    price: number
    currency: string
    features: string[]
    trialPeriodDays: number
}

interface PricingCardsProps {
    plans: Plan[]
    onSelectPlan: (planId: number) => void
    isLoading?: boolean
}

export function PricingCards({ plans, onSelectPlan, isLoading }: PricingCardsProps) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {plans.map((plan) => (
                <Card key={plan.id} className={`flex flex-col ${plan.name === 'PROFESSIONNEL' ? 'border-primary shadow-lg scale-105 relative' : ''}`}>
                    {plan.name === 'PROFESSIONNEL' && (
                        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-primary text-white px-4 py-1 rounded-full text-sm font-bold">
                            Recommandé
                        </div>
                    )}
                    <CardHeader>
                        <CardTitle className="text-2xl">{plan.name}</CardTitle>
                        <CardDescription>
                            <span className="text-3xl font-bold text-foreground">
                                {plan.price === 0 ? 'Gratuit' : `${plan.price}€`}
                            </span>
                            {plan.price > 0 && <span className="text-muted-foreground">/mois</span>}
                            {plan.trialPeriodDays > 0 && (
                                <div className="mt-2 text-green-600 font-semibold">
                                    {plan.trialPeriodDays} jours d'essai offert
                                </div>
                            )}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="flex-1">
                        <ul className="space-y-2">
                            {plan.features.map((feature, i) => (
                                <li key={i} className="flex items-center">
                                    <Check className="h-4 w-4 mr-2 text-primary" />
                                    <span className="text-sm">{feature}</span>
                                </li>
                            ))}
                        </ul>
                    </CardContent>
                    <CardFooter>
                        <Button
                            className="w-full"
                            variant={plan.name === 'PROFESSIONNEL' ? 'default' : 'outline'}
                            onClick={() => onSelectPlan(plan.id)}
                            disabled={isLoading}
                        >
                            {isLoading ? 'Traitement...' : (plan.trialPeriodDays > 0 ? "Commencer l'essai gratuit" : 'Choisir ce forfait')}
                        </Button>
                    </CardFooter>
                </Card>
            ))}
        </div>
    )
}
