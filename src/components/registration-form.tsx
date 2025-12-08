'use client'

import { useActionState, useState } from 'react'
import { registerUser, registerPro } from '@/lib/actions'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'

export function RegistrationForm() {
    const [userState, userAction, isUserPending] = useActionState(registerUser, undefined)
    const [proState, proAction, isProPending] = useActionState(registerPro, undefined)
    const [activeTab, setActiveTab] = useState('particulier')

    return (
        <div className="w-full max-w-lg mx-auto mt-10">
            <h1 className="text-3xl font-bold text-center mb-6">Rejoignez Purple Dog</h1>

            <Tabs defaultValue="particulier" className="w-full" onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-2 mb-4">
                    <TabsTrigger value="particulier">Particulier</TabsTrigger>
                    <TabsTrigger value="professionnel">Professionnel</TabsTrigger>
                </TabsList>

                {/* Particulier Form */}
                <TabsContent value="particulier">
                    <Card>
                        <CardHeader>
                            <CardTitle>Créer un compte Particulier</CardTitle>
                            <CardDescription>Pour vendre vos objets d'exception.</CardDescription>
                        </CardHeader>
                        <form action={userAction}>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Nom complet</Label>
                                    <Input id="name" name="name" placeholder="Johnny Hallyday" required minLength={2} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="email">Email</Label>
                                    <Input id="email" name="email" type="email" placeholder="johnny@example.com" required />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="password">Mot de passe</Label>
                                    <Input id="password" name="password" type="password" required minLength={6} />
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Input type="checkbox" id="isAdult" name="isAdult" required className="w-4 h-4" />
                                    <Label htmlFor="isAdult" className="text-sm font-normal">Je certifie avoir plus de 18 ans</Label>
                                </div>
                                {userState && typeof userState === 'string' && (
                                    <p className="text-red-500 text-sm">{userState}</p>
                                )}
                            </CardContent>
                            <CardFooter>
                                <Button type="submit" className="w-full" disabled={isUserPending}>
                                    {isUserPending ? 'Chargement...' : "S'inscrire"}
                                </Button>
                            </CardFooter>
                        </form>
                    </Card>
                </TabsContent>

                {/* Professionnel Form */}
                <TabsContent value="professionnel">
                    <Card>
                        <CardHeader>
                            <CardTitle>Créer un compte Professionnel</CardTitle>
                            <CardDescription>Pour acheter et vendre sur la plateforme.</CardDescription>
                        </CardHeader>
                        <form action={proAction}>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="pro-name">Nom complet</Label>
                                    <Input id="pro-name" name="name" placeholder="Jean-Pierre Galerie" required minLength={2} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="pro-email">Email</Label>
                                    <Input id="pro-email" name="email" type="email" placeholder="pro@gallery.com" required />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="pro-password">Mot de passe</Label>
                                    <Input id="pro-password" name="password" type="password" required minLength={6} />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="companyName">Nom de l'entreprise</Label>
                                    <Input id="companyName" name="companyName" placeholder="Galerie JP" required minLength={2} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="siret">Numéro SIRET</Label>
                                    <Input id="siret" name="siret" placeholder="123 456 789 00019" required minLength={14} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="specialties">Spécialités (optionnel)</Label>
                                    <Input id="specialties" name="specialties" placeholder="Tableaux, Art déco..." />
                                </div>

                                {proState && typeof proState === 'string' && (
                                    <p className="text-red-500 text-sm">{proState}</p>
                                )}
                            </CardContent>
                            <CardFooter>
                                <Button type="submit" className="w-full" disabled={isProPending}>
                                    {isProPending ? 'Chargement...' : "S'inscrire"}
                                </Button>
                            </CardFooter>
                        </form>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    )
}
