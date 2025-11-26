# BookShop Library Management System

A full-stack portfolio project demonstrating modern web development practices with Python FastAPI, React TypeScript, and MS SQL Server in a Dockerized environment. This hybrid bookshop/library system showcases inventory management, e-commerce capabilities, and real-time analytics.

## 🚀 Professional Features

### Full-Stack Architecture
- **Backend API**: FastAPI with automatic OpenAPI documentation
- **Frontend**: React with TypeScript for type-safe development
- **Database**: MS SQL Server with complex relational data modeling
- **Containerization**: Docker for consistent development and deployment

### Development Excellence
- **Automated Scripts**: Comprehensive bash scripts for environment management
- **WSL Optimization**: Optimized for Windows Subsystem for Linux development
- **Virtual Environments**: Python virtual environment isolation
- **Process Management**: Automated service startup/shutdown with PID tracking

### Business Logic
- **Hybrid Business Model**: Support for both purchases and rentals
- **Inventory Management**: Real-time stock tracking and availability
- **Multi-type Items**: Books, movies, board games, and magazines
- **Admin Dashboard**: Complete CRUD operations with authentication
- **Analytics**: Pricing statistics and inventory analytics

## 🛠️ Tech Stack

**Backend**
- Python 3.8+
- FastAPI (RESTful API with automatic docs)
- pymssql (MS SQL Server connectivity)
- Uvicorn (ASGI server)

**Frontend**
- React 18 with TypeScript
- Axios for API communication
- Modern React hooks and functional components

**Database & Infrastructure**
- MS SQL Server 2022 (Docker container)
- Docker & Docker Compose
- Bash scripting for automation
- WSL2-optimized development environment

## 📋 Prerequisites

Before running this project, ensure you have:

### Required Software
- **Docker Desktop** (with WSL2 integration if on Windows)
- **Node.js** (v18+ recommended, use [nvm](https://github.com/nvm-sh/nvm) for management)
- **Python 3.8+** (with venv support)
- **Git** for version control

### Windows-Specific
- **WSL2** (Windows Subsystem for Linux) with Ubuntu distribution
- **Docker Desktop** with WSL2 backend enabled

### Optional but Recommended
- **VS Code** with WSL and Docker extensions
- **Python Extension** for VS Code
- **GitHub CLI** for repository management

## 🚀 Quick Start

### 1. Clone and Setup
```bash
git clone https://github.com/yourusername/bookshop-library.git
cd bookshop-library
```

### 2. Start Development Environment
```bash
# Start all services (Docker SQL Server, Backend API, Frontend)
./scripts/start-dev.sh

# Or use the convenience script:
./dev.sh start
```

### 3. Access the Application
- **Frontend**: http://localhost:3000
- **Admin Panel**: http://localhost:3000/admin
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs
- **Database**: localhost:1433 (SQL Server)

### Routes
- `/` &mdash; Customer experience (`CustomerPanel`) with catalog browsing.
- `/admin` &mdash; New admin control center scaffold, sharing the same visual system.

A pill-style navigation control is rendered on both panels so you can switch views without editing code.

## 📁 Project Structure

```
bookshop-library/
├── backend/                 # FastAPI application
│   ├── app/                # Main application module
│   ├── scripts/            # Python utility scripts
│   │   └── admin/          # Admin functionality
│   └── requirements.txt    # Python dependencies
├── frontend/               # React TypeScript app
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── services/       # API service layer
│   │   └── types/          # TypeScript definitions
│   └── package.json
├── database/               # Database schemas and seeds
│   ├── schema.sql          # Database schema
│   └── sample_data.sql     # Sample data
├── scripts/                # Development automation
│   ├── start-dev.sh        # Start all services
│   ├── stop-dev.sh         # Stop all services
│   ├── status.sh           # Service status check
│   └── activate-venv.sh    # Python environment activation
└── dev.sh                  # Main convenience script
```

## 🎯 Development Commands

### Using the Convenience Script
```bash
./dev.sh start          # Start all services
./dev.sh stop           # Stop all services
./dev.sh status         # Check service status
./dev.sh items          # List all inventory items
./dev.sh create         # Add new inventory item
./dev.sh admin          # Launch interactive admin panel
./dev.sh test-auth      # Test authentication system
./dev.sh venv           # Activate Python virtual environment
```

### Individual Scripts
```bash
# Service management
./scripts/start-dev.sh
./scripts/stop-dev.sh
./scripts/status.sh

# Admin functions
./run-item-listing.sh
./run-item-creation.sh
./run-admin-panel.sh
./run-admin-test.sh
```

## 🗄️ Database Schema

The system uses a robust MS SQL Server database with:

- **Items**: Books, movies, games, magazines with pricing and inventory
- **Users**: Customer management with membership tiers
- **ItemTypes**: Categorization system for different media types
- **Transactions**: Purchase and rental history (planned)
- **Analytics**: Real-time business intelligence data

## 🔧 Advanced Configuration

### Manual Service Startup
```bash
# Start SQL Server only
docker start bookshop-sql

# Start backend only
cd backend && source venv/bin/activate
uvicorn app.main:app --reload

# Start frontend only
cd frontend && npm start
```

### Database Reset
```bash
# The database automatically initializes with sample data
# Manual reset available through admin panel
```

### Environment Variables
Create a `.env` file in the backend directory for production:
```env
DATABASE_URL=your_connection_string
SECRET_KEY=your_secret_key
```

## 🧪 Testing

### API Testing
```bash
# Test backend API endpoints
curl http://localhost:8000/items
curl http://localhost:8000/analytics/pricing
```

### Database Connection Test
```bash
./run-admin-test.sh
```

### Manual Testing
- Access http://localhost:8000/docs for interactive API testing
- Use the admin panel for inventory management testing
- Verify frontend-backend integration at http://localhost:3000

## 📈 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | API welcome and endpoints list |
| GET | `/items` | Browse all inventory items |
| GET | `/users` | User management |
| GET | `/analytics/pricing` | Pricing statistics |
| GET | `/analytics/inventory` | Inventory analytics |
| GET | `/health` | System health check |

## 🐛 Troubleshooting

### Common Issues

**Port 3000 already in use**
```bash
# Kill any existing Node processes
pkill -f node
```

**SQL Server connection issues**
```bash
# Restart Docker container
docker restart bookshop-sql
```

**Python import errors**
```bash
# Recreate virtual environment
cd backend
rm -rf venv
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

### Logs and Debugging
```bash
# View backend logs
tail -f backend.log

# View frontend logs  
tail -f frontend.log

# Check service status
./scripts/status.sh
```

## 🚀 Deployment Ready

This project includes:
- ✅ Docker containerization for database
- ✅ Environment configuration patterns
- ✅ Production-ready API documentation
- ✅ Type-safe frontend development
- ✅ Automated development workflows
- ✅ Comprehensive error handling

## 👥 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/new-feature`
3. Commit changes: `git commit -am 'Add new feature'`
4. Push to branch: `git push origin feature/new-feature`
5. Submit a pull request

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 💼 Professional Highlights

This project demonstrates:
- **Full-Stack Proficiency**: End-to-end application development
- **Database Expertise**: MS SQL Server design and optimization
- **DevOps Practices**: Containerization and automation scripting
- **Modern Frameworks**: FastAPI and React with TypeScript
- **Production Readiness**: Error handling, logging, and monitoring

---

**Built with ❤️ for modern web development**
