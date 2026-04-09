# Glowdesk — Salon Management System

Full-stack salon management app built with **Next.js 14** (frontend) and **FastAPI** (backend).

---

## Project structure

```
glowdesk/
├── backend/          # FastAPI + SQLAlchemy + SQLite
│   ├── main.py
│   ├── database/db.py
│   ├── models/models.py
│   ├── schemas/schemas.py
│   ├── routers/
│   │   ├── appointments.py
│   │   ├── clients.py
│   │   ├── staff.py
│   │   └── services.py
│   ├── seed.py
│   └── requirements.txt
│
└── frontend/         # Next.js 14 + React Query + Tailwind
    ├── app/
    │   ├── layout.tsx        # Sidebar + QueryClient provider
    │   ├── page.tsx          # Calendar (day/week view)
    │   ├── clients/page.tsx
    │   ├── staff/page.tsx
    │   ├── services/page.tsx
    │   ├── reminders/page.tsx
    │   └── checkout/page.tsx
    ├── components/
    │   ├── ui/index.tsx      # Shared: Button, Modal, Badge, Avatar…
    │   ├── calendar/         # DayView, WeekView
    │   └── forms/            # AppointmentForm
    ├── hooks/useApi.ts       # React Query hooks for all resources
    ├── lib/api.ts            # Axios API client
    └── types/index.ts        # TypeScript types
```

---

## Setup

### 1. Backend

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate       # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Seed the database with sample data (run once)
python seed.py

# Start the API server
uvicorn main:app --reload --port 8000
```

API will be at: http://localhost:8000  
Interactive docs: http://localhost:8000/docs

---

### 2. Frontend

```bash
cd frontend

# Install dependencies
npm install

# Start the dev server
npm run dev
```

App will be at: http://localhost:3000

Next.js proxies all `/api/*` requests to the FastAPI backend automatically (configured in `next.config.js`).

---

## API endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET/POST | `/api/appointments` | List / create appointments |
| GET/PATCH/DELETE | `/api/appointments/{id}` | Get / update / delete |
| GET | `/api/appointments?date=YYYY-MM-DD` | Filter by date |
| GET/POST | `/api/clients` | List / create clients |
| GET/PATCH/DELETE | `/api/clients/{id}` | Get / update / delete |
| GET/POST | `/api/staffs` | List / create staff |
| GET/PATCH/DELETE | `/api/staffs/{id}` | Get / update / delete |
| GET/POST | `/api/services` | List / create services |
| GET/PATCH/DELETE | `/api/services/{id}` | Get / update / delete |

---

## Features

- **Calendar** — Day and week view, create/cancel/complete appointments
- **Clients** — List with search, expandable profiles, visit history, quick booking
- **Staff** — Cards with specialties, availability toggle, color picker
- **Services** — Grouped by category, price + deposit management
- **Reminders** — Toggle SMS/email rules, deposit + no-show fee settings
- **Checkout** — POS flow with tip selection and payment method

---

## Next steps

- Add PostgreSQL (swap `SQLALCHEMY_DATABASE_URL` in `database/db.py`)
- Add authentication (FastAPI OAuth2 + NextAuth.js)
- Wire up real SMS (Twilio) and email (Resend/SendGrid)
- Add online booking page (public-facing Next.js route)
