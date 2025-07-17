import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  await prisma.user.createMany({
    data: [
      {
        login: 'admin',
        password: '$2b$10$UUc4I/zpgbHVfZ6KrrrkdOC48sQRTbhUal46Vl1zWVh5WLc7gZDYe',
        role: 'admin',
        storeId: null,
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