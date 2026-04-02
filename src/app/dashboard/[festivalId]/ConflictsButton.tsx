'use client'
import { useState } from 'react'
import { calculateScore, getCategory, CATEGORY_COLORS, findConflicts, formatTime, FestivalConfig, DEFAULT_CONFIG, ArtistWithTime } from '@/lib/score'

export default function ConflictsButton({ artists, ratings, config: rawConfig }: {
  artists: ArtistWithTime[]
  ratings: any[]
  config: any
}) {
  const [open, setOpen] = useState(false)
  const config: FestivalConfig = rawConfig ?? DEFAULT_CONFIG

  const artistsWithTime = artists.filter(a => a.start_time && a.end_time)
  const conflicts = findConflicts(artistsWithTime, ratings, config)

  if (artistsWithTime.length === 0) return null

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="relative flex items-center gap-2 bg-white border border-[#E0D9CC] hover:border-[#1A1A1A] rounded-2xl px-4 py-2.5 text-sm font-bold transition"
      >
        {conflicts.length > 0 && (
          <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center">
            {conflicts.length}
          </span>
        )}
        ⚡ Conflitti
      </button>

      {open && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-end sm:items-center justify-center p-4">
          <div className="bg-[#F5F0E8] rounded-3xl w-full max-w-lg max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between p-5 border-b border-[#E0D9CC]">
              <div>
                <h2 className="font-black text-xl uppercase tracking-tight">Conflitti orari</h2>
                <p className="text-xs text-[#666] mt-0.5">Artisti MUST SEE e ALTO con orari sovrapposti</p>
              </div>
              <button onClick={() => setOpen(false)} className="text-[#666] hover:text-[#1A1A1A] text-2xl leading-none">×</button>
            </div>

            <div className="overflow-y-auto flex-1 p-5 space-y-3">
              {conflicts.length === 0 && (
                <div className="text-center py-12 text-[#999]">
                  <p className="text-3xl mb-2">✅</p>
                  <p className="font-bold">Nessun conflitto!</p>
                  <p className="text-sm mt-1">I tuoi artisti preferiti non si sovrappongono.</p>
                </div>
              )}

              {conflicts.map((conflict, i) => {
                const score1 = calculateScore(ratings.filter((r: any) => r.artist_id === conflict.artist1.id), config)
                const score2 = calculateScore(ratings.filter((r: any) => r.artist_id === conflict.artist2.id), config)
                const cat1 = getCategory(score1, config)
                const cat2 = getCategory(score2, config)

                return (
                  <div key={i} className="bg-white rounded-2xl border border-[#E0D9CC] overflow-hidden">
                    {/* Header conflitto */}
                    <div className="bg-red-50 border-b border-red-100 px-4 py-2 flex items-center justify-between">
                      <span className="text-xs font-black text-red-600 uppercase tracking-wide">
                        {conflict.artist1.day_label ?? conflict.artist1.day}
                      </span>
                      <span className="text-xs text-red-500 font-bold">
                        {conflict.overlapMinutes} min di sovrapposizione
                      </span>
                    </div>

                    {/* I due artisti */}
                    <div className="divide-y divide-[#E0D9CC]">
                      {[
                        { artist: conflict.artist1, score: score1, cat: cat1 },
                        { artist: conflict.artist2, score: score2, cat: cat2 },
                      ].map(({ artist, score, cat }) => (
                        <div key={artist.id} className="flex items-center gap-3 p-3">
                          <div className={`flex-shrink-0 w-12 h-12 rounded-xl flex flex-col items-center justify-center border font-black text-sm ${CATEGORY_COLORS[cat]}`}>
                            <span className="leading-none">{score}</span>
                            <span className="text-[8px] leading-none mt-0.5 opacity-75">{cat === 'MUST SEE' ? '★' : '↑'}</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-black uppercase tracking-tight truncate text-sm">{artist.name}</p>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="text-xs text-[#666] font-medium">{artist.stage}</span>
                              <span className="text-xs text-[#999]">
                                {formatTime(artist.start_time!)} – {formatTime(artist.end_time!)}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>

            <div className="p-5 border-t border-[#E0D9CC]">
              <button
                onClick={() => setOpen(false)}
                className="w-full bg-[#1A1A1A] text-white rounded-xl py-3 text-sm font-black uppercase tracking-wide"
              >
                Chiudi
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}