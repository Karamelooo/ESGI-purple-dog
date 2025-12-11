'use client';

import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { confirmReceipt } from "@/app/actions/delivery";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export function ConfirmReceiptButton({ adId }: { adId: number }) {
    const [isPending, startTransition] = useTransition();

    const handleClick = () => {
        if (!confirm("Avez-vous bien reçu cet article ? Cela débloquera le paiement pour le vendeur.")) return;

        startTransition(async () => {
            const result = await confirmReceipt(adId);
            if (result.success) {
                toast.success(result.message);
            } else {
                toast.error(result.message);
            }
        });
    };

    return (
        <Button
            onClick={handleClick}
            disabled={isPending}
            size="sm"
            className="mt-2 bg-blue-600 hover:bg-blue-700 text-white w-full"
        >
            {isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : "confirmer la réception"}
        </Button>
    );
}
