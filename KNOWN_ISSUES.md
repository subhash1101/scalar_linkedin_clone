# Known Issues & Risks

## Severity: High
1. **Database Migrations:** The project uses `Base.metadata.create_all()` in `main.py` to generate tables. While the `alembic/` folder exists, there are no migration scripts in `alembic/versions`. This makes schema updates in a production environment extremely risky and prone to data loss.
2. **File Upload Architecture:** User uploads (avatars, resumes) are saved locally to `backend/uploads/`. This breaks horizontal scaling (load balancing) and makes containerization difficult. It needs migration to cloud storage (AWS S3, Google Cloud Storage, or Azure Blob).
3. **Missing Automated Tests:** There are no `tests/` directories in either the backend or frontend. The lack of unit and integration tests severely impacts deployment confidence.

## Severity: Medium
4. **Real-time Implementation:** The `MessagingPage.tsx` and notifications rely on HTTP polling (e.g., 5-second intervals) instead of a WebSocket connection. This will cause immense unnecessary load on the FastAPI server if user traffic scales up.
5. **CORS Configuration:** In `backend/app/main.py`, CORS allows `http://localhost:5173`. In production, this needs to be an environment variable that handles dynamic origins.
6. **Passlib Python 3.12 Compatibility:** The `requirements.txt` forces `bcrypt==4.0.1` to maintain compatibility with `passlib`. `passlib` is largely unmaintained. Moving to a dedicated `bcrypt` implementation without `passlib` is recommended for future security and stability.

## Severity: Low
7. **No Password Reset:** There are no endpoints or UI flows for a user who forgets their password.
8. **Missing Dockerization:** The lack of `Dockerfile` and `docker-compose.yml` creates a "works on my machine" scenario, impeding fast onboarding and deployment.
9. **SQLite Default:** SQLite is fine for development, but the environment defaults should seamlessly point to PostgreSQL for staging/production.
