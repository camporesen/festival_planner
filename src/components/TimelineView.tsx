'use client'
import { useState } from 'react'
import { calculateScore, getCategory, CATEGORY_COLORS, DEFAULT_CONFIG, FestivalConfig } from '@/lib/score'

type Artist = {
  id: string
  name: string
  day: string | null
  day_label: string | null
  stage: string | null
  start_time: string | null
  end_time: string | null
}
type Rating = { artist_id: string; user_id: string; interest?: number; priority?: number; curiosity?: number }
type Plan = { artist_id: string; user_id: string }
type Member = { user_id: string; display_name: string }

function timeToMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number)
  return h < 6 ? (h + 24) * 60 + m : h * 60 + m
}

function formatHour(minutes: number): string {
  const h = Math.floor(minutes / 60) % 24
  return `${String(h).padStart(2, '0')}:00`
}

function memberInitials(name: string): string {
  return name.split(/[\s._-]/).map(p => p[0]?.toUpperCase() ?? '').join('').slice(0, 2)
}

export default function TimelineView({
  artists, ratings, config: rawConfig, selectedMembers, plans, members, userId
}: {
  artists: Artist[]
  ratings: Rating[]
  config: any
  selectedMembers: string[]
  plans: Plan[]
  members: Member[]
  userId: string
}) {
  const [selectedDay, setSelectedDay] = useState<string | null>(null)
  const [open, setOpen] = useState(false)
  const config: FestivalConfig = rawConfig ?? DEFAULT_CONFIG

  const artistsWithTime = artists.filter(a => a.start_time && a.end_time && a.day)
  if (artistsWithTime.length === 0) return null

  const days = Array.from(new Set(artistsWithTime.map(a => a.day!))).sort()
  const currentDay = selectedDay ?? days[0]
  const dayArtists = artistsWithTime.filter(a => a.day === currentDay)
  const stages = Array.from(new Set(dayArtists.map(a => a.stage!).filter(Boolean)))

  const allMinutes = dayArtists.flatMap(a => [timeToMinutes(a.start_time!), timeToMinutes(a.end_time!)])
  const minTime = Math.floor(Math.min(...allMinutes) / 60) * 60
  const maxTime = Math.ceil(Math.max(...allMinutes) / 60) * 60

  const hours: number[] = []
  for (let m = minTime; m <= maxTime; m += 60) hours.push(m)

  const PX_PER_HOUR = 80
  const STAGE_WIDTH = 120
  const TIME_COL_WIDTH = 48

  function getArtistStyle(artist: Artist) {
    const start = timeToMinutes(artist.start_time!)
    const end = timeToMinutes(artist.end_time!)
    const top = ((start - minTime) / 60) * PX_PER_HOUR
    const height = Math.max(((end - start) / 60) * PX_PER_HOUR, 36)
    return { top, height }
  }

  function getScore(artistId: string) {
    return calculateScore(ratings.filter(r => r.artist_id === artistId && selectedMembers.includes(r.user_id)), config)
  }

  function getCat(artistId: string) {
    return getCategory(getScore(artistId), config)
  }

  function getMembersInPlan(artistId: string): Member[] {
    return members.filter(m =>
      selectedMembers.includes(m.user_id) &&
      plans.some(p => p.artist_id === artistId && p.user_id === m.user_id)
    )
  }

  // Controlla conflitti nel piano per il giorno corrente
  function hasConflict(artist: Artist): boolean {
    const myPlan = plans.filter(p => p.user_id === userId)
    const myDayArtists = dayArtists.filter(a =>
      myPlan.some(p => p.artist_id === a.id) && a.id !== artist.id
    )
    const start1 = timeToMinutes(artist.start_time!)
    const end1 = timeToMinutes(artist.end_time!)
    const adjEnd1 = end1 < start1 ? end1 + 1440 : end1

    return myDayArtists.some(a => {
      const start2 = timeToMinutes(a.start_time!)
      const end2 = timeToMinutes(a.end_time!)
      const adjEnd2 = end2 < start2 ? end2 + 1440 : end2
      return Math.min(adjEnd1, adjEnd2) > Math.max(start1, start2)
    })
  }

  function dayLabel(day: string) {
    const a = artists.find(a => a.day === day)
    if (a?.day_label) return a.day_label
    return new Date(day + 'T12:00:00').toLocaleDateString('it-IT', { weekday: 'short', day: 'numeric', month: 'short' })
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 bg-white border border-[#E0D9CC] hover:border-[#1A1A1A] rounded-2xl px-4 py-2.5 text-sm font-bold transition"
      >
        📅 Timeline
      </button>

      {open && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-end sm:items-center justify-center p-4">
          <div className="bg-[#F5F0E8] rounded-3xl w-full max-w-2xl max-h-[90vh] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-[#E0D9CC] flex-shrink-0">
              <h2 className="font-black text-xl uppercase tracking-tight">Timeline</h2>
              <button onClick={() => setOpen(false)} className="text-[#666] hover:text-[#1A1A1A] text-2xl leading-none">×</button>
            </div>

            {/* Filtro giorni */}
            <div className="flex gap-2 overflow-x-auto px-5 py-3 border-b border-[#E0D9CC] flex-shrink-0">
              {days.map(day => (
                <button
                  key={day}
                  onClick={() => setSelectedDay(day)}
                  className={`flex-shrink-0 px-3 py-1.5 rounded-xl text-sm font-bold transition uppercase tracking-wide capitalize ${currentDay === day ? 'bg-[#1A1A1A] text-white' : 'bg-white text-[#666] border border-[#E0D9CC] hover:border-[#1A1A1A]'}`}
                >
                  {dayLabel(day)}
                </button>
              ))}
            </div>

            {/* Legenda membri */}
            {members.filter(m => selectedMembers.includes(m.user_id)).length > 0 && (
              <div className="flex gap-2 px-5 py-2 border-b border-[#E0D9CC] flex-shrink-0 overflow-x-auto">
                {members.filter(m => selectedMembers.includes(m.user_id)).map(m => (
                  <div key={m.user_id} className={`flex items-center gap-1.5 px-2 py-1 rounded-lg text-[10px] font-black flex-shrink-0 ${m.user_id === userId ? 'bg-[#C8F135] text-[#1A1A1A]' : 'bg-[#1A1A1A] text-white'}`}>
                    {memberInitials(m.display_name)} {m.display_name}
                    {m.user_id === userId && <span className="opacity-60">tu</span>}
                  </div>
                ))}
              </div>
            )}

            {/* Griglia timeline */}
            <div className="overflow-auto flex-1 p-4">
              <div className="flex" style={{ minWidth: `${TIME_COL_WIDTH + stages.length * STAGE_WIDTH}px` }}>

                {/* Colonna orari */}
                <div style={{ width: TIME_COL_WIDTH, flexShrink: 0 }}>
                  <div style={{ height: 32 }} />
                  <div className="relative" style={{ height: hours.length * PX_PER_HOUR }}>
                    {hours.map((m, i) => (
                      <div
                        key={m}
                        className="absolute right-2 text-xs text-[#999] font-mono"
                        style={{ top: i * PX_PER_HOUR - 8 }}
                      >
                        {formatHour(m)}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Colonne palchi */}
                {stages.map(stage => (
                  <div key={stage} style={{ width: STAGE_WIDTH, flexShrink: 0 }} className="relative">
                    <div className="h-8 flex items-center justify-center text-[10px] font-black uppercase tracking-wide text-[#666] border-b border-[#E0D9CC] bg-[#F5F0E8] sticky top-0 px-1 text-center">
                      {stage}
                    </div>

                    <div className="relative border-l border-[#E0D9CC]" style={{ height: hours.length * PX_PER_HOUR }}>
                      {hours.map((m, i) => (
                        <div key={m} className="absolute w-full border-t border-[#E0D9CC]" style={{ top: i * PX_PER_HOUR }} />
                      ))}

                      {dayArtists
                        .filter(a => a.stage === stage)
                        .map(artist => {
                          const { top, height } = getArtistStyle(artist)
                          const score = getScore(artist.id)
                          const cat = getCat(artist.id)
                          const hasVote = score > 0
                          const membersInPlan = getMembersInPlan(artist.id)
                          const inMyPlan = plans.some(p => p.artist_id === artist.id && p.user_id === userId)
                          const conflict = inMyPlan && hasConflict(artist)

                          return (
                            <div
                              key={artist.id}
                              className={`absolute left-1 right-1 rounded-lg overflow-hidden transition ${
                                conflict
                                  ? 'border-2 border-red-500'
                                  : inMyPlan
                                    ? 'border-2 border-[#1A1A1A]'
                                    : 'border border-[#E0D9CC]'
                              } ${hasVote ? CATEGORY_COLORS[cat] : 'bg-white text-[#CCC]'}`}
                              style={{ top: top + 2, height: height - 4 }}
                            >
                              <div className="p-1 h-full flex flex-col justify-between">
                                <div>
                                  <p className={`text-[9px] font-black uppercase leading-tight line-clamp-2 ${hasVote ? '' : 'text-[#CCC]'}`}>
                                    {artist.name}
                                  </p>
                                  {height > 40 && score > 0 && (
                                    <p className="text-[9px] font-black opacity-75">{score}</p>
                                  )}
                                </div>

                                {/* Icone membri nel piano */}
                                {membersInPlan.length > 0 && height > 30 && (
                                  <div className="flex gap-0.5 flex-wrap mt-0.5">
                                    {membersInPlan.map(m => (
                                      <span
                                        key={m.user_id}
                                        className={`text-[8px] font-black px-1 py-0.5 rounded leading-none ${
                                          m.user_id === userId
                                            ? 'bg-[#1A1A1A] text-[#C8F135]'
                                            : 'bg-white/50 text-[#1A1A1A]'
                                        }`}
                                      >
                                        {memberInitials(m.display_name)}
                                      </span>
                                    ))}
                                  </div>
                                )}
                              </div>

                              {/* Indicatore conflitto */}
                              {conflict && (
                                <div className="absolute top-0.5 right-0.5 text-[8px] font-black text-red-500">⚠</div>
                              )}
                            </div>
                          )
                        })}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Legenda */}
            <div className="px-5 py-3 border-t border-[#E0D9CC] flex gap-3 flex-shrink-0 overflow-x-auto">
              <div className="flex items-center gap-1.5 text-[10px] text-[#666] flex-shrink-0">
                <div className="w-3 h-3 rounded border-2 border-[#1A1A1A] bg-transparent" />
                Nel piano
              </div>
              <div className="flex items-center gap-1.5 text-[10px] text-[#666] flex-shrink-0">
                <div className="w-3 h-3 rounded border-2 border-red-500 bg-transparent" />
                Conflitto
              </div>
              {(['MUST SEE', 'ALTO', 'VALUTA'] as const).map(cat => (
                <div key={cat} className={`flex items-center gap-1.5 px-2 py-1 rounded-lg border text-[10px] font-bold flex-shrink-0 ${CATEGORY_COLORS[cat]}`}>
                  {cat}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  )
}