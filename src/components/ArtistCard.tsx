'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { calculateScore, getCategory, CATEGORY_COLORS, FestivalConfig } from '@/lib/score'
import { toast } from '@/components/Toast'

type Rating = { artist_id: string; user_id: string; interest?: number; priority?: number; curiosity?: number; already_seen?: boolean }
type Member = { user_id: string; display_name: string }
type SpotifyData = { id: string; name: string; image: string | null; genres: string[]; url: string; topTracks: any[] }
type Plan = { artist_id: string; user_id: string }

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
  const [showVoteInfo, setShowVoteInfo] = useState(false)
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

  useEffect(() => {
    const r = ratings.find(r => r.user_id === userId)
    if (r) {
      setInterest(r.interest ?? 0)
      setPriority(r.priority ?? 0)
      setCuriosity(r.curiosity ?? 0)
      setAlreadySeen(r.already_seen ?? false)
    }
  }, [ratings, userId])

  useEffect(() => {
    if (!open || spotify || loadingSpotify) return
    setLoadingSpotify(true)
    fetch(`/api/spotify?artist=${encodeURIComponent(artist.name)}`)
      .then(r => r.json())
      .then(data => { setSpotify(data); setLoadingSpotify(false) })
      .catch(() => setLoadingSpotify(false))
  }, [open])

  async function togglePlan(e: React.MouseEvent) {
  e.stopPropagation()
  if (!groupId || !festivalId) return
  setSavingPlan(true)
  try {
    if (inPlan) {
      const { error } = await supabase.from('plans')
        .delete()
        .eq('group_id', groupId)
        .eq('user_id', userId)
        .eq('artist_id', artist.id)
      if (error) throw error
      setInPlan(false)
      onPlanChange?.(artist.id, false)
    } else {
      const { error } = await supabase.from('plans').insert({
        group_id: groupId,
        festival_id: festivalId,
        user_id: userId,
        artist_id: artist.id,
      })
      if (error) throw error
      setInPlan(true)
      onPlanChange?.(artist.id, true)
    }
  } catch (e) {
    toast('Errore, riprova', 'error')
  }
  setSavingPlan(false)
}

  async function saveRating() {
  setSaving(true)
  try {
    const { data: artistData } = await supabase.from('artists').select('festival_id').eq('id', artist.id).single()
    const { error } = await supabase.from('ratings').upsert({
      artist_id: artist.id,
      user_id: userId,
      festival_id: artistData?.festival_id,
      group_id: groupId ?? null,
      interest,
      priority,
      curiosity,
      already_seen: alreadySeen,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'artist_id,user_id,group_id' })
    if (error) throw error
    onRate({ interest, priority, curiosity, already_seen: alreadySeen })
    toast('Voto salvato', 'success')
    setOpen(false)
  } catch (e) {
    toast('Errore nel salvataggio', 'error')
  }
  setSaving(false)
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

        {/* Piano + freccia */}
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
      </div>

      {open && (
        <div className="border-t border-[#E0D9CC] bg-[#FDFCF9]">
          {/* Spotify */}
          {loadingSpotify && (
            <div className="h-16 bg-[#F5F0E8] animate-pulse flex items-center justify-center">
              <span className="text-xs text-[#999]">Caricamento...</span>
            </div>
          )}
          {spotify && (
            <div className="border-b border-[#E0D9CC]">
              <div className="flex gap-3 p-3">
                {spotify.image && (
                  <img src={spotify.image} alt={spotify.name} className="w-16 h-16 rounded-xl object-cover flex-shrink-0" />
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
              <div className="flex items-center justify-between">
                <p className="text-xs font-black uppercase tracking-widest text-[#999]">Il tuo voto</p>
                <button
                  onClick={() => setShowVoteInfo(!showVoteInfo)}
                  className="text-xs text-[#999] hover:text-[#1A1A1A] transition flex items-center gap-1"
                >
                  {showVoteInfo ? '✕ chiudi' : 'ℹ️ come funziona'}
                </button>
              </div>

              {showVoteInfo && (
                <div className="bg-[#F5F0E8] rounded-xl p-3 space-y-2 text-xs">
                  <div className="flex items-start gap-2">
                    <span>🎯</span>
                    <div>
                      <p className="font-black text-[#1A1A1A]">Interesse (1-5)</p>
                      <p className="text-[#666]">Quanto ti piace l'artista in generale. È il peso maggiore nello score.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <span>⚡</span>
                    <div>
                      <p className="font-black text-[#1A1A1A]">Priorità (1-5)</p>
                      <p className="text-[#666]">Quanto è importante vederlo live — rarità, tour rari, momenti unici.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <span>🔍</span>
                    <div>
                      <p className="font-black text-[#1A1A1A]">Curiosità (1-5)</p>
                      <p className="text-[#666]">Quanto vuoi scoprirlo — artisti che non conosci bene ma vuoi esplorare.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <span>👁️</span>
                    <div>
                      <p className="font-black text-[#1A1A1A]">Già visto live</p>
                      <p className="text-[#666]">Se l'hai già visto, riduce leggermente il bonus "mai visto" nello score.</p>
                    </div>
                  </div>
                </div>
              )}

              <NumberPicker label="Interesse (1-5)" value={interest} max={5} onChange={setInterest} />
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