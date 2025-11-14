# BookShop Library Management System

A full-stack application for managing a hybrid bookshop and library, built with Python FastAPI, React, and MS SQL Server.

## 🚀 Features

- **Library Management**: Track book/movie/game rentals
- **E-commerce**: Purchase items directly
- **Analytics Dashboard**: Statistical analysis of inventory and pricing
- **RESTful API**: FastAPI backend with automatic documentation
- **MS SQL Server**: Robust database with complex relationships

## 🛠️ Tech Stack

- **Backend**: Python FastAPI
- **Database**: MS SQL Server (Docker)
- **Frontend**: React + TypeScript (Coming soon)
- **ORM**: pymssql
- **Deployment**: Docker containerization

## 📊 Database Schema

The system manages:
- Items (books, movies, games, magazines)
- Users and membership tiers
- Transactions (purchases and rentals)
- Inventory analytics and pricing statistics

## 🚀 Getting Started

### Prerequisites
- Python 3.8+
- Docker
- MS SQL Server (via Docker)

### Installation
1. Clone the repository
2. Set up the database: `cd backend && python setup_database.py`
3. Start the API: `uvicorn app.main:app --reload`
4. Access the API at `http://localhost:8000`

## 📈 API Endpoints

- `GET /` - API documentation
- `GET /items` - Browse available items
- `GET /analytics/pricing` - Pricing statistics
- `GET /analytics/inventory` - Inventory analytics
- Interactive docs: `http://localhost:8000/docs`

## 🔮 Future Enhancements

- React frontend dashboard
- Advanced statistical modeling
- User authentication
- Payment integration