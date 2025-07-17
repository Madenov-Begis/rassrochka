import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Магазины
  const store1 = await prisma.store.create({
    data: {
      name: 'Электроника Центр',
      address: 'ул. Ленина, 45',
      phone: '+998907006808',
      status: 'active',
    },
  })
  const store2 = await prisma.store.create({
    data: {
      name: 'ТехноМир',
      address: 'пр. Мира, 123',
      phone: '+998909876543',
      status: 'inactive',
    },
  })
  const store3 = await prisma.store.create({
    data: {
      name: 'Цифровой Дом',
      address: 'ул. Советская, 78',
      phone: '+998905551234',
      status: 'inactive',
    },
  })

  // Пользователи
  await prisma.user.createMany({
    data: [
      {
        login: 'admin',
        password: '$2b$10$K7L/8Y75aIsgGPUvZ2q2aOBhyiTx8hIXLkw8CK6RD.rJ9rJ9rJ9rJ',
        role: 'admin',
        storeId: null,
      },
      {
        login: 'manager1',
        password: '$2b$10$9L8K7Y75aIsgGPUvZ2q2aOBhyiTx8hIXLkw8CK6RD.rJ9rJ9rJ9rJ',
        role: 'store_manager',
        storeId: store1.id,
      },
      {
        login: 'manager2',
        password: '$2b$10$9L8K7Y75aIsgGPUvZ2q2aOBhyiTx8hIXLkw8CK6RD.rJ9rJ9rJ9rJ',
        role: 'store_manager',
        storeId: store2.id,
      },
    ],
    skipDuplicates: true,
  })

  // Клиенты
  const customer1 = await prisma.customer.create({
    data: {
      firstName: 'Иван',
      lastName: 'Петров',
      middleName: 'Сергеевич',
      passportSeries: 'AA',
      passportNumber: '1234567',
      phone: '+998901112233',
      address: 'ул. Пушкина, 10',
      isBlacklisted: false,
      storeId: store1.id,
    },
  })
  const customer2 = await prisma.customer.create({
    data: {
      firstName: 'Мария',
      lastName: 'Сидорова',
      middleName: 'Александровна',
      passportSeries: 'AB',
      passportNumber: '7654321',
      phone: '+998902223344',
      address: 'ул. Гагарина, 25',
      isBlacklisted: false,
      storeId: store1.id,
    },
  })
  const customer3 = await prisma.customer.create({
    data: {
      firstName: 'Петр',
      lastName: 'Иванов',
      middleName: 'Михайлович',
      passportSeries: 'AC',
      passportNumber: '7890123',
      phone: '+998903334455',
      address: 'пр. Ленина, 50',
      isBlacklisted: true,
      storeId: store2.id,
    },
  })

  // Рассрочки
  const installment1 = await prisma.installment.create({
    data: {
      productName: 'iPhone 15 Pro',
      productPrice: 12000000.0,
      downPayment: 2000000.0,
      interestRate: 15.0,
      months: 12,
      totalAmount: 11500000.0,
      monthlyPayment: 958333.33,
      status: 'active',
      customerId: customer1.id,
      storeId: store1.id,
    },
  })
  const installment2 = await prisma.installment.create({
    data: {
      productName: 'Samsung Galaxy S24',
      productPrice: 8000000.0,
      downPayment: 1000000.0,
      interestRate: 12.0,
      months: 24,
      totalAmount: 7840000.0,
      monthlyPayment: 326666.67,
      status: 'active',
      customerId: customer2.id,
      storeId: store1.id,
    },
  })
  const installment3 = await prisma.installment.create({
    data: {
      productName: 'MacBook Air M2',
      productPrice: 15000000.0,
      downPayment: 3000000.0,
      interestRate: 18.0,
      months: 18,
      totalAmount: 14160000.0,
      monthlyPayment: 786666.67,
      status: 'overdue',
      customerId: customer3.id,
      storeId: store2.id,
    },
  })

  // Платежи
  await prisma.payment.createMany({
    data: [
      // installment1
      {
        amount: 958333.33,
        dueDate: new Date('2024-02-01'),
        paidDate: new Date('2024-02-01'),
        status: 'paid',
        installmentId: installment1.id,
      },
      {
        amount: 958333.33,
        dueDate: new Date('2024-03-01'),
        paidDate: new Date('2024-03-01'),
        status: 'paid',
        installmentId: installment1.id,
      },
      {
        amount: 958333.33,
        dueDate: new Date('2024-04-01'),
        paidDate: null,
        status: 'pending',
        installmentId: installment1.id,
      },
      {
        amount: 958333.33,
        dueDate: new Date('2024-05-01'),
        paidDate: null,
        status: 'pending',
        installmentId: installment1.id,
      },
      // installment2
      {
        amount: 326666.67,
        dueDate: new Date('2024-02-01'),
        paidDate: new Date('2024-02-01'),
        status: 'paid',
        installmentId: installment2.id,
      },
      {
        amount: 326666.67,
        dueDate: new Date('2024-03-01'),
        paidDate: null,
        status: 'pending',
        installmentId: installment2.id,
      },
      // installment3
      {
        amount: 786666.67,
        dueDate: new Date('2024-02-01'),
        paidDate: null,
        status: 'overdue',
        installmentId: installment3.id,
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