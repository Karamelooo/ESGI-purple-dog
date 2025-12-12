'use server';

import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";

export type ProProfileResult = {
  success: boolean;
  message: string;
  field?: "companyName" | "siret" | "specialties";
};

const proProfileSchema = z.object({
  companyName: z.string().trim().min(2, "Le nom de l'entreprise doit contenir au moins 2 caractères."),
  siret: z
    .string()
    .trim()
    .transform((val) => val.replace(/\s+/g, ""))
    .refine((val) => /^\d{14}$/.test(val), { message: "Le SIRET doit comporter exactement 14 chiffres." }),
  specialties: z
    .string()
    .trim()
    .max(255, "Les spécialités ne doivent pas dépasser 255 caractères.")
    .optional()
    .or(z.literal("")),
});

export async function updateProProfile(
  prevState: ProProfileResult,
  formData: FormData
): Promise<ProProfileResult> {
  const session = await auth();

  if (!session?.user?.id || session.user.role !== "PRO") {
    return { success: false, message: "Accès non autorisé." };
  }

  const parsed = proProfileSchema.safeParse({
    companyName: formData.get("companyName") ?? "",
    siret: formData.get("siret") ?? "",
    specialties: formData.get("specialties") ?? "",
  });

  if (!parsed.success) {
    const firstError = parsed.error.issues[0];
    return {
      success: false,
      message: firstError.message,
      field: (firstError.path[0] as ProProfileResult["field"]) ?? undefined,
    };
  }

  const { companyName, siret, specialties } = parsed.data;

  try {
    await prisma.user.update({
      where: { id: Number(session.user.id) },
      data: {
        companyName,
        siret,
        specialties: specialties ? specialties : null,
      },
    });

    revalidatePath("/dashboard/pro/profile");

    return { success: true, message: "Profil professionnel mis à jour." };
  } catch (error) {
    console.error("Erreur lors de la mise à jour du profil pro:", error);
    return { success: false, message: "Impossible de sauvegarder vos informations pour le moment." };
  }
}
