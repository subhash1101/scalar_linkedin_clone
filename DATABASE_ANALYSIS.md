# Database Analysis

## 1. Discovered Tables & Models
The project utilizes SQLAlchemy to define a highly relational database schema. The following models were discovered:

**User Domain:**
- `User` (`users` table) - Core authentication and identity.
- `Profile` (`profiles` table) - User profile details.
- `Experience` (`experiences` table) - Work history.
- `Education` (`educations` table) - Academic history.
- `Skill` (`skills` table) - Global dictionary of skills.
- `UserSkill` (`user_skills` table) - Association table linking users to skills with endorsements.
- `Certification` (`certifications` table) - User certifications.
- `Project` (`projects` table) - User portfolio projects.
- `Recommendation` (`recommendations` table) - Endorsements given/received.

**Social / Feed Domain:**
- `Follower` - Tracks following relationships.
- `Connection` - Mutual connections (LinkedIn style).
- `Post`, `PostMedia`, `PostLike`, `Comment`, `Repost` - Core feed entities.
- `Notification` - In-app alerts.

**Company & Jobs Domain:**
- `Company`, `Recruiter` - Employer entities.
- `Job`, `SavedJob`, `JobApplication`, `JobAlert` - Core job board functionality.
- `CandidateNote`, `Interview` - Recruiter ATS functionality.

**Messaging & Learning:**
- `Conversation`, `ConversationMember`, `Message`, `MessageRead` - Chat system.
- `Course`, `CourseLesson`, `CourseProgress` - E-learning module.

**Administration:**
- `Report` - Moderation queues.

## 2. Relationships
- **One-to-One:** `User` <-> `Profile`
- **One-to-Many:** `User` -> `Experience`, `Education`, `Project`, etc.
- **Many-to-Many:** Users to Skills (via `UserSkill`), Connections, Followers.
- **Hierarchical:** Posts have Comments, Conversations have Messages.
- Relationships are properly configured with SQLAlchemy `relationship` and cascading deletes (e.g., `cascade="all, delete-orphan"`).

## 3. Missing Migrations
- **Status:** **Critical Issue**
- The `alembic` directory exists, but the `alembic/versions` directory is **empty**.
- The application relies on `Base.metadata.create_all(bind=engine)` in `main.py`. This is not suitable for schema evolution or production environments.

## 4. Schema Inconsistencies
- No direct schema inconsistencies found at the model definition level.
- SQLite is being used as the default database, which struggles with complex `ALTER TABLE` operations and concurrent writes.

## 5. Unused Models
- All models appear to be imported and exposed through API routers. None appear immediately unused or orphaned.

## 6. Potential Issues
- Lack of database indexing on frequently searched fields (e.g., job titles, post text).
- Cascade deletion might be too aggressive in some areas if soft-deletes are preferred for compliance.
- No history tables or audit logs for sensitive operations (e.g., recruiter changing applicant status).

## 7. ER Diagram (Text Format)
```
[User] 1--1 [Profile]
[User] 1--* [Experience, Education, Certification, Project]
[User] 1--* [UserSkill] *--1 [Skill]
[User] 1--* [Connection, Follower] *--1 [User]
[User] 1--* [Post] 1--* [PostMedia, Comment, PostLike, Repost]
[Company] 1--* [Job]
[Job] 1--* [JobApplication] *--1 [User]
[JobApplication] 1--* [Interview, CandidateNote]
[Conversation] 1--* [Message] *--1 [User]
```
