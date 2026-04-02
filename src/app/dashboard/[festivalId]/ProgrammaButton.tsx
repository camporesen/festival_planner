'use client'
import { useState, useRef } from 'react'
import { calculateScore, getCategory, FestivalConfig, DEFAULT_CONFIG } from '@/lib/score'

type Artist = { id: string; name: string; day: string | null; day_label: string | null }
type Rating = { artist_id: string; user_id: string; interest?: number; priority?: number; curiosity?: number }

export default function ProgrammaButton({ artists, ratings, members, config: rawConfig }: {
  artists: Artist[]
  ratings: Rating[]
  members: { user_id: string; display_name: string }[]
  config: any
}) {
  const [open, setOpen] = useState(false)
  const [exporting, setExporting] = useState(false)
  const cardRef = useRef<HTMLDivElement>(null)
  const config: FestivalConfig = rawConfig ?? DEFAULT_CONFIG

  const days = Array.from(new Set(artists.map(a => a.day).filter(Boolean))).sort() as string[]

  function getArtistScore(artistId: string) {
    return calculateScore(ratings.filter(r => r.artist_id === artistId), config)
  }

  function getArtistCategory(artistId: string) {
    return getCategory(getArtistScore(artistId), config)
  }

  const mustSeeCount = artists.filter(a => getArtistCategory(a.id) === 'MUST SEE').length

  function artistsForDay(day: string) {
    return artists
      .filter(a => a.day === day && ['MUST SEE', 'ALTO'].includes(getArtistCategory(a.id)))
      .sort((a, b) => getArtistScore(b.id) - getArtistScore(a.id))
  }

  function dayLabel(day: string) {
    const a = artists.find(a => a.day === day)
    if (a?.day_label) return a.day_label
    return new Date(day + 'T12:00:00').toLocaleDateString('it-IT', { weekday: 'long', day: 'numeric', month: 'long' })
  }

  async function exportImage() {
    if (!cardRef.current) return
    setExporting(true)
    try {
      const html2canvas = (await import('html2canvas')).default
      const canvas = await html2canvas(cardRef.current, {
        backgroundColor: '#F5F0E8',
        scale: 2,
        useCORS: true,
        logging: false,
      })
      const url = canvas.toDataURL('image/png')
      const link = document.createElement('a')
      link.download = 'programma-festival.png'
      link.href = url
      link.click()
    } catch (e) {
      console.error(e)
    }
    setExporting(false)
  }

  return (
    <>
      {/* Pulsante fisso in basso */}
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-[#1A1A1A] text-white px-6 py-3 rounded-2xl font-black uppercase tracking-wide text-sm shadow-lg hover:bg-[#333] transition flex items-center gap-2 z-40"
      >
        <span className="bg-[#C8F135] text-[#1A1A1A] rounded-lg px-2 py-0.5 text-xs font-black">
          {mustSeeCount}
        </span>
        Programma del gruppo
      </button>

      {open && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-end sm:items-center justify-center p-4">
          <div className="bg-[#F5F0E8] rounded-3xl w-full max-w-lg max-h-[90vh] flex flex-col">
            {/* Header modal */}
            <div className="flex items-center justify-between p-5 border-b border-[#E0D9CC]">
              <h2 className="font-black text-xl uppercase tracking-tight">Programma del gruppo</h2>
              <button onClick={() => setOpen(false)} className="text-[#666] hover:text-[#1A1A1A] text-2xl leading-none">×</button>
            </div>

            {/* Contenuto scrollabile */}
            <div className="overflow-y-auto flex-1 p-5">
              {/* Card esportabile */}
              <div ref={cardRef} className="bg-[#F5F0E8] p-5 rounded-2xl">
                {/* Header card */}
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <div className="inline-block bg-[#C8F135] px-3 py-0.5 rounded-full text-xs font-black uppercase tracking-widest mb-1">
                      Festival Planner
                    </div>
                    <p className="font-black text-2xl uppercase tracking-tight leading-none">
                      Da vedere
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-4xl font-black leading-none">{mustSeeCount}</p>
                    <p className="text-xs text-[#666] font-bold uppercase">must see</p>
                  </div>
                </div>

                {/* Artisti per giorno */}
                {days.map(day => {
                  const dayArtists = artistsForDay(day)
                  if (dayArtists.length === 0) return null
                  return (
                    <div key={day} className="mb-5 last:mb-0">
                      <p className="text-xs font-black uppercase tracking-widest text-[#666] mb-2 capitalize">
                        {dayLabel(day)}
                      </p>
                      <div className="space-y-1.5">
                        {dayArtists.map(artist => {
                          const score = getArtistScore(artist.id)
                          const cat = getArtistCategory(artist.id)
                          return (
                            <div key={artist.id} className="flex items-center gap-2 bg-white rounded-xl px-3 py-2 border border-[#E0D9CC]">
                              <div className={`w-10 h-10 rounded-lg flex flex-col items-center justify-center flex-shrink-0 font-black text-sm border
                                ${cat === 'MUST SEE' ? 'bg-[#C8F135] text-[#1A1A1A] border-[#b8e020]' : 'bg-[#1A1A1A] text-white border-[#1A1A1A]'}`}>
                                <span className="leading-none">{score}</span>
                                <span className="text-[8px] leading-none opacity-75 mt-0.5">{cat === 'MUST SEE' ? '★' : '↑'}</span>
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-black uppercase tracking-tight text-sm truncate">{artist.name}</p>
                                {members.length > 0 && (
                                  <div className="flex gap-2">
                                    {members.map(m => {
                                      const r = ratings.find(r => r.artist_id === artist.id && r.user_id === m.user_id)
                                      if (!r?.interest) return null
                                      return (
                                        <span key={m.user_id} className="text-[10px] text-[#666]">
                                          {m.display_name}: {r.interest}
                                        </span>
                                      )
                                    })}
                                  </div>
                                )}
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )
                })}

                {/* Footer card */}
                <div className="mt-5 pt-4 border-t border-[#E0D9CC] flex items-center justify-between">
                  <p className="text-xs text-[#999] font-mono">festival-planner.vercel.app</p>
                  <p className="text-xs text-[#999]">
                    {artists.filter(a => getArtistCategory(a.id) === 'ALTO').length} alto · {mustSeeCount} must see
                  </p>
                </div>
              </div>
            </div>

            {/* Footer modal */}
            <div className="p-5 border-t border-[#E0D9CC] flex gap-3">
              <button
                onClick={exportImage}
                disabled={exporting}
                className="flex-1 bg-[#C8F135] hover:bg-[#b8e020] text-[#1A1A1A] disabled:opacity-50 rounded-xl py-3 text-sm font-black uppercase tracking-wide transition flex items-center justify-center gap-2"
              >
                {exporting ? 'Generando...' : '📲 Scarica immagine'}
              </button>
              <button
                onClick={() => setOpen(false)}
                className="bg-white border border-[#E0D9CC] rounded-xl px-4 py-3 text-sm font-bold transition hover:border-[#1A1A1A]"
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