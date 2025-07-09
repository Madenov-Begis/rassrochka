-- seed_clean.sql (UTF-8)
-- Очистка всех таблиц в правильном порядке
DELETE FROM payments;
DELETE FROM installments;
DELETE FROM customers;
DELETE FROM users;
DELETE FROM stores;

-- Вставка магазинов
INSERT INTO stores (name, address, phone, status, "createdAt", "updatedAt") VALUES
('Elektronika Center', 'ulitsa Lenina, 45', '+998 (90) 123-45-67', 'active', NOW(), NOW()),
('TechnoMir', 'prospekt Mira, 123', '+998 (90) 987-65-43', 'payment_overdue', NOW(), NOW()),
('Tsifrovoy Dom', 'ulitsa Sovetskaya, 78', '+998 (90) 555-12-34', 'blocked', NOW(), NOW());

-- Получите id магазинов после вставки:
-- SELECT id, name FROM stores;
-- Например: 1 | Elektronika Center, 2 | TechnoMir, 3 | Tsifrovoy Dom

-- Вставка пользователей (подставьте реальные id магазинов)
INSERT INTO users (login, password, role, "storeId", "createdAt", "updatedAt") VALUES
('admin', '$2b$10$K7L/8Y75aIsgGPUvZ2q2aOBhyiTx8hIXLkw8CK6RD.rJ9rJ9rJ9rJ', 'admin', NULL, NOW(), NOW()),
('manager1', '$2b$10$9L8K7Y75aIsgGPUvZ2q2aOBhyiTx8hIXLkw8CK6RD.rJ9rJ9rJ9rJ', 'store_manager', 1, NOW(), NOW()),
('manager2', '$2b$10$9L8K7Y75aIsgGPUvZ2q2aOBhyiTx8hIXLkw8CK6RD.rJ9rJ9rJ9rJ', 'store_manager', 2, NOW(), NOW());

-- Вставка клиентов (подставьте реальные storeId)
INSERT INTO customers ("firstName", "lastName", "middleName", "passportSeries", "passportNumber", phone, address, "isBlacklisted", "storeId", "createdAt", "updatedAt") VALUES
('Ivan', 'Petrov', 'Sergeevich', 'AA', '1234567', '+998 (90) 111-22-33', 'ulitsa Pushkina, 10', false, 1, NOW(), NOW()),
('Maria', 'Sidorova', 'Alexandrovna', 'AB', '7654321', '+998 (90) 222-33-44', 'ulitsa Gagarina, 25', false, 1, NOW(), NOW()),
('Petr', 'Ivanov', 'Mikhailovich', 'AC', '7890123', '+998 (90) 333-44-55', 'prospekt Lenina, 50', true, 2, NOW(), NOW());

-- Получите id клиентов после вставки:
-- SELECT id, "firstName" FROM customers;
-- Например: 1 | Ivan, 2 | Maria, 3 | Petr

-- Вставка рассрочек (подставьте реальные customerId и storeId)
INSERT INTO installments ("productName", "productPrice", "downPayment", "interestRate", months, "totalAmount", "monthlyPayment", status, "customerId", "storeId", "createdAt", "updatedAt") VALUES
('iPhone 15 Pro', 12000000.00, 2000000.00, 15.0, 12, 11500000.00, 958333.33, 'active', 1, 1, NOW(), NOW()),
('Samsung Galaxy S24', 8000000.00, 1000000.00, 12.0, 24, 7840000.00, 326666.67, 'active', 2, 1, NOW(), NOW()),
('MacBook Air M2', 15000000.00, 3000000.00, 18.0, 18, 14160000.00, 786666.67, 'overdue', 3, 2, NOW(), NOW());

-- Получите id рассрочек после вставки:
-- SELECT id, "productName" FROM installments;
-- Например: 1 | iPhone 15 Pro, 2 | Samsung Galaxy S24, 3 | MacBook Air M2

-- Вставка платежей (подставьте реальные installmentId)
INSERT INTO payments (amount, "dueDate", "paidDate", status, "installmentId", "createdAt", "updatedAt") VALUES
(958333.33, '2024-02-01', '2024-02-01', 'paid', 1, NOW(), NOW()),
(958333.33, '2024-03-01', '2024-03-01', 'paid', 1, NOW(), NOW()),
(958333.33, '2024-04-01', NULL, 'pending', 1, NOW(), NOW()),
(958333.33, '2024-05-01', NULL, 'pending', 1, NOW(), NOW()),

(326666.67, '2024-02-01', '2024-02-01', 'paid', 2, NOW(), NOW()),
(326666.67, '2024-03-01', NULL, 'pending', 2, NOW(), NOW()),

(786666.67, '2024-02-01', NULL, 'overdue', 3, NOW(), NOW());
