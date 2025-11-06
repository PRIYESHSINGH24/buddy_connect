import type { ObjectId } from "mongodb"

export interface User {
  _id?: ObjectId
  email: string
  password: string // hashed
  name: string
  college: string
  department: string
  year: string // 1st, 2nd, 3rd, 4th
  skills: string[]
  bio: string
  profileImage?: string
  linkedinUrl?: string
  interests: string[]
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
  likes: ObjectId[]
  comments: Comment[]
  createdAt: Date
  updatedAt: Date
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
