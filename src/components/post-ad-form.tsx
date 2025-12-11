"use client";

import { useActionState, useState } from "react";
import { createAd, getPriceEstimate } from "@/lib/actions-ad";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

import { Category } from "@prisma/client";

export function PostAdForm({ categories }: { categories: Category[] }) {
  const [state, formAction, isPending] = useActionState(createAd, null);
  const [adType, setAdType] = useState("SALE");
  const [estimate, setEstimate] = useState<string | null>(null);
  const [isEstimating, setIsEstimating] = useState(false);

  // Local state for estimate inputs
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");

  const handleEstimate = async () => {
    if (!title || !desc) return;
    setIsEstimating(true);
    try {
      const result = await getPriceEstimate(title, desc);
      setEstimate(result);
    } catch (e) {
      setEstimate("Erreur d'estimation");
    } finally {
      setIsEstimating(false);
    }
  };

  return (
    <form action={formAction} className="space-y-6">
      <Card>
        <CardContent className="p-6 space-y-6">
          {/* Category & Type */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label>Catégorie</Label>
              <Select name="categoryId" required>
                <SelectTrigger>
                  <SelectValue placeholder="Choisir..." />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((c) => (
                    <SelectItem key={c.id} value={c.id.toString()}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Type de vente</Label>
              <Select
                name="type"
                value={adType}
                onValueChange={setAdType}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choisir..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="SALE">Vente Directe</SelectItem>
                  <SelectItem value="AUCTION">Enchère</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Basic Info */}
          <div className="space-y-2">
            <Label>Titre</Label>
            <Input
              name="title"
              required
              placeholder="Ancien Vase Ming..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea
              name="description"
              className="min-h-[100px]"
              required
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
            />
          </div>

          {/* AI Estimate Button */}
          <div className="bg-purple-50 p-4 rounded-lg flex items-center justify-between border border-purple-100">
            <div>
              <h4 className="font-bold text-purple-900">
                Besoin d'aide pour le prix ?
              </h4>
              <p className="text-sm text-purple-700">
                Utilisez notre IA pour estimer la valeur.
              </p>
              {estimate && (
                <p className="mt-2 font-bold text-lg text-purple-800">
                  Estimation : {estimate}
                </p>
              )}
            </div>
            <Button
              type="button"
              onClick={handleEstimate}
              disabled={isEstimating || !title || !desc}
              variant="outline"
              className="border-purple-200 text-purple-700 hover:bg-purple-100"
            >
              {isEstimating ? (
                <Loader2 className="animate-spin mr-2 h-4 w-4" />
              ) : (
                "Estimer"
              )}
            </Button>
          </div>

          {/* Price Fields */}
          <div className="space-y-2">
            <Label>
              {adType === "AUCTION" ? "Prix de départ (€)" : "Prix (€)"}
            </Label>
            <Input name="price" type="number" required min="1" step="0.01" />
          </div>

          {adType === "AUCTION" && (
            <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
              <Label>Prix de réserve (Optionnel)</Label>
              <Input
                name="minPrice"
                type="number"
                min="1"
                step="0.01"
                placeholder="Prix minimum..."
              />
              <p className="text-xs text-gray-500">
                Le prix en dessous duquel l'objet ne sera pas vendu.
              </p>
            </div>
          )}

          {/* Shipping Info */}
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label>Poids (kg)</Label>
              <Input name="weight" type="number" step="0.1" />
            </div>
            <div className="space-y-2">
              <Label>Dimensions (L x l x h)</Label>
              <Input name="dimensions" placeholder="ex: 30x20x10cm" />
            </div>
          </div>

          {state?.message && (
            <p className="text-red-500 font-bold">{state.message}</p>
          )}

          <Button
            type="submit"
            className="w-full text-lg py-6 bg-purple-700 hover:bg-purple-800"
            disabled={isPending}
          >
            {isPending ? "Publication..." : "Publier l'annonce"}
          </Button>
        </CardContent>
      </Card>
    </form>
  );
}
