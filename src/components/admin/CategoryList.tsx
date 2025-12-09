'use client'

import { useState } from "react";
import { createCategory, updateCategory, deleteCategory } from "@/app/actions/admin-settings";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Pencil, Trash2, X, Save } from "lucide-react";

export default function CategoryList({ categories }: { categories: any[] }) {
    const [isCreating, setIsCreating] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [formData, setFormData] = useState({ name: "", slug: "", commBuyer: "", commSeller: "" });

    const resetForm = () => {
        setFormData({ name: "", slug: "", commBuyer: "", commSeller: "" });
        setIsCreating(false);
        setEditingId(null);
    };

    const handleEdit = (category: any) => {
        setFormData({
            name: category.name,
            slug: category.slug,
            commBuyer: category.commissionRateBuyer?.toString() || "",
            commSeller: category.commissionRateSeller?.toString() || ""
        });
        setEditingId(category.id);
        setIsCreating(false);
    };

    const handleSave = async () => {
        if (!formData.name || !formData.slug) return;

        const buyer = formData.commBuyer ? parseFloat(formData.commBuyer) : undefined;
        const seller = formData.commSeller ? parseFloat(formData.commSeller) : undefined;

        if (editingId) {
            await updateCategory(editingId, formData.name, formData.slug, buyer, seller);
        } else {
            await createCategory(formData.name, formData.slug, buyer, seller);
        }
        resetForm();
    };

    const handleDelete = async (id: number) => {
        if (confirm("Êtes-vous sûr de vouloir supprimer cette catégorie ?")) {
            await deleteCategory(id);
        }
    };

    return (
        <div className="p-6">
            <div className="flex justify-between mb-4">
                <h2 className="text-lg font-semibold">Toutes les catégories</h2>
                <Button onClick={() => setIsCreating(true)} variant="outline" size="sm" disabled={isCreating || editingId !== null}>
                    <Plus className="w-4 h-4 mr-2" /> Nouvelle Catégorie
                </Button>
            </div>

            {isCreating && (
                <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <h3 className="font-medium text-sm mb-3">Nouvelle Catégorie</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        <Input placeholder="Nom" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                        <Input placeholder="Slug" value={formData.slug} onChange={e => setFormData({ ...formData, slug: e.target.value })} />
                        <Input placeholder="Com. Acheteur %" type="number" value={formData.commBuyer} onChange={e => setFormData({ ...formData, commBuyer: e.target.value })} />
                        <Input placeholder="Com. Vendeur %" type="number" value={formData.commSeller} onChange={e => setFormData({ ...formData, commSeller: e.target.value })} />
                    </div>
                    <div className="flex gap-2 justify-end">
                        <Button variant="ghost" size="sm" onClick={resetForm}>Annuler</Button>
                        <Button size="sm" onClick={handleSave}>Créer</Button>
                    </div>
                </div>
            )}

            <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                    <thead>
                        <tr className="border-b text-gray-500">
                            <th className="text-left py-3 px-2">Nom</th>
                            <th className="text-left py-3 px-2">Slug</th>
                            <th className="text-left py-3 px-2">Com. Acheteur</th>
                            <th className="text-left py-3 px-2">Com. Vendeur</th>
                            <th className="text-right py-3 px-2">Annonces</th>
                            <th className="text-right py-3 px-2">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {categories.map(cat => (
                            <tr key={cat.id} className="border-b last:border-0 hover:bg-gray-50 group">
                                {editingId === cat.id ? (
                                    <>
                                        <td className="p-2"><Input value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="h-8" /></td>
                                        <td className="p-2"><Input value={formData.slug} onChange={e => setFormData({ ...formData, slug: e.target.value })} className="h-8" /></td>
                                        <td className="p-2"><Input value={formData.commBuyer} onChange={e => setFormData({ ...formData, commBuyer: e.target.value })} className="h-8" type="number" /></td>
                                        <td className="p-2"><Input value={formData.commSeller} onChange={e => setFormData({ ...formData, commSeller: e.target.value })} className="h-8" type="number" /></td>
                                        <td className="p-2 text-right text-gray-400">-</td>
                                        <td className="p-2 text-right">
                                            <div className="flex justify-end gap-1">
                                                <Button size="icon" variant="ghost" className="h-8 w-8 text-green-600" onClick={handleSave}><Save size={16} /></Button>
                                                <Button size="icon" variant="ghost" className="h-8 w-8 text-red-600" onClick={resetForm}><X size={16} /></Button>
                                            </div>
                                        </td>
                                    </>
                                ) : (
                                    <>
                                        <td className="p-2 font-medium">{cat.name}</td>
                                        <td className="p-2 text-gray-500">{cat.slug}</td>
                                        <td className="p-2">{cat.commissionRateBuyer != null ? `${cat.commissionRateBuyer}%` : <span className="text-gray-400 text-xs">Par défaut</span>}</td>
                                        <td className="p-2">{cat.commissionRateSeller != null ? `${cat.commissionRateSeller}%` : <span className="text-gray-400 text-xs">Par défaut</span>}</td>
                                        <td className="p-2 text-right">{cat._count.ads}</td>
                                        <td className="p-2 text-right">
                                            <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Button size="icon" variant="ghost" className="h-8 w-8 text-blue-600" onClick={() => handleEdit(cat)}><Pencil size={16} /></Button>
                                                <Button size="icon" variant="ghost" className="h-8 w-8 text-red-600" onClick={() => handleDelete(cat.id)}><Trash2 size={16} /></Button>
                                            </div>
                                        </td>
                                    </>
                                )}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
