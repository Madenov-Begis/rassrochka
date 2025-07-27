import { PrismaClient } from '@prisma/client'
import * as bcrypt from 'bcrypt'

const prisma = new PrismaClient()

async function main() {
  // Создание магазина 'test'
  const testStore = await prisma.store.upsert({
    where: { id: 1 },
    update: {},
    create: {
      name: 'test',
      status: 'active', 
      address: 'testtesttest',
      phone: '998901234567',
    },
  });

  // Хеширование пароля для пользователя 'test'
  const hashedPassword = await bcrypt.hash('test123', 10);

  await prisma.user.createMany({
    data: [
      {
        login: 'admin',
        password: '$2b$10$UUc4I/zpgbHVfZ6KrrrkdOC48sQRTbhUal46Vl1zWVh5WLc7gZDYe',
        role: 'admin',
        storeId: null,
      },
      {
        login: 'test',
        password: hashedPassword,
        role: 'store_manager',
        storeId: testStore.id,
      },
    ],
    skipDuplicates: true,
  })
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  }) 