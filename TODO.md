# Project TODO List

## Completed
- [x] Basic FastAPI backend structure
- [x] SQLAlchemy Models definition (User, Job, Post, Message, Course, etc.)
- [x] JWT Authentication & Role-based Access Control
- [x] React (Vite) frontend initialization
- [x] Tailwind CSS + Framer Motion styling
- [x] Zustand & TanStack Query setup
- [x] Core Pages UI (Feed, Profile, Jobs, Network, Admin)
- [x] API Integration logic (`services/`)
- [x] Local filesystem uploading

## In Progress
- [ ] Real-time Messaging & Notifications (Polling implemented, needs transition to WebSockets)
- [ ] Proper error handling and form validation edge cases

## Not Started

### High Priority
- [ ] **Database Migrations:** Initialize and generate Alembic migrations (`alembic revision --autogenerate`).
- [ ] **Cloud Storage:** Migrate local file uploads to AWS S3 or equivalent.
- [ ] **Testing:** Add `pytest` for backend and `Vitest/React Testing Library` for frontend.
- [ ] **Containerization:** Create `Dockerfile` for frontend and backend, plus a `docker-compose.yml`.

### Medium Priority
- [ ] **Password Reset:** Add email service integration and token logic for forgot password.
- [ ] **OAuth Integration:** Add 'Login with Google / LinkedIn'.
- [ ] **CI/CD:** Add GitHub Actions workflows for linting, testing, and deployment.

### Low Priority
- [ ] **Pagination/Infinite Scroll:** Optimize frontend feed fetching using IntersectionObserver instead of basic pagination.
- [ ] **SEO & Metadata:** Add proper `<title>` and `<meta>` tags per route.
