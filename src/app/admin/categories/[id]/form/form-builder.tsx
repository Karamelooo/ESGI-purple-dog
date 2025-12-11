'use client';

import { useState, useEffect } from 'react';
import { updateCategoryFormConfig, getCategoryById } from '@/app/actions/admin-settings';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Trash2, ArrowLeft, Save } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Checkbox } from "@/components/ui/checkbox";

export default function FormBuilder({ id }: { id: string }) {
    const [fields, setFields] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [categoryName, setCategoryName] = useState("");
    const router = useRouter();
    const categoryId = parseInt(id);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const result = await getCategoryById(categoryId);
                if (result.category) {
                    setCategoryName(result.category.name);
                    setFields(result.category.formConfig as any[] || []);
                }
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [categoryId]);

    const addField = () => {
        setFields([...fields, { label: '', type: 'text', required: false, options: '' }]);
    };

    const removeField = (index: number) => {
        setFields(fields.filter((_, i) => i !== index));
    };

    const updateField = (index: number, key: string, value: any) => {
        const newFields = [...fields];
        newFields[index][key] = value;
        setFields(newFields);
    };

    const handleSave = async () => {
        const result = await updateCategoryFormConfig(categoryId, fields);
        if (result.error) {
            alert(result.error);
        } else {
            router.push('/admin/categories');
        }
    };

    if (loading) return <div>Chargement...</div>;

    return (
        <div className="max-w-4xl mx-auto space-y-6 p-6">
            <div className="flex items-center gap-4 mb-6">
                <Link href="/admin/categories" className="p-2 hover:bg-gray-100 rounded-full">
                    <ArrowLeft size={20} />
                </Link>
                <h1 className="text-2xl font-bold">Configuration du formulaire : {categoryName}</h1>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Champs personnalisés</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    {fields.map((field, index) => (
                        <div key={index} className="flex gap-4 items-start p-4 bg-gray-50 rounded-lg border">
                            <div className="flex-1 space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label>Label</Label>
                                        <Input
                                            value={field.label}
                                            onChange={(e) => updateField(index, 'label', e.target.value)}
                                            placeholder="Ex: Taille, Kilométrage"
                                        />
                                    </div>
                                    <div>
                                        <Label>Type</Label>
                                        <Select
                                            value={field.type}
                                            onValueChange={(val) => updateField(index, 'type', val)}
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="text">Texte</SelectItem>
                                                <SelectItem value="number">Nombre</SelectItem>
                                                <SelectItem value="select">Liste déroulante</SelectItem>
                                                <SelectItem value="checkbox">Case à cocher</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                {field.type === 'select' && (
                                    <div>
                                        <Label>Options (séparées par une virgule)</Label>
                                        <Input
                                            value={field.options}
                                            onChange={(e) => updateField(index, 'options', e.target.value)}
                                            placeholder="Rouge, Vert, Bleu"
                                        />
                                    </div>
                                )}

                                <div className="flex items-center gap-2">
                                    <Checkbox
                                        id={`req-${index}`}
                                        checked={field.required}
                                        onCheckedChange={(checked) => updateField(index, 'required', checked)}
                                    />
                                    <Label htmlFor={`req-${index}`}>Obligatoire</Label>
                                </div>
                            </div>
                            <Button
                                variant="destructive"
                                size="icon"
                                onClick={() => removeField(index)}
                            >
                                <Trash2 size={16} />
                            </Button>
                        </div>
                    ))}

                    <Button onClick={addField} variant="outline" className="w-full dashed border-2">
                        <Plus className="mr-2 h-4 w-4" /> Ajouter un champ
                    </Button>
                </CardContent>
            </Card>

            <div className="flex justify-end gap-4">
                <Button variant="outline" onClick={() => router.back()}>Annuler</Button>
                <Button onClick={handleSave} className="bg-primary text-white">
                    <Save className="mr-2 h-4 w-4" /> Enregistrer la configuration
                </Button>
            </div>
        </div>
    );
}
