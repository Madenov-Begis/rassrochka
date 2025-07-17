/**
 * @file: generate-test-excel.js
 * @description: Скрипт для генерации тестовых Excel файлов для импорта
 * @dependencies: exceljs
 * @created: 2024-07-16
 */

const ExcelJS = require('exceljs');
const path = require('path');

// Создаем рабочую книгу для клиентов
async function generateClientsTemplate() {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Клиенты');

  // Заголовки для клиентов
  const headers = [
    'Имя',
    'Фамилия', 
    'Отчество',
    'Серия паспорта',
    'Номер паспорта',
    'Телефон',
    'Адрес'
  ];

  // Добавляем заголовки
  worksheet.addRow(headers);

  // Тестовые данные клиентов
  const testClients = [
    ['Иван', 'Петров', 'Сергеевич', 'AA', '1234567', '+998901112233', 'ул. Ленина, 10, кв. 5'],
    ['Мария', 'Сидорова', 'Александровна', 'BB', '7654321', '+998902223344', 'пр. Мира, 25, кв. 12'],
    ['Алексей', 'Козлов', 'Иванович', 'CC', '1111111', '+998903334455', 'ул. Пушкина, 7, кв. 3'],
    ['Елена', 'Морозова', 'Петровна', 'DD', '2222222', '+998904445566', 'ул. Гагарина, 15, кв. 8'],
    ['Дмитрий', 'Волков', 'Андреевич', 'EE', '3333333', '+998905556677', 'пр. Победы, 42, кв. 15'],
    ['Анна', 'Лебедева', 'Дмитриевна', 'FF', '4444444', '+998906667788', 'ул. Советская, 33, кв. 7'],
    ['Сергей', 'Соколов', 'Николаевич', 'GG', '5555555', '+998907778899', 'ул. Космонавтов, 18, кв. 22'],
    ['Ольга', 'Новикова', 'Владимировна', 'HH', '6666666', '+998908889900', 'пр. Ленина, 55, кв. 11'],
    ['Павел', 'Федоров', 'Михайлович', 'II', '7777777', '+998909990011', 'ул. Мира, 12, кв. 4'],
    ['Татьяна', 'Андреева', 'Сергеевна', 'JJ', '8888888', '+998900001122', 'ул. Парковая, 8, кв. 9']
  ];

  // Добавляем тестовые данные
  testClients.forEach(client => {
    worksheet.addRow(client);
  });

  // Стилизация заголовков
  const headerRow = worksheet.getRow(1);
  headerRow.font = { bold: true };
  headerRow.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFE0E0E0' }
  };

  // Автоподбор ширины колонок
  worksheet.columns.forEach(column => {
    column.width = Math.max(
      ...column.values.map(v => v ? v.toString().length : 0)
    ) + 2;
  });

  // Сохраняем файл
  const filePath = path.join(__dirname, '../docs/import-templates/clients_template.xlsx');
  await workbook.xlsx.writeFile(filePath);
  console.log(`✅ Файл клиентов создан: ${filePath}`);
}

// Создаем рабочую книгу для рассрочек
async function generateInstallmentsTemplate() {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Рассрочки');

  // Заголовки для рассрочек
  const headers = [
    'Имя клиента',
    'Фамилия клиента',
    'Отчество клиента', 
    'Серия паспорта',
    'Номер паспорта',
    'Название товара',
    'Цена товара',
    'Первоначальный взнос',
    'Процентная ставка',
    'Срок (месяцев)'
  ];

  // Добавляем заголовки
  worksheet.addRow(headers);

  // Тестовые данные рассрочек
  const testInstallments = [
    ['Иван', 'Петров', 'Сергеевич', 'AA', '1234567', 'iPhone 15 Pro', '1500000', '300000', '12.5', '12'],
    ['Мария', 'Сидорова', 'Александровна', 'BB', '7654321', 'MacBook Air M2', '2500000', '500000', '10.0', '18'],
    ['Алексей', 'Козлов', 'Иванович', 'CC', '1111111', 'Samsung Galaxy S24', '1200000', '200000', '15.0', '10'],
    ['Елена', 'Морозова', 'Петровна', 'DD', '2222222', 'iPad Pro 12.9', '1800000', '400000', '11.5', '15'],
    ['Дмитрий', 'Волков', 'Андреевич', 'EE', '3333333', 'Dell XPS 13', '2200000', '600000', '9.5', '20'],
    ['Анна', 'Лебедева', 'Дмитриевна', 'FF', '4444444', 'Sony WH-1000XM5', '800000', '150000', '18.0', '8'],
    ['Сергей', 'Соколов', 'Николаевич', 'GG', '5555555', 'Apple Watch Series 9', '600000', '100000', '20.0', '6'],
    ['Ольга', 'Новикова', 'Владимировна', 'HH', '6666666', 'LG OLED C3 65"', '3000000', '800000', '8.5', '24'],
    ['Павел', 'Федоров', 'Михайлович', 'II', '7777777', 'Canon EOS R6', '1400000', '300000', '13.0', '12'],
    ['Татьяна', 'Андреева', 'Сергеевна', 'JJ', '8888888', 'DJI Mini 3 Pro', '900000', '200000', '16.5', '9']
  ];

  // Добавляем тестовые данные
  testInstallments.forEach(installment => {
    worksheet.addRow(installment);
  });

  // Стилизация заголовков
  const headerRow = worksheet.getRow(1);
  headerRow.font = { bold: true };
  headerRow.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFE0E0E0' }
  };

  // Автоподбор ширины колонок
  worksheet.columns.forEach(column => {
    column.width = Math.max(
      ...column.values.map(v => v ? v.toString().length : 0)
    ) + 2;
  });

  // Сохраняем файл
  const filePath = path.join(__dirname, '../docs/import-templates/installments_template.xlsx');
  await workbook.xlsx.writeFile(filePath);
  console.log(`✅ Файл рассрочек создан: ${filePath}`);
}

// Создаем файл с ошибками для тестирования
async function generateErrorTestFile() {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Клиенты с ошибками');

  // Заголовки
  const headers = [
    'Имя',
    'Фамилия', 
    'Отчество',
    'Серия паспорта',
    'Номер паспорта',
    'Телефон',
    'Адрес'
  ];

  worksheet.addRow(headers);

  // Данные с ошибками для тестирования валидации
  const errorData = [
    ['', 'Петров', 'Сергеевич', 'AA', '1234567', '+998901112233', 'ул. Ленина, 10'], // Пустое имя
    ['Иван', '', 'Сергеевич', 'BB', '7654321', '+998902223344', 'ул. Мира, 25'], // Пустая фамилия
    ['Мария', 'Сидорова', 'Александровна', '', '1111111', '+998903334455', 'ул. Пушкина, 7'], // Пустая серия
    ['Алексей', 'Козлов', 'Иванович', 'CC', '', '+998904445566', 'ул. Гагарина, 15'], // Пустой номер
    ['Елена', 'Морозова', 'Петровна', 'DD', '2222222', '', 'ул. Советская, 33'], // Пустой телефон
    ['Дмитрий', 'Волков', 'Андреевич', 'EE', '3333333', '+998905556677', ''], // Пустой адрес
    ['Анна', 'Лебедева', 'Дмитриевна', 'FF', '4444444', 'неверный_телефон', 'ул. Космонавтов, 18'], // Неверный формат телефона
    ['Сергей', 'Соколов', 'Николаевич', 'GG', '5555555', '+998907778899', 'ул. Новикова, 8'], // Корректные данные
  ];

  errorData.forEach(row => {
    worksheet.addRow(row);
  });

  // Стилизация
  const headerRow = worksheet.getRow(1);
  headerRow.font = { bold: true };
  headerRow.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFE0E0E0' }
  };

  worksheet.columns.forEach(column => {
    column.width = Math.max(
      ...column.values.map(v => v ? v.toString().length : 0)
    ) + 2;
  });

  const filePath = path.join(__dirname, '../docs/import-templates/clients_with_errors.xlsx');
  await workbook.xlsx.writeFile(filePath);
  console.log(`✅ Файл с ошибками создан: ${filePath}`);
}

// Основная функция
async function main() {
  try {
    console.log('🚀 Генерация тестовых Excel файлов...\n');
    
    await generateClientsTemplate();
    await generateInstallmentsTemplate();
    await generateErrorTestFile();
    
    console.log('\n✅ Все файлы успешно созданы!');
    console.log('\n📁 Файлы находятся в папке: docs/import-templates/');
    console.log('   - clients_template.xlsx - шаблон для импорта клиентов');
    console.log('   - installments_template.xlsx - шаблон для импорта рассрочек');
    console.log('   - clients_with_errors.xlsx - файл с ошибками для тестирования валидации');
    
  } catch (error) {
    console.error('❌ Ошибка при создании файлов:', error);
  }
}

// Запускаем скрипт
if (require.main === module) {
  main();
}

module.exports = {
  generateClientsTemplate,
  generateInstallmentsTemplate,
  generateErrorTestFile
}; 