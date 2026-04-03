'use client'
import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { calculateScore, getCategory, CATEGORY_COLORS, FestivalConfig } from '@/lib/score'


type Rating = { artist_id: string; user_id: string; interest?: number; priority?: number; curiosity?: number; already_seen?: boolean }
type Member = { user_id: string; display_name: string }
type SpotifyData = {
  id: string
  name: string
  image: string | null
  genres: string[]
  url: string
  topTracks: {
    id: string
    name: string
    preview_url: string | null
    duration_ms: number
    album_image: string | null
  }[]
}

function NumberPicker({ label, value, max, onChange }: { label: string, value: number, max: number, onChange: (v: number) => void }) {
  return (
    <div>
      <p className="text-xs text-[#666] font-bold uppercase tracking-wide mb-1.5">{label}</p>
      <div className="flex gap-1 flex-wrap">
        {Array.from({ length: max }, (_, i) => i + 1).map(n => (
          <button
            key={n}
            onClick={() => onChange(value === n ? 0 : n)}
            className={`w-8 h-8 rounded-lg text-sm font-bold transition ${value === n ? 'bg-[#1A1A1A] text-white' : 'bg-[#F5F0E8] text-[#666] hover:bg-[#E0D9CC]'}`}
          >
            {n}
          </button>
        ))}
      </div>
    </div>
  )
}

function TrackRow({ track }: {
  track: { id: string; name: string; preview_url: string | null; duration_ms: number; album_image: string | null }
}) {
  const [playing, setPlaying] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  function togglePlay(e: React.MouseEvent) {
    e.stopPropagation()
    if (!track.preview_url) return

    if (!audioRef.current) {
      audioRef.current = new Audio(track.preview_url)
      audioRef.current.onended = () => setPlaying(false)
    }

    if (playing) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
      setPlaying(false)
    } else {
      // Ferma tutti gli altri audio
      document.querySelectorAll('audio').forEach(a => a.pause())
      audioRef.current.play()
      setPlaying(true)
    }
  }

  const minutes = Math.floor(track.duration_ms / 60000)
  const seconds = Math.floor((track.duration_ms % 60000) / 1000)

  return (
    <div className="flex items-center gap-2">
      {track.album_image && (
        <img src={track.album_image} alt="" className="w-8 h-8 rounded flex-shrink-0" />
      )}
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold truncate">{track.name}</p>
        <p className="text-[10px] text-[#999]">{minutes}:{String(seconds).padStart(2, '0')}</p>
      </div>
      <button
        onClick={togglePlay}
        className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition ${
          track.preview_url
            ? playing
              ? 'bg-[#1DB954] text-white'
              : 'bg-[#F5F0E8] text-[#666] hover:bg-[#E0D9CC]'
            : 'bg-[#F5F0E8] text-[#CCC] cursor-not-allowed'
        }`}
        title={track.preview_url ? 'Ascolta preview' : 'Preview non disponibile'}
      >
        {playing ? '⏹' : '▶'}
      </button>
    </div>
  )
}

type Plan = { artist_id: string; user_id: string }

export default function ArtistCard({ artist, ratings, members, userId, groupId, festivalId, config, onRate, plans, onPlanChange }: {
  artist: { id: string; name: string; day_label?: string | null; event_type?: string | null }
  ratings: Rating[]
  members: Member[]
  userId: string
  groupId?: string
  festivalId?: string
  config: FestivalConfig
  onRate: (r: Omit<Rating, 'artist_id' | 'user_id'>) => void
  plans?: Plan[]
  onPlanChange?: (artistId: string, inPlan: boolean) => void
}) {
  const [open, setOpen] = useState(false)
  const [spotify, setSpotify] = useState<SpotifyData | null>(null)
  const [loadingSpotify, setLoadingSpotify] = useState(false)
  const supabase = createClient()

  const myRating = ratings.find(r => r.user_id === userId)
  const [interest, setInterest] = useState(myRating?.interest ?? 0)
  const [priority, setPriority] = useState(myRating?.priority ?? 0)
  const [curiosity, setCuriosity] = useState(myRating?.curiosity ?? 0)
  const [alreadySeen, setAlreadySeen] = useState(myRating?.already_seen ?? false)
  const [saving, setSaving] = useState(false)

  const score = calculateScore(ratings, config)
  const category = getCategory(score, config)
  const hasMyVote = myRating && (myRating.interest || myRating.priority || myRating.curiosity)
  const otherRatings = ratings.filter(r => r.user_id !== userId)

  const isInMyPlan = plans?.some(p => p.artist_id === artist.id && p.user_id === userId) ?? false
const membersInPlan = members.filter(m => plans?.some(p => p.artist_id === artist.id && p.user_id === m.user_id))
const [inPlan, setInPlan] = useState(isInMyPlan)
const [savingPlan, setSavingPlan] = useState(false)

async function togglePlan(e: React.MouseEvent) {
  e.stopPropagation()
  if (!groupId || !festivalId) return
  setSavingPlan(true)
  if (inPlan) {
    await supabase.from('plans')
      .delete()
      .eq('group_id', groupId)
      .eq('user_id', userId)
      .eq('artist_id', artist.id)
    setInPlan(false)
    onPlanChange?.(artist.id, false)
  } else {
    await supabase.from('plans').insert({
      group_id: groupId,
      festival_id: festivalId,
      user_id: userId,
      artist_id: artist.id,
    })
    setInPlan(true)
    onPlanChange?.(artist.id, true)
  }
  setSavingPlan(false)
}

  useEffect(() => {
    if (!open || spotify || loadingSpotify) return
    setLoadingSpotify(true)
    fetch(`/api/spotify?artist=${encodeURIComponent(artist.name)}`)
      .then(r => r.json())
      .then(data => { setSpotify(data); setLoadingSpotify(false) })
      .catch(() => setLoadingSpotify(false))
  }, [open])

  async function saveRating() {
    setSaving(true)
    const { data: artistData } = await supabase.from('artists').select('festival_id').eq('id', artist.id).single()
    await supabase.from('ratings').upsert({
      artist_id: artist.id, user_id: userId,
      festival_id: artistData?.festival_id,
      interest, priority, curiosity, already_seen: alreadySeen,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'artist_id,user_id,group_id' })
    onRate({ interest, priority, curiosity, already_seen: alreadySeen })
    setSaving(false)
    setOpen(false)
  }

  return (
    <div className={`bg-white border rounded-2xl overflow-hidden transition ${open ? 'border-[#1A1A1A]' : hasMyVote ? 'border-[#E0D9CC]' : 'border-[#E0D9CC] border-dashed'}`}>
      <div
        className="flex items-center gap-3 p-3 cursor-pointer hover:bg-[#F5F0E8] transition"
        onClick={() => setOpen(!open)}
      >
        {/* Score badge */}
        <div className={`flex-shrink-0 w-14 h-14 rounded-xl flex flex-col items-center justify-center border font-black ${score > 0 ? CATEGORY_COLORS[category] : 'bg-[#F5F0E8] text-[#CCC] border-[#E0D9CC]'}`}>
          <span className="text-lg leading-none">{score > 0 ? score : '—'}</span>
          {score > 0 && <span className="text-[9px] leading-none mt-0.5 opacity-75">{category}</span>}
        </div>

        {/* Nome */}
        <div className="flex-1 min-w-0">
          <p className="font-black uppercase tracking-tight truncate">{artist.name}</p>
          <div className="flex items-center gap-2 mt-0.5 flex-wrap">
            {artist.day_label && <span className="text-xs text-[#999]">{artist.day_label}</span>}
            {!hasMyVote && <span className="text-xs text-[#999] italic">non votato</span>}
            {hasMyVote && (
              <span className="text-xs text-[#666]">
                I:{myRating?.interest ?? 0} P:{myRating?.priority ?? 0} C:{myRating?.curiosity ?? 0}
              </span>
            )}
            {membersInPlan.length > 0 && (
              <div className="flex gap-1">
                {membersInPlan.map(m => (
                  <span key={m.user_id} className={`text-[10px] font-black px-1.5 py-0.5 rounded-lg ${m.user_id === userId ? 'bg-[#C8F135] text-[#1A1A1A]' : 'bg-[#1A1A1A] text-white'}`}>
                    {m.display_name}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={togglePlan}
            disabled={savingPlan}
            className={`text-xs font-black px-2.5 py-1.5 rounded-xl transition ${inPlan ? 'bg-[#C8F135] text-[#1A1A1A]' : 'bg-[#F5F0E8] text-[#999] hover:bg-[#E0D9CC]'}`}
          >
            {savingPlan ? '...' : inPlan ? '✓ Ci vado' : '+ Piano'}
          </button>
          <span className="text-[#CCC] text-sm">{open ? '▲' : '▼'}</span>
        </div>

        <span className="text-[#CCC] text-sm">{open ? '▲' : '▼'}</span>
      </div>

      {open && (
        <div className="border-t border-[#E0D9CC] bg-[#FDFCF9]">
          {/* Spotify banner */}
          {loadingSpotify && (
            <div className="h-24 bg-[#F5F0E8] animate-pulse flex items-center justify-center">
              <span className="text-xs text-[#999]">Caricamento Spotify...</span>
            </div>
          )}
          {spotify && (
  <div className="border-b border-[#E0D9CC]">
    <div className="flex gap-3 p-3">
      {spotify.image && (
        <img
          src={spotify.image}
          alt={spotify.name}
          className="w-16 h-16 rounded-xl object-cover flex-shrink-0"
        />
      )}
      <div className="flex items-center">
        
        <a  href={spotify.url}
          target="_blank"
          rel="noopener noreferrer"
          onClick={e => e.stopPropagation()}
          className="inline-flex items-center gap-1.5 bg-[#1DB954] text-white text-xs font-black px-3 py-1.5 rounded-xl hover:bg-[#1aa34a] transition"
        >
          {'▶'} Apri su Spotify
        </a>
      </div>
    </div>
  </div>
)}
              

          <div className="p-4 space-y-4">
            {/* Voti degli altri */}
            {otherRatings.length > 0 && (
              <div className="space-y-1.5">
                {otherRatings.map(r => {
                  const member = members.find(m => m.user_id === r.user_id)
                  return (
                    <div key={r.user_id} className="flex items-center gap-3 text-xs bg-[#F5F0E8] rounded-xl px-3 py-2">
                      <span className="font-black uppercase tracking-wide text-[#1A1A1A]">{member?.display_name ?? 'Utente'}</span>
                      <span className="text-[#666]">Int: <strong>{r.interest ?? '—'}</strong></span>
                      <span className="text-[#666]">Pri: <strong>{r.priority ?? '—'}</strong></span>
                      <span className="text-[#666]">Cur: <strong>{r.curiosity ?? '—'}</strong></span>
                      {r.already_seen && <span className="ml-auto bg-[#1A1A1A] text-white px-1.5 py-0.5 rounded text-[10px] font-bold">GIÀ VISTO</span>}
                    </div>
                  )
                })}
              </div>
            )}

            {/* Il tuo voto */}
            <div className="space-y-4">
              <p className="text-xs font-black uppercase tracking-widest text-[#999]">Il tuo voto</p>
              <NumberPicker label="Interesse (1-10)" value={interest} max={10} onChange={setInterest} />
              <NumberPicker label="Priorità (1-5)" value={priority} max={5} onChange={setPriority} />
              <NumberPicker label="Curiosità (1-5)" value={curiosity} max={5} onChange={setCuriosity} />
              <label className="flex items-center gap-2 cursor-pointer">
                <div
                  onClick={() => setAlreadySeen(!alreadySeen)}
                  className={`w-10 h-6 rounded-full transition-colors flex items-center px-1 ${alreadySeen ? 'bg-[#1A1A1A]' : 'bg-[#E0D9CC]'}`}
                >
                  <div className={`w-4 h-4 bg-white rounded-full transition-transform ${alreadySeen ? 'translate-x-4' : 'translate-x-0'}`} />
                </div>
                <span className="text-sm font-semibold">L'ho già visto live</span>
              </label>
            </div>

            <button
              onClick={saveRating}
              disabled={saving}
              className="w-full bg-[#1A1A1A] hover:bg-[#333] text-white disabled:opacity-40 rounded-xl py-2.5 text-sm font-black uppercase tracking-wide transition"
            >
              {saving ? '...' : 'Salva voto'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}