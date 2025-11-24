-- BookShop Library Database Schema
-- Simple version without complex SQL features

-- ENUM-like tables for consistent data
CREATE TABLE ItemTypes (
    type_id INT PRIMARY KEY IDENTITY(1,1),
    type_name NVARCHAR(50) NOT NULL UNIQUE,
    description NVARCHAR(255)
);

-- Main Items table (books, movies, games, etc.)
CREATE TABLE Items (
    item_id INT PRIMARY KEY IDENTITY(1,1),
    title NVARCHAR(255) NOT NULL,
    author_director NVARCHAR(255),
    item_type_id INT FOREIGN KEY REFERENCES ItemTypes(type_id),
    purchase_price DECIMAL(10,2),
    rental_price_per_day DECIMAL(8,2),
    total_copies INT NOT NULL DEFAULT 1,
    available_copies INT NOT NULL DEFAULT 1,
    created_date DATETIME2 DEFAULT GETDATE(),
    last_updated DATETIME2 DEFAULT GETDATE(),
    CHECK (available_copies <= total_copies),
    CHECK (available_copies >= 0)
);

-- Users/Customers table
CREATE TABLE Users (
    user_id INT PRIMARY KEY IDENTITY(1,1),
    first_name NVARCHAR(100) NOT NULL,
    last_name NVARCHAR(100) NOT NULL,
    email NVARCHAR(255) UNIQUE NOT NULL,
    phone NVARCHAR(20),
    address TEXT,
    membership_tier NVARCHAR(50) DEFAULT 'Basic',
    created_date DATETIME2 DEFAULT GETDATE(),
    is_active BIT DEFAULT 1
);

-- Insert initial item types
INSERT INTO ItemTypes (type_name, description) VALUES 
('book', 'Physical books and novels'),
('magazine', 'Periodical publications'),
('movie', 'DVDs and Blu-ray films'),
('board_game', 'Tabletop games and puzzles');