export async function fetchPetsForUser(userId) {
  const res = await fetch(`/api/pets?user_id=${encodeURIComponent(userId)}`)
  if (!res.ok) throw new Error('Failed to load pets')
  const data = await res.json()
  return Array.isArray(data)
    ? data.map((pet) => ({
      id: pet.id,
      name: pet.name,
      breed: pet.breed,
      age: pet.age,
      images: pet.image_url ? [pet.image_url] : [],
    }))
    : []
}

export async function fetchLikedPetsForUser(userId) {
  const res = await fetch(`/api/liked-pets?user_id=${encodeURIComponent(userId)}`)
  if (!res.ok) return []
  const data = await res.json()
  return Array.isArray(data)
    ? data.map((pet) => ({
      id: pet.id,
      name: pet.name,
      breed: pet.breed,
      age: pet.age,
      images: pet.image_url ? [pet.image_url] : [],
    }))
    : []
}

export async function fetchPreviewPets() {
  const res = await fetch('/api/preview-pets')
  if (!res.ok) return []
  const data = await res.json()
  return Array.isArray(data)
    ? data.map((pet) => ({
      id: pet.id,
      name: pet.name,
      breed: pet.breed,
      age: pet.age,
      images: pet.image_url ? [pet.image_url] : [],
    }))
    : []
}

export async function recordSelection({ user_id, pet_id, did_like }) {
  const res = await fetch('/api/selections', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ user_id, pet_id, did_like }),
  })
  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    throw new Error(data?.error || 'Failed to record selection')
  }
  return res.json()
}
