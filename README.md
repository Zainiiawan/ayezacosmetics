# AYEZA COSMETICS

Luxury cosmetics e-commerce monorepo (Next.js + Express + MongoDB).

## Apps

- `frontend/` — Next.js 16 storefront + admin
- `backend/`  — Express REST API
- `packages/shared` — shared Zod schemas & types

## Local setup

1. Copy env:

```bash
cp .env.example .env
# ensure MONGODB_URI points to your MongoDB
# macOS often blocks port 5000 (AirPlay) — use PORT=5001
```

2. Install & seed:

```bash
npm install
npm run seed -w @ayeza/api
```

3. Run:

```bash
# terminal 1
npm run dev -w @ayeza/api

# terminal 2
npm run dev -w @ayeza/web
```

- Storefront: http://localhost:3000
- API: http://localhost:5001
- Swagger: http://localhost:5001/api/docs

## Seeded accounts

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@ayezacosmetics.com | Admin@123! |
| Customer | customer@ayezacosmetics.com | Customer@123! |

Coupon: `AYEZA15` (15% off)

## Production notes

- Set real `MONGODB_URI` (Atlas), JWT secrets, Cloudinary, Stripe, SMTP, JazzCash/Easypaisa credentials.
- Never commit `.env`.
- Build: `npm run build`
