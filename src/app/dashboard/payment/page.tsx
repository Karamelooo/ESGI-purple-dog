import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { stripe } from "@/lib/stripe";
import AddCardForm from "@/components/payment/AddCardForm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { redirect } from "next/navigation";

export default async function PaymentPage() {
  const session = await auth();

  if (!session || !session.user) {
    redirect("/auth/signin");
  }

  const userId = parseInt(session.user.id!);
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) return <div>User not found</div>;

  let customerId = user.stripeCustomerId;

  if (!customerId) {
    // Create customer if not exists
    const customer = await stripe.customers.create({
      email: user.email,
      name: user.name || undefined,
      metadata: {
        userId: userId.toString(),
      },
    });
    customerId = customer.id;

    await prisma.user.update({
      where: { id: userId },
      data: { stripeCustomerId: customerId },
    });
  }

  // Create Setup Intent
  const setupIntent = await stripe.setupIntents.create({
    customer: customerId,
    payment_method_types: ["card"],
  });

  // Check existing payment methods
  const paymentMethods = await stripe.paymentMethods.list({
    customer: customerId,
    type: "card",
  });

  return (
    <div className="container mx-auto py-8 max-w-2xl">
      <h1 className="text-3xl font-bold mb-8 text-purple-900">
        Moyens de Paiement
      </h1>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Mes cartes enregistrées</CardTitle>
          </CardHeader>
          <CardContent>
            {paymentMethods.data.length === 0 ? (
              <p className="text-gray-500">Aucune carte enregistrée.</p>
            ) : (
              <ul className="space-y-2">
                {paymentMethods.data.map((pm) => (
                  <li
                    key={pm.id}
                    className="flex items-center gap-2 border p-3 rounded bg-gray-50"
                  >
                    <span className="font-bold capitalize">
                      {pm.card?.brand}
                    </span>
                    <span>•••• {pm.card?.last4}</span>
                    <span className="text-sm text-gray-500 ml-auto">
                      Exp: {pm.card?.exp_month}/{pm.card?.exp_year}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Ajouter une nouvelle carte</CardTitle>
          </CardHeader>
          <CardContent>
            <AddCardForm clientSecret={setupIntent.client_secret!} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
