'use client';

import { useFormState, useFormStatus } from "react-dom";
import { updateProProfile, type ProProfileResult } from "@/lib/actions-pro-profile";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

type ProProfileFormProps = {
  companyName: string;
  siret: string;
  specialties: string;
};

const initialState: ProProfileResult = {
  success: false,
  message: "",
};

export default function ProProfileForm({ companyName, siret, specialties }: ProProfileFormProps) {
  const [state, formAction] = useFormState<ProProfileResult, FormData>(updateProProfile, initialState);

  const errorClass = (field?: ProProfileResult["field"]) =>
    state.field === field && !state.success ? "border-red-500 focus-visible:ring-red-500" : "";

  return (
    <form action={formAction} className="space-y-6">
      <div className="grid gap-4">
        <div className="space-y-2">
          <Label htmlFor="companyName">Nom de l'entreprise</Label>
          <Input
            id="companyName"
            name="companyName"
            defaultValue={companyName}
            placeholder="Ex: Galerie JP"
            required
            minLength={2}
            className={errorClass("companyName")}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="siret">SIRET</Label>
          <Input
            id="siret"
            name="siret"
            defaultValue={siret}
            placeholder="14 chiffres"
            inputMode="numeric"
            maxLength={20}
            className={errorClass("siret")}
            required
          />
          <p className="text-sm text-gray-500">14 chiffres, les espaces sont ignorés.</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="specialties">Spécialités (optionnel)</Label>
          <Textarea
            id="specialties"
            name="specialties"
            defaultValue={specialties}
            placeholder="Ex: Art moderne, mobilier vintage..."
            rows={4}
            className={errorClass("specialties")}
          />
        </div>
      </div>

      {state.message && (
        <p className={`text-sm font-medium ${state.success ? "text-green-600" : "text-red-600"}`}>
          {state.message}
        </p>
      )}

      <div className="flex justify-end">
        <SubmitButton />
      </div>
    </form>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Sauvegarde..." : "Enregistrer les modifications"}
    </Button>
  );
}
