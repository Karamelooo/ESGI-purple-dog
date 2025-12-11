'use client'

import { useActionState } from 'react' // Changed from useFormState to useActionState as per next 15+ changes or keep useFormState if older
// Assuming useActionState for simplicity if React 19 canary or recent Next, but check import
import { useState } from 'react' // Fallback
import { updatePlan } from './actions'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'
import { useFormStatus } from 'react-dom'

function SubmitButton() {
    const { pending } = useFormStatus()
    return (
        <Button type="submit" disabled={pending}>
            {pending ? 'Enregistrement...' : 'Enregistrer'}
        </Button>
    )
}

export default function EditPlanForm({ plan }: { plan: any }) {
    // Basic form handling without complex hook for now

    return (
        <Card className="max-w-2xl mx-auto">
            <CardHeader>
                <CardTitle>{plan.id ? 'Modifier le forfait' : 'Nouveau forfait'}</CardTitle>
            </CardHeader>
            <CardContent>
                <form action={updatePlan} className="space-y-4">
                    <input type="hidden" name="id" value={plan.id || ''} />

                    <div className="space-y-2">
                        <Label htmlFor="name">Nom</Label>
                        <Input id="name" name="name" defaultValue={plan.name} required />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="price">Prix (€)</Label>
                        <Input id="price" name="price" type="number" step="0.01" defaultValue={plan.price} required />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="trialPeriodDays">Période d'essai (jours)</Label>
                        <Input id="trialPeriodDays" name="trialPeriodDays" type="number" defaultValue={plan.trialPeriodDays} />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="features">Fonctionnalités (une par ligne)</Label>
                        <Textarea
                            id="features"
                            name="features"
                            defaultValue={plan.features?.join('\n')}
                            rows={5}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="limits">Limites (JSON)</Label>
                        <Textarea
                            id="limits"
                            name="limits"
                            defaultValue={JSON.stringify(plan.limits || {}, null, 2)}
                            className="font-mono text-sm"
                            rows={5}
                        />
                        <p className="text-xs text-muted-foreground">Exemple: {'{ "maxAds": 10, "analytics": true }'}</p>
                    </div>

                    <SubmitButton />
                </form>
            </CardContent>
        </Card>
    )
}
