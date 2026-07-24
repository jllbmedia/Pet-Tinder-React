import dotenv from 'dotenv'
import { neon } from '@neondatabase/serverless'

dotenv.config({ path: '.env.local' })
const sql = neon(process.env.DATABASE_URL)

async function seedPets() {
  console.log('Fetching 50 pets from worker API...')
  const res = await fetch('https://pet.btholt.workers.dev/pets/random/50')
  const data = await res.json()
  const apiPets = data.pets || []
  console.log(`Fetched ${apiPets.length} pets from API.`)

  let inserted = 0
  for (const pet of apiPets) {
    try {
      const img = pet.image || (pet.images && pet.images[0]) || 'https://images.unsplash.com/photo-1552053831-71594a27632d'
      await sql`
        INSERT INTO public.pets (name, breed, age, image_url)
        VALUES (${pet.name}, ${pet.breed || 'Mixed'}, ${typeof pet.age === 'number' ? pet.age : 2}, ${img})
      `
      inserted++
    } catch (e) {
      console.error('Error inserting pet:', e.message)
    }
  }
  console.log(`Successfully inserted ${inserted} new pets into database!`)
  const total = await sql.query('SELECT count(*) FROM public.pets')
  console.log('Total pets in DB now:', total[0].count)
}

seedPets().catch(console.error)
