const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const adminPassword = await bcrypt.hash('admin123', 12);
  const operatorPassword = await bcrypt.hash('operator123', 12);

  await prisma.user.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      email: 'admin@prolocodairago.it',
      passwordHash: adminPassword,
      role: 'admin',
    },
  });

  await prisma.user.upsert({
    where: { username: 'operator1' },
    update: {},
    create: {
      username: 'operator1',
      email: 'operator1@prolocodairago.it',
      passwordHash: operatorPassword,
      role: 'operator',
    },
  });

  const categories = ['Antipasto', 'Primo', 'Secondo', 'Contorno', 'Dolce', 'Bevanda'];
  const sampleItems = [
    { name: 'Salame e formaggio', category: 'Antipasto', price: 5.00, sortOrder: 1 },
    { name: 'Risotto alla milanese', category: 'Primo', price: 9.00, sortOrder: 2 },
    { name: 'Tagliatelle al ragù', category: 'Primo', price: 8.50, sortOrder: 3 },
    { name: 'Costoletta alla milanese', category: 'Secondo', price: 14.00, sortOrder: 4 },
    { name: 'Arrosto di vitello', category: 'Secondo', price: 12.00, sortOrder: 5 },
    { name: 'Patate arrosto', category: 'Contorno', price: 3.50, sortOrder: 6 },
    { name: 'Insalata mista', category: 'Contorno', price: 3.00, sortOrder: 7 },
    { name: 'Torta della nonna', category: 'Dolce', price: 4.00, sortOrder: 8 },
    { name: 'Acqua naturale', category: 'Bevanda', price: 1.50, sortOrder: 9 },
    { name: 'Vino rosso (quartino)', category: 'Bevanda', price: 4.00, sortOrder: 10 },
  ];

  for (const item of sampleItems) {
    await prisma.menuItem.upsert({
      where: { id: item.sortOrder },
      update: {},
      create: item,
    });
  }

  console.log('Seed completato. Utenti creati: admin / operator1');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
