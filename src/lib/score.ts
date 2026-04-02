export interface RatingData {
  interest?: number
  priority?: number
  curiosity?: number
  already_seen?: boolean
}

export interface FestivalConfig {
  weight_interest: number
  weight_priority: number
  weight_curiosity: number
  weight_never_seen: number
  threshold_must_see: number
  threshold_high: number
  threshold_consider: number
}

export const DEFAULT_CONFIG: FestivalConfig = {
  weight_interest: 2,
  weight_priority: 2,
  weight_curiosity: 1,
  weight_never_seen: 1,
  threshold_must_see: 24,
  threshold_high: 18,
  threshold_consider: 13,
}

export function calculateScore(ratings: RatingData[], config: FestivalConfig): number {
  const valid = ratings.filter(r => r.interest || r.priority || r.curiosity)
  if (!valid.length) return 0
  const avg = (vals: (number | undefined)[]) => {
    const v = vals.filter((n): n is number => !!n)
    return v.length ? v.reduce((a, b) => a + b, 0) / v.length : 0
  }
  const neverCount = valid.filter(r => !r.already_seen).length
  const neverBonus = neverCount === valid.length ? 1 : neverCount > 0 ? 0.5 : 0
  return Math.round((
    avg(valid.map(r => r.interest)) * config.weight_interest +
    avg(valid.map(r => r.priority)) * config.weight_priority +
    avg(valid.map(r => r.curiosity)) * config.weight_curiosity +
    neverBonus * config.weight_never_seen
  ) * 10) / 10
}

export type Category = 'MUST SEE' | 'ALTO' | 'VALUTA' | 'SKIP'

export function getCategory(score: number, config: FestivalConfig): Category {
  if (score >= config.threshold_must_see) return 'MUST SEE'
  if (score >= config.threshold_high) return 'ALTO'
  if (score >= config.threshold_consider) return 'VALUTA'
  return 'SKIP'
}

export const CATEGORY_COLORS: Record<Category, string> = {
  'MUST SEE': 'bg-[#C8F135] text-[#1A1A1A] border-[#b8e020]',
  'ALTO':     'bg-[#1A1A1A] text-white border-[#1A1A1A]',
  'VALUTA':   'bg-white text-[#1A1A1A] border-[#E0D9CC]',
  'SKIP':     'bg-[#F5F0E8] text-[#999] border-[#E0D9CC]',
}

export interface ArtistWithTime {
  id: string
  name: string
  day: string
  day_label: string | null
  stage: string | null
  start_time: string | null
  end_time: string | null
}

export interface Conflict {
  artist1: ArtistWithTime
  artist2: ArtistWithTime
  overlapMinutes: number
}

export function findConflicts(artists: ArtistWithTime[], ratings: any[], config: FestivalConfig, minCategory: 'MUST SEE' | 'ALTO' | 'VALUTA' = 'ALTO'): Conflict[] {
  // Solo artisti con orario e score abbastanza alto
  const relevant = artists.filter(a => {
    if (!a.start_time || !a.end_time) return false
    const artistRatings = ratings.filter((r: any) => r.artist_id === a.id)
    const score = calculateScore(artistRatings, config)
    const cat = getCategory(score, config)
    return cat === 'MUST SEE' || cat === 'ALTO' || (minCategory === 'VALUTA' && cat === 'VALUTA')
  })

  const conflicts: Conflict[] = []

  for (let i = 0; i < relevant.length; i++) {
    for (let j = i + 1; j < relevant.length; j++) {
      const a1 = relevant[i]
      const a2 = relevant[j]

      if (a1.day !== a2.day) continue
      if (a1.stage === a2.stage) continue // stesso palco = non è un conflitto

      const start1 = timeToMinutes(a1.start_time!)
      const end1 = timeToMinutes(a1.end_time!)
      const start2 = timeToMinutes(a2.start_time!)
      const end2 = timeToMinutes(a2.end_time!)

      // Gestisci mezzanotte (es. 23:00 - 00:30 → 23:00 - 24:30)
      const adjustedEnd1 = end1 < start1 ? end1 + 1440 : end1
      const adjustedEnd2 = end2 < start2 ? end2 + 1440 : end2

      const overlapStart = Math.max(start1, start2)
      const overlapEnd = Math.min(adjustedEnd1, adjustedEnd2)
      const overlap = overlapEnd - overlapStart

      if (overlap > 0) {
        conflicts.push({ artist1: a1, artist2: a2, overlapMinutes: overlap })
      }
    }
  }

  return conflicts.sort((a, b) => b.overlapMinutes - a.overlapMinutes)
}

function timeToMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number)
  return h * 60 + m
}

export function formatTime(time: string): string {
  return time.slice(0, 5)
}