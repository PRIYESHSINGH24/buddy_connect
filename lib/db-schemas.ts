// Shared API-facing types.
// DB access goes through Prisma (lib/prisma.ts). IDs are cuid() strings;
// API responses serialize them as `_id` to keep the frontend contract stable.

export interface User {
  _id?: string
  email: string
  password: string // hashed
  name: string
  username?: string
  college: string
  department: string
  year: string // 1st, 2nd, 3rd, 4th
  skills: string[]
  bio: string
  profileImage?: string
  linkedinUrl?: string
  socials?: {
    github?: string
    leetcode?: string
    codeforces?: string
    website?: string
    x?: string
  }
  interests: string[]
  // Connections: other users this user is connected with
  connections?: string[]
  // Incoming connection requests (user ids who requested)
  incomingRequests?: string[]
  // Outgoing connection requests (user ids this user requested)
  outgoingRequests?: string[]
  featuredProjectIds?: string[]
  endorsements?: Array<{
    from: string
    text: string
    createdAt: Date | string
  }>
  experience?: any[]
  education?: any[]
  projects?: any[]
  certifications?: any[]
  contact?: Record<string, any>
  resumeUrl?: string
  emailVerified?: boolean
  verificationToken?: string
  resetToken?: string
  resetTokenExpires?: Date
  createdAt: Date
  updatedAt: Date
}

export interface Post {
  _id?: string
  userId: string
  author: string
  authorImage?: string
  content: string
  image?: string
  attachments?: PostAttachment[]
  likes: string[]
  comments: Comment[]
  createdAt: Date
  updatedAt: Date
}

export interface PostAttachment {
  name: string
  type: string
  size: number
  url?: string   // R2 public URL (new uploads)
  data?: string  // base64 data URL (legacy, kept for backward compat)
}

export interface Comment {
  _id?: string
  userId: string
  author: string
  content: string
  createdAt: Date
}

export interface Project {
  _id?: string
  userId: string
  author: string
  title: string
  description: string
  githubUrl: string
  technologies: string[]
  image?: string
  likes: string[]
  createdAt: Date
  updatedAt: Date
}

export interface HackathonTeam {
  _id?: string
  hackathonId: string
  name: string
  members: string[]
  teamLead: string
  skills: string[]
  idea?: string
  createdAt: Date
}

export interface CollegeEvent {
  _id?: string
  title: string
  description: string
  date: Date
  time: string
  location: string
  organizer: string
  attendees: string[]
  category: string // hackathon, seminar, workshop, etc.
  image?: string
  registrationOpen: boolean
  maxAttendees?: number
  createdAt: Date
  updatedAt: Date
}

export interface Hackathon {
  _id?: string
  title: string
  description: string
  startDate: Date
  endDate: Date
  registrationDeadline: Date
  theme: string
  image?: string
  prizes: string[]
  organizer: string
  teams: string[]
  createdAt: Date
}

export interface Company {
  _id?: string
  name: string
  description?: string
  website?: string
  campusVisitDate?: Date
  recruitersContact?: string
  createdAt: Date
}

export interface Job {
  _id?: string
  companyId?: string
  companyName: string
  title: string
  description: string
  location?: string
  employmentType?: string
  salaryRange?: string
  hiringBatch?: string
  applyLink?: string
  applicants: string[]
  createdBy: string
  createdAt: Date
  updatedAt?: Date
}

export interface Notification {
  _id?: string
  recipient: string
  sender?: string
  type: string
  message: string
  jobId?: string
  read?: boolean
  createdAt: Date
}

export interface Message {
  _id?: string
  from: string
  to: string
  content: string
  readAt?: Date | null
  createdAt: Date
}
