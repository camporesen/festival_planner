import { NextRequest, NextResponse } from 'next/server'

async function getSpotifyToken(): Promise<string> {
  const credentials = Buffer.from(
    `${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`
  ).toString('base64')

  const res = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${credentials}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
    next: { revalidate: 3500 }
  })

  const data = await res.json()
  return data.access_token
}

export async function GET(request: NextRequest) {
  const artist = request.nextUrl.searchParams.get('artist')
  if (!artist) return NextResponse.json({ error: 'Missing artist' }, { status: 400 })

  try {
    const token = await getSpotifyToken()

    const res = await fetch(
      `https://api.spotify.com/v1/search?q=${encodeURIComponent(artist)}&type=artist&limit=1`,
      { headers: { 'Authorization': `Bearer ${token}` } }
    )

    const data = await res.json()
    const found = data.artists?.items?.[0]

    if (!found) return NextResponse.json(null)

    return NextResponse.json({
      id: found.id,
      name: found.name,
      image: found.images?.[1]?.url ?? found.images?.[0]?.url ?? null,
      popularity: found.popularity,
      genres: found.genres?.slice(0, 3) ?? [],
      url: found.external_urls?.spotify,
      followers: found.followers?.total,
    })
  } catch (e) {
    return NextResponse.json({ error: 'Spotify error' }, { status: 500 })
  }
}