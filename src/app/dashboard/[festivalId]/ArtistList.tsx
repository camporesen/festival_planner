'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { calculateScore, getCategory, CATEGORY_COLORS, DEFAULT_CONFIG, FestivalConfig } from '@/lib/score'
import ArtistCard from './ArtistCard'
import AddArtistButton from './AddArtistButton'

type Artist = { id: string; name: string; day: string | null; day_label: string | null; event_type: string | null }
type Rating = { artist_id: string; user_id: string; interest?: number; priority?: number; curiosity?: number; already_seen?: boolean }
type Member = { user_id: string; display_name: string }

export default function ArtistList({
  festivalId, userId, artists: initialArtists, ratings: initialRatings, members, config: rawConfig
}: {
  festivalId: string
  userId: string
  artists: Artist[]
  ratings: Rating[]
  members: Member[]
  config: any
}) {
  const [artists, setArtists] = useState(initialArtists)
  const [ratings, setRatings] = useState(initialRatings)
  const [selectedDay, setSelectedDay] = useState<string | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const supabase = createClient()

  const config: FestivalConfig = rawConfig ?? DEFAULT_CONFIG

  // Aggiorna i rating in realtime quando un altro membro vota
  useEffect(() => {
    const channel = supabase
      .channel('ratings-changes')
      .on('postgres_changes', {
        event: '*', schema: 'public', table: 'ratings',
        filter: `festival_id=eq.${festivalId}`
      }, payload => {
        if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
          setRatings(prev => {
            const filtered = prev.filter(r =>
              !(r.artist_id === (payload.new as Rating).artist_id && r.user_id === (payload.new as Rating).user_id)
            )
            return [...filtered, payload.new as Rating]
          })
        }
      })
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [festivalId])

  // Giorni unici
  const days = Array.from(new Set(artists.map(a => a.day).filter(Boolean))).sort() as string[]

  const filteredArtists = artists.filter(a => {
    if (selectedDay && a.day !== selectedDay) return false
    if (selectedCategory) {
      const artistRatings = ratings.filter(r => r.artist_id === a.id)
      const score = calculateScore(artistRatings, config)
      const cat = getCategory(score, config)
      if (cat !== selectedCategory) return false
    }
    return true
  }).sort((a, b) => {
    const scoreA = calculateScore(ratings.filter(r => r.artist_id === a.id), config)
    const scoreB = calculateScore(ratings.filter(r => r.artist_id === b.id), config)
    return scoreB - scoreA
  })

  function dayLabel(day: string) {
    const a = artists.find(a => a.day === day)
    if (a?.day_label) return a.day_label
    return new Date(day).toLocaleDateString('it-IT', { weekday: 'short', day: 'numeric', month: 'short' })
  }

  return (
    <div>
      {/* Filtro per giorno */}
      {days.length > 0 && (
        <div className="flex gap-2 overflow-x-auto pb-2 mb-3 scrollbar-hide">
          <button
            onClick={() => setSelectedDay(null)}
            className={`flex-shrink-0 px-3 py-1.5 rounded-xl text-sm font-medium transition ${!selectedDay ? 'bg-indigo-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}
          >
            Tutti
          </button>
          {days.map(day => (
            <button
              key={day}
              onClick={() => setSelectedDay(selectedDay === day ? null : day)}
              className={`flex-shrink-0 px-3 py-1.5 rounded-xl text-sm font-medium transition capitalize ${selectedDay === day ? 'bg-indigo-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}
            >
              {dayLabel(day)}
            </button>
          ))}
        </div>
      )}

      {/* Filtro per categoria */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-5 scrollbar-hide">
        {(['MUST SEE', 'ALTO', 'VALUTA', 'SKIP'] as const).map(cat => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(selectedCategory === cat ? null : cat)}
            className={`flex-shrink-0 px-3 py-1.5 rounded-xl text-xs font-semibold border transition ${selectedCategory === cat ? 'opacity-100 ring-2 ring-white/30' : 'opacity-60 hover:opacity-100'} ${CATEGORY_COLORS[cat]}`}
          >
            {cat}
          </button>
        ))}
        <AddArtistButton
          festivalId={festivalId}
          onAdd={artist => setArtists(prev => [...prev, artist])}
        />
      </div>

      {/* Lista artisti */}
      <div className="space-y-2">
        {filteredArtists.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <p className="text-3xl mb-2">🎵</p>
            <p>Nessun artista trovato.</p>
            {artists.length === 0 && <p className="text-sm mt-1">Aggiungi il primo artista con il pulsante +</p>}
          </div>
        )}
        {filteredArtists.map(artist => (
          <ArtistCard
            key={artist.id}
            artist={artist}
            ratings={ratings.filter(r => r.artist_id === artist.id)}
            members={members}
            userId={userId}
            config={config}
            onRate={newRating => {
              setRatings(prev => {
                const filtered = prev.filter(r => !(r.artist_id === artist.id && r.user_id === userId))
                return [...filtered, { ...newRating, artist_id: artist.id, user_id: userId }]
              })
            }}
          />
        ))}
      </div>
    </div>
  )
}