# Let's Do Prenup - MVP Implementation

A comprehensive online platform for creating legally enforceable prenuptial and postnuptial agreements across key U.S. jurisdictions (California, Washington, New York, Washington D.C., and Virginia).

## 🎯 Overview

Let's Do Prenup is a guided, state-specific platform that helps couples create legally compliant prenuptial agreements. The platform ensures proper legal requirements are met while providing an intuitive user experience for complex legal processes.

## 🏗️ Architecture

### Tech Stack
- **Frontend**: React 18 + TypeScript + Tailwind CSS + Vite
- **Backend**: Node.js + Express + TypeScript
- **Database**: PostgreSQL + Prisma ORM
- **Authentication**: JWT-based authentication system
- **UI Components**: Headless UI + Heroicons
- **Document Generation**: PDF generation with legal templates (planned)
- **E-Signatures**: DocuSign API integration (planned)
- **Deployment**: Docker containerization

### Project Structure
```
letsdoprenup/
├── frontend/                 # React application
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── pages/          # Application pages
│   │   ├── hooks/          # Custom React hooks
│   │   ├── services/       # API services
│   │   ├── types/          # TypeScript type definitions
│   │   └── styles/         # Global styles and Tailwind config
│   └── dist/               # Production build
├── backend/                 # Node.js API server
│   ├── src/
│   │   ├── routes/         # Express route handlers
│   │   ├── middleware/     # Authentication & error handling
│   │   ├── services/       # Business logic services
│   │   ├── utils/          # Utility functions
│   │   └── server.ts       # Express app configuration
│   ├── prisma/             # Database schema and migrations
│   └── dist/               # Compiled TypeScript
├── docker-compose.yml       # Multi-service Docker setup
└── package.json            # Workspace configuration
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Docker (optional but recommended)
- PostgreSQL (if not using Docker)

### Using Docker (Recommended)
```bash
# Clone the repository
git clone <repository-url>
cd letsdoprenup

# Start all services
docker-compose up

# The application will be available at:
# - Frontend: http://localhost:3000
# - Backend API: http://localhost:3001
# - Database: PostgreSQL on port 5432
```

**Note**: The backend container now automatically:
1. Generates the Prisma client (`npx prisma generate`)
2. Applies database migrations (`npx prisma migrate deploy`) 
3. Starts the application (`npm start`)

This ensures the database schema and Prisma client are always up-to-date when the container starts, eliminating common setup issues.

### Manual Setup
```bash
# Install dependencies
npm run install:all

# Set up environment variables
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env

# Start PostgreSQL database
# Update backend/.env with your database URL

# Run database migrations
cd backend
npx prisma migrate dev
npx prisma generate

# Start development servers
npm run dev  # Starts both frontend and backend
```

## 🎯 Core Features

### ✅ Implemented Features

#### User Management & Authentication
- Secure user registration and login
- JWT-based authentication
- Password hashing with bcrypt
- Protected routes and API endpoints

#### State-Specific Legal Compliance
- **California**: 7-day waiting period, fairness testing, full disclosure
- **Washington**: Community property rules, comprehensive disclosure
- **New York**: Mandatory notarization, fair and reasonable standards
- **Washington D.C.**: UPAA compliance, disclosure requirements
- **Virginia**: Voluntariness emphasis, full disclosure requirements

#### Prenup Management
- Create and manage multiple prenup agreements
- State selection with specific legal requirements
- Progress tracking with step-by-step completion
- Partner collaboration workflow
- Document status management

#### Financial Disclosure System
- Comprehensive asset entry forms (real estate, vehicles, investments, etc.)
- Debt tracking (mortgages, student loans, credit cards, etc.)
- Income documentation with multiple sources
- Automatic net worth calculations
- Side-by-side financial comparisons
- Timestamped, auditable disclosure reports

#### Document Management
- File upload support for financial documents
- Document categorization and organization
- Download capabilities for all documents
- Secure document storage

#### User Interface
- Responsive design for mobile and desktop
- Modern, accessible UI with Tailwind CSS
- Progress indicators and step-by-step guidance
- Legal disclaimers and compliance messaging
- State-specific information and requirements

### 🔄 In Progress Features

#### Multi-Step Wizard Interface
- Guided interview process with state-specific questions
- Dynamic form validation based on state requirements
- Real-time progress saving
- Step navigation with completion tracking

#### Document Generation
- PDF generation with legal templates
- State-specific document formatting
- Custom clause selection and modification
- Document preview and review system

### 📋 Planned Features

#### E-Signature Integration
- DocuSign API integration for electronic signatures
- Remote online notarization support
- Identity verification workflows
- Compliance logging and audit trails

#### Advanced Features
- Real-time partner collaboration
- Financial calculators and planning tools
- Attorney review marketplace integration
- Document versioning and revision tracking
- Advanced reporting and analytics

## 🏛️ Legal Compliance

### State-Specific Requirements

#### California
- **Waiting Period**: 7 days between execution and marriage
- **Disclosure**: Complete financial disclosure required
- **Standards**: Court examines fairness at enforcement
- **Special Rules**: Agreements signed <7 days before marriage are voidable

#### Washington  
- **Property Type**: Community property state
- **Disclosure**: Complete and accurate disclosure of all assets/debts
- **Standards**: Must be fair and reasonable when made
- **Requirements**: Voluntary execution essential

#### New York
- **Notarization**: Agreement must be notarized or acknowledged
- **Standards**: Fair and reasonable at both execution and enforcement
- **Disclosure**: Fair disclosure of assets and financial obligations
- **Maintenance**: Cannot completely waive without strict requirements

#### Washington D.C.
- **Framework**: Follows Uniform Premarital Agreement Act (UPAA)
- **Disclosure**: Adequate disclosure of assets and obligations required
- **Standards**: Agreement unconscionable if lacking disclosure
- **Limitations**: Cannot adversely affect child support

#### Virginia
- **Emphasis**: Strong focus on voluntariness and full disclosure
- **Standards**: Agreement must not be unconscionable
- **Requirements**: Complete disclosure of assets, debts, and income
- **Limitations**: Cannot adversely affect child support obligations

### Important Legal Disclaimers
- This platform provides document preparation services, not legal advice
- Both parties should have adequate time to review agreements
- Independent legal representation is recommended for complex situations
- Full financial disclosure is required in all supported states

## 🔧 Development

### Available Scripts

```bash
# Install all dependencies
npm run install:all

# Development (runs both frontend and backend)
npm run dev

# Build for production
npm run build

# Run tests
npm run test

# Backend specific
cd backend
npm run dev          # Start development server
npm run build        # Compile TypeScript
npm run prisma:studio # Open database GUI

# Frontend specific  
cd frontend
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
```

### Database Management

```bash
# Generate Prisma client
npx prisma generate

# Create and apply migrations
npx prisma migrate dev

# Reset database
npx prisma migrate reset

# Open Prisma Studio
npx prisma studio
```

### Environment Variables

#### Backend (.env)
```env
DATABASE_URL="postgresql://user:password@localhost:5432/letsdoprenup"
JWT_SECRET="your-super-secret-jwt-key"
NODE_ENV="development"
PORT=3001
```

#### Frontend (.env)
```env
VITE_API_URL="http://localhost:3001/api"
```

## 📊 Database Schema

The application uses PostgreSQL with Prisma ORM. Key entities include:

- **Users**: Authentication and profile information
- **Prenups**: Agreement metadata and progress tracking
- **FinancialDisclosures**: Asset, debt, and income information
- **Documents**: File attachments and supporting documentation
- **Signatures**: Electronic signature tracking
- **PartnerInvitations**: Collaboration workflow management

## 🛡️ Security Features

- Password hashing with bcrypt (12 rounds)
- JWT token authentication
- CORS protection
- Rate limiting on API endpoints
- Input validation with Joi
- SQL injection protection via Prisma
- Secure file upload handling

## 🚢 Deployment

### Docker Deployment
```bash
# Build and start all services
docker-compose up --build

# Production mode
docker-compose -f docker-compose.prod.yml up
```

#### Automated Database Setup
The backend Docker container includes automated setup that runs on every container start:

1. **Prisma Client Generation**: Ensures the Prisma client is always generated with the latest schema
2. **Database Migrations**: Automatically applies pending database migrations
3. **Application Startup**: Only starts the application after database setup is complete

This automation is handled by the `docker-entrypoint.sh` script, which:
- Runs `npx prisma generate` to generate the Prisma client
- Runs `npx prisma migrate deploy` to apply database migrations  
- Executes `npm start` to launch the application

This approach ensures:
- ✅ Database schema is always up-to-date
- ✅ Prisma client is properly generated
- ✅ No manual intervention needed for database setup
- ✅ Safer CI/CD deployments and developer onboarding

### Manual Deployment
1. Build both frontend and backend
2. Configure production environment variables
3. Set up PostgreSQL database
4. Run database migrations
5. Deploy backend to your server
6. Deploy frontend to CDN/static hosting

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Support

For support and questions:
- Create an issue in this repository
- Contact: [your-email@domain.com]

---

**⚖️ Legal Notice**: This platform provides document preparation services and legal information but does not provide legal advice. We recommend consulting with a qualified attorney for legal guidance specific to your situation.