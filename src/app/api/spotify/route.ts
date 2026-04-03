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

    // Cerca artista
    const searchRes = await fetch(
      `https://api.spotify.com/v1/search?q=${encodeURIComponent(artist)}&type=artist&limit=1`,
      { headers: { 'Authorization': `Bearer ${token}` } }
    )
    const searchData = await searchRes.json()
    const found = searchData.artists?.items?.[0]
    if (!found) return NextResponse.json(null)

    // Recupera top tracks
    const tracksRes = await fetch(
      `https://api.spotify.com/v1/artists/${found.id}/top-tracks?market=IT`,
      { headers: { 'Authorization': `Bearer ${token}` } }
    )
    const tracksData = await tracksRes.json()
    const topTracks = (tracksData.tracks ?? []).slice(0, 5).map((t: any) => ({
      id: t.id,
      name: t.name,
      preview_url: t.preview_url,
      duration_ms: t.duration_ms,
      album_image: t.album?.images?.[2]?.url ?? t.album?.images?.[0]?.url ?? null,
    }))

    return NextResponse.json({
      id: found.id,
      name: found.name,
      image: found.images?.[1]?.url ?? found.images?.[0]?.url ?? null,
      genres: found.genres?.slice(0, 3) ?? [],
      url: found.external_urls?.spotify,
      topTracks,
    })
  } catch (e) {
    return NextResponse.json({ error: 'Spotify error' }, { status: 500 })
  }
}