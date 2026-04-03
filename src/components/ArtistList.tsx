'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { calculateScore, getCategory, CATEGORY_COLORS, DEFAULT_CONFIG, FestivalConfig } from '@/lib/score'
import ArtistCard from '@/components/ArtistCard'
import AddArtistButton from '@/components/AddArtistButton'
import ConflictsButton from '@/components/ConflictsButton'
import TimelineView from '@/components/TimelineView'

type Artist = { id: string; name: string; day: string | null; day_label: string | null; event_type: string | null; stage: string | null; start_time: string | null; end_time: string | null }
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
  const [showOnlyUnrated, setShowOnlyUnrated] = useState(false)
  const [selectedMembers, setSelectedMembers] = useState<string[]>(members.map(m => m.user_id))
  const supabase = createClient()
  const config: FestivalConfig = rawConfig ?? DEFAULT_CONFIG

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

  function toggleMember(uid: string) {
    setSelectedMembers(prev =>
      prev.includes(uid)
        ? prev.length === 1 ? prev : prev.filter(id => id !== uid)
        : [...prev, uid]
    )
  }

  function filteredRatingsForArtist(artistId: string) {
    return ratings.filter(r => r.artist_id === artistId && selectedMembers.includes(r.user_id))
  }

  // Rating filtrati per i conflitti — solo i membri selezionati
  const filteredRatings = ratings.filter(r => selectedMembers.includes(r.user_id))

  const days = Array.from(new Set(artists.map(a => a.day).filter(Boolean))).sort() as string[]

  const artistsForDay = selectedDay ? artists.filter(a => a.day === selectedDay) : artists
  const ratedInDay = artistsForDay.filter(a => {
    const myR = ratings.find(r => r.artist_id === a.id && r.user_id === userId)
    return myR && (myR.interest || myR.priority || myR.curiosity)
  }).length
  const totalInDay = artistsForDay.length
  const progressPct = totalInDay > 0 ? Math.round((ratedInDay / totalInDay) * 100) : 0

  const filteredArtists = artists.filter(a => {
    if (selectedDay && a.day !== selectedDay) return false
    const myRating = ratings.find(r => r.artist_id === a.id && r.user_id === userId)
    const hasMyVote = myRating && (myRating.interest || myRating.priority || myRating.curiosity)
    if (showOnlyUnrated && hasMyVote) return false
    if (selectedCategory) {
      const score = calculateScore(filteredRatingsForArtist(a.id), config)
      const cat = getCategory(score, config)
      if (cat !== selectedCategory) return false
    }
    return true
  }).sort((a, b) => {
    const scoreA = calculateScore(filteredRatingsForArtist(a.id), config)
    const scoreB = calculateScore(filteredRatingsForArtist(b.id), config)
    return scoreB - scoreA
  })

  function dayLabel(day: string) {
    const a = artists.find(a => a.day === day)
    if (a?.day_label) return a.day_label
    return new Date(day + 'T12:00:00').toLocaleDateString('it-IT', { weekday: 'short', day: 'numeric', month: 'short' })
  }

  function memberInitials(name: string) {
    return name.split(/[\s._-]/).map(p => p[0]?.toUpperCase() ?? '').join('').slice(0, 2)
  }

  return (
    <div>
      {/* Selettore membri */}
      {members.length > 1 && (
        <div className="mb-4">
          <p className="text-xs font-black uppercase tracking-widest text-[#999] mb-2">Score basato su</p>
          <div className="flex gap-2 flex-wrap">
            {members.map(m => {
              const isSelected = selectedMembers.includes(m.user_id)
              const isMe = m.user_id === userId
              return (
                <button
                  key={m.user_id}
                  onClick={() => toggleMember(m.user_id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-bold border transition ${
                    isSelected
                      ? 'bg-[#1A1A1A] text-white border-[#1A1A1A]'
                      : 'bg-white text-[#999] border-[#E0D9CC] hover:border-[#1A1A1A]'
                  }`}
                >
                  <span className={`w-5 h-5 rounded-lg flex items-center justify-center text-[10px] font-black flex-shrink-0 ${
                    isSelected ? 'bg-white/20 text-white' : 'bg-[#F5F0E8] text-[#666]'
                  }`}>
                    {memberInitials(m.display_name)}
                  </span>
                  {m.display_name}
                  {isMe && <span className="text-[10px] opacity-60">tu</span>}
                </button>
              )
            })}
            {selectedMembers.length < members.length && (
              <button
                onClick={() => setSelectedMembers(members.map(m => m.user_id))}
                className="px-3 py-1.5 rounded-xl text-xs font-bold border border-dashed border-[#E0D9CC] text-[#999] hover:border-[#1A1A1A] hover:text-[#1A1A1A] transition"
              >
                tutti
              </button>
            )}
          </div>
        </div>
      )}

      {/* Timeline */}
<div className="mb-4 flex gap-2">
  <ConflictsButton
    artists={artists}
    ratings={filteredRatings}
    config={config}
  />
  <TimelineView
    artists={artists}
    ratings={ratings}
    config={config}
    selectedMembers={selectedMembers}
  />
</div>

      {/* Filtro giorni */}
      {days.length > 0 && (
        <div className="flex gap-2 overflow-x-auto pb-2 mb-3 scrollbar-hide">
          <button
            onClick={() => setSelectedDay(null)}
            className={`flex-shrink-0 px-3 py-1.5 rounded-xl text-sm font-bold transition uppercase tracking-wide ${!selectedDay ? 'bg-[#1A1A1A] text-white' : 'bg-white text-[#666] border border-[#E0D9CC] hover:border-[#1A1A1A]'}`}
          >
            Tutti
          </button>
          {days.map(day => (
            <button
              key={day}
              onClick={() => setSelectedDay(selectedDay === day ? null : day)}
              className={`flex-shrink-0 px-3 py-1.5 rounded-xl text-sm font-bold transition uppercase tracking-wide capitalize ${selectedDay === day ? 'bg-[#1A1A1A] text-white' : 'bg-white text-[#666] border border-[#E0D9CC] hover:border-[#1A1A1A]'}`}
            >
              {dayLabel(day)}
            </button>
          ))}
        </div>
      )}

      {/* Barra progresso */}
      <div className="bg-white border border-[#E0D9CC] rounded-2xl p-4 mb-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-bold">{ratedInDay} / {totalInDay} artisti votati</span>
          <span className="text-sm font-black text-[#1A1A1A] bg-[#C8F135] px-2 py-0.5 rounded-lg">{progressPct}%</span>
        </div>
        <div className="h-2 bg-[#F5F0E8] rounded-full overflow-hidden">
          <div
            className="h-full bg-[#C8F135] rounded-full transition-all duration-500"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>

      {/* Filtri categoria + toggle */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-4 scrollbar-hide items-center">
        {(['MUST SEE', 'ALTO', 'VALUTA', 'SKIP'] as const).map(cat => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(selectedCategory === cat ? null : cat)}
            className={`flex-shrink-0 px-3 py-1.5 rounded-xl text-xs font-bold border-2 transition uppercase ${selectedCategory === cat ? `${CATEGORY_COLORS[cat]} border-[#1A1A1A]` : `${CATEGORY_COLORS[cat]} border-transparent opacity-50 hover:opacity-100`}`}
          >
            {cat}
          </button>
        ))}
        <button
          onClick={() => setShowOnlyUnrated(!showOnlyUnrated)}
          className={`flex-shrink-0 ml-auto px-3 py-1.5 rounded-xl text-xs font-bold border transition ${showOnlyUnrated ? 'bg-[#1A1A1A] text-white border-[#1A1A1A]' : 'bg-white text-[#666] border-[#E0D9CC] hover:border-[#1A1A1A]'}`}
        >
          Da votare
        </button>
        <AddArtistButton festivalId={festivalId} onAdd={artist => setArtists(prev => [...prev, artist])} />
      </div>

      {/* Lista artisti */}
      <div className="space-y-2">
        {filteredArtists.length === 0 && (
          <div className="text-center py-12 text-[#999]">
            <p className="text-3xl mb-2">{'🎵'}</p>
            <p className="font-medium">Nessun artista trovato.</p>
            {artists.length === 0 && <p className="text-sm mt-1">Aggiungi il primo artista con il pulsante +</p>}
          </div>
        )}
        {filteredArtists.map(artist => (
          <ArtistCard
            key={artist.id}
            artist={artist}
            ratings={ratings.filter(r => r.artist_id === artist.id)}
            members={members.filter(m => selectedMembers.includes(m.user_id))}
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