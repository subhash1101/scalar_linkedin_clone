from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Query
from sqlalchemy.orm import Session, joinedload
from typing import List, Optional
from app.db.session import get_db
from app.dependencies.auth import get_current_user
from app.models.user import User, Profile, Experience, Education, Skill, UserSkill, Certification, Project, Recommendation
from app.models.social import Connection, ConnectionStatus, Follower
from app.schemas.user import (
    UserOut, ProfileUpdate, ProfileOut,
    ExperienceCreate, ExperienceOut,
    EducationCreate, EducationOut,
    CertificationCreate, CertificationOut,
    ProjectCreate, ProjectOut,
    RecommendationCreate, RecommendationOut,
    SkillOut
)
from app.utils.files import save_upload
import json

router = APIRouter(prefix="/api/users", tags=["users"])


@router.get("/me", response_model=UserOut)
def get_me(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return db.query(User).options(joinedload(User.profile)).filter(User.id == current_user.id).first()


@router.get("/search")
def search_users(q: str = Query(""), skip: int = 0, limit: int = 20, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    users = db.query(User).options(joinedload(User.profile)).filter(
        (User.username.ilike(f"%{q}%")) |
        (User.email.ilike(f"%{q}%"))
    ).offset(skip).limit(limit).all()
    result = []
    for u in users:
        if u.id == current_user.id:
            continue
        conn = db.query(Connection).filter(
            ((Connection.requester_id == current_user.id) & (Connection.addressee_id == u.id)) |
            ((Connection.requester_id == u.id) & (Connection.addressee_id == current_user.id))
        ).first()
        data = {
            "id": u.id,
            "username": u.username,
            "role": u.role.value,
            "profile": None,
            "connection_status": conn.status.value if conn else None,
            "connection_id": conn.id if conn else None,
            "is_requester": conn.requester_id == current_user.id if conn else None,
        }
        if u.profile:
            data["profile"] = {
                "first_name": u.profile.first_name,
                "last_name": u.profile.last_name,
                "headline": u.profile.headline,
                "avatar_url": u.profile.avatar_url,
                "location": u.profile.location,
            }
        result.append(data)
    return result


@router.get("/{user_id}", response_model=UserOut)
def get_user(user_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    user = db.query(User).options(joinedload(User.profile)).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if user.profile:
        user.profile.profile_views = (user.profile.profile_views or 0) + 1
        db.commit()
    return user


@router.put("/me/profile", response_model=ProfileOut)
def update_profile(data: ProfileUpdate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    profile = db.query(Profile).filter(Profile.user_id == current_user.id).first()
    if not profile:
        profile = Profile(user_id=current_user.id, **data.model_dump())
        db.add(profile)
    else:
        for k, v in data.model_dump(exclude_unset=True).items():
            setattr(profile, k, v)
    db.commit()
    db.refresh(profile)
    return profile


@router.post("/me/avatar")
async def upload_avatar(file: UploadFile = File(...), current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    url = await save_upload(file, "avatars")
    profile = db.query(Profile).filter(Profile.user_id == current_user.id).first()
    profile.avatar_url = url
    db.commit()
    return {"avatar_url": url}


@router.post("/me/banner")
async def upload_banner(file: UploadFile = File(...), current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    url = await save_upload(file, "banners")
    profile = db.query(Profile).filter(Profile.user_id == current_user.id).first()
    profile.banner_url = url
    db.commit()
    return {"banner_url": url}


@router.post("/me/resume")
async def upload_resume(file: UploadFile = File(...), current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    url = await save_upload(file, "resumes")
    profile = db.query(Profile).filter(Profile.user_id == current_user.id).first()
    profile.resume_url = url
    db.commit()
    return {"resume_url": url}


# Experience
@router.get("/{user_id}/experiences", response_model=List[ExperienceOut])
def get_experiences(user_id: int, db: Session = Depends(get_db), _: User = Depends(get_current_user)):
    return db.query(Experience).filter(Experience.user_id == user_id).all()


@router.post("/me/experiences", response_model=ExperienceOut)
def add_experience(data: ExperienceCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    exp = Experience(user_id=current_user.id, **data.model_dump())
    db.add(exp)
    db.commit()
    db.refresh(exp)
    return exp


@router.put("/me/experiences/{exp_id}", response_model=ExperienceOut)
def update_experience(exp_id: int, data: ExperienceCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    exp = db.query(Experience).filter(Experience.id == exp_id, Experience.user_id == current_user.id).first()
    if not exp:
        raise HTTPException(status_code=404, detail="Experience not found")
    for k, v in data.model_dump().items():
        setattr(exp, k, v)
    db.commit()
    db.refresh(exp)
    return exp


@router.delete("/me/experiences/{exp_id}")
def delete_experience(exp_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    exp = db.query(Experience).filter(Experience.id == exp_id, Experience.user_id == current_user.id).first()
    if not exp:
        raise HTTPException(status_code=404, detail="Experience not found")
    db.delete(exp)
    db.commit()
    return {"message": "Deleted"}


# Education
@router.get("/{user_id}/educations", response_model=List[EducationOut])
def get_educations(user_id: int, db: Session = Depends(get_db), _: User = Depends(get_current_user)):
    return db.query(Education).filter(Education.user_id == user_id).all()


@router.post("/me/educations", response_model=EducationOut)
def add_education(data: EducationCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    edu = Education(user_id=current_user.id, **data.model_dump())
    db.add(edu)
    db.commit()
    db.refresh(edu)
    return edu


@router.put("/me/educations/{edu_id}", response_model=EducationOut)
def update_education(edu_id: int, data: EducationCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    edu = db.query(Education).filter(Education.id == edu_id, Education.user_id == current_user.id).first()
    if not edu:
        raise HTTPException(status_code=404, detail="Education not found")
    for k, v in data.model_dump().items():
        setattr(edu, k, v)
    db.commit()
    db.refresh(edu)
    return edu


@router.delete("/me/educations/{edu_id}")
def delete_education(edu_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    edu = db.query(Education).filter(Education.id == edu_id, Education.user_id == current_user.id).first()
    if not edu:
        raise HTTPException(status_code=404, detail="Not found")
    db.delete(edu)
    db.commit()
    return {"message": "Deleted"}


# Skills
@router.get("/{user_id}/skills")
def get_skills(user_id: int, db: Session = Depends(get_db), _: User = Depends(get_current_user)):
    user_skills = db.query(UserSkill).options(joinedload(UserSkill.skill)).filter(UserSkill.user_id == user_id).all()
    return [{"id": us.id, "skill_id": us.skill_id, "name": us.skill.name, "endorsement_count": us.endorsement_count} for us in user_skills]


@router.post("/me/skills")
def add_skill(name: str, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    skill = db.query(Skill).filter(Skill.name.ilike(name)).first()
    if not skill:
        skill = Skill(name=name)
        db.add(skill)
        db.flush()
    existing = db.query(UserSkill).filter(UserSkill.user_id == current_user.id, UserSkill.skill_id == skill.id).first()
    if existing:
        raise HTTPException(status_code=400, detail="Skill already added")
    us = UserSkill(user_id=current_user.id, skill_id=skill.id)
    db.add(us)
    db.commit()
    return {"id": us.id, "name": skill.name, "endorsement_count": 0}


@router.delete("/me/skills/{skill_id}")
def remove_skill(skill_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    us = db.query(UserSkill).filter(UserSkill.id == skill_id, UserSkill.user_id == current_user.id).first()
    if not us:
        raise HTTPException(status_code=404, detail="Not found")
    db.delete(us)
    db.commit()
    return {"message": "Removed"}


@router.post("/me/skills/{skill_id}/endorse")
def endorse_skill(skill_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    us = db.query(UserSkill).filter(UserSkill.id == skill_id).first()
    if not us:
        raise HTTPException(status_code=404, detail="Not found")
    us.endorsement_count += 1
    db.commit()
    return {"endorsement_count": us.endorsement_count}


# Certifications
@router.get("/{user_id}/certifications", response_model=List[CertificationOut])
def get_certifications(user_id: int, db: Session = Depends(get_db), _: User = Depends(get_current_user)):
    return db.query(Certification).filter(Certification.user_id == user_id).all()


@router.post("/me/certifications", response_model=CertificationOut)
def add_certification(data: CertificationCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    cert = Certification(user_id=current_user.id, **data.model_dump())
    db.add(cert)
    db.commit()
    db.refresh(cert)
    return cert


@router.put("/me/certifications/{cert_id}", response_model=CertificationOut)
def update_certification(cert_id: int, data: CertificationCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    cert = db.query(Certification).filter(Certification.id == cert_id, Certification.user_id == current_user.id).first()
    if not cert:
        raise HTTPException(status_code=404, detail="Not found")
    for k, v in data.model_dump().items():
        setattr(cert, k, v)
    db.commit()
    db.refresh(cert)
    return cert


@router.delete("/me/certifications/{cert_id}")
def delete_certification(cert_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    cert = db.query(Certification).filter(Certification.id == cert_id, Certification.user_id == current_user.id).first()
    if not cert:
        raise HTTPException(status_code=404, detail="Not found")
    db.delete(cert)
    db.commit()
    return {"message": "Deleted"}


# Projects
@router.get("/{user_id}/projects", response_model=List[ProjectOut])
def get_projects(user_id: int, db: Session = Depends(get_db), _: User = Depends(get_current_user)):
    return db.query(Project).filter(Project.user_id == user_id).all()


@router.post("/me/projects", response_model=ProjectOut)
def add_project(data: ProjectCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    proj = Project(user_id=current_user.id, **data.model_dump())
    db.add(proj)
    db.commit()
    db.refresh(proj)
    return proj


@router.put("/me/projects/{proj_id}", response_model=ProjectOut)
def update_project(proj_id: int, data: ProjectCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    proj = db.query(Project).filter(Project.id == proj_id, Project.user_id == current_user.id).first()
    if not proj:
        raise HTTPException(status_code=404, detail="Not found")
    for k, v in data.model_dump().items():
        setattr(proj, k, v)
    db.commit()
    db.refresh(proj)
    return proj


@router.delete("/me/projects/{proj_id}")
def delete_project(proj_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    proj = db.query(Project).filter(Project.id == proj_id, Project.user_id == current_user.id).first()
    if not proj:
        raise HTTPException(status_code=404, detail="Not found")
    db.delete(proj)
    db.commit()
    return {"message": "Deleted"}


# Recommendations
@router.get("/{user_id}/recommendations")
def get_recommendations(user_id: int, db: Session = Depends(get_db), _: User = Depends(get_current_user)):
    received = db.query(Recommendation).options(
        joinedload(Recommendation.giver).joinedload(User.profile)
    ).filter(Recommendation.receiver_id == user_id).all()
    given = db.query(Recommendation).options(
        joinedload(Recommendation.receiver).joinedload(User.profile)
    ).filter(Recommendation.giver_id == user_id).all()
    return {"received": received, "given": given}


@router.post("/me/recommendations", response_model=RecommendationOut)
def add_recommendation(data: RecommendationCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    rec = Recommendation(giver_id=current_user.id, **data.model_dump())
    db.add(rec)
    db.commit()
    db.refresh(rec)
    return rec


# Stats
@router.get("/{user_id}/stats")
def get_user_stats(user_id: int, db: Session = Depends(get_db), _: User = Depends(get_current_user)):
    connections = db.query(Connection).filter(
        ((Connection.requester_id == user_id) | (Connection.addressee_id == user_id)) &
        (Connection.status == ConnectionStatus.accepted)
    ).count()
    followers = db.query(Follower).filter(Follower.following_id == user_id).count()
    following = db.query(Follower).filter(Follower.follower_id == user_id).count()
    return {"connections": connections, "followers": followers, "following": following}
