const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const company = await prisma.company.upsert({
    where: { slug: 'default-company' },
    update: {},
    create: {
      id: 'default-company',
      name: 'Barbearia do Jules',
      slug: 'default-company',
    },
  });

  await prisma.user.upsert({
    where: { email: 'demo@agendazap.com' },
    update: {},
    create: {
      email: 'demo@agendazap.com',
      name: 'Jules Dev',
      companyId: company.id,
    },
  });

  await prisma.service.createMany({
    data: [
      {
        name: 'Corte Masculino',
        description: 'Corte moderno com acabamento na navalha.',
        duration: 30,
        price: 45.0,
        companyId: company.id,
      },
      {
        name: 'Barba Completa',
        description: 'Barba com toalha quente e óleos essenciais.',
        duration: 20,
        price: 35.0,
        companyId: company.id,
      },
      {
        name: 'Combo: Corte + Barba',
        description: 'O pacote completo para o seu visual.',
        duration: 50,
        price: 70.0,
        companyId: company.id,
      },
    ],
  });

  console.log('Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
