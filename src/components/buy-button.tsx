"use client";

import { useActionState, useEffect } from "react";
import { buyNow } from "@/lib/actions-bid";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export function BuyButton({
  adId,
  price,
  reservedUntil,
  reservedById,
  currentUserId,
}: {
  adId: number;
  price: number;
  reservedUntil?: Date | null;
  reservedById?: number | null;
  currentUserId?: number;
}) {
  const actionWithId = buyNow.bind(null, adId);

  const [state, formAction, isPending] = useActionState(actionWithId, null);

  useEffect(() => {
    if (state?.message) {
      if (
        state.message.includes("confirmé") ||
        state.message.toLowerCase().includes("ajouté")
      ) {
        toast.success(state.message);
      } else {
        toast.error(state.message);
      }
    }
  }, [state]);

  const isReservedByOther =
    reservedUntil &&
    new Date(reservedUntil) > new Date() &&
    reservedById !== currentUserId;


  if (isReservedByOther) {
    return (
      <div className="mt-6">
        <Button
          disabled
          className="w-full text-lg py-6 bg-gray-400 font-bold cursor-not-allowed"
        >
          Indisponible (Réservé)
        </Button>
      </div>
    );
  }

  return (
    <form action={formAction} className="mt-6">
      <Button
        type="submit"
        disabled={isPending}
        className="w-full text-lg py-6 bg-green-600 hover:bg-green-700 font-bold"
      >
        {isPending ? "Traitement..." : `Acheter maintenant (${price} €)`}
      </Button>
    </form>
  );
}
