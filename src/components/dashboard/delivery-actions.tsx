'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { updateDeliveryStatus } from "@/lib/actions-dashboard-user";
import { toast } from "sonner";
import { Loader2, PackageCheck, Truck } from "lucide-react";

interface DeliveryActionsProps {
    adId: number;
    initialStatus: string;
    initialTracking: string | null;
}

export default function DeliveryActions({ adId, initialStatus, initialTracking }: DeliveryActionsProps) {
    const [status, setStatus] = useState(initialStatus);
    const [tracking, setTracking] = useState(initialTracking || '');
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleMarkAsSent = async () => {
        if (!tracking.trim()) {
            toast.error("Veuillez entrer un numéro de suivi.");
            return;
        }

        setLoading(true);
        const result = await updateDeliveryStatus(adId, tracking);
        setLoading(false);

        if (result.success) {
            setStatus('SENT');
            setIsEditing(false);
            toast.success("Statut mis à jour : Colis envoyé !");
        } else {
            toast.error(result.error || "Erreur lors de la mise à jour.");
        }
    };

    if (status === 'SENT' || status === 'DELIVERED') {
        return (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mt-4">
                <div className="flex items-center gap-3 text-green-800">
                    <Truck className="h-6 w-6" />
                    <div>
                        <p className="font-semibold">Colis envoyé</p>
                        <p className="text-sm">Numéro de suivi : <span className="font-mono bg-white px-2 py-0.5 rounded border">{tracking}</span></p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mt-4">
            <h3 className="font-semibold text-blue-900 flex items-center gap-2 mb-4">
                <PackageCheck className="h-5 w-5" />
                Gestion de l'expédition
            </h3>

            {!isEditing ? (
                <div className="flex flex-col gap-3">
                    <p className="text-sm text-blue-800 mb-2">
                        Une fois le colis déposé au transporteur, confirmez l'envoi ici.
                    </p>
                    <div className="flex gap-4">
                        <Button variant="outline" onClick={() => toast.info("Téléchargement de l'étiquette (Mock)...")}>
                            Télécharger l'étiquette
                        </Button>
                        <Button onClick={() => setIsEditing(true)} className="bg-blue-600 hover:bg-blue-700 text-white">
                            Confirmer l'envoi
                        </Button>
                    </div>
                </div>
            ) : (
                <div className="flex flex-col gap-3 max-w-md">
                    <label className="text-sm font-medium text-gray-700">Numéro de suivi</label>
                    <div className="flex gap-2">
                        <Input
                            placeholder="Ex: 1Z999AA101..."
                            value={tracking}
                            onChange={(e) => setTracking(e.target.value)}
                        />
                        <Button onClick={handleMarkAsSent} disabled={loading} className="bg-green-600 hover:bg-green-700 text-white">
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Valider
                        </Button>
                        <Button variant="ghost" onClick={() => setIsEditing(false)} disabled={loading}>
                            Annuler
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}
