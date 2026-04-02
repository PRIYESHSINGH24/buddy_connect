import { MongoClient, type Db, MongoClientOptions } from "mongodb"

const MONGODB_URI = process.env.MONGODB_URI
const MONGODB_DB_NAME = process.env.MONGODB_DB_NAME || "college-linkedin"

if (!MONGODB_URI) {
  throw new Error(
    "Please define the MONGODB_URI environment variable (add it to .env.local for local development or set it in your deployment provider)"
  )
}

const options: MongoClientOptions = {
  // Connection pooling - optimized for high concurrency
  maxPoolSize: 50,
  minPoolSize: 5,
  maxIdleTimeMS: 60000,
  
  // Retry settings
  retryWrites: true,
  retryReads: true,
  
  // Performance settings
  appName: "buddy-connect",
  
  // Connection monitoring disabled to save resources
  monitorCommands: false,
}

let client: MongoClient
let clientPromise: Promise<MongoClient>

if (process.env.NODE_ENV === "development") {
  // In development mode, use a global variable so that the value
  // is preserved across module reloads caused by HMR (Hot Module Replacement).
  let globalWithMongo = global as typeof globalThis & {
    _mongoClientPromise?: Promise<MongoClient>
  }

  if (!globalWithMongo._mongoClientPromise) {
    client = new MongoClient(MONGODB_URI, options)
    globalWithMongo._mongoClientPromise = client.connect()
  }
  clientPromise = globalWithMongo._mongoClientPromise as Promise<MongoClient>
} else {
  // In production mode, it's best to not use a global variable.
  client = new MongoClient(MONGODB_URI, options)
  clientPromise = client.connect()
}

export async function connectToDatabase() {
  const connectedClient = await clientPromise
  const db = connectedClient.db(MONGODB_DB_NAME)
  return { client: connectedClient, db }
}

export async function getDatabase(): Promise<Db> {
  const { db } = await connectToDatabase()
  return db
}

export async function closeConnection() {
  // Provided for backwards compatibility, not strictly needed for serverless
  if (client) {
    await client.close()
  }
}
