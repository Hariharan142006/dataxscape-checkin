
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
    const password = await bcrypt.hash('hall123', 10);

    const user = await prisma.user.upsert({
        where: { username: 'hall_admin' },
        update: {
            password,
            role: 'HALL_VOLUNTEER'
        },
        create: {
            username: 'hall_admin',
            password,
            role: 'HALL_VOLUNTEER'
        },
    });

    console.log({ user });
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
