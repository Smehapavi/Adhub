# AdFlow — Advertisement Campaign Management Platform

A production-ready full-stack MERN application for managing advertising campaigns, creatives, analytics, and user access — inspired by Google Ads and Meta Ads Manager.

![MERN Stack](https://img.shields.io/badge/Stack-MERN-green)
![License](https://img.shields.io/badge/License-MIT-blue)

## Features

- **JWT Authentication** with bcrypt password hashing
- **Role-based access control** (User / Admin)
- **Campaign CRUD** with search, filters, pagination, and status management
- **Advertisement management** with image/video uploads (Multer)
- **Analytics dashboard** with interactive Recharts (impressions, clicks, CTR, CPC, CPM, budget usage)
- **Notifications** system with read/unread tracking
- **Profile management** with password change
- **Admin panel** for user management
- **Responsive UI** with Tailwind CSS and modern dashboard layout
- **Dummy analytics data** auto-generated on campaign creation and via seed script

## Tech Stack

| Layer    | Technology                                      |
|----------|-------------------------------------------------|
| Frontend | React 18, Vite, Tailwind CSS, Recharts, Axios   |
| Backend  | Node.js, Express.js, Mongoose                   |
| Database | MongoDB Atlas                                   |
| Auth     | JWT, bcryptjs                                   |

## Project Structure

```
AdHub/
├── client/                 # React frontend (Vite)
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── context/        # Auth & Notification contexts
│   │   ├── pages/          # Route pages
│   │   └── services/       # Axios API client
│   └── package.json
├── server/                 # Express backend (MVC)
│   ├── config/             # Database connection
│   ├── controllers/        # Route handlers
│   ├── middleware/         # Auth, upload, validation, errors
│   ├── models/             # Mongoose schemas
│   ├── routes/             # API routes
│   ├── utils/              # Helpers, validators, seed
│   └── server.js
└── README.md
```

## Getting Started

### Prerequisites

- Node.js 18+
- MongoDB Atlas account (or local MongoDB)

### 1. Clone and install

```bash
cd AdHub
npm run install:all
```

### 2. Configure environment

**Server** — copy `server/.env.example` to `server/.env`:

```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/adflow?retryWrites=true&w=majority
JWT_SECRET=your_super_secret_jwt_key_change_in_production
JWT_EXPIRE=7d
CLIENT_URL=http://localhost:5173
MAX_FILE_SIZE=10485760
```

**Client** — copy `client/.env.example` to `client/.env`:

```env
VITE_API_URL=http://localhost:5000/api
```

### 3. Seed demo data (optional)

```bash
npm run seed
```

This creates demo users, campaigns, ads, 30 days of analytics, and notifications.

### 4. Run development servers

Terminal 1 — Backend:
```bash
npm run dev:server
```

Terminal 2 — Frontend:
```bash
npm run dev:client
```

- Frontend: http://localhost:5173
- Backend API: http://localhost:5000/api
- Health check: http://localhost:5000/api/health

### Demo Credentials

| Role  | Email              | Password  |
|-------|--------------------|-----------|
| User  | user@adflow.com    | user123   |
| Admin | admin@adflow.com   | admin123  |

## API Endpoints

| Method | Endpoint                          | Description              | Access |
|--------|-----------------------------------|--------------------------|--------|
| POST   | `/api/auth/register`              | Register user            | Public |
| POST   | `/api/auth/login`                 | Login                    | Public |
| GET    | `/api/auth/me`                    | Get current user         | Auth   |
| PUT    | `/api/auth/profile`               | Update profile           | Auth   |
| PUT    | `/api/auth/change-password`       | Change password          | Auth   |
| GET    | `/api/auth/users`                 | List all users           | Admin  |
| GET    | `/api/campaigns`                  | List campaigns           | Auth   |
| POST   | `/api/campaigns`                  | Create campaign          | Auth   |
| GET    | `/api/campaigns/:id`              | Get campaign             | Auth   |
| PUT    | `/api/campaigns/:id`              | Update campaign          | Auth   |
| DELETE | `/api/campaigns/:id`              | Delete campaign          | Auth   |
| GET    | `/api/ads`                        | List advertisements      | Auth   |
| POST   | `/api/ads`                        | Create ad (multipart)    | Auth   |
| GET    | `/api/analytics/dashboard`        | Dashboard analytics      | Auth   |
| GET    | `/api/notifications`              | List notifications       | Auth   |

## Deployment

### Backend (Render / Railway / Heroku)

1. Set environment variables from `server/.env.example`
2. Set `NODE_ENV=production`
3. Start command: `npm start` (from `server/` directory)

### Frontend (Vercel / Netlify)

1. Set `VITE_API_URL` to your deployed API URL
2. Build command: `npm run build`
3. Output directory: `dist`

### MongoDB compass

## License

MIT
