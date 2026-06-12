# LinkedIn — Professional Networking Platform

A full-stack LinkedIn-inspired professional networking platform built with React + FastAPI.

## Tech Stack

**Frontend:** React 18 · TypeScript · Vite · Tailwind CSS · Zustand · TanStack Query · Framer Motion  
**Backend:** FastAPI · SQLAlchemy · SQLite · JWT Auth · Alembic  

## Quick Start

### Backend

```bash
cd backend
python3 -m venv venv
source venv/bin/activate          # Windows: venv\Scripts\activate
pip install -r requirements.txt
pip install "bcrypt==4.0.1"       # ensures passlib compatibility

# Seed sample data (50 users, 100 jobs, 200 posts, etc.)
python3 seed.py

# Start API server
uvicorn app.main:app --reload --port 8000
```

API docs: http://localhost:8000/docs

### Frontend

```bash
cd frontend
npm install
npm run dev
```

App: http://localhost:5173

---

## Demo Accounts

| Username | Password    | Role      |
|----------|-------------|-----------|
| demo     | password123 | user      |
| admin    | password123 | admin     |

All seeded users have password: `password123`

---

## Features

### Core
- JWT authentication (register / login / logout)
- Responsive desktop-first UI matching LinkedIn's layout

### Profile
- Edit name, headline, bio, location, industry, website
- Upload avatar & banner photos
- Upload resume (PDF)
- CRUD: Experience, Education, Skills, Certifications, Projects
- Skill endorsements
- Recommendations (give/receive)
- Open to work badge
- Profile views counter

### Feed
- Infinite-scroll post feed (connections + following)
- Create posts with text and image/document attachments
- 6 reaction types (Like, Celebrate, Support, Love, Insightful, Funny)
- Nested comments with replies
- Repost with/without comment
- Delete own posts/comments

### Network
- Send / accept / reject / withdraw connection requests
- Follow / unfollow users
- Suggested connections
- View followers & following lists

### Jobs
- Search & filter by title, location, job type, experience level, remote
- Save jobs, Easy Apply
- Upload resume + cover letter
- Track application status (Applied → Reviewing → Shortlisted → Interview → Hired/Rejected)

### Messaging
- Direct conversations with real-time polling (5s interval)
- File attachment support
- Read indicators
- Unread message badges

### Notifications
- Likes, comments, connection requests, acceptances, profile views
- Mark as read / mark all read
- Unread badge in navbar

### Learning
- Browse courses by category & skill level
- Progress tracking per lesson
- Certificate generation on completion

### Recruiter Dashboard
- Post, edit, delete jobs
- View applicants with status management
- Candidate notes
- Interview scheduling
- Hiring analytics

### Admin Panel
- User management (role changes, ban/unban)
- Report queue management
- Platform analytics

---

## Environment Variables

```
# backend/.env
SECRET_KEY=your-secret-key
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440
DATABASE_URL=sqlite:///./linkedin.db
UPLOAD_DIR=uploads
CORS_ORIGINS=["http://localhost:5173"]
```

---

## Project Structure

```
LinkedIn/
├── backend/
│   ├── app/
│   │   ├── api/          # Route handlers
│   │   ├── core/         # Config, security
│   │   ├── db/           # Session, base
│   │   ├── dependencies/ # Auth deps
│   │   ├── models/       # SQLAlchemy models
│   │   ├── schemas/      # Pydantic schemas
│   │   ├── services/     # Business logic
│   │   ├── utils/        # File uploads
│   │   └── main.py       # FastAPI app
│   ├── uploads/          # Uploaded files
│   ├── seed.py           # Sample data
│   └── requirements.txt
└── frontend/
    └── src/
        ├── components/   # Reusable UI
        ├── pages/        # Route pages
        ├── layouts/      # Layout wrappers
        ├── hooks/        # Custom hooks
        ├── services/     # API client
        ├── store/        # Zustand state
        ├── types/        # TypeScript types
        └── utils/        # Helpers
```
