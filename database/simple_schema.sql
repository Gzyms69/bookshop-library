-- Simple version for testing
CREATE TABLE ItemTypes (
    type_id INT PRIMARY KEY IDENTITY(1,1),
    type_name NVARCHAR(50) NOT NULL UNIQUE,
    description NVARCHAR(255)
);

CREATE TABLE Items (
    item_id INT PRIMARY KEY IDENTITY(1,1),
    title NVARCHAR(255) NOT NULL,
    author_director NVARCHAR(255),
    item_type_id INT,
    purchase_price DECIMAL(10,2),
    rental_price_per_day DECIMAL(8,2),
    total_copies INT NOT NULL DEFAULT 1,
    available_copies INT NOT NULL DEFAULT 1,
    created_date DATETIME2 DEFAULT GETDATE()
);

CREATE TABLE Users (
    user_id INT PRIMARY KEY IDENTITY(1,1),
    first_name NVARCHAR(100) NOT NULL,
    last_name NVARCHAR(100) NOT NULL,
    email NVARCHAR(255) UNIQUE NOT NULL,
    created_date DATETIME2 DEFAULT GETDATE()
);