'use client';

import { Download } from "lucide-react";
import { downloadCSV } from "@/lib/utils/csv-export";
import { Button } from "@/components/ui/button";

import { toast } from "sonner";

interface AccountingExportButtonProps {
    transactions: any[];
}

export function AccountingExportButton({ transactions }: AccountingExportButtonProps) {
    const handleExport = () => {
        if (!transactions || transactions.length === 0) {
            toast.warning("Aucune donnée à exporter.");
            return;
        }

        // Format data for export
        const dataToExport = transactions.map(t => ({
            Ref: t.id,
            Annonce: t.ad.title,
            Type: t.type,
            Montant: t.amount,
            Commission: t.commissionAmount / 100,
            Date: new Date(t.createdAt).toLocaleDateString(),
            Vendeur: t.ad.user.name || t.ad.user.email
        }));

        const filename = `transactions-${new Date().toISOString().split('T')[0]}.csv`;
        downloadCSV(dataToExport, filename);
    };

    return (
        <Button onClick={handleExport} variant="outline" className="flex items-center gap-2">
            <Download size={16} />
            Exporter CSV
        </Button>
    );
}
