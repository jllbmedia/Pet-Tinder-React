# Pawfect 🐾

A full-stack pet matching application that lets users discover, swipe, and connect with adoptable pets. Built with modern web technologies and deployed on Vercel.

**Live Deployments:**
- [Full Stack App](https://pet-tinder-react.vercel.app/) - Complete app with backend and database
- [Frontend Only](https://jllbmedia.github.io/Pet-Tinder-React/) - GitHub Pages static build

---

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Installation](#installation)
- [Environment Setup](#environment-setup)
- [Running Locally](#running-locally)
- [Deployment](#deployment)
- [API Documentation](#api-documentation)
- [Database Schema](#database-schema)
- [Available Scripts](#available-scripts)

---

## ✨ Features

- **Pet Discovery**: Browse available pets in a card-based interface with swipe-like interactions
- **User Authentication**: Sign in with Google via Neon Auth for personalized experience
- **Pet Swiping**: Like or pass on pets with keyboard shortcuts (arrow keys) or click controls
- **Like History**: Save liked pets to your profile and view your history
- **Theme Support**: Toggle between light and dark modes
- **Responsive Design**: Mobile-friendly interface with Tailwind CSS
- **Rate Limiting**: API endpoints protected with rate limiting
- **Security**: Helmet.js middleware, CORS enabled, environment-based configuration

---

## 🛠️ Tech Stack

### Frontend
- **React 19.2** - UI library
- **Vite 8** - Build tool and dev server
- **TypeScript** - Type safety
- **Tailwind CSS 3.4** - Utility-first CSS framework
- **shadcn/ui** - Reusable UI components (alerts, buttons, cards)
- **Lucide React** - Icon library (Heart, LogOut, Sun, Moon, PawPrint, Sparkles, User)
- **Neon Auth UI** - Database-native authentication
- **Oxlint** - Fast JavaScript linter

### Backend
- **Express 5.2** - Web framework
- **Neon Serverless PostgreSQL** - Database client (`@neondatabase/serverless`)
- **Better Auth 1.6** - Authentication framework with Neon integration
- **CORS 2.8** - Cross-origin resource sharing
- **Helmet 8.3** - Security headers middleware
- **Express Rate Limit 8.6** - Request rate limiting
- **dotenv** - Environment variable management

### Authentication
- **Neon Auth** - Database-native authentication system
- **Google OAuth 2.0** - Social sign-in provider
- **Better Auth** - Authentication abstraction layer
- **JWT (Jose 6.2)** - Token management

### Database
- **PostgreSQL** - Primary database (Neon serverless)
- **SQL/Neon Query Language** - Data queries

### Deployment & DevOps
- **Vercel** - Hosting platform for frontend and backend
- **GitHub Pages** - Static site deployment alternative
- **Neon Auth Proxy** - Auth endpoint rewrite on Vercel

---

## 📂 Project Structure

```
pet-tinder-react/
├── src/                           # Frontend source code
│   ├── App.jsx                    # Main app component
│   ├── AuthProvider.jsx           # React Context for authentication
│   ├── AuthCallback.jsx           # OAuth callback handler
│   ├── main.jsx                   # React entry point
│   ├── App.css                    # App styles
│   ├── index.css                  # Global styles
│   ├── assets/                    # Static assets
│   ├── components/
│   │   ├── PetCard.jsx           # Individual pet card component
│   │   ├── Results.jsx           # Results/liked pets view
│   │   └── ui/                   # shadcn/ui components
│   │       ├── alert.jsx
│   │       ├── button.jsx
│   │       └── card.jsx
│   └── lib/
│       ├── api.js                # Frontend API client
│       ├── authClient.js         # Neon Auth client
│       └── utils.js              # Utility functions
├── api/
│   └── index.js                  # Backend API routes (Express)
├── lib/
│   └── auth.ts                   # Backend auth config
├── server.js                      # Express server entry point
├── vite.config.ts                # Vite configuration
├── vercel.json                   # Vercel deployment config
├── tailwind.config.js            # Tailwind CSS config
├── postcss.config.js             # PostCSS config
├── components.json               # UI component metadata
├── package.json                  # Project dependencies
├── seed_pets.mjs                 # Database seeding script
└── README.md                     # This file
```

---

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/jllbmedia/Pet-Tinder-React.git
   cd Pet-Tinder-React
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

---

## 🔐 Environment Setup

Create a `.env.local` file in the project root with the following variables:

```env
# Neon Database
DATABASE_URL=postgresql://user:password@ep-xxx.neon.tech/database?sslmode=require

# Better Auth
BETTER_AUTH_SECRET=your-secret-key-here
BETTER_AUTH_API_KEY=your-api-key-here
BETTER_AUTH_URL=https://pet-tinder-react.vercel.app

# Neon Auth
VITE_NEON_AUTH_URL=https://ep-xxx.neonauth.c-4.us-east-2.aws.neon.tech

# Server
PORT=5000
NODE_ENV=development
```

### Required Environment Variables Explained

| Variable | Purpose | Example |
|----------|---------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pw@neon.tech/db` |
| `BETTER_AUTH_SECRET` | Authentication secret key | Generate with: `openssl rand -hex 32` |
| `BETTER_AUTH_URL` | Base URL for auth callbacks | `https://pet-tinder-react.vercel.app` |
| `VITE_NEON_AUTH_URL` | Neon Auth endpoint for UI | Neon Auth dashboard URL |
| `PORT` | Server port (local dev) | `5000` |

---

## 🚀 Running Locally

### Development Mode (Frontend Only)
```bash
npm run dev
```
Opens the app at `http://localhost:5173` with Vite dev server

### Full Stack (Frontend + Backend)
In one terminal, start the backend:
```bash
npm run backend
```

In another terminal, start the frontend dev server:
```bash
npm run dev
```

The Vite config proxies `/api` requests to `http://localhost:5000`

### Accessing the App
- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:5000`
- Auth Proxy: Configured in `vercel.json` for production

---

## 🌐 API Documentation

### Pet Endpoints

#### Get Pets for Authenticated User
```http
GET /api/pets?user_id=<user_id>
```
Returns list of unseen pets for the user, excluding already-swiped pets.

**Response:**
```json
[
  {
    "id": "pet-uuid",
    "name": "Bella",
    "breed": "Golden Retriever",
    "age": 2,
    "image_url": "https://..."
  }
]
```

#### Get Liked Pets for User
```http
GET /api/liked-pets?user_id=<user_id>
```
Returns list of pets the user has liked.

#### Get Preview Pets (Unauthenticated)
```http
GET /api/preview-pets
```
Returns 3 random pets for unauthenticated users to preview the app.

#### Record Pet Selection
```http
POST /api/selections
Content-Type: application/json

{
  "user_id": "user-uuid",
  "pet_id": "pet-uuid",
  "did_like": true
}
```
Saves user's like/pass decision to database.

### Authentication Endpoints

#### Get Session
```http
GET /api/auth/session
```
Returns current user session information.

#### Google Sign-In
```http
GET /api/auth/sign-in/social?providerId=google&callbackURL=...
```
Redirects to Google OAuth flow.

#### Sign Out
```http
POST /api/auth/sign-out
```
Terminates user session.

---

## 🗄️ Database Schema

### PostgreSQL Tables

#### `public.pets`
Stores all available pets for adoption.

```sql
CREATE TABLE public.pets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  breed VARCHAR(255),
  age INTEGER,
  image_url TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### `public.auth_user` (Better Auth)
Stores user accounts (auto-created by Better Auth).

```sql
CREATE TABLE public.auth_user (
  id TEXT PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255),
  image_url TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  ...
);
```

#### `public.auth_account` (Better Auth)
Stores OAuth provider connections.

```sql
CREATE TABLE public.auth_account (
  id TEXT PRIMARY KEY,
  user_id TEXT REFERENCES public.auth_user(id),
  provider TEXT NOT NULL,
  provider_account_id TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  ...
);
```

#### `public.selections` (or similar)
Stores user's like/pass decisions.

```sql
CREATE TABLE public.selections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT REFERENCES public.auth_user(id),
  pet_id UUID REFERENCES public.pets(id),
  did_like BOOLEAN NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

## 📄 Available Scripts

```bash
# Frontend Development
npm run dev              # Start Vite dev server

# Backend
npm run backend          # Start Express server on port 5000

# Building
npm run build            # Build for production (Vite)
npm run predeploy        # Runs build before deploy
npm run deploy           # Deploy to GitHub Pages

# Code Quality
npm run lint             # Run Oxlint linter
npm run preview          # Preview production build

# Database
node seed_pets.mjs       # Seed database with 50 random pets
```

---

## 🚢 Deployment

### Vercel (Full Stack)

The app is configured for Vercel deployment with:

**Frontend**: Built and served by Vercel
**Backend API**: Node.js serverless functions in `/api`
**Auth Proxy**: Vercel rewrites `/auth-proxy/*` to Neon Auth endpoints

#### Vercel Configuration (`vercel.json`)
```json
{
  "version": 2,
  "rewrites": [
    {
      "source": "/auth-proxy/(.*)",
      "destination": "https://neonauth-domain/neondb/auth/$1"
    },
    {
      "source": "/api/(.*)",
      "destination": "/api/index.js"
    },
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

#### Deploy Steps
1. Push to GitHub repository
2. Connect repository to Vercel
3. Set environment variables in Vercel project settings
4. Deploy automatically on push to main branch

### GitHub Pages (Frontend Only)

For static frontend-only deployment:

```bash
npm run deploy
```

Deploys to `https://jllbmedia.github.io/Pet-Tinder-React/`

---

## 🔒 Security Features

- **Helmet.js**: Adds security headers (HSTS, CSP, X-Frame-Options, etc.)
- **CORS**: Configured for cross-origin requests
- **Rate Limiting**: Express rate limiting on API endpoints
- **Environment Variables**: Sensitive data in `.env.local`, never committed
- **PostgreSQL**: Uses parameterized queries to prevent SQL injection
- **JWT**: Secure token-based authentication via Better Auth
- **HTTPS**: Enforced in production via Helmet

---

## 🐛 Troubleshooting

### "Failed to create auth client" Error
- Ensure `VITE_NEON_AUTH_URL` is set correctly
- Check that Neon Auth is initialized in Neon console
- Clear browser cache and local storage

### Database Connection Issues
- Verify `DATABASE_URL` includes `?sslmode=require`
- Check Neon dashboard for IP allowlist
- Ensure database user has proper permissions

### API 404 Errors
- Verify backend server is running (`npm run backend`)
- Check that Vite proxy config points to `http://localhost:5000`
- Confirm environment variables are loaded

### Build Failures
- Run `npm ci` to install exact versions
- Clear `node_modules` and reinstall: `rm -rf node_modules && npm install`
- Check that all environment variables are set

---

## 📚 Technologies & Links

- [React Documentation](https://react.dev/)
- [Vite Documentation](https://vite.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [shadcn/ui Components](https://ui.shadcn.com/)
- [Express.js](https://expressjs.com/)
- [Neon Serverless PostgreSQL](https://neon.tech/)
- [Better Auth](https://www.better-auth.com/)
- [Vercel Documentation](https://vercel.com/docs)

---

## 📄 License

This project is open source and available for educational purposes.

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 👨‍💻 Author

**jllbmedia** - [GitHub](https://github.com/jllbmedia)

---

## 📝 Notes

- The app loads random pets from the [Brian Holt's Pet Worker API](https://pet.btholt.workers.dev/pets/random/15)
- Database seeding available via `seed_pets.mjs` script
- Supports both authenticated (database) and demo modes for testing
- Theme preferences are stored in localStorage
