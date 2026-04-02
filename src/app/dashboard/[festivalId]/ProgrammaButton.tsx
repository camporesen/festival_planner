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