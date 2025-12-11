"use client";

import { useActionState } from "react";
import { confirmPurchase } from "@/lib/actions-bid"; // Verify export
import { Button } from "@/components/ui/button";

export function PayButton({ adId, price }: { adId: number; price: number }) {
  const actionWithId = confirmPurchase.bind(null, adId);
  const [state, formAction, isPending] = useActionState(actionWithId, null);

  return (
    <form action={formAction}>
      <Button
        type="submit"
        disabled={isPending}
        className="bg-green-600 hover:bg-green-700 w-full font-bold"
      >
        {isPending ? "Paiement..." : `Payer ${price} €`}
      </Button>
      {state?.message && (
        <p
          className={`text-xs mt-1 ${
            state.success ? "text-green-600" : "text-red-600"
          }`}
        >
          {state.message}
        </p>
      )}
    </form>
  );
}
