import { MongoClient, type Db, MongoClientOptions } from "mongodb"

let cachedClient: MongoClient | null = null
let cachedDb: Db | null = null

export async function connectToDatabase() {
  const MONGODB_URI = process.env.MONGODB_URI
  const MONGODB_DB_NAME = process.env.MONGODB_DB_NAME || "college-linkedin"

  if (!MONGODB_URI) {
    throw new Error(
      "Please define the MONGODB_URI environment variable (add it to .env.local for local development or set it in your deployment provider)"
    )
  }

  if (cachedClient && cachedDb) {
    return { client: cachedClient, db: cachedDb }
  }

  const options: MongoClientOptions = {
    serverSelectionTimeoutMS: 5000,
    retryWrites: true,
    appName: "buddy-connect",
  }
  const client = new MongoClient(MONGODB_URI, options)
  await client.connect()
  const db = client.db(MONGODB_DB_NAME)

  cachedClient = client
  cachedDb = db

  return { client, db }
}

export async function getDatabase() {
  const { db } = await connectToDatabase()
  return db
}
