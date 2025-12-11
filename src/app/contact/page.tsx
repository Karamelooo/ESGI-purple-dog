'use client';

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { useState } from "react";

export default function ContactPage() {
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsSubmitting(true);
        
        // Mock submission delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        toast.success("Votre message a bien été envoyé !");
        setIsSubmitting(false);
        (e.target as HTMLFormElement).reset();
    };

    return (
        <div className="container mx-auto px-4 py-12 max-w-2xl">
            <h1 className="text-4xl font-bold mb-8 text-center text-purple-900">Nous contacter</h1>
            
            <Card>
                <CardHeader>
                    <CardTitle>Envoyez-nous un message</CardTitle>
                    <CardDescription>
                        Une question, une suggestion ou besoin d'aide ? N'hésitez pas à nous écrire.
                        Nous vous répondrons dans les plus brefs délais.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="name">Nom complet</Label>
                            <Input id="name" name="name" placeholder="Jean Dupont" required />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input id="email" name="email" type="email" placeholder="jean.dupont@exemple.com" required />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="subject">Sujet</Label>
                            <Input id="subject" name="subject" placeholder="Sujet de votre message" required />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="message">Message</Label>
                            <Textarea 
                                id="message" 
                                name="message" 
                                placeholder="Votre message..." 
                                className="min-h-[150px]"
                                required 
                            />
                        </div>

                        <Button type="submit" className="w-full font-bold bg-purple-700 hover:bg-purple-800" disabled={isSubmitting}>
                            {isSubmitting ? "Envoi en cours..." : "Envoyer le message"}
                        </Button>
                    </form>
                </CardContent>
            </Card>

            <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                <div className="p-4">
                    <h3 className="font-bold text-lg mb-2">Email</h3>
                    <p className="text-gray-600">contact@purpledog.com</p>
                </div>
                <div className="p-4">
                    <h3 className="font-bold text-lg mb-2">Téléphone</h3>
                    <p className="text-gray-600">+33 1 23 45 67 89</p>
                </div>
                <div className="p-4">
                    <h3 className="font-bold text-lg mb-2">Adresse</h3>
                    <p className="text-gray-600">123 Avenue de l'Innovation<br/>75000 Paris</p>
                </div>
            </div>
        </div>
    )
}
