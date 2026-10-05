import bcrypt from "bcryptjs"
import { prisma } from "./prisma"
import type { User } from "./db-schemas"

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10)
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

export async function createUser(userData: Omit<User, "_id" | "createdAt" | "updatedAt">) {
  const hashedPassword = await hashPassword(userData.password)

  const user = await prisma.user.create({
    data: {
      email: userData.email.toLowerCase(),
      password: hashedPassword,
      name: userData.name,
      username: userData.username || null,
      college: userData.college || "",
      department: userData.department || "",
      year: userData.year || "",
      skills: userData.skills || [],
      bio: userData.bio || "",
      profileImage: userData.profileImage || null,
      linkedinUrl: userData.linkedinUrl || null,
      socials: (userData.socials as any) ?? undefined,
      interests: userData.interests || [],
    },
  })

  return user.id
}

export async function getUserByEmail(email: string) {
  return prisma.user.findUnique({ where: { email: email.toLowerCase() } })
}

export async function getUserById(id: string) {
  return prisma.user.findUnique({ where: { id: String(id) } })
}

export async function updateUser(id: string, updates: Partial<User>) {
  return prisma.user.update({
    where: { id: String(id) },
    data: { ...(updates as any), updatedAt: new Date() },
  })
}
