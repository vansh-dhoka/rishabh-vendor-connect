# Rishabh Vendor Connect

A comprehensive real estate vendor portal for managing vendors, quotations, purchase orders, and invoices with HSN/GST compliance.

## Features

- **Multi-Company Management**: Support for multiple companies and projects
- **Vendor Management**: Complete vendor profiles with GSTIN, PAN, and bank details
- **Quotation Workflow**: RFQ creation, vendor quotes, and negotiation tracking
- **Purchase Orders**: PO generation with GST calculations and status tracking
- **Invoice Management**: Invoice processing with PDF generation and approval workflow
- **HSN/GST Compliance**: Built-in HSN codes and GST rate calculations
- **PDF Generation**: Professional PDFs for invoices and purchase orders
- **Audit Logging**: Complete audit trail for all operations
- **Budget Tracking**: Project and company budget monitoring
- **Security**: JWT authentication, company-scoped access, and data validation

## Technology Stack

### Backend
- **Node.js** with Express.js
- **PostgreSQL** database with connection pooling
- **JWT** authentication
- **PDFKit** for document generation
- **Multer** for file uploads
- **Comprehensive validation** and security middleware

### Frontend
- **React** with Vite
- **React Router** for navigation
- **Axios** for API communication
- **Context API** for state management
- **Responsive design** with modern UI

### Deployment
- **Render** platform for hosting
- **PostgreSQL** managed database
- **Persistent storage** for files and PDFs
- **Health monitoring** and logging
- **Automated backups**

## Quick Start

### Prerequisites
- Node.js 18+ and npm
- PostgreSQL 14+
- Git

### Local Development

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd rishabh-vendor-connect
   ```

2. **Backend Setup**
   ```bash
   cd backend
   npm install
   cp env.production.example .env
   # Update .env with your database credentials
   npm run dev
   ```

3. **Frontend Setup**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

4. **Database Setup**
   ```bash
   # Run migrations
   psql $DATABASE_URL -f backend/db/schema.sql
   
   # Optional: Seed initial data
   psql $DATABASE_URL -f backend/db/seed.sql
   ```

5. **Access the application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:4000
   - Health Check: http://localhost:4000/health

### Default Login Credentials

#### 🔑 Super Administrator (Full System Access)
- Email: `superadmin@rishabhvendorconnect.com`
- Password: `SuperAdmin@123`

#### 🏢 Company Administrator
- Email: `admin@rishabhdevelopers.com`
- Password: `CompanyAdmin@123`

#### 📋 Project Manager
- Email: `pm@rishabhdevelopers.com`
- Password: `ProjectManager@123`

#### 💰 Finance Manager
- Email: `finance@rishabhdevelopers.com`
- Password: `FinanceManager@123`

#### 🏗️ Vendor
- Email: `vendor@steelconstruction.com`
- Password: `Vendor@123`

#### 👁️ Viewer (Read-only)
- Email: `viewer@rishabhdevelopers.com`
- Password: `Viewer@123`

**See [USER_LOGIN_CREDENTIALS.md](./USER_LOGIN_CREDENTIALS.md) for complete user management details.**

## Project Structure

```
rishabh-vendor-connect/
├── backend/
│   ├── src/
│   │   ├── routes/          # API routes
│   │   ├── middleware/      # Authentication & validation
│   │   ├── utils/          # Utilities (PDF, monitoring, etc.)
│   │   └── assets/         # Logo and static assets
│   ├── db/
│   │   ├── schema.sql      # Database schema
│   │   └── seed.sql        # Initial data
│   ├── scripts/            # Production scripts
│   └── render.yaml         # Render deployment config
├── frontend/
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── pages/         # Page components
│   │   ├── services/      # API services
│   │   └── context/       # React context
│   ├── public/
│   │   └── assets/        # Static assets (logo)
│   └── render.yaml        # Render static site config
└── DEPLOYMENT_GUIDE.md    # Comprehensive deployment guide
```

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login

### Companies & Projects
- `GET/POST /api/companies` - Company management
- `GET/POST /api/projects` - Project management

### Vendors & Items
- `GET/POST /api/vendors` - Vendor management
- `GET/POST /api/items` - Item/material management

### Quotations & RFQs
- `GET/POST /api/rfqs` - Quotation requests
- `POST /api/rfqs/:id/vendor-quotes` - Submit vendor quotes
- `GET/POST /api/rfqs/:id/negotiations` - Negotiation tracking

### Purchase Orders
- `GET/POST /api/purchase-orders` - PO management
- `POST /api/purchase-orders/from-quote` - Create PO from quote
- `PATCH /api/purchase-orders/:id/status` - Update PO status

### Invoices
- `GET/POST /api/invoices` - Invoice management
- `GET /api/invoices/:id/pdf` - Download invoice PDF
- `POST /api/invoices/:id/upload` - Upload invoice files

### Monitoring
- `GET /health` - Health check
- `GET /api/monitoring/overview` - System overview
- `GET /api/monitoring/database` - Database metrics
- `GET /api/monitoring/performance` - Performance metrics

## Deployment

See [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) for comprehensive deployment instructions on Render.

### Quick Deploy to Render

1. **Connect GitHub repository** to Render
2. **Create PostgreSQL database** service
3. **Deploy backend** web service with environment variables
4. **Deploy frontend** static site
5. **Configure monitoring** and backups

## Security Features

- **JWT Authentication** with secure token handling
- **Company-scoped access** to prevent data leakage
- **Input validation** on all endpoints
- **File upload security** with type and size validation
- **HTTPS enforcement** in production
- **Rate limiting** to prevent abuse
- **Audit logging** for compliance

## Business Logic

### Workflow
1. **Create RFQ** with line items and send to vendors
2. **Vendors submit quotes** with pricing and terms
3. **Negotiate** with multiple rounds and comments
4. **Approve quotation** to generate Purchase Order
5. **Track PO status** through lifecycle (Draft → Submitted → Approved → Completed)
6. **Generate invoices** from completed POs
7. **Process payments** and maintain audit trail

### Budget Management
- **Company and project budgets** with real-time tracking
- **Budget warnings** when approaching limits
- **Spend analytics** and reporting

### GST Compliance
- **HSN/SAC codes** for all items
- **Automatic GST calculations** (CGST/SGST/IGST)
- **Tax breakdown** in all documents
- **GSTIN validation** and tracking

## Monitoring & Maintenance

### Health Checks
- Database connectivity monitoring
- Memory usage tracking
- Performance metrics
- Error rate monitoring

### Logging
- Request/response logging
- Error tracking with context
- Audit trail for all operations
- Performance monitoring

### Backups
- Automated daily database backups
- File storage backups
- 30-day retention policy
- Manual backup capabilities

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is proprietary software for Rishabh Vendor Connect.

## Support

For technical support or questions:
- Check the [Deployment Guide](./DEPLOYMENT_GUIDE.md)
- Review the API documentation
- Monitor application health via `/health` endpoint
- Check logs in Render dashboard

---

**Rishabh Vendor Connect** - Streamlining real estate vendor management with modern technology.
