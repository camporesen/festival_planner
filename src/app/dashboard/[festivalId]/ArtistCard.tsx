'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { calculateScore, getCategory, CATEGORY_COLORS, FestivalConfig } from '@/lib/score'

type Rating = { artist_id: string; user_id: string; interest?: number; priority?: number; curiosity?: number; already_seen?: boolean }
type Member = { user_id: string; display_name: string }

export default function ArtistCard({ artist, ratings, members, userId, config, onRate }: {
  artist: { id: string; name: string; day_label?: string | null; event_type?: string | null }
  ratings: Rating[]
  members: Member[]
  userId: string
  config: FestivalConfig
  onRate: (r: Omit<Rating, 'artist_id' | 'user_id'>) => void
}) {
  const [open, setOpen] = useState(false)
  const supabase = createClient()

  const myRating = ratings.find(r => r.user_id === userId)
  const [interest, setInterest] = useState(myRating?.interest ?? 0)
  const [priority, setPriority] = useState(myRating?.priority ?? 0)
  const [curiosity, setCuriosity] = useState(myRating?.curiosity ?? 0)
  const [alreadySeen, setAlreadySeen] = useState(myRating?.already_seen ?? false)
  const [saving, setSaving] = useState(false)

  const score = calculateScore(ratings, config)
  const category = getCategory(score, config)

  async function saveRating() {
    setSaving(true)
    const data = { artist_id: artist.id, user_id: userId, festival_id: undefined, interest, priority, curiosity, already_seen: alreadySeen }
    
    // Recupera festival_id dall'artista
    const { data: artistData } = await supabase.from('artists').select('festival_id').eq('id', artist.id).single()
    
    await supabase.from('ratings').upsert({
      ...data,
      festival_id: artistData?.festival_id,
      updated_at: new Date().toISOString(),
    })
    onRate({ interest, priority, curiosity, already_seen: alreadySeen })
    setSaving(false)
    setOpen(false)
  }

  const otherRatings = ratings.filter(r => r.user_id !== userId)

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
      <div
        className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-800/50 transition"
        onClick={() => setOpen(!open)}
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className="min-w-0">
            <p className="font-medium truncate">{artist.name}</p>
            {artist.day_label && <p className="text-xs text-gray-500">{artist.day_label}</p>}
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {score > 0 && <span className="text-sm font-mono text-gray-300">{score}</span>}
          <span className={`text-xs px-2 py-0.5 rounded-lg border font-semibold ${CATEGORY_COLORS[category]}`}>
            {score > 0 ? category : '—'}
          </span>
          <span className="text-gray-600 text-sm">{open ? '▲' : '▼'}</span>
        </div>
      </div>

      {open && (
        <div className="border-t border-gray-800 p-4 space-y-4">
          {/* Voti degli altri membri */}
          {otherRatings.length > 0 && (
            <div className="space-y-1">
              {otherRatings.map(r => {
                const member = members.find(m => m.user_id === r.user_id)
                return (
                  <div key={r.user_id} className="flex items-center gap-3 text-xs text-gray-400">
                    <span className="font-medium text-gray-300">{member?.display_name ?? 'Utente'}</span>
                    <span>Int: {r.interest ?? '—'}</span>
                    <span>Pri: {r.priority ?? '—'}</span>
                    <span>Cur: {r.curiosity ?? '—'}</span>
                    {r.already_seen && <span className="text-indigo-400">già visto</span>}
                  </div>
                )
              })}
            </div>
          )}

          {/* I tuoi voti */}
          <div className="space-y-3">
            <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">Il tuo voto</p>

            <div>
              <div className="flex justify-between text-xs text-gray-400 mb-1">
                <span>Interesse</span><span>{interest}/10</span>
              </div>
              <input type="range" min={0} max={10} value={interest} onChange={e => setInterest(+e.target.value)}
                className="w-full accent-indigo-500" />
            </div>

            <div>
              <div className="flex justify-between text-xs text-gray-400 mb-1">
                <span>Priorità</span><span>{priority}/5</span>
              </div>
              <input type="range" min={0} max={5} value={priority} onChange={e => setPriority(+e.target.value)}
                className="w-full accent-indigo-500" />
            </div>

            <div>
              <div className="flex justify-between text-xs text-gray-400 mb-1">
                <span>Curiosità</span><span>{curiosity}/5</span>
              </div>
              <input type="range" min={0} max={5} value={curiosity} onChange={e => setCuriosity(+e.target.value)}
                className="w-full accent-indigo-500" />
            </div>

            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input type="checkbox" checked={alreadySeen} onChange={e => setAlreadySeen(e.target.checked)}
                className="accent-indigo-500 w-4 h-4" />
              <span className="text-gray-300">L'ho già visto live</span>
            </label>
          </div>

          <button
            onClick={saveRating}
            disabled={saving}
            className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 rounded-xl py-2 text-sm font-semibold transition"
          >
            {saving ? 'Salvando...' : 'Salva voto'}
          </button>
        </div>
      )}
    </div>
  )
}