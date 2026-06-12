# API Analysis

## Overview
The FastAPI backend is highly modular and organized into separate routers. All endpoints are prefixed with `/api`. Most routes require JWT authentication via dependency injection (`Depends(get_current_user)`).

## Endpoints Discovered

### Auth (`/api/auth`)
- **POST `/api/auth/register`**: Complete (Public)
- **POST `/api/auth/login`**: Complete (Public)

### Users & Profiles (`/api/users`)
- **GET `/api/users/me`**: Complete (Auth req)
- **GET `/api/users/{user_id}`**: Complete (Auth req)
- **PUT `/api/users/profile`**: Complete (Auth req)
- **POST `/api/users/experience`**: Complete (Auth req)
- **PUT/DELETE `/api/users/experience/{id}`**: Complete (Auth req)
- *(Similar CRUD operations exist for Education, Skills, Certifications, Projects, Recommendations)*

### Jobs (`/api/jobs`)
- **GET `/api/jobs`**: Complete (Auth req) - Search/List jobs.
- **POST `/api/jobs`**: Complete (Auth req) - Recruiter only.
- **GET `/api/jobs/{job_id}`**: Complete (Auth req)
- **PUT/DELETE `/api/jobs/{job_id}`**: Complete (Auth req)
- **POST `/api/jobs/{job_id}/save`**: Complete (Auth req)
- **GET `/api/jobs/saved/list`**: Complete (Auth req)
- **POST `/api/jobs/{job_id}/apply`**: Complete (Auth req) - Handles resume uploads.
- **GET `/api/jobs/applications/my`**: Complete (Auth req)
- **GET `/api/jobs/{job_id}/applicants`**: Complete (Auth req) - Recruiter only.
- **PUT `/api/jobs/applications/{app_id}/status`**: Complete (Auth req)
- **POST `/api/jobs/applications/{app_id}/notes`**: Complete (Auth req)
- **POST `/api/jobs/applications/{app_id}/interviews`**: Complete (Auth req)
- **GET `/api/jobs/recruiter/posted`**: Complete (Auth req)

### Posts & Feed (`/api/posts`)
- **GET `/api/posts/feed`**: Complete (Auth req)
- **POST `/api/posts`**: Complete (Auth req) - Supports media uploads.
- **POST `/api/posts/{id}/like`**: Complete (Auth req)
- **POST `/api/posts/{id}/comments`**: Complete (Auth req)

### Connections & Networking (`/api/connections`)
- **GET `/api/connections`**: Complete (Auth req)
- **POST `/api/connections/request`**: Complete (Auth req)
- **PUT `/api/connections/accept`**: Complete (Auth req)
- **POST `/api/connections/follow`**: Complete (Auth req)

### Messages (`/api/messages`)
- **GET `/api/messages/conversations`**: Complete (Auth req)
- **GET `/api/messages/conversations/{id}`**: Complete (Auth req)
- **POST `/api/messages/conversations/{id}`**: Complete (Auth req) - Send message.

### Notifications (`/api/notifications`)
- **GET `/api/notifications`**: Complete (Auth req)
- **PUT `/api/notifications/read`**: Complete (Auth req)

### Courses (`/api/courses`)
- **GET `/api/courses`**: Complete (Auth req)
- **POST `/api/courses/{id}/progress`**: Complete (Auth req)

### Admin (`/api/admin`)
- **GET `/api/admin/users`**: Complete (Admin req)
- **PUT `/api/admin/users/{id}/role`**: Complete (Admin req)

## Missing Endpoints
- Password reset functionality (Forgot Password / Reset Password).
- OAuth integrations (Login with Google / LinkedIn).
- WebSocket endpoint for `/api/messages/ws` or `/api/notifications/ws` (Currently relies on HTTP polling).

## Implementation Status
- **Complete:** ~90%
- **Partial:** Messaging (missing WebSockets)
- **Missing:** Password Reset, OAuth
- **Broken:** None detected statically.
