
import { auth } from "@/auth";
import prisma from "@/lib/prisma";

import { redirect } from "next/navigation";
import SettingsForm from "@/components/admin/SettingsForm";
import { AlertCircle } from "lucide-react";

export default async function AdminSettingsPage() {
    const session = await auth();

    if (!session?.user || session.user.role !== 'ADMIN') {
        redirect('/');
    }

    const settings = await prisma.globalSettings.findUnique({
        where: { id: 1 }
    }) || { commissionRateBuyer: 0, commissionRateSeller: 0 };

    return (
        <div className="max-w-2xl mx-auto">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Paramètres Globaux</h1>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">Commissions par défaut</h2>

                <div className="bg-orange-50 border-l-4 border-orange-500 p-4 mb-6">
                    <div className="flex">
                        <div className="flex-shrink-0">
                            <AlertCircle className="h-5 w-5 text-orange-500" />
                        </div>
                        <div className="ml-3">
                            <p className="text-sm text-orange-700">
                                Ces taux s'appliqueront à toutes les catégories qui n'ont pas de taux spécifique défini.
                            </p>
                        </div>
                    </div>
                </div>

                <SettingsForm
                    initialBuyerRate={settings.commissionRateBuyer}
                    initialSellerRate={settings.commissionRateSeller}
                />
            </div>
        </div>
    );
}
