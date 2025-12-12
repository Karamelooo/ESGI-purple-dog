"use client";

import { useState } from "react";
import { Heart } from "lucide-react";
import { toggleFavorite } from "@/app/actions/favorites";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

interface FavoriteButtonProps {
  adId: number;
  initialIsFavorite: boolean;
  className?: string;
}

export function FavoriteButton({
  adId,
  initialIsFavorite,
  className,
}: FavoriteButtonProps) {
  const [isFavorite, setIsFavorite] = useState(initialIsFavorite);
  const [isLoading, setIsLoading] = useState(false);

  const handleToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isLoading) return;

    setIsLoading(true);
    // Optimistic update
    const previousState = isFavorite;
    setIsFavorite(!isFavorite);

    try {
      const newState = await toggleFavorite(adId);
      setIsFavorite(newState);
      if (newState) {
        toast.success("Ajouté aux favoris");
      } else {
        toast.success("Retiré des favoris");
      }
    } catch {
      // Revert on error
      setIsFavorite(previousState);
      toast.error("Une erreur est survenue");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      className={cn(
        "rounded-full bg-white/80 hover:bg-white backdrop-blur shadow-sm transition-all",
        isFavorite
          ? "text-red-500 hover:text-red-600"
          : "text-gray-500 hover:text-gray-700",
        className
      )}
      onClick={handleToggle}
      disabled={isLoading}
    >
      <Heart className={cn("h-5 w-5", isFavorite && "fill-current")} />
      <span className="sr-only">
        {isFavorite ? "Retirer des favoris" : "Ajouter aux favoris"}
      </span>
    </Button>
  );
}
