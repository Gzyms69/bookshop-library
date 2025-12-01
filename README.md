# BookShop Library Management System

A full-stack portfolio project demonstrating modern web development with Python FastAPI, React TypeScript, and MS SQL Server in a Dockerized environment. Implements a hybrid bookshop/library system with inventory management, e-commerce capabilities, and analytics.

## Tech Stack

**Backend**: Python 3.8+, FastAPI, pymssql, Uvicorn  
**Frontend**: React 18, TypeScript, Tailwind CSS, native Fetch API  
**Database**: MS SQL Server 2022 (Docker)  
**Infrastructure**: Docker, Docker Compose, WSL2 (Windows)

## Features

- Hybrid business model (purchases and rentals)
- Real-time inventory tracking
- Multi-type item support (books, movies, board games, magazines)
- Admin dashboard with CRUD operations
- REST API with automatic OpenAPI documentation
- Type-safe full-stack development
- Session-based caching and request deduplication

## Quick Start

### Prerequisites

- Docker Desktop (with WSL2 backend for Windows)
- Node.js v18+ (use [nvm](https://github.com/nvm-sh/nvm))
- Python 3.8+
- Git

### Installation & Setup

Clone and start all services (SQL Server, backend, frontend):

```bash
git clone https://github.com/Gzyms69/bookshop-library.git
cd bookshop-library
./dev.sh start
```

Access the application:
- Frontend: http://localhost:3000
- Admin Panel: http://localhost:3000/admin
- API: http://localhost:8000
- API Docs: http://localhost:8000/docs
- Database: localhost:1433

### Manual Service Startup

```bash
# Backend only
cd backend && source venv/bin/activate
uvicorn app.main:app --reload

# Frontend only
cd frontend && npm start

# Database only
docker start bookshop-sql
```

## Development

### Common Commands

```bash
./dev.sh start                          # Start all services
./dev.sh stop                           # Stop all services
./dev.sh status                         # Service status
./dev.sh items                          # List inventory
./dev.sh create                         # Add item (interactive)
./dev.sh admin                          # Admin panel
```

### Testing & Validation

```bash
npx tsc --noEmit                        # TypeScript check (frontend/)
cd frontend && npm test -- --watchAll=false  # Run React tests once
cd frontend && npm run build            # Build for production
./run-admin-test.sh                     # Test database connection
curl http://localhost:8000/health       # Backend health
```

### API Testing

- **Interactive**: http://localhost:8000/docs (Swagger UI)
- **Items**: `curl http://localhost:8000/items`
- **Analytics**: `curl http://localhost:8000/analytics/pricing`

## Project Structure

```
bookshop-library/
├── backend/                      # FastAPI application
│   ├── app/main.py              # REST API endpoints
│   ├── scripts/admin/           # Database utilities
│   └── requirements.txt          # Python dependencies
├── frontend/                     # React application
│   ├── src/
│   │   ├── components/          # Reusable React components
│   │   ├── pages/               # Page-level components
│   │   ├── services/api.ts      # API service layer
│   │   └── types/index.ts       # TypeScript definitions
│   └── package.json
├── database/                     # Database schemas
│   ├── schema.sql               # Table definitions
│   └── sample_data.sql          # Sample data
├── dev.sh                       # Main convenience script
└── .windsurfrules               # Development patterns
```

## Database Schema

**Items**: Books, movies, games, magazines with pricing and inventory  
**ItemTypes**: Category system for media types  
**Users**: Customer management with membership tiers  
**Transactions**: Purchase and rental history (planned)  
**Analytics**: Real-time business intelligence

## Configuration

### Environment Variables

Create `.env` in the backend directory for production:

```env
DATABASE_URL=your_connection_string
SECRET_KEY=your_secret_key
```

Development uses hardcoded credentials. Update for production.

### CORS Configuration

Currently hardcoded to `http://localhost:3000`. Update `backend/app/main.py` for other origins.

## Code Patterns & Guidelines

See `.windsurfrules` and `.github/copilot-instructions.md` for:
- React component patterns (functional, React.memo, useRef guards)
- FastAPI conventions (type hints, ItemTypes joins)
- API deduplication and caching
- Database connection patterns
- Tailwind CSS styling rules

Key principles:
- Functional React components only, wrapped with React.memo()
- Use useMemo() for derived state, not useState + effect
- AbortController for fetch cleanup
- Always join ItemTypes in item responses
- Return JSON format: `{items: [...], count: N}`

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Port 3000 in use | `pkill -f node` or `./dev.sh stop` |
| SQL Server connection fails | `docker start bookshop-sql` or restart Docker Desktop |
| Python import errors | `cd backend && python -m venv venv && pip install -r requirements.txt` |
| TypeScript errors | Run `npx tsc --noEmit` in frontend/ |
| Duplicate API calls | Verify didFetchRef guard and inflightGetItems dedup in components |

## Logs & Debugging

```bash
tail -f backend.log      # Backend logs
tail -f frontend.log     # Frontend logs
./scripts/status.sh      # Service status
```

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/new-feature`
3. Commit changes: `git commit -am 'Add new feature'`
4. Push to branch: `git push origin feature/new-feature`
5. Submit a pull request

## License

MIT License. See LICENSE file for details.

---

Built December 2025
