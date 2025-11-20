import type { ObjectId } from "mongodb"

export interface User {
  _id?: ObjectId
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
  connections?: ObjectId[]
  // Incoming connection requests (user ids who requested)
  incomingRequests?: ObjectId[]
  // Outgoing connection requests (user ids this user requested)
  outgoingRequests?: ObjectId[]
  featuredProjectIds?: ObjectId[]
  endorsements?: Array<{
    from: ObjectId
    text: string
    createdAt: Date
  }>
  emailVerified?: boolean
  verificationToken?: string
  resetToken?: string
  resetTokenExpires?: Date
  createdAt: Date
  updatedAt: Date
}

export interface Post {
  _id?: ObjectId
  userId: ObjectId
  author: string
  authorImage?: string
  content: string
  image?: string
  attachments?: PostAttachment[]
  likes: ObjectId[]
  comments: Comment[]
  createdAt: Date
  updatedAt: Date
}

export interface PostAttachment {
  name: string
  type: string
  size: number
  data: string
}

export interface Comment {
  _id?: ObjectId
  userId: ObjectId
  author: string
  content: string
  createdAt: Date
}

export interface Project {
  _id?: ObjectId
  userId: ObjectId
  author: string
  title: string
  description: string
  githubUrl: string
  technologies: string[]
  image?: string
  likes: ObjectId[]
  createdAt: Date
  updatedAt: Date
}

export interface HackathonTeam {
  _id?: ObjectId
  hackathonId: ObjectId
  name: string
  members: ObjectId[]
  teamLead: ObjectId
  skills: string[]
  idea?: string
  createdAt: Date
}

export interface CollegeEvent {
  _id?: ObjectId
  title: string
  description: string
  date: Date
  time: string
  location: string
  organizer: ObjectId
  attendees: ObjectId[]
  category: string // hackathon, seminar, workshop, etc.
  image?: string
  registrationOpen: boolean
  maxAttendees?: number
  createdAt: Date
  updatedAt: Date
}

export interface Hackathon {
  _id?: ObjectId
  title: string
  description: string
  startDate: Date
  endDate: Date
  registrationDeadline: Date
  theme: string
  image?: string
  prizes: string[]
  organizer: ObjectId
  teams: ObjectId[]
  createdAt: Date
}

export interface Company {
  _id?: ObjectId
  name: string
  description?: string
  website?: string
  campusVisitDate?: Date
  recruitersContact?: string
  createdAt: Date
}

export interface Job {
  _id?: ObjectId
  companyId?: ObjectId
  companyName: string
  title: string
  description: string
  location?: string
  employmentType?: string
  salaryRange?: string
  hiringBatch?: string
  applyLink?: string
  applicants: ObjectId[]
  createdBy: ObjectId
  createdAt: Date
  updatedAt?: Date
}

export interface Notification {
  _id?: ObjectId
  recipient: ObjectId
  sender?: ObjectId
  type: string
  message: string
  jobId?: ObjectId
  read?: boolean
  createdAt: Date
}
