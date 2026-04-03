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

function timeToMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number)
  // Orari dopo mezzanotte li trattiamo come 24+
  return h < 6 ? (h + 24) * 60 + m : h * 60 + m
}

function formatHour(minutes: number): string {
  const h = Math.floor(minutes / 60) % 24
  return `${String(h).padStart(2, '0')}:00`
}

export default function TimelineView({
  artists, ratings, config: rawConfig, selectedMembers
}: {
  artists: Artist[]
  ratings: Rating[]
  config: any
  selectedMembers: string[]
}) {
  const [selectedDay, setSelectedDay] = useState<string | null>(null)
  const [open, setOpen] = useState(false)
  const config: FestivalConfig = rawConfig ?? DEFAULT_CONFIG

  const artistsWithTime = artists.filter(a => a.start_time && a.end_time && a.day)
  if (artistsWithTime.length === 0) return null

  const days = Array.from(new Set(artistsWithTime.map(a => a.day!))).sort()
  const currentDay = selectedDay ?? days[0]
  const dayArtists = artistsWithTime.filter(a => a.day === currentDay)

  // Palchi unici per il giorno
  const stages = Array.from(new Set(dayArtists.map(a => a.stage!).filter(Boolean)))

  // Range orario del giorno
  const allMinutes = dayArtists.flatMap(a => [timeToMinutes(a.start_time!), timeToMinutes(a.end_time!)])
  const minTime = Math.floor(Math.min(...allMinutes) / 60) * 60
  const maxTime = Math.ceil(Math.max(...allMinutes) / 60) * 60

  // Ore da mostrare
  const hours: number[] = []
  for (let m = minTime; m <= maxTime; m += 60) hours.push(m)

  // Altezza per ora in pixel
  const PX_PER_HOUR = 80
  const STAGE_WIDTH = 110
  const TIME_COL_WIDTH = 48

  function getArtistStyle(artist: Artist) {
    const start = timeToMinutes(artist.start_time!)
    const end = timeToMinutes(artist.end_time!)
    const top = ((start - minTime) / 60) * PX_PER_HOUR
    const height = Math.max(((end - start) / 60) * PX_PER_HOUR, 32)
    return { top, height }
  }

  function getScore(artistId: string) {
    return calculateScore(ratings.filter(r => r.artist_id === artistId && selectedMembers.includes(r.user_id)), config)
  }

  function getCat(artistId: string) {
    return getCategory(getScore(artistId), config)
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

            {/* Griglia timeline */}
            <div className="overflow-auto flex-1 p-4">
              <div className="flex" style={{ minWidth: `${TIME_COL_WIDTH + stages.length * STAGE_WIDTH}px` }}>

                {/* Colonna orari */}
                <div style={{ width: TIME_COL_WIDTH, flexShrink: 0 }}>
                  {/* Header vuoto */}
                  <div style={{ height: 32 }} />
                  {/* Righe ore */}
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
                    {/* Header palco */}
                    <div
                      className="h-8 flex items-center justify-center text-[10px] font-black uppercase tracking-wide text-[#666] border-b border-[#E0D9CC] bg-[#F5F0E8] sticky top-0 px-1 text-center"
                    >
                      {stage}
                    </div>

                    {/* Sfondo con righe ore */}
                    <div
                      className="relative border-l border-[#E0D9CC]"
                      style={{ height: hours.length * PX_PER_HOUR }}
                    >
                      {hours.map((m, i) => (
                        <div
                          key={m}
                          className="absolute w-full border-t border-[#E0D9CC]"
                          style={{ top: i * PX_PER_HOUR }}
                        />
                      ))}

                      {/* Artisti */}
                      {dayArtists
                        .filter(a => a.stage === stage)
                        .map(artist => {
                          const { top, height } = getArtistStyle(artist)
                          const score = getScore(artist.id)
                          const cat = getCat(artist.id)
                          const hasVote = score > 0

                          return (
                            <div
                              key={artist.id}
                              className={`absolute left-1 right-1 rounded-lg border overflow-hidden cursor-pointer transition hover:opacity-90 ${
                                hasVote ? CATEGORY_COLORS[cat] : 'bg-white border-[#E0D9CC] text-[#CCC]'
                              }`}
                              style={{ top: top + 2, height: height - 4 }}
                            >
                              <div className="p-1.5 h-full flex flex-col justify-between">
                                <p className={`text-[10px] font-black uppercase leading-tight line-clamp-2 ${hasVote ? '' : 'text-[#CCC]'}`}>
                                  {artist.name}
                                </p>
                                {height > 48 && score > 0 && (
                                  <p className="text-[10px] font-black opacity-75">{score}</p>
                                )}
                              </div>
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
              {(['MUST SEE', 'ALTO', 'VALUTA', 'SKIP'] as const).map(cat => (
                <div key={cat} className={`flex items-center gap-1.5 px-2 py-1 rounded-lg border text-[10px] font-bold flex-shrink-0 ${CATEGORY_COLORS[cat]}`}>
                  {cat}
                </div>
              ))}
              <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg border border-[#E0D9CC] bg-white text-[10px] font-bold text-[#CCC] flex-shrink-0">
                NON VOTATO
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}