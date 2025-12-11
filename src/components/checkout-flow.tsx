'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { processCheckout, finalizeCheckout } from "@/app/actions/checkout";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Elements, useStripe, useElements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";

// Initialize Stripe outside component to avoid recreation
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

type DeliveryPlatform = {
    id: number;
    name: string;
    slug: string;
};

type PaymentMethod = {
    id: string;
    brand: string;
    last4: string;
};

type AdDetails = {
    id: number;
    title: string;
    price: number;
    images: string[];
    user: {
        name: string | null;
    };
};

function CheckoutFlowContent({
    ad,
    deliveryPlatforms,
    commissionRate,
    paymentMethods
}: {
    ad: AdDetails,
    deliveryPlatforms: DeliveryPlatform[],
    commissionRate: number,
    paymentMethods: PaymentMethod[]
}) {
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);

    // Stripe Hooks
    const stripe = useStripe();
    const elements = useElements();

    // Form State
    const [deliverySlug, setDeliverySlug] = useState(deliveryPlatforms[0]?.slug || '');
    const [paymentMethodId, setPaymentMethodId] = useState(paymentMethods[0]?.id || '');

    const [formData, setFormData] = useState({
        address: '',
        city: '',
        zipCode: '',
        phone: '',
        billingAddress: '',
        billingCity: '',
        billingZipCode: '',
        sameAsShipping: true
    });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const toggleSameAsShipping = (checked: boolean) => {
        setFormData(prev => ({ ...prev, sameAsShipping: checked }));
    }

    const nextStep = () => setStep(s => s + 1);
    const prevStep = () => setStep(s => s - 1);

    const handleSubmit = async () => {
        if (!stripe || !elements) return;

        setLoading(true);
        const data = new FormData();
        data.append('deliverySlug', deliverySlug);
        data.append('paymentMethodId', paymentMethodId);
        data.append('address', formData.address);
        data.append('city', formData.city);
        data.append('zipCode', formData.zipCode);
        data.append('phone', formData.phone);

        // Billing
        data.append('billingAddress', formData.sameAsShipping ? formData.address : formData.billingAddress);
        data.append('billingCity', formData.sameAsShipping ? formData.city : formData.billingCity);
        data.append('billingZipCode', formData.sameAsShipping ? formData.zipCode : formData.billingZipCode);

        // 1. Process Checkout (Create PaymentIntent)
        const result = await processCheckout(ad.id, data);

        if (result?.success === false && result.requiresAction && result.clientSecret) {
            // 2. Handle 3DS Action
            const { error, paymentIntent } = await stripe.confirmCardPayment(result.clientSecret);

            if (error) {
                toast.error(error.message);
                setLoading(false);
            } else if (paymentIntent && paymentIntent.status === 'succeeded') {
                // 3. Finalize Order on Server
                const addressDetails = {
                    address: formData.address,
                    city: formData.city,
                    zipCode: formData.zipCode,
                    phone: formData.phone
                };
                const finalResult = await finalizeCheckout(result.paymentIntentId, ad.id, deliverySlug, addressDetails);
                if (finalResult?.success === false) {
                    toast.error(finalResult.message);
                    setLoading(false);
                } else {
                    toast.success("Paiement validé avec succès !");
                }
            }
        } else if (result?.success === false) {
            toast.error(result.message);
            setLoading(false);
        } else {
            toast.success("Commande validée avec succès !");
            // Redirect handled by server action
        }
    };



    const renderStep1_Recap = () => (
        <div className="space-y-6">
            <h2 className="text-xl font-semibold">Récapitulatif de la commande</h2>
            <div className="flex gap-4 border p-4 rounded-lg bg-gray-50">
                <div className="w-24 h-24 bg-gray-200 rounded overflow-hidden shrink-0">
                    <img src={ad.images[0] ?? 'https://placehold.co/100'} alt={ad.title} className="w-full h-full object-cover" />
                </div>
                <div>
                    <h3 className="font-bold text-lg">{ad.title}</h3>
                    <p className="text-gray-500 text-sm">Vendu par : {ad.user.name}</p>
                    <p className="font-bold text-purple-700 mt-2 text-xl">{ad.price} €</p>
                </div>
            </div>
            <div className="flex justify-between items-center text-sm text-gray-500 mt-2">
                <p>Information: Les frais de commission sont calculés sur la base du prix de l'objet (Taux: {commissionRate}%).</p>
            </div>
            <div className="flex justify-between mt-6">
                <Button variant="outline" disabled>Retour</Button>
                <Button onClick={nextStep} size="lg" disabled={deliveryPlatforms.length === 0}>
                    {deliveryPlatforms.length === 0 ? "Livraison indisponible" : "Valider et choisir la livraison"}
                </Button>
            </div>
        </div>
    );

    const renderStep2_Delivery = () => (
        <div className="space-y-6">
            <h2 className="text-xl font-semibold">Mode de livraison</h2>
            {deliveryPlatforms.length === 0 ? (
                <div className="p-8 border-2 border-dashed rounded-lg text-center bg-gray-50">
                    <p className="text-gray-500 font-medium">En attente de configuration des modes de livraison par l'administrateur.</p>
                </div>
            ) : (
                <RadioGroup value={deliverySlug} onValueChange={setDeliverySlug} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {deliveryPlatforms.map((platform) => (
                        <div key={platform.id}>
                            <RadioGroupItem value={platform.slug} id={platform.slug} className="peer sr-only" />
                            <Label
                                htmlFor={platform.slug}
                                className="flex items-center justify-between p-4 border-2 rounded-lg cursor-pointer hover:bg-gray-50 peer-data-[state=checked]:border-purple-600 peer-data-[state=checked]:bg-purple-50"
                            >
                                <span className="font-semibold">{platform.name}</span>
                            </Label>
                        </div>
                    ))}
                </RadioGroup>
            )}

            <div className="pt-4 border-t space-y-4">
                <h3 className="font-medium">Adresse de livraison</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label>Adresse</Label>
                        <Input name="address" value={formData.address} onChange={handleInputChange} placeholder="123 rue de la Paix" />
                    </div>
                    <div className="space-y-2">
                        <Label>Ville</Label>
                        <Input name="city" value={formData.city} onChange={handleInputChange} placeholder="Paris" />
                    </div>
                    <div className="space-y-2">
                        <Label>Code Postal</Label>
                        <Input name="zipCode" value={formData.zipCode} onChange={handleInputChange} placeholder="75000" />
                    </div>
                    <div className="space-y-2">
                        <Label>Téléphone</Label>
                        <Input name="phone" value={formData.phone} onChange={handleInputChange} placeholder="06 12 34 56 78" />
                    </div>
                </div>
            </div>

            <div className="pt-4 border-t space-y-4">
                <div className="flex items-center space-x-2">
                    <input
                        type="checkbox"
                        id="sameAsShipping"
                        checked={formData.sameAsShipping}
                        onChange={(e) => toggleSameAsShipping(e.target.checked)}
                        className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                    />
                    <label htmlFor="sameAsShipping" className="text-sm font-medium text-gray-700">L'adresse de facturation est identique à l'adresse de livraison</label>
                </div>

                {!formData.sameAsShipping && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 animate-in fade-in slide-in-from-top-2">
                        <div className="space-y-2">
                            <Label>Adresse de facturation</Label>
                            <Input name="billingAddress" value={formData.billingAddress} onChange={handleInputChange} placeholder="Autre adresse..." />
                        </div>
                        <div className="space-y-2">
                            <Label>Ville</Label>
                            <Input name="billingCity" value={formData.billingCity} onChange={handleInputChange} placeholder="Paris" />
                        </div>
                        <div className="space-y-2">
                            <Label>Code Postal</Label>
                            <Input name="billingZipCode" value={formData.billingZipCode} onChange={handleInputChange} placeholder="75000" />
                        </div>
                    </div>
                )}
            </div>

            <div className="flex justify-between pt-4">
                <Button variant="outline" onClick={prevStep}>Retour</Button>
                <Button onClick={nextStep} disabled={!deliverySlug || !formData.address || !formData.city}>Continuer vers le paiement</Button>
            </div>
        </div>
    );

    const renderStep3_Payment = () => (
        <div className="space-y-6">
            <h2 className="text-xl font-semibold">Moyen de paiement</h2>

            {paymentMethods.length === 0 ? (
                <div className="text-center py-8">
                    <p className="text-red-500 mb-4">Aucune carte enregistrée.</p>
                    <Button asChild>
                        <a href="/dashboard/payment" target="_blank">Ajouter une carte (Nouvel onglet)</a>
                    </Button>
                    <p className="text-sm text-gray-400 mt-2">Rechargez la page après avoir ajouté une carte.</p>
                </div>
            ) : (
                <RadioGroup value={paymentMethodId} onValueChange={setPaymentMethodId} className="space-y-3">
                    {paymentMethods.map((pm) => (
                        <div key={pm.id} className="flex items-center space-x-2 border p-4 rounded hover:bg-gray-50 cursor-pointer">
                            <RadioGroupItem value={pm.id} id={pm.id} />
                            <Label htmlFor={pm.id} className="flex-1 cursor-pointer font-medium flex items-center justify-between">
                                <span className="uppercase">{pm.brand} **** {pm.last4}</span>
                            </Label>
                        </div>
                    ))}
                </RadioGroup>
            )}

            <div className="flex justify-between pt-8">
                <Button variant="outline" onClick={prevStep}>Retour</Button>
                <Button onClick={nextStep} disabled={!paymentMethodId}>Voir le récapitulatif</Button>
            </div>
        </div>
    );

    const renderStep4_Summary = () => {
        const platformName = deliveryPlatforms.find(dp => dp.slug === deliverySlug)?.name;
        const selectedPm = paymentMethods.find(pm => pm.id === paymentMethodId);
        // Mock shipping cost logic or read from platform
        const shippingCost = deliverySlug === 'hand-delivery' ? 0 : 15.90;

        const commissionAmount = ad.price * (commissionRate / 100);
        const total = (ad.price + commissionAmount + shippingCost).toFixed(2);

        return (
            <div className="space-y-6">
                <h2 className="text-xl font-semibold">Confirmation finale</h2>

                <div className="bg-white border rounded-lg overflow-hidden divide-y">
                    <div className="p-4 flex justify-between">
                        <span>Sous-total (Article)</span>
                        <span className="font-medium">{ad.price} €</span>
                    </div>
                    <div className="p-4 flex justify-between text-gray-500 text-sm">
                        <span>Frais de protection acheteur ({(commissionRate * 100).toFixed(1)}%)</span>
                        <span className="font-medium">{commissionAmount.toFixed(2)} €</span>
                    </div>
                    <div className="p-4 flex justify-between">
                        <span>Livraison ({platformName})</span>
                        <span className="font-medium">{shippingCost.toFixed(2)} €</span>
                    </div>
                    <div className="p-4 flex justify-between">
                        <span>Paiement via</span>
                        <span className="font-medium uppercase">{selectedPm?.brand} **** {selectedPm?.last4}</span>
                    </div>
                    <div className="p-4 flex justify-between bg-gray-50 text-lg font-bold">
                        <span>Total à payer</span>
                        <span className="text-purple-900">{total} €</span>
                    </div>
                </div>

                <div className="border p-4 rounded bg-blue-50 text-blue-800 text-sm">
                    <p className="font-bold mb-1">Livraison à :</p>
                    <p>{formData.address}, {formData.zipCode} {formData.city}</p>
                    <p>Tel: {formData.phone}</p>
                </div>

                <div className="flex justify-between pt-4">
                    <Button variant="outline" onClick={prevStep} disabled={loading}>Retour</Button>
                    <Button onClick={handleSubmit} size="lg" className="bg-green-600 hover:bg-green-700" disabled={loading}>
                        {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Traitement...</> : `Payer ${total} €`}
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-3xl mx-auto">
            {/* Stepper Header */}
            <div className="flex justify-between mb-8 relative">
                <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-200 -z-10"></div>
                {[1, 2, 3, 4].map((s) => (
                    <div key={s} className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-colors ${step >= s ? 'bg-purple-600 text-white' : 'bg-gray-200 text-gray-400'}`}>
                        {s}
                    </div>
                ))}
            </div>

            <Card>
                <CardContent className="p-6">
                    {step === 1 && renderStep1_Recap()}
                    {step === 2 && renderStep2_Delivery()}
                    {step === 3 && renderStep3_Payment()}
                    {step === 4 && renderStep4_Summary()}
                </CardContent>
            </Card>
        </div>
    );
}

export default function CheckoutFlow(props: any) {
    return (
        <Elements stripe={stripePromise}>
            <CheckoutFlowContent {...props} />
        </Elements>
    );
}
