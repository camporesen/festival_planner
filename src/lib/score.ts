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
  'MUST SEE': 'bg-green-100 text-green-800 border-green-300',
  'ALTO':     'bg-blue-100 text-blue-800 border-blue-300',
  'VALUTA':   'bg-yellow-100 text-yellow-800 border-yellow-300',
  'SKIP':     'bg-gray-100 text-gray-500 border-gray-200',
}