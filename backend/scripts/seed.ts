import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Магазины
  await prisma.store.createMany({
    data: [
      {
        id: 'store1',
        name: 'Электроника Центр',
        address: 'ул. Ленина, 45',
        phone: '+998 (90) 123-45-67',
        status: 'active',
      },
      {
        id: 'store2',
        name: 'ТехноМир',
        address: 'пр. Мира, 123',
        phone: '+998 (90) 987-65-43',
        status: 'payment_overdue',
      },
      {
        id: 'store3',
        name: 'Цифровой Дом',
        address: 'ул. Советская, 78',
        phone: '+998 (90) 555-12-34',
        status: 'blocked',
      },
    ],
    skipDuplicates: true,
  })

  // Пользователи
  await prisma.user.createMany({
    data: [
      {
        id: 'user1',
        login: 'admin',
        password: '$2b$10$K7L/8Y75aIsgGPUvZ2q2aOBhyiTx8hIXLkw8CK6RD.rJ9rJ9rJ9rJ',
        role: 'admin',
        storeId: null,
      },
      {
        id: 'user2',
        login: 'manager1',
        password: '$2b$10$9L8K7Y75aIsgGPUvZ2q2aOBhyiTx8hIXLkw8CK6RD.rJ9rJ9rJ9rJ',
        role: 'store_manager',
        storeId: 'store1',
      },
      {
        id: 'user3',
        login: 'manager2',
        password: '$2b$10$9L8K7Y75aIsgGPUvZ2q2aOBhyiTx8hIXLkw8CK6RD.rJ9rJ9rJ9rJ',
        role: 'store_manager',
        storeId: 'store2',
      },
    ],
    skipDuplicates: true,
  })

  // Клиенты
  await prisma.customer.createMany({
    data: [
      {
        id: 'cust1',
        firstName: 'Иван',
        lastName: 'Петров',
        middleName: 'Сергеевич',
        passportSeries: '4509',
        passportNumber: '123456',
        phone: '+998 (90) 111-22-33',
        address: 'ул. Пушкина, 10',
        isBlacklisted: false,
        storeId: 'store1',
      },
      {
        id: 'cust2',
        firstName: 'Мария',
        lastName: 'Сидорова',
        middleName: 'Александровна',
        passportSeries: '4510',
        passportNumber: '654321',
        phone: '+998 (90) 222-33-44',
        address: 'ул. Гагарина, 25',
        isBlacklisted: false,
        storeId: 'store1',
      },
      {
        id: 'cust3',
        firstName: 'Петр',
        lastName: 'Иванов',
        middleName: 'Михайлович',
        passportSeries: '4511',
        passportNumber: '789012',
        phone: '+998 (90) 333-44-55',
        address: 'пр. Ленина, 50',
        isBlacklisted: true,
        storeId: 'store2',
      },
    ],
    skipDuplicates: true,
  })

  // Рассрочки
  await prisma.installment.createMany({
    data: [
      {
        id: 'inst1',
        productName: 'iPhone 15 Pro',
        productPrice: 120000.0,
        downPayment: 20000.0,
        interestRate: 15.0,
        months: 12,
        totalAmount: 115000.0,
        monthlyPayment: 9583.33,
        status: 'active',
        customerId: 'cust1',
        storeId: 'store1',
      },
      {
        id: 'inst2',
        productName: 'Samsung Galaxy S24',
        productPrice: 80000.0,
        downPayment: 10000.0,
        interestRate: 12.0,
        months: 24,
        totalAmount: 78400.0,
        monthlyPayment: 3266.67,
        status: 'active',
        customerId: 'cust2',
        storeId: 'store1',
      },
      {
        id: 'inst3',
        productName: 'MacBook Air M2',
        productPrice: 150000.0,
        downPayment: 30000.0,
        interestRate: 18.0,
        months: 18,
        totalAmount: 141600.0,
        monthlyPayment: 7866.67,
        status: 'overdue',
        customerId: 'cust3',
        storeId: 'store2',
      },
    ],
    skipDuplicates: true,
  })

  // Платежи
  await prisma.payment.createMany({
    data: [
      // inst1
      {
        id: 'pay1',
        amount: 9583.33,
        dueDate: new Date('2024-02-01'),
        paidDate: new Date('2024-02-01'),
        status: 'paid',
        installmentId: 'inst1',
      },
      {
        id: 'pay2',
        amount: 9583.33,
        dueDate: new Date('2024-03-01'),
        paidDate: new Date('2024-03-01'),
        status: 'paid',
        installmentId: 'inst1',
      },
      {
        id: 'pay3',
        amount: 9583.33,
        dueDate: new Date('2024-04-01'),
        paidDate: null,
        status: 'pending',
        installmentId: 'inst1',
      },
      {
        id: 'pay4',
        amount: 9583.33,
        dueDate: new Date('2024-05-01'),
        paidDate: null,
        status: 'pending',
        installmentId: 'inst1',
      },
      // inst2
      {
        id: 'pay5',
        amount: 3266.67,
        dueDate: new Date('2024-02-01'),
        paidDate: new Date('2024-02-01'),
        status: 'paid',
        installmentId: 'inst2',
      },
      {
        id: 'pay6',
        amount: 3266.67,
        dueDate: new Date('2024-03-01'),
        paidDate: null,
        status: 'overdue',
        installmentId: 'inst2',
      },
      {
        id: 'pay7',
        amount: 3266.67,
        dueDate: new Date('2024-04-01'),
        paidDate: null,
        status: 'pending',
        installmentId: 'inst2',
      },
      // inst3
      {
        id: 'pay8',
        amount: 7866.67,
        dueDate: new Date('2024-01-01'),
        paidDate: null,
        status: 'overdue',
        installmentId: 'inst3',
      },
      {
        id: 'pay9',
        amount: 7866.67,
        dueDate: new Date('2024-02-01'),
        paidDate: null,
        status: 'overdue',
        installmentId: 'inst3',
      },
      {
        id: 'pay10',
        amount: 7866.67,
        dueDate: new Date('2024-03-01'),
        paidDate: null,
        status: 'overdue',
        installmentId: 'inst3',
      },
    ],
    skipDuplicates: true,
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