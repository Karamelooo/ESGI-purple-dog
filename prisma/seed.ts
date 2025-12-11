import { PrismaClient, AdType, Role } from '@prisma/client'
import * as bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
    await prisma.review.deleteMany()
    await prisma.transaction.deleteMany()
    await prisma.bid.deleteMany()
    await prisma.delivery.deleteMany()
    await prisma.notification.deleteMany()
    await prisma.ad.deleteMany()
    await prisma.user.deleteMany()
    await prisma.category.deleteMany()
    await prisma.subscriptionPlan.deleteMany()


    const plansData = [
        {
            name: 'PARTICULIER',
            price: 0,
            features: ['Compte gratuit', 'Achats illimités', 'Ventes standard'],
            trialPeriodDays: 0,
            limits: {}
        },
        {
            name: 'PROFESSIONNEL',
            price: 49.00,
            features: ['Accès illimité', '1 mois offert', 'Dashboard Pro', 'Support prioritaire'],
            trialPeriodDays: 30,
            limits: { unlimited: true }
        },
    ]

    for (const plan of plansData) {
        await prisma.subscriptionPlan.create({ data: plan })
    }
    const allPlans = await prisma.subscriptionPlan.findMany();

    const categoriesData = [
        { name: 'Bijoux et montres', slug: 'bijoux-montres' },
        { name: 'Meubles anciens', slug: 'meubles-anciens' },
        { name: 'Art et tableaux', slug: 'art-tableaux' },
        { name: 'Collection', slug: 'collection' },
        { name: 'Vins et spiritueux', slug: 'vins-spiritueux' },
        { name: 'Instruments de musique', slug: 'instruments-musique' },
        { name: 'Livres anciens', slug: 'livres-anciens' },
        { name: 'Mode et luxe', slug: 'mode-luxe' },
        { name: 'Horlogerie', slug: 'horlogerie' },
        { name: 'Photographie', slug: 'photographie' },
        { name: 'Vaisselle et argenterie', slug: 'vaisselle-argenterie' },
        { name: 'Sculptures', slug: 'sculptures' },
        { name: 'Véhicules', slug: 'vehicules' },
    ]

    for (const cat of categoriesData) {
        await prisma.category.create({ data: cat })
    }
    const allCats = await prisma.category.findMany();

    const password = await bcrypt.hash('password123', 10)

    const admin = await prisma.user.create({
        data: {
            email: 'admin@purpledog.com',
            name: 'Admin User',
            password,
            role: Role.ADMIN,
        },
    })

    const proUser = await prisma.user.create({
        data: {
            email: 'pro@gallery.com',
            name: 'Jean-Pierre Galerie',
            password,
            role: Role.PRO,
            companyName: 'Galerie JP',
            siret: '12345678900019',
            specialties: 'Tableaux, Art déco',
        }
    })

    const individualUser = await prisma.user.create({
        data: {
            email: 'johnny@gmail.com',
            name: 'Johnny Hallyday',
            password,
            role: Role.USER,
        }
    })

    const buyerUser = await prisma.user.create({
        data: {
            email: 'buyer@purpledog.com',
            name: 'Alice Buyer',
            password,
            role: Role.PRO,
            companyName: 'Alice Art Gallery',
            siret: '98765432100019',
            specialties: 'Achat d\'art, Collectionneur',
        }
    })

    const auctionAd = await prisma.ad.create({
        data: {
            title: 'Tableau Ancien XIXe',
            description: 'Magnifique tableau huile sur toile, représentant un paysage bucolique. Signé en bas à droite.',
            type: AdType.AUCTION,
            status: 'ACTIVE',
            price: 500,
            reservePrice: 800,
            startDate: new Date(),
            endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            dimensions: '50x70cm',
            weight: 2.5,
            userId: proUser.id,
            categoryId: allCats.find(c => c.slug === 'art-tableaux')?.id || allCats[0].id,
            images: ['https://placehold.co/600x400?text=Tableau+XIXe'],
        }
    })

    const saleAd = await prisma.ad.create({
        data: {
            title: 'Montre Vintage Omega',
            description: 'Montre en parfait état de marche. Année 1960. Bracelet cuir neuf.',
            type: AdType.SALE,
            status: 'ACTIVE',
            price: 1200,
            dimensions: '40mm',
            weight: 0.1,
            userId: individualUser.id,
            categoryId: allCats.find(c => c.slug === 'bijoux-montres')?.id || allCats[0].id,
            images: ['https://placehold.co/600x400?text=Montre+Omega', 'https://placehold.co/600x400?text=Dos+Montre'],
        }
    })

    const reservedAd = await prisma.ad.create({
        data: {
            title: 'Vase Ming Rare',
            description: 'Vase authentique, réservé pour achat. Certificat d\'authenticité disponible.',
            type: AdType.SALE,
            status: 'ACTIVE',
            price: 2500,
            dimensions: '20x20x40cm',
            weight: 1.2,
            userId: proUser.id,
            categoryId: allCats.find(c => c.slug === 'collection')?.id || allCats[0].id,
            reservedById: individualUser.id,
            reservedUntil: new Date(Date.now() + 10 * 60 * 1000),
            images: ['https://placehold.co/600x400?text=Vase+Ming'],
        }
    })

    const soldAd1 = await prisma.ad.create({
        data: {
            title: 'Vase Gallé Art Nouveau',
            description: 'Vase en pâte de verre multicouche, motif floral dégagé à l\'acide.',
            type: AdType.SALE,
            status: 'SOLD',
            price: 450,
            dimensions: '30cm',
            weight: 1.2,
            userId: proUser.id,
            buyerId: buyerUser.id,
            categoryId: allCats.find(c => c.slug === 'art-tableaux')?.id || allCats[0].id,
            images: ['https://placehold.co/600x400?text=Vase+Galle'],
        }
    })

    const transaction1 = await prisma.transaction.create({
        data: {
            amount: 450,
            commissionAmount: 45,
            type: 'PAIEMENT',
            status: 'COMPLETED',
            stripePaymentId: 'ch_1234567890',
            adId: soldAd1.id,
            createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
        }
    })

    const soldAd2 = await prisma.ad.create({
        data: {
            title: 'Lampe Jielde',
            description: 'Lampe industrielle vintage 2 bras, finition graphite.',
            type: AdType.AUCTION,
            status: 'SOLD',
            price: 320,
            userId: individualUser.id,
            buyerId: admin.id,
            categoryId: allCats.find(c => c.slug === 'meubles-anciens')?.id || allCats[0].id,
            images: ['https://placehold.co/600x400?text=Lampe+Jielde'],
        }
    })

    const transaction2 = await prisma.transaction.create({
        data: {
            amount: 320,
            commissionAmount: 32,
            type: 'PAIEMENT',
            status: 'COMPLETED',
            stripePaymentId: 'ch_0987654321',
            adId: soldAd2.id,
            createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
        }
    })

    await prisma.bid.create({
        data: {
            amount: 550,
            userId: individualUser.id,
            adId: auctionAd.id,
            createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
        }
    })

    await prisma.bid.create({
        data: {
            amount: 600,
            userId: buyerUser.id,
            adId: auctionAd.id,
            createdAt: new Date()
        }
    })

    await prisma.review.create({
        data: {
            rating: 5,
            comment: "Transaction parfaite, emballage très soigné pour ce vase fragile.",
            authorId: buyerUser.id,
            targetId: proUser.id,
            createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
        }
    })

    await prisma.review.create({
        data: {
            rating: 4,
            comment: "Objet conforme, mais livraison un peu lente.",
            authorId: admin.id,
            targetId: individualUser.id,
            createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000)
        }
    })

    await prisma.notification.create({
        data: {
            userId: proUser.id,
            message: "Votre vase Gallé a été vendu à Alice Buyer !",
            read: true,
            createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
        }
    })

    await prisma.notification.create({
        data: {
            userId: individualUser.id,
            message: "Nouvelle enchère de 600€ sur votre tableau (non, c'est pas votre tableau, c'est celui du pro, mais pour l'exemple).",
            read: false,
        }
    })

    await prisma.notification.create({
        data: {
            userId: proUser.id,
            message: "Nouvelle enchère de 600€ sur 'Tableau Ancien XIXe'",
            read: false,
            link: `/ad/${auctionAd.id}`
        }
    })


    console.log({
        admin, proUser, individualUser, buyerUser,
        auctionAd, saleAd, reservedAd, soldAd1, soldAd2,
        transaction1, transaction2
    })
}

main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })
