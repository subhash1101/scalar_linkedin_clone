"""Seed script — generates realistic sample data for LinkedIn."""
import sys, os
sys.path.insert(0, os.path.dirname(__file__))

from faker import Faker
from app.db.base import Base, engine, SessionLocal
from app.models.user import User, Profile, Experience, Education, Skill, UserSkill, Certification, Project, Recommendation
from app.models.social import Follower, Connection, ConnectionStatus, Post, PostLike, Comment, ReactionType, Notification, NotificationType
from app.models.company import Company, Recruiter
from app.models.job import Job, SavedJob, JobApplication, ApplicationStatus, JobAlert
from app.models.message import Conversation, ConversationMember, Message
from app.models.course import Course, CourseLesson, CourseProgress
from app.core.security import get_password_hash
import random
import json
from datetime import datetime, timedelta

fake = Faker()
random.seed(42)
Faker.seed(42)

Base.metadata.create_all(bind=engine)
db = SessionLocal()

# ── Clear existing data ────────────────────────────────────────────────────
tables = [
    "message_reads", "messages", "conversation_members", "conversations",
    "course_progress", "course_lessons", "courses",
    "interviews", "candidate_notes", "job_alerts", "job_applications", "saved_jobs", "jobs",
    "recruiters", "companies",
    "reports", "notifications", "reposts", "comments", "post_likes", "post_media", "posts",
    "connections", "followers",
    "recommendations", "projects", "certifications", "user_skills", "skills",
    "educations", "experiences", "profiles", "users",
]
from sqlalchemy import text
for t in tables:
    try:
        db.execute(text(f"DELETE FROM {t}"))
    except Exception:
        pass
db.commit()
print("Cleared existing data")

# ── Skills ─────────────────────────────────────────────────────────────────
skill_names = [
    "Python", "JavaScript", "TypeScript", "React", "Node.js", "FastAPI", "SQL",
    "Machine Learning", "Data Analysis", "AWS", "Docker", "Kubernetes", "Go",
    "Java", "Rust", "GraphQL", "PostgreSQL", "MongoDB", "Redis", "TensorFlow",
    "Leadership", "Product Management", "Agile", "UX Design", "Figma",
    "Communication", "Project Management", "Marketing", "Sales", "Finance",
]
skill_objs = []
for name in skill_names:
    s = Skill(name=name)
    db.add(s)
    skill_objs.append(s)
db.flush()
print(f"Created {len(skill_objs)} skills")

# ── Companies ──────────────────────────────────────────────────────────────
company_data = [
    ("TechNova", "Software & Cloud", "Enterprise", "San Francisco, CA"),
    ("DataBridge", "Data Analytics", "Mid-Market", "New York, NY"),
    ("PixelForge", "Design & Creative", "Startup", "Austin, TX"),
    ("CloudMatrix", "Cloud Infrastructure", "Enterprise", "Seattle, WA"),
    ("AiPulse", "Artificial Intelligence", "Growth", "Boston, MA"),
    ("GreenPath", "CleanTech", "Startup", "Denver, CO"),
    ("FinEdge", "FinTech", "Mid-Market", "Chicago, IL"),
    ("HealthSync", "HealthTech", "Growth", "Nashville, TN"),
    ("EduCraft", "EdTech", "Startup", "Portland, OR"),
    ("RetailIQ", "Retail Technology", "Mid-Market", "Dallas, TX"),
    ("MediaStream", "Media & Entertainment", "Enterprise", "Los Angeles, CA"),
    ("SecureNet", "Cybersecurity", "Mid-Market", "Washington, DC"),
    ("LogiFlow", "Supply Chain Tech", "Growth", "Atlanta, GA"),
    ("PropTech", "Real Estate Tech", "Startup", "Miami, FL"),
    ("AgriSense", "AgriTech", "Startup", "Des Moines, IA"),
    ("TravelHub", "Travel Technology", "Mid-Market", "Las Vegas, NV"),
    ("FoodTech", "Food & Beverage Tech", "Growth", "San Jose, CA"),
    ("SportAnalytics", "Sports Technology", "Startup", "Phoenix, AZ"),
    ("LegalAI", "LegalTech", "Mid-Market", "Minneapolis, MN"),
    ("BioNova", "Biotech", "Enterprise", "San Diego, CA"),
]
company_objs = []
sizes = ["1-10", "11-50", "51-200", "201-500", "501-1000", "1001-5000", "5000+"]
for name, industry, stage, hq in company_data:
    c = Company(
        name=name,
        description=fake.paragraph(nb_sentences=4),
        industry=industry,
        company_size=random.choice(sizes),
        website=f"https://www.{name.lower().replace(' ', '')}.com",
        headquarters=hq,
        founded_year=random.randint(2000, 2022),
        is_verified=random.choice([True, False]),
    )
    db.add(c)
    company_objs.append(c)
db.flush()
print(f"Created {len(company_objs)} companies")

# ── Users ──────────────────────────────────────────────────────────────────
ROLES = ["user"] * 40 + ["recruiter"] * 8 + ["admin"] * 2
random.shuffle(ROLES)

user_objs = []
hashed_pw = get_password_hash("password123")

admin_user = User(username="admin", email="admin@linkedin.dev", hashed_password=hashed_pw, role="admin")
db.add(admin_user)
db.flush()
admin_profile = Profile(
    user_id=admin_user.id,
    first_name="Admin",
    last_name="User",
    headline="Platform Administrator",
    bio="Keeping LinkedIn running smoothly.",
    location="San Francisco, CA",
    industry="Technology",
    profile_views=500,
)
db.add(admin_profile)
user_objs.append(admin_user)

demo_user = User(username="demo", email="demo@linkedin.dev", hashed_password=hashed_pw, role="user")
db.add(demo_user)
db.flush()
demo_profile = Profile(
    user_id=demo_user.id,
    first_name="Demo",
    last_name="User",
    headline="Senior Software Engineer | React · TypeScript · FastAPI",
    bio="Passionate about building scalable systems and great user experiences. Currently exploring the intersection of AI and developer tooling.",
    location="San Francisco, CA",
    industry="Technology",
    profile_views=342,
    open_to_work=True,
)
db.add(demo_profile)
user_objs.append(demo_user)

for i, role in enumerate(ROLES[:48]):
    first = fake.first_name()
    last = fake.last_name()
    username = f"{first.lower()}{last.lower()}{random.randint(1, 999)}"
    u = User(
        username=username,
        email=fake.unique.email(),
        hashed_password=hashed_pw,
        role=role,
    )
    db.add(u)
    db.flush()
    p = Profile(
        user_id=u.id,
        first_name=first,
        last_name=last,
        headline=random.choice([
            "Software Engineer at " + random.choice(company_data)[0],
            "Product Manager | " + fake.job(),
            "Senior " + fake.job(),
            "Founder & CEO at " + fake.company(),
            "Data Scientist | ML Engineer",
            "Full Stack Developer",
            "UX Designer & Researcher",
            "DevOps Engineer | Cloud Architect",
        ]),
        bio=fake.paragraph(nb_sentences=3),
        location=fake.city() + ", " + fake.state_abbr(),
        industry=random.choice(["Technology", "Finance", "Healthcare", "Marketing", "Education", "Design"]),
        profile_views=random.randint(0, 2000),
        open_to_work=random.choice([True, False]),
    )
    db.add(p)
    user_objs.append(u)

db.flush()
print(f"Created {len(user_objs)} users")

# ── Experiences ────────────────────────────────────────────────────────────
for u in user_objs[2:]:
    for _ in range(random.randint(1, 3)):
        company_name = random.choice(company_data)[0]
        start_year = random.randint(2015, 2022)
        is_current = random.random() < 0.4
        exp = Experience(
            user_id=u.id,
            title=fake.job(),
            company=company_name,
            employment_type=random.choice(["Full-time", "Part-time", "Contract", "Internship"]),
            location=fake.city() + ", " + fake.state_abbr(),
            is_current=is_current,
            start_date=f"{start_year}-{random.randint(1,12):02d}",
            end_date=None if is_current else f"{start_year + random.randint(1,3)}-{random.randint(1,12):02d}",
            description=fake.paragraph(nb_sentences=2),
        )
        db.add(exp)

# Demo user experiences
for title, company, start in [
    ("Senior Software Engineer", "TechNova", "2021-03"),
    ("Software Engineer", "DataBridge", "2018-06"),
    ("Junior Developer", "PixelForge", "2016-01"),
]:
    db.add(Experience(user_id=demo_user.id, title=title, company=company, start_date=start, is_current=(title == "Senior Software Engineer"), employment_type="Full-time", location="San Francisco, CA"))

# ── Educations ─────────────────────────────────────────────────────────────
universities = ["MIT", "Stanford", "UC Berkeley", "Carnegie Mellon", "Harvard", "Georgia Tech", "University of Michigan", "Caltech"]
for u in user_objs[2:]:
    for _ in range(random.randint(1, 2)):
        start = random.randint(2008, 2018)
        edu = Education(
            user_id=u.id,
            school=random.choice(universities),
            degree=random.choice(["B.S.", "M.S.", "Ph.D.", "MBA", "B.A."]),
            field_of_study=random.choice(["Computer Science", "Electrical Engineering", "Business", "Data Science", "Design", "Mathematics"]),
            start_date=f"{start}-09",
            end_date=f"{start + random.randint(2,4)}-05",
        )
        db.add(edu)

db.add(Education(user_id=demo_user.id, school="UC Berkeley", degree="B.S.", field_of_study="Computer Science", start_date="2012-09", end_date="2016-05"))

# ── User Skills ────────────────────────────────────────────────────────────
for u in user_objs:
    sampled = random.sample(skill_objs, random.randint(3, 8))
    for s in sampled:
        us = UserSkill(user_id=u.id, skill_id=s.id, endorsement_count=random.randint(0, 50))
        db.add(us)

db.flush()

# ── Connections ────────────────────────────────────────────────────────────
connected_pairs = set()
all_ids = [u.id for u in user_objs]
for u in user_objs:
    targets = random.sample([x for x in all_ids if x != u.id and (u.id, x) not in connected_pairs and (x, u.id) not in connected_pairs], min(8, len(all_ids) - 1))
    for t in targets:
        connected_pairs.add((u.id, t))
        status = random.choices(
            [ConnectionStatus.accepted, ConnectionStatus.pending, ConnectionStatus.rejected],
            weights=[70, 20, 10]
        )[0]
        conn = Connection(requester_id=u.id, addressee_id=t, status=status)
        db.add(conn)

db.flush()

# ── Companies assigned to recruiters ──────────────────────────────────────
recruiter_users = [u for u in user_objs if u.role == "recruiter"]
for i, ru in enumerate(recruiter_users):
    company = company_objs[i % len(company_objs)]
    company.created_by = ru.id
    rec = Recruiter(user_id=ru.id, company_id=company.id, title="Talent Acquisition Manager")
    db.add(rec)

db.flush()

# ── Jobs ───────────────────────────────────────────────────────────────────
job_titles = [
    "Senior Software Engineer", "Product Manager", "Data Scientist", "UX Designer",
    "DevOps Engineer", "Machine Learning Engineer", "Frontend Developer",
    "Backend Engineer", "Full Stack Developer", "Engineering Manager",
    "Data Analyst", "Security Engineer", "Cloud Architect", "Mobile Developer",
    "QA Engineer", "Site Reliability Engineer", "Technical Lead",
    "Scrum Master", "Business Analyst", "Content Strategist",
]
locations = ["San Francisco, CA", "New York, NY", "Austin, TX", "Seattle, WA", "Boston, MA", "Remote", "Chicago, IL", "Los Angeles, CA"]
job_types = ["full_time", "part_time", "contract", "internship"]
exp_levels = ["entry", "associate", "mid_senior", "director"]
job_objs = []

for _ in range(100):
    company = random.choice(company_objs)
    poster = random.choice(user_objs)
    jtype = random.choice(job_types)
    elevel = random.choice(exp_levels)
    salary_base = {"entry": 60000, "associate": 80000, "mid_senior": 120000, "director": 180000}[elevel]
    j = Job(
        company_id=company.id,
        posted_by=poster.id,
        title=random.choice(job_titles),
        description=fake.paragraph(nb_sentences=6),
        requirements="\n".join(["• " + fake.sentence() for _ in range(5)]),
        benefits="\n".join(["• " + b for b in ["Health insurance", "401k", "Remote work", "PTO", "Stock options"]]),
        location=random.choice(locations),
        is_remote=random.choice([True, False]),
        job_type=jtype,
        experience_level=elevel,
        salary_min=salary_base,
        salary_max=int(salary_base * 1.4),
        is_easy_apply=random.choice([True, False]),
        is_active=True,
    )
    db.add(j)
    job_objs.append(j)

db.flush()
print(f"Created {len(job_objs)} jobs")

# ── Job Applications ───────────────────────────────────────────────────────
statuses = list(ApplicationStatus)
for u in user_objs[:30]:
    for j in random.sample(job_objs, random.randint(0, 4)):
        app = JobApplication(
            job_id=j.id,
            applicant_id=u.id,
            cover_letter=fake.paragraph(nb_sentences=3),
            status=random.choice(statuses),
        )
        db.add(app)

db.flush()

# ── Saved Jobs ─────────────────────────────────────────────────────────────
for u in user_objs[:20]:
    for j in random.sample(job_objs, random.randint(0, 5)):
        sv = SavedJob(user_id=u.id, job_id=j.id)
        db.add(sv)

db.flush()

# ── Posts ──────────────────────────────────────────────────────────────────
post_templates = [
    "Excited to share that I've just joined {} as {}! Looking forward to the journey ahead.",
    "Just published a new article on {}. Check it out if you're interested in {}!",
    "Reflecting on {} years in the industry. Here are my top {} lessons learned:\n\n1. {}\n2. {}\n3. {}",
    "Big news! {} is hiring {} engineers. DM me if you're interested!",
    "Thrilled to announce that our team at {} just shipped {}. A huge shoutout to everyone involved!",
    "After {} months of hard work, we finally launched {}. The journey was incredibly rewarding.",
    "Grateful for the opportunities at {}. Onward to the next chapter!",
    "Hot take: {} is the most underrated skill in software engineering. Change my mind.",
    "Asked {} engineers what they wish they knew earlier. Here's what they said:\n\n{}",
]
post_objs = []
for _ in range(200):
    author = random.choice(user_objs)
    company = random.choice(company_data)[0]
    content = random.choice([
        f"Excited to share that I've just joined {company} as {fake.job()}! Incredible team and challenging problems ahead. #NewJob #Grateful",
        f"Just finished reading '{fake.catch_phrase()}' — game-changing perspective on {random.choice(['leadership', 'product thinking', 'engineering culture', 'distributed systems'])}. Highly recommend.",
        f"Hot take: {random.choice(['TypeScript', 'Rust', 'GraphQL', 'microservices', 'AI'])} will fundamentally reshape how we build software in the next 5 years. Thoughts?",
        f"Proud to announce that our team shipped {fake.catch_phrase()} today! {random.randint(3, 18)} months of work finally live. Grateful for an incredible team. 🚀",
        f"Lesson learned this week: {fake.sentence()} Sometimes the simplest solution is the right one.",
        f"We're hiring {fake.job()}s at {company}! Remote-friendly, great culture, meaningful work. DM me or apply at our website. Tag someone who might be interested! 👇",
        fake.paragraph(nb_sentences=random.randint(2, 5)),
    ])
    post = Post(
        author_id=author.id,
        content=content,
        visibility="public",
    )
    db.add(post)
    post_objs.append(post)

db.flush()

# ── Post Likes ─────────────────────────────────────────────────────────────
reactions = list(ReactionType)
for p in post_objs:
    likers = random.sample(user_objs, random.randint(0, 15))
    for liker in likers:
        like = PostLike(post_id=p.id, user_id=liker.id, reaction=random.choice(reactions))
        db.add(like)

db.flush()

# ── Comments ───────────────────────────────────────────────────────────────
comment_texts = [
    "Congratulations! Well deserved 🎉",
    "This is so inspiring, thank you for sharing!",
    "Love this perspective. Totally agree.",
    "Great insight! Would love to connect.",
    "Thanks for sharing your journey!",
    "This is exactly what I needed to read today.",
    "Incredible achievement. Keep it up!",
    "Such an important topic. More people should be talking about this.",
    "I had a similar experience. It really changes your perspective.",
    "Exciting times ahead! Looking forward to seeing what you build.",
]
for p in random.sample(post_objs, 100):
    for _ in range(random.randint(0, 5)):
        author = random.choice(user_objs)
        comment = Comment(
            post_id=p.id,
            author_id=author.id,
            content=random.choice(comment_texts),
        )
        db.add(comment)

db.flush()

# ── Messages ───────────────────────────────────────────────────────────────
message_texts = [
    "Hey! I saw your profile and would love to connect.",
    "Thanks for connecting! Looking forward to exchanging ideas.",
    "I noticed you're working on some interesting projects. Would love to chat.",
    "Are you open to discussing a potential collaboration?",
    "I really enjoyed your recent post about {}.",
    "Hi! I'm reaching out regarding an exciting opportunity at our company.",
    "Great to meet you at the virtual event last week!",
    "Would you be available for a quick call this week?",
]
conv_count = 0
for i in range(50):
    u1, u2 = random.sample(user_objs, 2)
    conv = Conversation()
    db.add(conv)
    db.flush()
    db.add(ConversationMember(conversation_id=conv.id, user_id=u1.id))
    db.add(ConversationMember(conversation_id=conv.id, user_id=u2.id))
    db.flush()
    n_msgs = random.randint(2, 8)
    for j in range(n_msgs):
        sender = u1 if j % 2 == 0 else u2
        msg = Message(
            conversation_id=conv.id,
            sender_id=sender.id,
            content=random.choice(message_texts).format(random.choice(["AI", "distributed systems", "product management"])),
        )
        db.add(msg)
    conv_count += 1

db.flush()
print(f"Created {conv_count} conversations")

# ── Courses ────────────────────────────────────────────────────────────────
course_data = [
    ("Python for Data Science", "Data Science", "Beginner", "Dr. Sarah Chen", 12.5),
    ("React & TypeScript Mastery", "Frontend Development", "Intermediate", "Alex Rivera", 20.0),
    ("Machine Learning Fundamentals", "AI & ML", "Intermediate", "Prof. James Liu", 30.0),
    ("AWS Cloud Practitioner", "Cloud Computing", "Beginner", "Maria Johnson", 15.0),
    ("System Design for Engineers", "Software Engineering", "Advanced", "David Kim", 25.0),
    ("UX Research Methods", "Design", "Beginner", "Emma Watson", 10.0),
    ("Advanced SQL & Analytics", "Data Analytics", "Intermediate", "Robert Chen", 18.0),
    ("Kubernetes in Production", "DevOps", "Advanced", "Nina Patel", 22.0),
    ("Product Management 101", "Product", "Beginner", "Michael Torres", 14.0),
    ("Leadership for Engineers", "Leadership", "Intermediate", "Dr. Lisa Park", 8.0),
]
course_objs = []
for title, category, level, instructor, hours in course_data:
    course = Course(
        title=title,
        description=fake.paragraph(nb_sentences=4),
        instructor=instructor,
        duration_hours=hours,
        level=level,
        category=category,
        skills_covered=", ".join(random.sample(skill_names, 3)),
        is_free=random.choice([True, False]),
    )
    db.add(course)
    db.flush()
    for idx in range(random.randint(6, 12)):
        lesson = CourseLesson(
            course_id=course.id,
            title=f"Module {idx + 1}: {fake.catch_phrase()}",
            duration_minutes=random.randint(15, 45),
            order_index=idx,
        )
        db.add(lesson)
    course_objs.append(course)

db.flush()

# ── Course Progress ─────────────────────────────────────────────────────────
for u in random.sample(user_objs, 20):
    for c in random.sample(course_objs, random.randint(1, 3)):
        lessons = db.query(CourseLesson).filter(CourseLesson.course_id == c.id).all()
        n_done = random.randint(0, len(lessons))
        done_ids = [l.id for l in lessons[:n_done]]
        pct = round((n_done / len(lessons)) * 100, 1) if lessons else 0
        completed = n_done == len(lessons) and len(lessons) > 0
        cp = CourseProgress(
            user_id=u.id,
            course_id=c.id,
            completed_lessons=json.dumps(done_ids),
            progress_percent=pct,
            completed=completed,
            certificate_url=f"/certificates/{u.id}/{c.id}" if completed else None,
        )
        db.add(cp)

db.flush()

# ── Notifications ──────────────────────────────────────────────────────────
notif_types = list(NotificationType)
for u in user_objs:
    for _ in range(random.randint(2, 8)):
        actor = random.choice([x for x in user_objs if x.id != u.id])
        ntype = random.choice(notif_types)
        msgs = {
            "like": "liked your post",
            "comment": "commented on your post",
            "mention": "mentioned you in a post",
            "connection_request": "sent you a connection request",
            "connection_accepted": "accepted your connection request",
            "job_alert": "New job matching your alert",
            "profile_view": "viewed your profile",
            "repost": "reposted your post",
            "endorsement": "endorsed you for a skill",
        }
        notif = Notification(
            recipient_id=u.id,
            actor_id=actor.id,
            type=ntype,
            entity_id=random.randint(1, 50),
            entity_type=random.choice(["post", "user", "job"]),
            message=msgs.get(ntype.value if hasattr(ntype, "value") else ntype, "interacted with your content"),
            is_read=random.choice([True, False]),
        )
        db.add(notif)

db.commit()
print("Seeding complete!")
print("\nDemo accounts:")
print("  Username: demo  | Password: password123  | Role: user")
print("  Username: admin | Password: password123  | Role: admin")
print(f"\nTotal users: {len(user_objs)}, companies: {len(company_objs)}, jobs: {len(job_objs)}, posts: {len(post_objs)}, courses: {len(course_objs)}")
