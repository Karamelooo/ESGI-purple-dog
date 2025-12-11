'use client'

import { useState } from "react";
import { updateGlobalSettings } from "@/app/actions/admin-settings";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function SettingsForm({
    initialBuyerRate,
    initialSellerRate
}: {
    initialBuyerRate: number,
    initialSellerRate: number
}) {
    const [buyerRate, setBuyerRate] = useState(initialBuyerRate);
    const [sellerRate, setSellerRate] = useState(initialSellerRate);
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setMessage("");

        const result = await updateGlobalSettings(Number(buyerRate), Number(sellerRate));

        if (result.success) {
            setMessage("Paramètres mis à jour avec succès");
        } else {
            setMessage("Erreur lors de la mise à jour");
        }
        setIsLoading(false);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <Label htmlFor="buyerRate">Commission Acheteur (%)</Label>
                    <Input
                        id="buyerRate"
                        type="number"
                        step="0.1"
                        min="0"
                        value={buyerRate}
                        onChange={(e) => setBuyerRate(Number(e.target.value))}
                        disabled={isLoading}
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="sellerRate">Commission Vendeur (%)</Label>
                    <Input
                        id="sellerRate"
                        type="number"
                        step="0.1"
                        min="0"
                        value={sellerRate}
                        onChange={(e) => setSellerRate(Number(e.target.value))}
                        disabled={isLoading}
                    />
                </div>
            </div>

            {message && (
                <div className={`p-3 rounded-md text-sm ${message.includes("succès") ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
                    {message}
                </div>
            )}

            <div className="flex justify-end">
                <Button type="submit" disabled={isLoading}>
                    {isLoading ? "Enregistrement..." : "Enregistrer les modifications"}
                </Button>
            </div>
        </form>
    );
}
