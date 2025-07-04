-- Создание тестовых данных для системы рассрочки

DELETE FROM payments;
DELETE FROM installments;
DELETE FROM customers;
DELETE FROM users;
DELETE FROM stores;

-- Создание магазинов
INSERT INTO stores (id, name, address, phone, status, "createdAt", "updatedAt") VALUES
('store1', 'Электроника Центр', 'ул. Ленина, 45', '+7 (495) 123-45-67', 'active', '2025-07-02 10:22:02', '2025-07-02 10:22:02'),
('store2', 'ТехноМир', 'пр. Мира, 123', '+7 (495) 987-65-43', 'payment_overdue', '2025-07-02 10:22:02', '2025-07-02 10:22:02'),
('store3', 'Цифровой Дом', 'ул. Советская, 78', '+7 (495) 555-12-34', 'blocked', '2025-07-02 10:22:02', '2025-07-02 10:22:02');

-- Создание пользователей
INSERT INTO users (id, login, password, role, "storeId", "createdAt", "updatedAt") VALUES
('user1', 'admin', '$2b$10$K7L/8Y75aIsgGPUvZ2q2aOBhyiTx8hIXLkw8CK6RD.rJ9rJ9rJ9rJ', 'admin', NULL, '2025-07-02 10:22:02', '2025-07-02 10:22:02'),
('user2', 'manager1', '$2b$10$9L8K7Y75aIsgGPUvZ2q2aOBhyiTx8hIXLkw8CK6RD.rJ9rJ9rJ9rJ', 'store_manager', 'store1', '2025-07-02 10:22:02', '2025-07-02 10:22:02'),
('user3', 'manager2', '$2b$10$9L8K7Y75aIsgGPUvZ2q2aOBhyiTx8hIXLkw8CK6RD.rJ9rJ9rJ9rJ', 'store_manager', 'store2', '2025-07-02 10:22:02', '2025-07-02 10:22:02');

-- Создание клиентов
INSERT INTO customers (id, "firstName", "lastName", "middleName", "passportSeries", "passportNumber", phone, address, "isBlacklisted", "storeId", "createdAt", "updatedAt") VALUES
('cust1', 'Иван', 'Петров', 'Сергеевич', '4509', '123456', '+7 (495) 111-22-33', 'ул. Пушкина, 10', false, 'store1', '2025-07-02 10:22:02', '2025-07-02 10:22:02'),
('cust2', 'Мария', 'Сидорова', 'Александровна', '4510', '654321', '+7 (495) 222-33-44', 'ул. Гагарина, 25', false, 'store1', '2025-07-02 10:22:02', '2025-07-02 10:22:02'),
('cust3', 'Петр', 'Иванов', 'Михайлович', '4511', '789012', '+7 (495) 333-44-55', 'пр. Ленина, 50', true, 'store2', '2025-07-02 10:22:02', '2025-07-02 10:22:02');

-- Создание рассрочек
INSERT INTO installments (id, "productName", "productPrice", "downPayment", "interestRate", months, "totalAmount", "monthlyPayment", status, "customerId", "storeId", "createdAt", "updatedAt") VALUES
('inst1', 'iPhone 15 Pro', 120000.00, 20000.00, 15.0, 12, 115000.00, 9583.33, 'active', 'cust1', 'store1', '2025-07-02 10:22:02', '2025-07-02 10:22:02'),
('inst2', 'Samsung Galaxy S24', 80000.00, 10000.00, 12.0, 24, 78400.00, 3266.67, 'active', 'cust2', 'store1', '2025-07-02 10:22:02', '2025-07-02 10:22:02'),
('inst3', 'MacBook Air M2', 150000.00, 30000.00, 18.0, 18, 141600.00, 7866.67, 'overdue', 'cust3', 'store2', '2025-07-02 10:22:02', '2025-07-02 10:22:02');

-- Платежи для iPhone 15 Pro
INSERT INTO payments (id, amount, "dueDate", "paidDate", status, "installmentId", "createdAt", "updatedAt") VALUES
('pay1', 9583.33, '2024-02-01', '2024-02-01', 'paid', 'inst1', '2025-07-02 10:22:02', '2025-07-02 10:22:02'),
('pay2', 9583.33, '2024-03-01', '2024-03-01', 'paid', 'inst1', '2025-07-02 10:22:02', '2025-07-02 10:22:02'),
('pay3', 9583.33, '2024-04-01', NULL, 'pending', 'inst1', '2025-07-02 10:22:02', '2025-07-02 10:22:02'),
('pay4', 9583.33, '2024-05-01', NULL, 'pending', 'inst1', '2025-07-02 10:22:02', '2025-07-02 10:22:02');

-- Платежи для Samsung Galaxy S24
INSERT INTO payments (id, amount, "dueDate", "paidDate", status, "installmentId", "createdAt", "updatedAt") VALUES
('pay5', 3266.67, '2024-02-01', '2024-02-01', 'paid', 'inst2', '2025-07-02 10:22:02', '2025-07-02 10:22:02'),
('pay6', 3266.67, '2024-03-01', NULL, 'overdue', 'inst2', '2025-07-02 10:22:02', '2025-07-02 10:22:02'),
('pay7', 3266.67, '2024-04-01', NULL, 'pending', 'inst2', '2025-07-02 10:22:02', '2025-07-02 10:22:02');

-- Платежи для MacBook Air M2
INSERT INTO payments (id, amount, "dueDate", "paidDate", status, "installmentId", "createdAt", "updatedAt") VALUES
('pay8', 7866.67, '2024-01-01', NULL, 'overdue', 'inst3', '2025-07-02 10:22:02', '2025-07-02 10:22:02'),
('pay9', 7866.67, '2024-02-01', NULL, 'overdue', 'inst3', '2025-07-02 10:22:02', '2025-07-02 10:22:02'),
('pay10', 7866.67, '2024-03-01', NULL, 'overdue', 'inst3', '2025-07-02 10:22:02', '2025-07-02 10:22:02');
