import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";

export default async function ProfilePage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <h1 className="text-2xl font-bold mb-6">Mon Profil</h1>

        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nom
            </label>
            <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
              {session.user.name}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
              {session.user.email}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Rôle
            </label>
            <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
              {session.user.role === "PRO"
                ? "Professionnel"
                : session.user.role === "ADMIN"
                ? "Administrateur"
                : "Particulier"}
            </div>
          </div>
        </div>

        <div className="mt-8 flex justify-end">
          <Button variant="outline" disabled>
            Modifier (Bientôt disponible)
          </Button>
        </div>
      </div>
    </div>
  );
}
