import { PrismaClient, AdType, Role } from '@prisma/client'
import * as bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
    // Safe cleanup
    await prisma.bid.deleteMany()
    await prisma.notification.deleteMany()
    await prisma.ad.deleteMany()
    await prisma.user.deleteMany()
    await prisma.category.deleteMany()

    // 1. Create Categories
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

    // Use createMany to insert all at once (if DB supports it, PG does)
    // But we need IDs for relations, so interactive loop is fine for seed
    for (const cat of categoriesData) {
        await prisma.category.create({ data: cat })
    }
    const allCats = await prisma.category.findMany();

    // 2. Create Users
    const password = await bcrypt.hash('password123', 10)

    // Admin
    const admin = await prisma.user.create({
        data: {
            email: 'admin@purpledog.com',
            name: 'Admin User',
            password,
            role: Role.ADMIN,
        },
    })

    // Professional Seller/Buyer
    const proUser = await prisma.user.create({
        data: {
            email: 'pro@gallery.com',
            name: 'Jean-Pierre Galerie',
            password,
            role: Role.PRO,
            companyName: 'Galerie JP',
            siret: '12345678900019',
            specialties: 'Tableaux, Art déco',
            // photoUrl: '...'
        }
    })

    // Individual Seller
    const individualUser = await prisma.user.create({
        data: {
            email: 'johnny@gmail.com',
            name: 'Johnny Hallyday',
            password,
            role: Role.USER,
            // age check implied
        }
    })

    // 3. Create Ads

    // Auction Ad by Pro
    const auctionAd = await prisma.ad.create({
        data: {
            title: 'Tableau Ancien XIXe',
            description: 'Magnifique tableau huile sur toile...',
            type: AdType.AUCTION,
            status: 'ACTIVE',
            price: 500, // Starting price
            reservePrice: 800,
            startDate: new Date(),
            endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // +7 days
            dimensions: '50x70cm',
            weight: 2.5,
            userId: proUser.id,
            categoryId: allCats.find(c => c.slug === 'art-tableaux')?.id || allCats[0].id,
        }
    })

    // Fast Sale Ad by Individual
    const saleAd = await prisma.ad.create({
        data: {
            title: 'Montre Vintage Omega',
            description: 'Montre en parfait état de marche. Année 1960.',
            type: AdType.SALE,
            status: 'ACTIVE',
            price: 1200, // Fixed price
            dimensions: '40mm',
            weight: 0.1,
            userId: individualUser.id,
            categoryId: allCats.find(c => c.slug === 'bijoux-montres')?.id || allCats[0].id,
        }
    })

    console.log({ admin, proUser, individualUser, auctionAd, saleAd })
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
