import { MongoClient, type Db, MongoClientOptions } from "mongodb"

let cachedClient: MongoClient | null = null
let cachedDb: Db | null = null
let connectionTimeout: NodeJS.Timeout | null = null
let lastConnectionAttempt = 0
let connectionAttemptCount = 0
let silenceErrors = false // Suppress repetitive error logs

const HEALTH_CHECK_INTERVAL = 30000 // 30 seconds
const CONNECTION_TIMEOUT = 10000 // Reduced from 30s to 10s for faster fallback
const MIN_RETRY_DELAY = 5000 // Wait 5s before retrying
const ERROR_SILENCE_DURATION = 60000 // Suppress logs for 60s after first error

export async function connectToDatabase() {
  const MONGODB_URI = process.env.MONGODB_URI
  const MONGODB_DB_NAME = process.env.MONGODB_DB_NAME || "college-linkedin"

  if (!MONGODB_URI) {
    throw new Error(
      "Please define the MONGODB_URI environment variable (add it to .env.local for local development or set it in your deployment provider)"
    )
  }

  const now = Date.now()
  
  // Prevent connection spam - wait at least MIN_RETRY_DELAY between attempts
  if (now - lastConnectionAttempt < MIN_RETRY_DELAY && connectionAttemptCount > 0) {
    if (cachedDb) {
      return { client: cachedClient!, db: cachedDb }
    }
    throw new Error("Connection attempt too soon after last failure - using fallback")
  }

  // Check if cached connection is still valid
  if (cachedClient && cachedDb) {
    try {
      // Quick ping to verify connection (5s timeout)
      await Promise.race([
        cachedDb.admin().ping(),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Ping timeout')), 5000))
      ])
      connectionAttemptCount = 0 // Reset on successful ping
      return { client: cachedClient, db: cachedDb }
    } catch (error) {
      // Connection is dead, clear cache
      if (!silenceErrors && connectionAttemptCount === 0) {
        console.warn("[MongoDB] Cached connection is stale, attempting reconnect...")
      }
      try {
        await cachedClient.close()
      } catch (e) {
        // Ignore close errors
      }
      cachedClient = null
      cachedDb = null
    }
  }

  lastConnectionAttempt = now
  connectionAttemptCount++

  const options: MongoClientOptions = {
    // Connection timeouts - faster for dev fallback
    serverSelectionTimeoutMS: CONNECTION_TIMEOUT,
    socketTimeoutMS: CONNECTION_TIMEOUT,
    connectTimeoutMS: CONNECTION_TIMEOUT,
    
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
    connectionAttemptCount = 0 // Reset on success
    silenceErrors = false
    
    console.log("[MongoDB] ✓ Connected successfully")
    
    // Set up periodic health check
    if (!connectionTimeout) {
      setupHealthCheck()
    }
    
    return { client, db }
  } catch (error) {
    // Suppress repetitive error logs after first error
    if (!silenceErrors) {
      console.error("[MongoDB] ✗ Connection failed - using mock data fallback")
      console.error(`[MongoDB] Error: ${error instanceof Error ? error.message : String(error)}`)
      silenceErrors = true
      
      // Unsuppress after ERROR_SILENCE_DURATION
      setTimeout(() => {
        silenceErrors = false
      }, ERROR_SILENCE_DURATION)
    }
    
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
