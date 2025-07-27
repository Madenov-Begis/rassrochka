const ExcelJS = require('exceljs');
const path = require('path');

async function generateInstallmentExcel() {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Installments');

    // Определяем заголовки столбцов в соответствии с import.service.ts
    worksheet.columns = [
        { header: 'customerFirstName', key: 'customerFirstName', width: 15 },
        { header: 'customerLastName', key: 'customerLastName', width: 15 },
        { header: 'customerMiddleName', key: 'customerMiddleName', width: 15 },
        { header: 'passportSeries', key: 'passportSeries', width: 15 },
        { header: 'passportNumber', key: 'passportNumber', width: 15 },
        { header: 'customerPhone', key: 'customerPhone', width: 15 },
        { header: 'customerAdditionalPhoneNumber', key: 'customerAdditionalPhoneNumber', width: 25 },
        { header: 'customerAddress', key: 'customerAddress', width: 25 },
        { header: 'productName', key: 'productName', width: 20 },
        { header: 'productPrice', key: 'productPrice', width: 15 },
        { header: 'downPayment', key: 'downPayment', width: 15 },
        { header: 'interestRate', key: 'interestRate', width: 15 },
        { header: 'months', key: 'months', width: 10 },
        { header: 'createdAt', key: 'createdAt', width: 20 },
        { header: 'managerLogin', key: 'managerLogin', width: 15 }
    ];

    // Функция для генерации случайной даты в прошлом (в пределах последнего года)
    function getRandomPastDate() {
        const now = new Date();
        // Убедимся, что самая поздняя возможная дата находится как минимум за 2 месяца до текущей
        const maxPastDate = new Date(now.getFullYear(), now.getMonth() - 2, now.getDate());
        // Генерируем случайную дату между 1 годом назад и maxPastDate
        const minPastDate = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());

        const randomTime = minPastDate.getTime() + Math.random() * (maxPastDate.getTime() - minPastDate.getTime());
        const date = new Date(randomTime);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}.${month}.${year}`;
    }

    // Данные для 10 примеров рассрочек
    const data = [
        {
            customerFirstName: 'Иван', customerLastName: 'Иванов', customerMiddleName: 'Иванович',
            passportSeries: 'AA', passportNumber: '1234567', customerPhone: '998901234567', customerAdditionalPhoneNumber: '998991234567', customerAddress: 'ул. Пушкина, д. 10',
            productName: 'Смартфон X', productPrice: 120000, downPayment: 20000, interestRate: 10, months: 12, createdAt: getRandomPastDate(), managerLogin: 'manager_a'
        },
        {
            customerFirstName: 'Мария', customerLastName: 'Петрова', customerMiddleName: 'Сергеевна',
            passportSeries: 'BB', passportNumber: '2345678', customerPhone: '998912345678', customerAdditionalPhoneNumber: '998982345678', customerAddress: 'пр. Ленина, д. 25',
            productName: 'Ноутбук Pro', productPrice: 180000, downPayment: 30000, interestRate: 8, months: 24, createdAt: getRandomPastDate(), managerLogin: 'manager_b'
        },
        {
            customerFirstName: 'Алексей', customerLastName: 'Сидоров', customerMiddleName: 'Дмитриевич',
            passportSeries: 'CC', passportNumber: '3456789', customerPhone: '998923456789', customerAdditionalPhoneNumber: '998973456789', customerAddress: 'ул. Гагарина, д. 5',
            productName: 'Телевизор Ultra', productPrice: 95000, downPayment: 15000, interestRate: 12, months: 18, createdAt: getRandomPastDate(), managerLogin: 'manager_a'
        },
        {
            customerFirstName: 'Елена', customerLastName: 'Козлова', customerMiddleName: 'Андреевна',
            passportSeries: 'DD', passportNumber: '4567890', customerPhone: '998934567890', customerAdditionalPhoneNumber: '998964567890', customerAddress: 'ул. Мира, д. 15',
            productName: 'Игровая приставка', productPrice: 70000, downPayment: 10000, interestRate: 15, months: 12, createdAt: getRandomPastDate(), managerLogin: 'manager_c'
        },
        {
            customerFirstName: 'Дмитрий', customerLastName: 'Смирнов', middleName: 'Викторович',
            passportSeries: 'EE', passportNumber: '5678901', customerPhone: '998945678901', customerAdditionalPhoneNumber: '998955678901', customerAddress: 'ул. Цветочная, д. 2',
            productName: 'Холодильник Smart', productPrice: 150000, downPayment: 25000, interestRate: 7, months: 36, createdAt: getRandomPastDate(), managerLogin: 'manager_b'
        },
        {
            customerFirstName: 'Анна', customerLastName: 'Кузнецова', customerMiddleName: 'Игоревна',
            passportSeries: 'FF', passportNumber: '6789012', customerPhone: '998956789012', customerAdditionalPhoneNumber: '998946789012', customerAddress: 'ул. Садовая, д. 8',
            productName: 'Стиральная машина', productPrice: 80000, downPayment: 12000, interestRate: 11, months: 18, createdAt: getRandomPastDate(), managerLogin: 'manager_a'
        },
        {
            customerFirstName: 'Сергей', customerLastName: 'Волков', customerMiddleName: 'Олегович',
            passportSeries: 'GG', passportNumber: '7890123', customerPhone: '998967890123', customerAdditionalPhoneNumber: '998937890123', customerAddress: 'пер. Школьный, д. 3',
            productName: 'Пылесос робот', productPrice: 45000, downPayment: 5000, interestRate: 9, months: 6, createdAt: getRandomPastDate(), managerLogin: 'manager_c'
        },
        {
            customerFirstName: 'Ольга', customerLastName: 'Морозова', customerMiddleName: 'Павловна',
            passportSeries: 'HH', passportNumber: '8901234', customerPhone: '998978901234', customerAdditionalPhoneNumber: '998928901234', customerAddress: 'ул. Лесная, д. 1',
            productName: 'Кофемашина', productPrice: 35000, downPayment: 4000, interestRate: 10, months: 6, createdAt: getRandomPastDate(), managerLogin: 'manager_b'
        },
        {
            customerFirstName: 'Павел', customerLastName: 'Новиков', customerMiddleName: 'Александрович',
            passportSeries: 'II', passportNumber: '9012345', customerPhone: '998989012345', customerAdditionalPhoneNumber: '998919012345', customerAddress: 'ул. Речная, д. 7',
            productName: 'Электросамокат', productPrice: 60000, downPayment: 8000, interestRate: 13, months: 12, createdAt: getRandomPastDate(), managerLogin: 'manager_a'
        },
        {
            customerFirstName: 'Наталья', customerLastName: 'Лебедева', customerMiddleName: 'Владимировна',
            passportSeries: 'JJ', passportNumber: '0123456', customerPhone: '998990123456', customerAdditionalPhoneNumber: '998900123456', customerAddress: 'ул. Полевая, д. 4',
            productName: 'Фитнес-браслет', productPrice: 15000, downPayment: 2000, interestRate: 5, months: 3, createdAt: getRandomPastDate(), managerLogin: 'manager_c'
        }
    ];

    // Добавляем данные в таблицу
    worksheet.addRows(data);

    // Указываем путь для сохранения файла
    const outputFilePath = path.join(__dirname, 'installment_sample.xlsx');

    // Сохраняем файл
    await workbook.xlsx.writeFile(outputFilePath);
    console.log(`Файл '${outputFilePath}' успешно создан.`);
}

generateInstallmentExcel().catch(error => {
    console.error('Ошибка при создании Excel файла:', error);
});