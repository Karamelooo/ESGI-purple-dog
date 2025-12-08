'use server'

import { z } from 'zod'
import { PrismaClient, Role } from '@prisma/client'
import bcrypt from 'bcryptjs'
import { redirect } from 'next/navigation'
import { signIn } from '@/auth'
import { AuthError } from 'next-auth'

const prisma = new PrismaClient()

// Schema for Individual Registration
const RegisterSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6),
    name: z.string().min(2),
    isAdult: z.string().refine((val) => val === 'on', {
        message: "You must certify you are 18+",
    }),
})

// Schema for Pro Registration
const RegisterProSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6),
    name: z.string().min(2),
    companyName: z.string().min(2),
    siret: z.string().min(14), // Basic length check
    specialties: z.string().optional(),
})

export async function registerUser(prevState: string | undefined, formData: FormData) {
    try {
        const data = Object.fromEntries(formData)
        const parsed = RegisterSchema.safeParse(data)

        if (!parsed.success) {
            return 'Invalid data: ' + JSON.stringify(parsed.error.flatten())
        }

        const { email, password, name } = parsed.data

        const existingUser = await prisma.user.findUnique({ where: { email } })
        if (existingUser) return 'Email already exists'

        const hashedPassword = await bcrypt.hash(password, 10)

        await prisma.user.create({
            data: {
                email,
                name,
                password: hashedPassword,
                role: Role.USER,
            },
        })
    } catch (error) {
        if (error instanceof Error) {
            return error.message;
        }
        return 'Something went wrong'
    }

    // Attempt login after register
    try {
        await signIn('credentials', {
            email: formData.get('email'),
            password: formData.get('password'),
            redirectTo: '/',
        })
    } catch (error) {
        if (error instanceof AuthError) {
            return 'Something went wrong with auto-login.'
        }
        throw error
    }
}

export async function registerPro(prevState: string | undefined, formData: FormData) {
    try {
        const data = Object.fromEntries(formData)
        const parsed = RegisterProSchema.safeParse(data)

        if (!parsed.success) {
            return 'Invalid data: ' + JSON.stringify(parsed.error.flatten())
        }

        const { email, password, name, companyName, siret, specialties } = parsed.data

        const existingUser = await prisma.user.findUnique({ where: { email } })
        if (existingUser) return 'Email already exists'

        const hashedPassword = await bcrypt.hash(password, 10)

        await prisma.user.create({
            data: {
                email,
                name,
                password: hashedPassword,
                role: Role.PRO,
                companyName,
                siret,
                specialties,
            },
        })
    } catch (error) {
        if (error instanceof Error) {
            return error.message;
        }
        return 'Something went wrong'
    }

    // Attempt login
    try {
        await signIn('credentials', {
            email: formData.get('email'),
            password: formData.get('password'),
            redirectTo: '/dashboard/pro',
        })
    } catch (error) {
        if (error instanceof AuthError) {
            return 'Something went wrong with auto-login.'
        }
        throw error
    }
}
