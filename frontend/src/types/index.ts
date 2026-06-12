export interface Profile {
  id: number
  user_id: number
  first_name: string
  last_name: string
  headline?: string
  bio?: string
  location?: string
  industry?: string
  avatar_url?: string
  banner_url?: string
  resume_url?: string
  website?: string
  phone?: string
  profile_views?: number
  open_to_work?: boolean
  created_at: string
}

export interface User {
  id: number
  username: string
  email: string
  role: 'user' | 'recruiter' | 'admin'
  is_active: boolean
  created_at: string
  profile?: Profile
}

export interface UserBrief {
  id: number
  username: string
  profile?: {
    first_name: string
    last_name: string
    headline?: string
    avatar_url?: string
    location?: string
  }
}

export interface Experience {
  id: number
  user_id: number
  title: string
  company: string
  employment_type?: string
  location?: string
  is_current: boolean
  start_date?: string
  end_date?: string
  description?: string
  created_at: string
}

export interface Education {
  id: number
  user_id: number
  school: string
  degree?: string
  field_of_study?: string
  start_date?: string
  end_date?: string
  grade?: string
  description?: string
  created_at: string
}

export interface Skill {
  id: number
  skill_id?: number
  name: string
  endorsement_count: number
}

export interface Certification {
  id: number
  user_id: number
  name: string
  issuing_org?: string
  issue_date?: string
  expiry_date?: string
  credential_id?: string
  credential_url?: string
  created_at: string
}

export interface Project {
  id: number
  user_id: number
  title: string
  description?: string
  url?: string
  start_date?: string
  end_date?: string
  created_at: string
}

export interface Recommendation {
  id: number
  giver_id: number
  receiver_id: number
  relationship_type?: string
  text: string
  created_at: string
  giver?: UserBrief
}

export interface PostMedia {
  id: number
  media_type?: string
  url?: string
}

export interface Comment {
  id: number
  post_id: number
  author_id: number
  parent_id?: number
  content: string
  created_at: string
  author?: UserBrief
  replies: Comment[]
}

export interface Post {
  id: number
  author_id: number
  content: string
  visibility: string
  repost_of_id?: number
  created_at: string
  updated_at?: string
  author?: UserBrief
  media: PostMedia[]
  like_count: number
  comment_count: number
  repost_count: number
  user_reaction?: string
  comments: Comment[]
}

export interface Company {
  id: number
  name: string
  description?: string
  industry?: string
  company_size?: string
  website?: string
  logo_url?: string
  banner_url?: string
  headquarters?: string
  founded_year?: number
  is_verified: boolean
  job_count: number
  created_at: string
}

export interface Job {
  id: number
  company_id: number
  title: string
  description?: string
  requirements?: string
  benefits?: string
  location?: string
  is_remote: boolean
  job_type: string
  experience_level: string
  salary_min?: number
  salary_max?: number
  is_easy_apply: boolean
  is_active: boolean
  created_at: string
  company?: {
    id: number
    name: string
    logo_url?: string
    headquarters?: string
  }
  application_count: number
  is_saved: boolean
  is_applied: boolean
}

export interface JobApplication {
  id: number
  job_id: number
  applicant_id: number
  resume_url?: string
  cover_letter?: string
  status: string
  applied_at: string
  job?: Job
}

export interface Notification {
  id: number
  type: string
  entity_id?: number
  entity_type?: string
  message?: string
  is_read: boolean
  created_at: string
  actor?: UserBrief
}

export interface Connection {
  id: number
  requester_id: number
  addressee_id: number
  status: string
  message?: string
  created_at: string
  requester?: UserBrief
  addressee?: UserBrief
}

export interface Message {
  id: number
  conversation_id: number
  sender_id: number
  content?: string
  attachment_url?: string
  attachment_type?: string
  is_deleted: boolean
  created_at: string
  sender?: UserBrief
  is_read: boolean
}

export interface Conversation {
  id: number
  created_at: string
  members: UserBrief[]
  last_message?: Message
  unread_count: number
}

export interface Course {
  id: number
  title: string
  description?: string
  instructor?: string
  thumbnail_url?: string
  duration_hours?: number
  level?: string
  category?: string
  skills_covered?: string
  is_free: boolean
  lesson_count: number
  progress?: number
  completed?: boolean
  lessons?: { id: number; title: string; duration_minutes?: number; order_index: number }[]
}

export interface TokenResponse {
  access_token: string
  token_type: string
  user_id: number
  username: string
  role: string
}
