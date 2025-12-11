'use client';

import { useState } from "react";
import { DELIVERY_PROVIDERS, DeliveryProvider } from "@/lib/constants/delivery-providers";
import { upsertDeliveryPlatformConfig, toggleDeliveryPlatform } from "@/app/actions/admin-delivery";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Settings, CheckCircle2 } from "lucide-react";

interface DeliveryPlatform {
    id: number;
    name: string;
    slug: string;
    isActive: boolean;
    config: any;
}

interface DeliveryPlatformsListProps {
    platforms: DeliveryPlatform[];
}

export function DeliveryPlatformsList({ platforms }: DeliveryPlatformsListProps) {
    const [selectedProvider, setSelectedProvider] = useState<DeliveryProvider | null>(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [formData, setFormData] = useState<Record<string, string>>({});
    const [isLoading, setIsLoading] = useState(false);

    // Helper to get current status of a provider
    const getPlatformStatus = (slug: string) => {
        const platform = platforms.find(p => p.slug === slug);
        return platform ? { isActive: platform.isActive, isConfigured: !!platform.config } : { isActive: false, isConfigured: false };
    };

    const handleOpenConfig = (provider: DeliveryProvider) => {
        const platform = platforms.find(p => p.slug === provider.slug);
        const existingConfig = platform?.config || {};

        // Initialize form data with existing config or empty strings
        const initialData: Record<string, string> = {};
        provider.fields.forEach(field => {
            initialData[field.name] = existingConfig[field.name] || "";
        });

        setSelectedProvider(provider);
        setFormData(initialData);
        setIsDialogOpen(true);
    };

    const handleSaveConfig = async () => {
        if (!selectedProvider) return;
        setIsLoading(true);

        try {
            const res = await upsertDeliveryPlatformConfig(selectedProvider.slug, formData, true); // Auto-activate on save
            if (res.success) {
                toast.success(`Configuration sauvegardée pour ${selectedProvider.name}`);
                setIsDialogOpen(false);
            } else {
                toast.error(res.error);
            }
        } catch (error) {
            toast.error("Une erreur est survenue");
        } finally {
            setIsLoading(false);
        }
    };

    const handleToggle = async (slug: string, currentStatus: boolean) => {
        const platform = platforms.find(p => p.slug === slug);
        if (!platform) return; // Should not happen if toggle is visible

        try {
            const res = await upsertDeliveryPlatformConfig(slug, platform.config, !currentStatus);
            if (res.success) {
                toast.success(currentStatus ? "Désactivé" : "Activé");
            } else {
                toast.error(res.error);
            }
        } catch (error) {
            toast.error("Erreur lors du changement de statut");
        }
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {DELIVERY_PROVIDERS.map((provider) => {
                const { isActive, isConfigured } = getPlatformStatus(provider.slug);
                return (
                    <Card key={provider.slug} className={`border-2 ${isActive ? 'border-primary/20' : 'border-dashed'}`}>
                        <CardHeader className="pb-4">
                            <div className="flex justify-between items-start">
                                <div>
                                    <CardTitle className="text-lg flex items-center gap-2">
                                        {provider.name}
                                        {isActive && <Badge className="bg-green-500 hover:bg-green-600">Actif</Badge>}
                                    </CardTitle>
                                    <CardDescription className="mt-1">{provider.description}</CardDescription>
                                </div>
                                {isConfigured && (
                                    <Switch
                                        checked={isActive}
                                        onCheckedChange={() => handleToggle(provider.slug, isActive)}
                                    />
                                )}
                            </div>
                        </CardHeader>
                        <CardFooter>
                            <Button
                                variant={isConfigured ? "outline" : "default"}
                                className="w-full gap-2"
                                onClick={() => handleOpenConfig(provider)}
                            >
                                <Settings size={16} />
                                {isConfigured ? "Modifier la configuration" : "Configurer & Activer"}
                            </Button>
                        </CardFooter>
                    </Card>
                );
            })}

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Configurer {selectedProvider?.name}</DialogTitle>
                        <DialogDescription>
                            Renseignez les informations de connexion pour activer ce transporteur.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-4 py-4">
                        {selectedProvider?.fields.map((field) => (
                            <div key={field.name} className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor={field.name} className="text-right">
                                    {field.label}
                                </Label>
                                <Input
                                    id={field.name}
                                    type={field.type}
                                    value={formData[field.name] || ""}
                                    onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value })}
                                    className="col-span-3"
                                    placeholder={field.placeholder}
                                    required={field.required}
                                />
                            </div>
                        ))}
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Annuler</Button>
                        <Button onClick={handleSaveConfig} disabled={isLoading}>
                            {isLoading ? "Enregistrement..." : "Sauvegarder"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}

