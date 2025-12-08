import { auth } from "@/auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { redirect } from "next/navigation"

export default async function SettingsPage() {
    const session = await auth();
    if (!session?.user) redirect('/login');

    return (
        <div className="container mx-auto px-4 py-8 max-w-2xl">
            <h1 className="text-3xl font-bold mb-8 text-gray-900">Paramètres du compte</h1>

            <div className="bg-white p-8 rounded-xl border border-gray-200 shadow-sm space-y-8">
                {/* Profile Section */}
                <div>
                    <h2 className="text-xl font-bold border-b pb-4 mb-6">Profil Public</h2>
                    <div className="grid gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="name">Nom complet</Label>
                            <Input id="name" defaultValue={session.user.name || ""} />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="email">Email</Label>
                            <Input id="email" defaultValue={session.user.email || ""} disabled className="bg-gray-50 text-gray-500" />
                        </div>
                        {session.user.role === 'PRO' && (
                            <div className="grid gap-2">
                                <Label htmlFor="company">Entreprise</Label>
                                <Input id="company" placeholder="Nom de l'entreprise" />
                            </div>
                        )}
                    </div>
                </div>

                {/* Password Section */}
                <div>
                    <h2 className="text-xl font-bold border-b pb-4 mb-6">Sécurité</h2>
                    <div className="grid gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="current_password">Mot de passe actuel</Label>
                            <Input id="current_password" type="password" />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="new_password">Nouveau mot de passe</Label>
                            <Input id="new_password" type="password" />
                        </div>
                        <Button variant="outline" className="w-full sm:w-auto">Mettre à jour le mot de passe</Button>
                    </div>
                </div>

                <div className="pt-4 flex justify-end">
                    <Button size="lg" className="bg-purple-700 hover:bg-purple-800">Enregistrer les modifications</Button>
                </div>
            </div>
        </div>
    )
}
