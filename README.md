# Golf Charity Subscription Platform

A subscription-driven web application combining golf performance tracking, charity fundraising, and a monthly draw-based reward engine.

## Tech Stack
- **Frontend**: React 18 + Vite + Framer Motion
- **Backend**: Node.js + Express + MongoDB (Mongoose)
- **Payments**: Stripe
- **Auth**: JWT
- **Deploy**: Vercel

## Quick Start

### Prerequisites
- Node.js 18+
- MongoDB Atlas account
- Stripe account (test mode)

### Installation
```bash
# Install server dependencies
cd server && npm install

# Install client dependencies
cd ../client && npm install
```

### Environment Setup
```bash
# Copy example env
cp server/.env.example server/.env
# Edit server/.env with your credentials
```

### Seed Database
```bash
cd server && node seed.js
```

### Run Development
```bash
# From root
npm run dev
```

**Server**: http://localhost:5000  
**Client**: http://localhost:5173

### Test Credentials
- **Admin**: admin@golfcharity.com / admin123
- **User**: user@golfcharity.com / user123

## Deployment to Vercel

1. Push to GitHub
2. Connect repo to new Vercel project
3. Set environment variables in Vercel dashboard
4. Deploy

## Features
- ✅ User signup/login with JWT auth
- ✅ Subscription plans (monthly/yearly) via Stripe
- ✅ Score tracking (5-score rolling, Stableford 1-45)
- ✅ Monthly prize draws (random + algorithmic)
- ✅ Prize distribution (5-match 40%, 4-match 35%, 3-match 25%)
- ✅ Jackpot rollover on no 5-match winner
- ✅ Charity directory with search/filter
- ✅ Charity selection and contribution (min 10%)
- ✅ Winner verification with proof upload
- ✅ Admin dashboard with full management
- ✅ Email notifications
- ✅ Mobile responsive design
- ✅ Modern UI with animations
