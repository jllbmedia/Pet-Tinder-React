import dotenv from 'dotenv'
import express from 'express'
import cors from 'cors'
import { betterAuth } from 'better-auth'
import { dash } from '@better-auth/infra'
import { toNodeHandler } from 'better-auth/node'
import { neon } from '@neondatabase/serverless'

dotenv.config({ path: '.env.local' })

const auth = betterAuth({
  plugins: [dash()]
})

const authHandler = toNodeHandler(auth)
const app = express()
const port = process.env.PORT || 5000

// Neon serverless SQL helper (safeguarded for missing env vars or missing SSL query params)
let sql = null
if (process.env.DATABASE_URL) {
  try {
    let dbUrl = process.env.DATABASE_URL
    if (!dbUrl.includes('sslmode=')) {
      dbUrl += (dbUrl.includes('?') ? '&' : '?') + 'sslmode=require'
    }
    sql = neon(dbUrl)
  } catch (initErr) {
    console.error('[Server Error] Failed to initialize Neon database client:', initErr)
  }
} else {
  console.warn('[Server Warning] DATABASE_URL is not configured. Falling back to local data only.')
}

app.use(cors())
app.use(express.json())

// Process-wide handlers to prevent serverless function crashes on unhandled errors
process.on('unhandledRejection', (reason, promise) => {
  console.error('[Server Error] Unhandled Rejection at:', promise, 'reason:', reason)
})
process.on('uncaughtException', (err) => {
  console.error('[Server Error] Uncaught Exception thrown:', err)
})

// Fallback pet data for graceful degradation
const FALLBACK_PETS = [
  {
    id: 'fallback-1',
    name: 'Bella',
    breed: 'Golden Retriever',
    age: 2,
    image_url: 'https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&q=80&w=600',
    created_at: new Date().toISOString()
  },
  {
    id: 'fallback-2',
    name: 'Charlie',
    breed: 'Tabby Cat',
    age: 1,
    image_url: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&q=80&w=600',
    created_at: new Date().toISOString()
  },
  {
    id: 'fallback-3',
    name: 'Max',
    breed: 'French Bulldog',
    age: 3,
    image_url: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&q=80&w=600',
    created_at: new Date().toISOString()
  },
  {
    id: 'fallback-4',
    name: 'Luna',
    breed: 'Siamese Cat',
    age: 4,
    image_url: 'https://images.unsplash.com/photo-1592194996308-7b43878e84a6?auto=format&fit=crop&q=80&w=600',
    created_at: new Date().toISOString()
  },
  {
    id: 'fallback-5',
    name: 'Rocky',
    breed: 'Beagle',
    age: 5,
    image_url: 'https://images.unsplash.com/photo-1505628346881-b72b27e84530?auto=format&fit=crop&q=80&w=600',
    created_at: new Date().toISOString()
  }
]

app.use('/api/auth', async (req, res, next) => {
  try {
    await authHandler(req, res)
  } catch (error) {
    next(error)
  }
})

app.use((err, req, res, next) => {
  console.error('[Better Auth] Error:', err)
  if (res.headersSent) {
    return next(err)
  }
  res.status(500).json({ error: 'Internal server error' })
})

// Fetch available pets for a user (exclude already-selected pets)
app.get('/api/pets', async (req, res) => {
  try {
    const userId = req.query.user_id
    if (!userId) return res.status(400).json({ error: 'user_id is required' })

    let pets = []
    if (sql) {
      try {
        pets = await sql`
          SELECT p.id, p.name, p.breed, p.age, p.image_url, p.created_at
          FROM public.pets p
          WHERE p.id::text NOT IN (
            SELECT pet_id::text FROM public.user_selections WHERE user_id = ${String(userId)}
          )
          ORDER BY p.created_at DESC
          LIMIT 50
        `
      } catch (dbErr) {
        console.error('[Database Error] Failed to fetch pets from Neon database:', dbErr.message || dbErr)
      }
    }

    // Degrade gracefully: return fallback pet data if the DB was offline or empty
    if (!pets || pets.length === 0) {
      console.log('[Info] Returning fallback mock pets to client.')
      return res.json(FALLBACK_PETS)
    }

    return res.json(pets)
  } catch (err) {
    console.error('[Server Error] Critical error in GET /api/pets:', err)
    return res.json(FALLBACK_PETS)
  }
})

// Record a user selection (like or pass)
app.post('/api/selections', async (req, res) => {
  try {
    const { user_id: userId, pet_id: petId, did_like } = req.body
    if (!userId || !petId || typeof did_like !== 'boolean') {
      return res.status(400).json({ error: 'Missing required fields' })
    }

    if (sql) {
      try {
        await sql`
          INSERT INTO public.user_selections (user_id, pet_id, did_like)
          VALUES (${String(userId)}, ${String(petId)}, ${did_like})
          ON CONFLICT (user_id, pet_id) DO NOTHING
        `
        return res.json({ ok: true })
      } catch (dbErr) {
        console.error('[Database Error] Failed to write selection to Neon database:', dbErr.message || dbErr)
        // Degrade gracefully: mock success so front-end flow is not interrupted
        return res.json({ ok: true, mocked: true })
      }
    }

    console.warn('[Server Warning] Database connection is missing, mock saving selection.')
    return res.json({ ok: true, mocked: true })
  } catch (err) {
    console.error('[Server Error] Critical error in POST /api/selections:', err)
    return res.json({ ok: true, mocked: true })
  }
})

if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
  app.listen(port, () => {
    console.log(`Better Auth backend listening on http://localhost:${port}`)
  })
}

export default app;
