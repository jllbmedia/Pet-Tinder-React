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

// Neon serverless SQL helper
const sql = neon(process.env.DATABASE_URL)

app.use(cors())
app.use(express.json())

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

    const pets = await sql`
      SELECT p.id, p.name, p.breed, p.age, p.image_url, p.created_at
      FROM public.pets p
      WHERE p.id NOT IN (
        SELECT pet_id FROM public.user_selections WHERE user_id = ${userId}
      )
      ORDER BY p.created_at DESC
      LIMIT 50
    `

    return res.json(pets ?? [])
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: 'Failed to fetch pets' })
  }
})

// Record a user selection (like or pass)
app.post('/api/selections', async (req, res) => {
  try {
    const { user_id: userId, pet_id: petId, did_like } = req.body
    if (!userId || !petId || typeof did_like !== 'boolean') return res.status(400).json({ error: 'Missing required fields' })

    await sql`
      INSERT INTO public.user_selections (user_id, pet_id, did_like)
      VALUES (${userId}, ${petId}, ${did_like})
      ON CONFLICT (user_id, pet_id) DO NOTHING
    `

    return res.json({ ok: true })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: 'Failed to record selection' })
  }
})

if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
  app.listen(port, () => {
    console.log(`Better Auth backend listening on http://localhost:${port}`)
  })
}

export default app;
