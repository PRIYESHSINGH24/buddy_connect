import { MongoClient, type Db, MongoClientOptions } from "mongodb"

const MONGODB_URI = process.env.MONGODB_URI
const MONGODB_DB_NAME = process.env.MONGODB_DB_NAME || "college-linkedin"

const options: MongoClientOptions = {
  // Connection pooling — env-configurable per deployment
  // Default 10 (not 50) to stay safe on Atlas free tier (500 conn limit)
  maxPoolSize: parseInt(process.env.MONGO_MAX_POOL_SIZE || "10", 10),
  minPoolSize: parseInt(process.env.MONGO_MIN_POOL_SIZE || "2", 10),
  maxIdleTimeMS: parseInt(process.env.MONGO_MAX_IDLE_MS || "30000", 10),
  
  // Retry settings
  retryWrites: true,
  retryReads: true,
  
  // Read preference — distribute reads to secondaries when available
  readPreference: (process.env.MONGO_READ_PREFERENCE as any) || "primaryPreferred",
  
  // Performance settings
  appName: "buddy-connect",
  
  // Connection monitoring disabled to save resources
  monitorCommands: false,
}

let clientPromise: Promise<MongoClient> | null = null

function getClientPromise(): Promise<MongoClient> {
  const uri = process.env.MONGODB_URI
  if (!uri) {
    throw new Error(
      "Please define the MONGODB_URI environment variable (add it to .env.local for local development or set it in your deployment provider)"
    )
  }

  if (clientPromise) return clientPromise

  if (process.env.NODE_ENV === "development") {
    let globalWithMongo = global as typeof globalThis & {
      _mongoClientPromise?: Promise<MongoClient>
    }

    if (!globalWithMongo._mongoClientPromise) {
      const client = new MongoClient(uri, options)
      globalWithMongo._mongoClientPromise = client.connect()
    }
    clientPromise = globalWithMongo._mongoClientPromise as Promise<MongoClient>
  } else {
    const client = new MongoClient(uri, options)
    clientPromise = client.connect()
  }

  return clientPromise
}

export async function connectToDatabase() {
  const connectedClient = await getClientPromise()
  const db = connectedClient.db(MONGODB_DB_NAME)
  return { client: connectedClient, db }
}

export async function getDatabase(): Promise<Db> {
  const { db } = await connectToDatabase()
  return db
}

export async function closeConnection() {
  if (clientPromise) {
    const client = await clientPromise
    await client.close()
    clientPromise = null
  }
}
