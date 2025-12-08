const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
    const password = await bcrypt.hash('admin123', 10);

    const admin = await prisma.user.upsert({
        where: { email: 'admin@leboncoin.fr' },
        update: {},
        create: {
            email: 'admin@leboncoin.fr',
            name: 'Super Admin',
            password,
            role: 'ADMIN',
        },
    });

    const category = await prisma.category.upsert({
        where: { name: 'Multimédia' },
        update: {},
        create: {
            name: 'Multimédia',
            slug: 'multimedia',
        },
    });

    console.log({ admin, category });
}

main()
    .then(async () => {
        await prisma.$disconnect();
    })
    .catch(async (e) => {
        console.error(e);
        await prisma.$disconnect();
        process.exit(1);
    });
