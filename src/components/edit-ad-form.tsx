"use client";

import { useActionState, useState } from "react";
import { updateAd, getPriceEstimate } from "@/lib/actions-ad";
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
import { Checkbox } from "@/components/ui/checkbox";

import { Category, Ad } from "@prisma/client";

interface EditAdFormProps {
    categories: Category[];
    ad: Ad;
}

export function EditAdForm({ categories, ad }: EditAdFormProps) {
    const updateAdWithId = updateAd.bind(null, ad.id);
    const [state, formAction, isPending] = useActionState(updateAdWithId, null);

    // Initialize state with ad data
    const [adType, setAdType] = useState(ad.type); // Probably 'SALE' given checks
    const [estimate, setEstimate] = useState<string | null>(null);
    const [isEstimating, setIsEstimating] = useState(false);
    const [selectedCategoryId, setSelectedCategoryId] = useState<string>(ad.categoryId.toString());
    const [uploading, setUploading] = useState(false);
    const [uploadError, setUploadError] = useState<string | null>(null);

    // Format images
    const initialImages = (ad.images as string[]).join('\n');
    const [imageInput, setImageInput] = useState(initialImages);

    const parsedImages = imageInput
        .split(/[\n,]/)
        .map((url) => url.trim())
        .filter((url) => url.length > 0);

    const handleFilesUpload = async (files: FileList | null) => {
        if (!files || files.length === 0) return;
        setUploading(true);
        setUploadError(null);
        try {
            const uploaded: string[] = [];
            for (const file of Array.from(files)) {
                const fd = new FormData();
                fd.append("file", file);
                const res = await fetch("/api/upload", {
                    method: "POST",
                    body: fd,
                });
                if (!res.ok) {
                    throw new Error("Upload échoué");
                }
                const data = await res.json();
                if (data.url) {
                    uploaded.push(data.url as string);
                }
            }
            const newList = [...parsedImages, ...uploaded];
            setImageInput(newList.join("\n"));
        } catch (err) {
            setUploadError("Erreur lors de l'upload des images. Réessayez.");
        } finally {
            setUploading(false);
        }
    };

    // Local state for inputs (needed for Estimate and Initial Values)
    const [title, setTitle] = useState(ad.title);
    const [desc, setDesc] = useState(ad.description);

    // Extract custom attributes to pre-fill? 
    // Custom attributes are stored in JSON. We can try to match them by name in the loop.
    const customAttrs = (ad.customAttributes as Record<string, any>) || {};

    const selectedCategory = categories.find(
        (c) => c.id.toString() === selectedCategoryId
    );
    const formConfig = (selectedCategory?.formConfig as any[]) || [];

    const handleEstimate = async () => {
        if (!title || !desc) return;
        setIsEstimating(true);
        try {
            const result = await getPriceEstimate(title, desc);
            setEstimate(result);
        } catch {
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
                            <Select
                                name="categoryId"
                                required
                                onValueChange={setSelectedCategoryId}
                                value={selectedCategoryId}
                            >
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
                            <Label>Type de vente (Non modifiable)</Label>
                            <Select
                                name="type"
                                value={adType}
                                disabled // Disable type change
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Choisir..." />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="SALE">Vente Directe</SelectItem>
                                    <SelectItem value="AUCTION">Enchère</SelectItem>
                                </SelectContent>
                            </Select>
                            {/* Hidden input to submit the disabled value if needed, but we don't strictly need it if we rely on backend valid check or pass it. 
                  However, Zod schema expects 'type'. So let's include a hidden input.
              */}
                            <input type="hidden" name="type" value={adType} />
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

                    <div className="space-y-2">
                        <Label>Images (URLs)</Label>
                        <Textarea
                            name="images"
                            placeholder="https://exemple.com/photo1.jpg&#10;https://exemple.com/photo2.jpg"
                            value={imageInput}
                            onChange={(e) => setImageInput(e.target.value)}
                            className="min-h-[80px]"
                        />
                        <p className="text-xs text-gray-500">
                            Collez une ou plusieurs URLs d'images (séparées par retour à la
                            ligne ou virgule). Première image utilisée comme vignette.
                        </p>

                        <div className="flex flex-col gap-2">
                            <Label className="text-sm text-gray-700">
                                Ou importez des fichiers
                            </Label>
                            <Input
                                type="file"
                                accept="image/*"
                                multiple
                                onChange={(e) => handleFilesUpload(e.target.files)}
                                disabled={uploading}
                            />
                            {uploading && (
                                <p className="text-xs text-purple-700 flex items-center gap-2">
                                    <Loader2 className="h-4 w-4 animate-spin" /> Upload en
                                    cours...
                                </p>
                            )}
                            {uploadError && (
                                <p className="text-xs text-red-600">{uploadError}</p>
                            )}
                        </div>

                        {parsedImages.length > 0 && (
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                {parsedImages.map((url) => (
                                    <div
                                        key={url}
                                        className="aspect-square overflow-hidden rounded-lg border bg-gray-50"
                                    >
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img
                                            src={url}
                                            alt="Prévisualisation"
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* AI Estimate Button */}
                    <div className="bg-purple-50 p-4 rounded-lg flex items-center justify-between border border-purple-100">
                        <div>
                            <h4 className="font-bold text-purple-900">
                                Besoin d&apos;aide pour le prix ?
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
                        <Input name="price" type="number" required min="1" step="0.01" defaultValue={ad.price ?? ''} />
                    </div>

                    {adType === "AUCTION" && (
                        <div className="space-y-2">
                            <Label>Prix de réserve</Label>
                            <Input
                                name="minPrice"
                                type="number"
                                min="1"
                                step="0.01"
                                defaultValue={ad.reservePrice?.toString() ?? ''}
                                disabled // Assuming no changes to auction parameters if forbidden, but if we allowed editing auctions we would enable this. But we block auctions. So this block might not even render.
                            />
                        </div>
                    )}

                    {/* Shipping Info */}
                    <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label>Poids (kg)</Label>
                            <Input name="weight" type="number" step="0.1" defaultValue={ad.weight ?? ''} />
                        </div>
                        <div className="space-y-2">
                            <Label>Dimensions (L x l x h)</Label>
                            <Input name="dimensions" defaultValue={ad.dimensions ?? ''} />
                        </div>
                    </div>

                    {/* Dynamic Fields */}
                    {formConfig.length > 0 && (
                        <div className="border-t pt-4 space-y-4">
                            <h3 className="font-medium text-lg text-gray-900">
                                Spécificités {selectedCategory?.name}
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {formConfig.map((field, idx) => {
                                    const savedVal = customAttrs[field.label] || '';
                                    return (
                                        <div key={idx} className="space-y-2">
                                            <Label>
                                                {field.label}{" "}
                                                {field.required && (
                                                    <span className="text-red-500">*</span>
                                                )}
                                            </Label>

                                            {field.type === "textarea" ? (
                                                <Textarea
                                                    name={`custom_${field.label}`}
                                                    required={field.required}
                                                    defaultValue={savedVal}
                                                />
                                            ) : field.type === "select" ? (
                                                <Select
                                                    name={`custom_${field.label}`}
                                                    required={field.required}
                                                    defaultValue={savedVal}
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Choisir..." />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {field.options?.split(",").map((opt: string) => (
                                                            <SelectItem key={opt.trim()} value={opt.trim()}>
                                                                {opt.trim()}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            ) : field.type === "checkbox" ? (
                                                <div className="flex items-center space-x-2 pt-2">
                                                    <Checkbox
                                                        name={`custom_${field.label}`}
                                                        id={`chk-${idx}`}
                                                        required={field.required}
                                                        defaultChecked={savedVal === 'on' || savedVal === 'true'}
                                                    />
                                                    <Label
                                                        htmlFor={`chk-${idx}`}
                                                        className="font-normal cursor-pointer"
                                                    >
                                                        Oui
                                                    </Label>
                                                </div>
                                            ) : (
                                                <Input
                                                    type={field.type === "number" ? "number" : "text"}
                                                    name={`custom_${field.label}`}
                                                    required={field.required}
                                                    defaultValue={savedVal}
                                                />
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {state?.message && (
                        <p className="text-red-500 font-bold">{state.message}</p>
                    )}

                    <div className="flex gap-4">
                        <Button
                            type="submit"
                            className="flex-1 text-lg py-6 bg-purple-700 hover:bg-purple-800"
                            disabled={isPending}
                        >
                            {isPending ? "Modification..." : "Modifier l'annonce"}
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </form>
    );
}
