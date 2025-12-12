import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import NotificationBell from "@/components/NotificationBell";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  if (session.user.role === "PRO") {
    const prisma = (await import("@/lib/prisma")).default;
    const dbUser = await prisma.user.findUnique({
      where: { email: session.user.email! },
      select: { planId: true }
    });

    if (!dbUser?.planId) {
      redirect("/pricing");
    }
  }

  const { role, name } = session.user;
  const isPro = role === "PRO";
  const isAdmin = role === "ADMIN";
  const isProOrAdmin = isPro || isAdmin;

  const basePath = isPro ? "/dashboard/pro" : "/dashboard/user";
  const profilePath = isPro ? "/dashboard/pro/profile" : "/dashboard/profile";

  const feedbackLink = !isPro ? (
    <Link href={`${basePath}/feedback`}>
      <Button
        variant="ghost"
        className="w-full justify-start text-blue-600 hover:text-blue-700 font-semibold"
      >
        ⭐️ Donner mon avis
      </Button>
    </Link>
  ) : null;

  return (
    <div className="container mx-auto px-4 py-8 flex flex-col md:flex-row gap-8">
      <aside className="w-full md:w-64 shrink-0">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sticky top-24">
          <div className="mb-6 flex items-start justify-between">
            <div className="flex flex-col">
              <h2 className="font-bold text-lg mb-0">{name}</h2>
              <p className="text-sm text-gray-500">
                {isPro ? "Compte Professionnel" : "Compte Particulier"}
              </p>
            </div>
            <div className="shrink-0 pt-0.5">
              <NotificationBell />
            </div>
          </div>

          <nav className="flex flex-col gap-2">
            {/* Vue d'ensemble */}
            <Link href={basePath}>
              <Button
                variant="ghost"
                className="w-full justify-start font-bold"
              >
                Vue d&apos;ensemble
              </Button>
            </Link>

            {/* Mes annonces */}
            <Link href={`/dashboard/ads`}>
              <Button variant="ghost" className="w-full justify-start">
                Mes annonces
              </Button>
            </Link>

            {/* Mes Achats & Enchères (logique fusionnée) */}
            {isProOrAdmin && (
              <Link href={`/dashboard/purchases`}>
                <Button variant="ghost" className="w-full justify-start">
                  Mes achats et enchères
                </Button>
              </Link>
            )}

            {/* Favoris */}
            <Link href="/dashboard/favorites">
              <Button variant="ghost" className="w-full justify-start">
                Favoris
              </Button>
            </Link>

            {/* Moyens de paiement */}
            <Link href="/dashboard/payment">
              <Button variant="ghost" className="w-full justify-start">
                Moyens de paiement
              </Button>
            </Link>

            {/* Mon Profil & Sécurité */}
            <Link href={profilePath}>
              <Button
                variant="ghost"
                className="w-full justify-start text-indigo-600 hover:text-indigo-700"
              >
                Mon profil et sécurité
              </Button>
            </Link>

            {/* Lien de feedback */}
            {feedbackLink}

            {/* Déposer une annonce */}
            <Link href="/deposer-une-annonce">
              <Button className="w-full mt-4 bg-purple-700 hover:bg-purple-800 text-white font-bold">
                + Déposer une annonce
              </Button>
            </Link>
          </nav>
        </div>
      </aside>
      <main className="flex-1">{children}</main>
    </div>
  );
}
