-- Sample data for BookShop Library

-- Insert sample items
INSERT INTO Items (title, author_director, item_type_id, purchase_price, rental_price_per_day, total_copies, available_copies) VALUES
('The Great Gatsby', 'F. Scott Fitzgerald', 1, 8.99, 0.50, 5, 5),
('Dune', 'Frank Herbert', 1, 9.99, 0.75, 3, 3),
('The Shawshank Redemption', 'Frank Darabont', 3, 12.99, 1.25, 4, 4),
('Catan', 'Klaus Teuber', 4, 35.99, 2.50, 2, 2),
('National Geographic', 'Various', 2, 4.99, 0.25, 10, 10);

-- Insert sample users
INSERT INTO Users (first_name, last_name, email, phone, membership_tier) VALUES
('John', 'Doe', 'john.doe@bookshop.com', '+1234567890', 'Premium'),
('Jane', 'Smith', 'jane.smith@bookshop.com', '+1234567891', 'Basic'),
('Bob', 'Johnson', 'bob.johnson@bookshop.com', '+1234567892', 'VIP');