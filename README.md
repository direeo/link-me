# LinkMe - Smart Tutorial Discovery Platform

🔗 **LinkMe** is a production-quality MVP web application that helps users find the most relevant learning resources without wasting time on irrelevant or low-quality tutorials.

![LinkMe Screenshot](docs/screenshot.png)

## ✨ Features

### 🔐 Authentication
- Email/password signup and login
- Guest mode (no account required)
- Passwords hashed with bcrypt (12 salt rounds)
- JWT-based authentication with HTTP-only cookies
- Protected routes with middleware

### ✉️ Email Verification
- Verification email sent on signup
- 24-hour expiring verification tokens
- Rate-limited resend functionality
- Console logging in development mode

### 🛡️ Security
- Bcrypt password hashing
- Input validation with Zod
- Secure HTTP headers (CSP, X-Frame-Options, etc.)
- Rate limiting for auth endpoints
- SQL injection protection via Prisma
- XSS prevention

### 💬 Chatbot Tutorial Discovery
- Conversational chat-style UI
- Clarifying questions for better results
- YouTube Data API integration
- Returns 5-7 curated tutorials
- Displays title, thumbnail, description, view count, and link
- Prefers recent and high-quality content

### 👤 Guest Mode
- Guests can search tutorials immediately
- History and preferences not saved
- Gentle prompts to sign up

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- YouTube Data API v3 key

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd linkme
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Copy the example environment file:
   ```bash
   cp .env.example .env.local
   ```
   
   Edit `.env.local` with your configuration:
   ```env
   # Database
   DATABASE_URL="file:./dev.db"
   
   # JWT Secrets - CHANGE THESE IN PRODUCTION!
   JWT_SECRET="your-secure-jwt-secret"
   JWT_REFRESH_SECRET="your-secure-refresh-secret"
   
   # YouTube API
   YOUTUBE_API_KEY="your-youtube-api-key"
   
   # Email (development mode logs to console)
   EMAIL_MODE="development"
   
   # Application URL
   NEXT_PUBLIC_APP_URL="http://localhost:3000"
   ```

4. **Set up the database**
   ```bash
   npx prisma db push
   npx prisma generate
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Open in browser**
   
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
linkme/
├── prisma/
│   └── schema.prisma       # Database models
├── src/
│   ├── app/
│   │   ├── api/            # API routes
│   │   │   ├── auth/       # Auth endpoints
│   │   │   ├── chat/       # Chat endpoint
│   │   │   ├── verify/     # Email verification
│   │   │   └── youtube/    # YouTube search
│   │   ├── chat/           # Chat page
│   │   ├── login/          # Login page
│   │   ├── signup/         # Signup page
│   │   ├── verify/         # Email verification page
│   │   ├── layout.tsx      # Root layout
│   │   ├── page.tsx        # Landing page
│   │   └── globals.css     # Global styles
│   ├── components/
│   │   ├── chat/           # Chat components
│   │   └── ui/             # Reusable UI components
│   ├── contexts/
│   │   └── AuthContext.tsx # Auth state management
│   ├── generated/
│   │   └── prisma/         # Generated Prisma client
│   ├── lib/
│   │   ├── auth.ts         # Auth utilities
│   │   ├── db.ts           # Database client
│   │   ├── email.ts        # Email service
│   │   ├── rate-limit.ts   # Rate limiting
│   │   ├── validation.ts   # Zod schemas
│   │   └── youtube.ts      # YouTube API client
│   ├── types/
│   │   └── index.ts        # TypeScript types
│   └── middleware.ts       # Route middleware
├── .env.example            # Environment template
├── package.json
└── README.md
```

## 🔧 Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | SQLite connection string | Yes |
| `JWT_SECRET` | Secret for signing access tokens | Yes |
| `JWT_REFRESH_SECRET` | Secret for refresh tokens | Yes |
| `YOUTUBE_API_KEY` | YouTube Data API v3 key | Yes |
| `EMAIL_MODE` | "development" or "production" | Yes |
| `SMTP_HOST` | SMTP server host | Prod only |
| `SMTP_PORT` | SMTP server port | Prod only |
| `SMTP_USER` | SMTP username | Prod only |
| `SMTP_PASS` | SMTP password | Prod only |
| `SMTP_FROM` | Sender email address | Prod only |
| `NEXT_PUBLIC_APP_URL` | Application URL | Yes |
| `BCRYPT_SALT_ROUNDS` | Bcrypt salt rounds (default: 12) | No |

## 📝 API Endpoints

### Authentication
- `POST /api/auth/signup` - Create new account
- `POST /api/auth/login` - Sign in
- `POST /api/auth/logout` - Sign out
- `GET /api/auth/me` - Get current user
- `POST /api/auth/guest` - Create guest session

### Email Verification
- `POST /api/verify/email` - Verify email with token
- `POST /api/verify/resend` - Resend verification email

### Chat & Search
- `POST /api/chat/message` - Send chat message
- `POST /api/youtube/search` - Direct YouTube search

## 🔒 Security Features

1. **Password Security**
   - Bcrypt hashing with 12 salt rounds
   - Minimum 8 characters
   - Requires uppercase, lowercase, and number

2. **Rate Limiting**
   - Login: 5 attempts per 15 minutes
   - Signup: 3 attempts per hour
   - Chat: 30 messages per minute

3. **Token Security**
   - Access tokens: 15 min expiry, HTTP-only cookies
   - Refresh tokens: 7 day expiry, HTTP-only cookies
   - Verification tokens: 24 hour expiry

4. **Headers**
   - Content Security Policy
   - X-Frame-Options: DENY
   - X-Content-Type-Options: nosniff
   - X-XSS-Protection: 1; mode=block

## 🚀 Deployment

### Building for Production

```bash
npm run build
npm start
```

### Environment Considerations

1. **Change secrets** - Generate new JWT secrets for production
2. **Enable HTTPS** - The app is HTTPS-ready
3. **Configure SMTP** - Set up production email service
4. **Database** - Consider migrating to PostgreSQL for scale

### Database Migration to PostgreSQL

1. Update `prisma/schema.prisma`:
   ```prisma
   datasource db {
     provider = "postgresql"
   }
   ```

2. Update `prisma.config.ts` with PostgreSQL URL

3. Run migrations:
   ```bash
   npx prisma db push
   ```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License.

---

Built with ❤️ using Next.js, Tailwind CSS, Prisma, and the YouTube Data API.
