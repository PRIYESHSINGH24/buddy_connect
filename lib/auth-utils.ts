import bcrypt from "bcryptjs"
import { getDatabase } from "./mongodb"
import type { User } from "./db-schemas"
import { ObjectId } from "mongodb"

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10)
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

export async function createUser(userData: Omit<User, "_id" | "createdAt" | "updatedAt">) {
  const db = await getDatabase()
  const hashedPassword = await hashPassword(userData.password)

  const result = await db.collection("users").insertOne({
    ...userData,
    password: hashedPassword,
    skills: userData.skills || [],
    interests: userData.interests || [],
    createdAt: new Date(),
    updatedAt: new Date(),
  })

  return result.insertedId
}

export async function getUserByEmail(email: string) {
  const db = await getDatabase()
  return db.collection<User>("users").findOne({ email: email.toLowerCase() })
}

export async function getUserById(id: string | ObjectId) {
  const db = await getDatabase()
  return db.collection<User>("users").findOne({ _id: new ObjectId(id) })
}

export async function updateUser(id: string | ObjectId, updates: Partial<User>) {
  const db = await getDatabase()
  return db.collection("users").updateOne({ _id: new ObjectId(id) }, { $set: { ...updates, updatedAt: new Date() } })
}
