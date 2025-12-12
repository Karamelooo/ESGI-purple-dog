import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import ProProfileForm from "./pro-profile-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function ProProfilePage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  if (session.user.role !== "PRO") {
    redirect("/dashboard");
  }

  const user = await prisma.user.findUnique({
    where: { id: Number(session.user.id) },
    select: {
      name: true,
      email: true,
      companyName: true,
      siret: true,
      specialties: true,
    },
  });

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Profil professionnel</h1>
          <p className="text-gray-600">
            Mettez à jour les informations de votre société pour vos factures et vos acheteurs.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Coordonnées</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-gray-700">
            <div>
              <p className="text-gray-500">Nom du compte</p>
              <p className="font-semibold">{user.name ?? "Non renseigné"}</p>
            </div>
            <div>
              <p className="text-gray-500">Email</p>
              <p className="font-semibold break-words">{user.email}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Informations entreprise</CardTitle>
          </CardHeader>
          <CardContent>
            <ProProfileForm
              companyName={user.companyName ?? ""}
              siret={user.siret ?? ""}
              specialties={user.specialties ?? ""}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
