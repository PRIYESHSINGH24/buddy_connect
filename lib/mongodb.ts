import { MongoClient, type Db, MongoClientOptions } from "mongodb"

let cachedClient: MongoClient | null = null
let cachedDb: Db | null = null
let connectionTimeout: NodeJS.Timeout | null = null

const HEALTH_CHECK_INTERVAL = 30000 // 30 seconds
const CONNECTION_TIMEOUT = 30000 // 30 seconds

export async function connectToDatabase() {
  const MONGODB_URI = process.env.MONGODB_URI
  const MONGODB_DB_NAME = process.env.MONGODB_DB_NAME || "college-linkedin"

  if (!MONGODB_URI) {
    throw new Error(
      "Please define the MONGODB_URI environment variable (add it to .env.local for local development or set it in your deployment provider)"
    )
  }

  // Check if cached connection is still valid
  if (cachedClient && cachedDb) {
    try {
      // Quick ping to verify connection
      await Promise.race([
        cachedDb.admin().ping(),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Ping timeout')), 5000))
      ])
      return { client: cachedClient, db: cachedDb }
    } catch (error) {
      // Connection is dead or timeout, clear cache
      console.warn("[MongoDB] Cached connection is stale, reconnecting...")
      try {
        await cachedClient.close()
      } catch (e) {
        // Ignore close errors
      }
      cachedClient = null
      cachedDb = null
    }
  }

  const options: MongoClientOptions = {
    // Connection timeouts
    serverSelectionTimeoutMS: CONNECTION_TIMEOUT,
    socketTimeoutMS: 30000,
    connectTimeoutMS: 10000,
    
    // Connection pooling - optimized for high concurrency
    maxPoolSize: 50,
    minPoolSize: 5,
    maxIdleTimeMS: 60000,
    
    // Retry settings
    retryWrites: true,
    retryReads: true,
    
    // Performance settings
    appName: "buddy-connect",
    
    // Connection monitoring
    monitorCommands: false,
  }

  try {
    const client = new MongoClient(MONGODB_URI, options)
    
    // Connect with timeout
    await Promise.race([
      client.connect(),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Connection timeout')), CONNECTION_TIMEOUT)
      )
    ])
    
    const db = client.db(MONGODB_DB_NAME)
    
    // Verify connection
    await db.admin().ping()
    
    cachedClient = client
    cachedDb = db
    
    console.log("[MongoDB] Connected successfully")
    
    // Set up periodic health check
    if (!connectionTimeout) {
      setupHealthCheck()
    }
    
    return { client, db }
  } catch (error) {
    console.error("[MongoDB] Connection failed:", error)
    throw error
  }
}

function setupHealthCheck() {
  connectionTimeout = setInterval(async () => {
    if (cachedDb) {
      try {
        await Promise.race([
          cachedDb.admin().ping(),
          new Promise((_, reject) => setTimeout(() => reject(new Error('Health check timeout')), 5000))
        ])
      } catch (error) {
        console.warn("[MongoDB] Health check failed, clearing cache")
        cachedClient = null
        cachedDb = null
      }
    }
  }, HEALTH_CHECK_INTERVAL)
}

export async function getDatabase() {
  const { db } = await connectToDatabase()
  return db
}

export async function closeConnection() {
  if (cachedClient) {
    try {
      await cachedClient.close()
      cachedClient = null
      cachedDb = null
      if (connectionTimeout) {
        clearInterval(connectionTimeout)
        connectionTimeout = null
      }
      console.log("[MongoDB] Connection closed")
    } catch (error) {
      console.error("[MongoDB] Error closing connection:", error)
    }
  }
}
