import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";

import { AccountingExportButton } from "./_components/export-button";

export default async function AdminAccountingPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") redirect("/");

  const transactions = await prisma.transaction.findMany({
    include: { ad: { include: { user: true } } },
    orderBy: { createdAt: "desc" },
  });

  const totalCommission = transactions.reduce(
    (acc, t) => acc + (t.commissionAmount / 100),
    0
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">
          Comptabilité et commissions
        </h1>
        <div className="flex items-center gap-4">
          <AccountingExportButton transactions={transactions} />
          <div className="bg-green-50 px-4 py-2 rounded-lg border border-green-100">
            <span className="text-gray-600 text-sm mr-2">
              Total commissions :
            </span>
            <span className="text-green-700 font-bold text-lg">
              {totalCommission.toFixed(2)} €
            </span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="px-6 py-4 text-left">Ref</th>
              <th className="px-6 py-4 text-left">Annonce</th>
              <th className="px-6 py-4 text-left">Type</th>
              <th className="px-6 py-4 text-right">Montant</th>
              <th className="px-6 py-4 text-right">Commission</th>
              <th className="px-6 py-4 text-right">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {transactions.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                  Aucune transaction pour le moment.
                </td>
              </tr>
            )}
            {transactions.map((t) => (
              <tr key={t.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 font-mono text-xs text-gray-500">
                  #{t.id}
                </td>
                <td className="px-6 py-4">{t.ad.title}</td>
                <td className="px-6 py-4">
                  <span className="px-2 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-700">
                    {t.type}
                  </span>
                </td>
                <td className="px-6 py-4 text-right font-medium">
                  {t.amount} €
                </td>
                <td className="px-6 py-4 text-right font-bold text-green-600">
                  +{t.commissionAmount / 100} €
                </td>
                <td className="px-6 py-4 text-right text-gray-400">
                  {new Date(t.createdAt).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
