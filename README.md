# BookShop Library Management System

A full-stack application for managing a hybrid bookshop and library. It provides the following features:

- Library rental management
- E-commerce book sales
- Advanced analytics and statistics
- Inventory tracking

## Project Structure

The project is divided into the following directories:

- `backend`: Contains the backend server code written in Python using FastAPI and MS SQL Server for the database.
- `frontend`: Contains the frontend code written in React and TypeScript.
- [database](cci:1://file:///c:/Users/PC/bookshop-library/backend/setup_database.py:2:0-34:20): Contains the SQL scripts for creating the database schema.

## Setup Instructions

### Backend Setup

1. Install the required dependencies by running `pip install -r backend/requirements.txt`.
2. Create a database named `BookShopLibrary` on your MS SQL Server.
3. Update the database connection details in [backend/app/main.py](cci:7://file:///c:/Users/PC/bookshop-library/backend/app/main.py:0:0-0:0) with your own server details.
4. Run the backend server using `uvicorn main:app --reload`.

### Frontend Setup

1. Install the required dependencies by running `npm install` in the `frontend` directory.
2. Start the frontend development server using `npm start`.

## API Documentation

The backend API is documented using Swagger UI. You can access it at `http://localhost:8000/docs`.

## Database Schema

The database schema is defined in the [database/simple_schema.sql](cci:7://file:///c:/Users/PC/bookshop-library/database/simple_schema.sql:0:0-0:0) file. You can run this script to create the tables in the `BookShopLibrary` database.

## Contributing

Contributions are welcome! Please follow the guidelines in the [CONTRIBUTING.md](CONTRIBUTING.md) file.